from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class AgentType(str, Enum):
    SECURITY = "security"
    PERFORMANCE = "performance"
    STYLE = "style"
    ORCHESTRATOR = "orchestrator"


class AgentStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ReviewIssue(BaseModel):
    severity: str  # "critical", "high", "medium", "low", "info"
    line_number: Optional[int] = None
    issue: str
    suggestion: str
    found_by: List[str] = []  # Which agents found this issue


class AgentReview(BaseModel):
    agent_type: AgentType
    status: AgentStatus
    issues: List[ReviewIssue] = []
    summary: str = ""
    thinking: str = ""  # Agent's reasoning process


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"
    context: Optional[str] = None  # Additional context about what the code does


class CodeQualityScore(BaseModel):
    overall_score: float  # 0-100
    security_score: float
    performance_score: float
    style_score: float
    grade: str  # A+, A, B, C, D, F
    projected_score: Optional[float] = None  # Score after fixing critical/high issues
    projected_grade: Optional[str] = None  # Grade after fixes


class CodeReviewResponse(BaseModel):
    review_id: str
    agent_reviews: List[AgentReview]
    overall_summary: str
    total_issues: int
    unique_issues: List[ReviewIssue] = []  # Deduplicated issues
    quality_score: Optional[CodeQualityScore] = None
