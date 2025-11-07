"""Configuration management for AI Code Review Team"""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Centralized configuration for the application"""

    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # Model Configuration with fallback chain
    PRIMARY_MODEL = "gpt-4o-mini"  # Latest affordable model
    FALLBACK_MODELS = [
        "gpt-4o-mini",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-0125",  # Specific version as last resort
    ]

    # API Configuration
    API_TIMEOUT = 60  # seconds
    MAX_RETRIES = 2
    TEMPERATURE = 0.3

    # Review Configuration
    MAX_CODE_LENGTH = 10000  # characters
    ENABLE_PARALLEL_REVIEWS = True

    @classmethod
    def get_available_models(cls) -> List[str]:
        """Get list of models to try in order"""
        return cls.FALLBACK_MODELS

    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        return True


# Validate config on import
Config.validate()
