from abc import ABC, abstractmethod
from typing import List, Callable, Awaitable, Optional
import openai
from openai import APIError, RateLimitError, APIConnectionError
import os
from models.review import AgentReview, ReviewIssue, AgentType, AgentStatus
from config import Config
import json


class BaseAgent(ABC):
    """Base class for all review agents"""

    def __init__(self, agent_type: AgentType):
        self.agent_type = agent_type
        self.client = openai.AsyncOpenAI(
            api_key=Config.OPENAI_API_KEY,
            timeout=Config.API_TIMEOUT
        )
        self.models_to_try = Config.get_available_models()

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass

    @abstractmethod
    def get_agent_name(self) -> str:
        """Return the agent's name"""
        pass

    async def _call_openai_with_fallback(
        self,
        messages: List[dict],
        status_callback: Optional[Callable[[str, str], Awaitable[None]]] = None
    ) -> Optional[str]:
        """Call OpenAI API with model fallback and retry logic"""

        last_error = None

        for model in self.models_to_try:
            for attempt in range(Config.MAX_RETRIES):
                try:
                    if status_callback and attempt > 0:
                        await status_callback(
                            self.get_agent_name(),
                            f"Retrying with {model} (attempt {attempt + 1}/{Config.MAX_RETRIES})..."
                        )

                    response = await self.client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=Config.TEMPERATURE,
                        response_format={"type": "json_object"}
                    )

                    return response.choices[0].message.content

                except RateLimitError as e:
                    last_error = f"Rate limit exceeded: {str(e)}"
                    if status_callback:
                        await status_callback(self.get_agent_name(), f"Rate limited, trying next model...")
                    break  # Try next model immediately

                except APIConnectionError as e:
                    last_error = f"Connection error: {str(e)}"
                    if attempt < Config.MAX_RETRIES - 1:
                        continue  # Retry same model

                except APIError as e:
                    error_msg = str(e)
                    last_error = error_msg

                    # If model doesn't exist, try next model immediately
                    if "does not exist" in error_msg or "404" in error_msg:
                        if status_callback:
                            await status_callback(
                                self.get_agent_name(),
                                f"Model {model} not available, trying fallback..."
                            )
                        break

                    # For other API errors, retry
                    if attempt < Config.MAX_RETRIES - 1:
                        continue

                except Exception as e:
                    last_error = f"Unexpected error: {str(e)}"
                    if attempt < Config.MAX_RETRIES - 1:
                        continue

        # All attempts failed
        raise Exception(f"All models failed. Last error: {last_error}")

    async def review(
        self,
        code: str,
        language: str,
        context: str = "",
        status_callback: Callable[[str, str], Awaitable[None]] = None
    ) -> AgentReview:
        """
        Perform a code review with robust error handling
        status_callback: async function to send real-time updates (agent_name, message)
        """

        # Initialize review
        review = AgentReview(
            agent_type=self.agent_type,
            status=AgentStatus.IN_PROGRESS,
            issues=[],
            summary="",
            thinking=""
        )

        if status_callback:
            await status_callback(self.get_agent_name(), f"Starting {self.agent_type.value} analysis...")

        try:
            # Build the user prompt
            user_prompt = f"""
Review the following {language} code for {self.agent_type.value} issues.

{f'Context: {context}' if context else ''}

Code:
```{language}
{code}
```

Provide your analysis in the following JSON format:
{{
    "thinking": "Your detailed reasoning process",
    "issues": [
        {{
            "severity": "critical|high|medium|low|info",
            "line_number": <line number or null>,
            "issue": "Description of the issue",
            "suggestion": "How to fix it"
        }}
    ],
    "summary": "Overall summary of your findings"
}}
"""

            if status_callback:
                await status_callback(self.get_agent_name(), "Analyzing code...")

            # Call OpenAI API with fallback
            messages = [
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": user_prompt}
            ]

            response_content = await self._call_openai_with_fallback(messages, status_callback)

            # Parse response
            result = json.loads(response_content)

            review.thinking = result.get("thinking", "")
            review.summary = result.get("summary", "")
            review.issues = [ReviewIssue(**issue) for issue in result.get("issues", [])]
            review.status = AgentStatus.COMPLETED

            if status_callback:
                await status_callback(
                    self.get_agent_name(),
                    f"✓ Complete: Found {len(review.issues)} issues"
                )

        except Exception as e:
            review.status = AgentStatus.FAILED
            review.summary = f"Agent failed: {str(e)}"
            if status_callback:
                await status_callback(self.get_agent_name(), f"✗ Failed: {str(e)}")

        return review
