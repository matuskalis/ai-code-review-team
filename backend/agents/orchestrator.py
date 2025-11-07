import asyncio
from typing import Callable, Awaitable, List
from models.review import (
    CodeReviewRequest,
    CodeReviewResponse,
    AgentReview,
    AgentStatus,
    ReviewIssue,
    CodeQualityScore
)
from agents.security_agent import SecurityAgent
from agents.performance_agent import PerformanceAgent
from agents.style_agent import StyleAgent
import uuid
from difflib import SequenceMatcher


class ReviewOrchestrator:
    """Orchestrates multiple AI agents to perform comprehensive code review"""

    def __init__(self):
        self.security_agent = SecurityAgent()
        self.performance_agent = PerformanceAgent()
        self.style_agent = StyleAgent()

    async def review_code(
        self,
        request: CodeReviewRequest,
        status_callback: Callable[[str, str], Awaitable[None]] = None
    ) -> CodeReviewResponse:
        """
        Coordinate all agents to review code
        status_callback: async function to send real-time updates (agent_name, message)
        """

        review_id = str(uuid.uuid4())

        if status_callback:
            await status_callback("Orchestrator", "Initializing code review team...")

        # Run all agents in parallel for faster results
        agent_reviews: List[AgentReview] = await asyncio.gather(
            self.security_agent.review(
                request.code,
                request.language,
                request.context or "",
                status_callback
            ),
            self.performance_agent.review(
                request.code,
                request.language,
                request.context or "",
                status_callback
            ),
            self.style_agent.review(
                request.code,
                request.language,
                request.context or "",
                status_callback
            ),
            return_exceptions=False
        )

        # Deduplicate issues
        if status_callback:
            await status_callback("Orchestrator", "Deduplicating and merging findings...")

        unique_issues = self._deduplicate_issues(agent_reviews)

        # Calculate quality score
        quality_score = self._calculate_quality_score(agent_reviews, unique_issues)

        # Aggregate results
        total_issues = sum(len(review.issues) for review in agent_reviews)

        # Generate overall summary
        if status_callback:
            await status_callback("Orchestrator", "Generating final summary...")

        overall_summary = self._generate_summary(agent_reviews, len(unique_issues), quality_score)

        if status_callback:
            await status_callback("Orchestrator", f"Review complete! Found {len(unique_issues)} unique issues.")

        return CodeReviewResponse(
            review_id=review_id,
            agent_reviews=agent_reviews,
            overall_summary=overall_summary,
            total_issues=total_issues,
            unique_issues=unique_issues,
            quality_score=quality_score
        )

    def _similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings (0-1)"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

    def _deduplicate_issues(self, agent_reviews: List[AgentReview]) -> List[ReviewIssue]:
        """Merge duplicate issues from different agents"""

        unique_issues: List[ReviewIssue] = []

        for review in agent_reviews:
            if review.status != AgentStatus.COMPLETED:
                continue

            for issue in review.issues:
                # Check if this issue is similar to any existing unique issue
                merged = False

                for unique_issue in unique_issues:
                    # Consider issues duplicates if:
                    # 1. Same line number (if specified)
                    # 2. High text similarity (>70%)
                    same_line = (
                        issue.line_number is not None and
                        unique_issue.line_number is not None and
                        issue.line_number == unique_issue.line_number
                    )

                    issue_similarity = self._similarity(issue.issue, unique_issue.issue)

                    if same_line or issue_similarity > 0.7:
                        # Merge this issue into the existing one
                        agent_name = review.agent_type.value.title()
                        if agent_name not in unique_issue.found_by:
                            unique_issue.found_by.append(agent_name)

                        # Use highest severity
                        severity_order = ["critical", "high", "medium", "low", "info"]
                        if severity_order.index(issue.severity) < severity_order.index(unique_issue.severity):
                            unique_issue.severity = issue.severity

                        # Combine suggestions if different
                        if self._similarity(issue.suggestion, unique_issue.suggestion) < 0.8:
                            unique_issue.suggestion += f" | Alternative: {issue.suggestion}"

                        merged = True
                        break

                if not merged:
                    # This is a new unique issue
                    new_issue = ReviewIssue(
                        severity=issue.severity,
                        line_number=issue.line_number,
                        issue=issue.issue,
                        suggestion=issue.suggestion,
                        found_by=[review.agent_type.value.title()]
                    )
                    unique_issues.append(new_issue)

        # Sort by severity then line number
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        unique_issues.sort(
            key=lambda x: (
                severity_order.get(x.severity, 5),
                x.line_number if x.line_number is not None else 9999
            )
        )

        return unique_issues

    def _calculate_quality_score(
        self,
        agent_reviews: List[AgentReview],
        unique_issues: List[ReviewIssue]
    ) -> CodeQualityScore:
        """Calculate code quality scores based on findings with logarithmic impact weighting"""
        import math

        # Base severity weights
        severity_weights = {
            "critical": 30,
            "high": 15,
            "medium": 6,
            "low": 2,
            "info": 1
        }

        # Logarithmic scaling: prevents averaging up critical issues
        def calculate_weighted_deduction(issues_by_severity):
            """Apply logarithmic scaling - critical issues compound heavily"""
            deduction = 0
            for severity, count in issues_by_severity.items():
                if count == 0:
                    continue

                base_weight = severity_weights.get(severity, 0)

                if severity == "critical":
                    # Logarithmic penalty: 1 critical = -39, 2 = -89, 3+ = -100
                    # Formula: base * count * (1 + log10(count + 1))
                    deduction += base_weight * count * (1 + math.log10(count + 1))
                elif severity == "high":
                    # Moderate logarithmic penalty for highs
                    deduction += base_weight * count * (1 + 0.5 * math.log10(count + 1))
                else:
                    # Linear for medium/low/info
                    deduction += base_weight * count

            return min(deduction, 100)  # Cap at 100 to avoid negative scores

        # Count issues by severity
        issues_by_severity = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}

        # Calculate per-agent scores
        def calculate_agent_score(agent_type: str) -> float:
            agent_issues = [
                issue for issue in unique_issues
                if agent_type in [a.lower() for a in issue.found_by]
            ]

            if not agent_issues:
                return 100.0

            # Count issues by severity for this agent
            agent_severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
            for issue in agent_issues:
                agent_severity_counts[issue.severity] = agent_severity_counts.get(issue.severity, 0) + 1

            # Calculate weighted deduction
            deduction = calculate_weighted_deduction(agent_severity_counts)
            score = max(0, 100 - deduction)
            return score

        security_score = calculate_agent_score("security")
        performance_score = calculate_agent_score("performance")
        style_score = calculate_agent_score("style")

        # Overall score is weighted average
        overall_score = (
            security_score * 0.4 +  # Security most important
            performance_score * 0.35 +
            style_score * 0.25
        )

        # Determine grade
        def get_grade(score: float) -> str:
            if score >= 95:
                return "A+"
            elif score >= 90:
                return "A"
            elif score >= 80:
                return "B"
            elif score >= 70:
                return "C"
            elif score >= 60:
                return "D"
            else:
                return "F"

        grade = get_grade(overall_score)

        # Calculate projected score (if critical/high issues are fixed)
        def calculate_projected_score(agent_type: str) -> float:
            agent_issues = [
                issue for issue in unique_issues
                if agent_type in [a.lower() for a in issue.found_by]
            ]

            if not agent_issues:
                return 100.0

            # Count only medium/low/info issues (simulate fixing critical/high)
            projected_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
            for issue in agent_issues:
                if issue.severity in ["medium", "low", "info"]:
                    projected_counts[issue.severity] += 1

            deduction = calculate_weighted_deduction(projected_counts)
            return max(0, 100 - deduction)

        # Calculate projected scores per agent
        proj_security = calculate_projected_score("security")
        proj_performance = calculate_projected_score("performance")
        proj_style = calculate_projected_score("style")

        projected_score = (
            proj_security * 0.4 +
            proj_performance * 0.35 +
            proj_style * 0.25
        )
        projected_grade = get_grade(projected_score)

        return CodeQualityScore(
            overall_score=round(overall_score, 1),
            security_score=round(security_score, 1),
            performance_score=round(performance_score, 1),
            style_score=round(style_score, 1),
            grade=grade,
            projected_score=round(projected_score, 1),
            projected_grade=projected_grade
        )

    def _generate_summary(
        self,
        agent_reviews: List[AgentReview],
        unique_issue_count: int,
        quality_score: CodeQualityScore
    ) -> str:
        """Generate an overall summary from all agent reviews"""

        # Check for failed agents
        failed_agents = [r for r in agent_reviews if r.status == AgentStatus.FAILED]
        successful_agents = [r for r in agent_reviews if r.status == AgentStatus.COMPLETED]

        # Count issues by severity across all successful agents
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "info": 0
        }

        for review in successful_agents:
            for issue in review.issues:
                severity_counts[issue.severity] = severity_counts.get(issue.severity, 0) + 1

        # Build summary
        if len(failed_agents) == len(agent_reviews):
            # All agents failed
            summary_parts = ["⚠️ **Review Failed**: All agents encountered errors.\n"]
            summary_parts.append("**Errors:**")
            for review in agent_reviews:
                summary_parts.append(f"- **{review.agent_type.value.title()}**: {review.summary}")
            return "\n".join(summary_parts)

        # Partial or complete success
        status = "Complete" if len(failed_agents) == 0 else "Partially Complete"
        summary_parts = [
            f"**Code Review {status}** | Grade: **{quality_score.grade}** ({quality_score.overall_score}/100)",
            f"{unique_issue_count} unique issues identified from {len(successful_agents)}/{len(agent_reviews)} agents.\n"
        ]

        # Warning about failed agents
        if failed_agents:
            failed_names = ", ".join([r.agent_type.value.title() for r in failed_agents])
            summary_parts.append(f"⚠️ **Warning**: {len(failed_agents)} agent(s) failed: {failed_names}\n")

        # Issue counts
        if severity_counts["critical"] > 0:
            summary_parts.append(f"🚨 **{severity_counts['critical']} Critical** issues require immediate attention.")
        if severity_counts["high"] > 0:
            summary_parts.append(f"⚠️  **{severity_counts['high']} High** priority issues found.")
        if severity_counts["medium"] > 0:
            summary_parts.append(f"📋 **{severity_counts['medium']} Medium** priority improvements suggested.")
        if severity_counts["low"] > 0:
            summary_parts.append(f"💡 **{severity_counts['low']} Low** priority suggestions.")

        if unique_issue_count == 0 and len(successful_agents) > 0:
            summary_parts.append("✅ **No issues found** - code looks good!")

        # Add agent-specific highlights
        summary_parts.append("\n**Agent Results:**")
        for review in agent_reviews:
            status_icon = "✓" if review.status == AgentStatus.COMPLETED else "✗"
            summary_parts.append(f"- {status_icon} **{review.agent_type.value.title()}**: {review.summary}")

        return "\n".join(summary_parts)
