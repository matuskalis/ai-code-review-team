# MODULE OVERVIEW
Purpose: FastAPI backend that runs the multi-agent code review system.

# ENTRY POINTS
- main.py: server startup, endpoints, WebSocket handler.
- /ws/review: streaming review endpoint.

# PUBLIC API CONTRACT
Incoming WebSocket message:
{
  "code": string,
  "language": string,
  "context": string
}

Outgoing stream:
- type: "status" | "partial" | "complete"
- agent: "Security Specialist" | "Performance Specialist" | "Style Specialist"
- data: results (on complete)

# INVARIANTS
- Agents must never block the event loop.
- Orchestrator must execute agents in documented order.
- Always return unique_issues, quality_score, agent_summaries.
- Preserve CWE tagging and Big-O reporting.

# FORBIDDEN PATTERNS
- No synchronous long-running operations in request handlers.
- No breaking changes to streaming format.
- No altering agent responsibilities.

# TESTING
Tests live in backend/tests or root test_*.py files.
Run tests after changes to ensure no API contract breakage.
