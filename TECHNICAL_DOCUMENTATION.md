# AI Code Review Team - Complete Technical Documentation

**Last Updated:** November 7, 2025
**Version:** 1.0.0
**Status:** Production Ready

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Multi-Agent System](#multi-agent-system)
4. [API Reference](#api-reference)
5. [Rate Limiting & Access Control](#rate-limiting--access-control)
6. [Code Structure](#code-structure)
7. [Configuration](#configuration)
8. [Deployment Guide](#deployment-guide)
9. [Development Workflow](#development-workflow)
10. [Testing & Validation](#testing--validation)
11. [Performance & Costs](#performance--costs)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)

---

## Project Overview

### What is AI Code Review Team?

AI Code Review Team is an automated multi-agent code review system that analyzes code for security vulnerabilities, performance issues, and style problems in under 30 seconds. Unlike traditional static analyzers, it uses specialized AI agents that collaborate to catch issues single tools miss.

### Key Features

- **3 Specialized AI Agents**: Security, Performance, Style
- **Multi-Agent Orchestration**: Parallel execution with intelligent deduplication
- **Real-Time Updates**: WebSocket-powered live status streaming
- **Quality Scoring**: Logarithmic penalty weighting for accurate grades (A+ to F)
- **Rate Limiting**: IP-based free tier (5/day) with admin bypass
- **CWE Tagging**: Industry-standard vulnerability identification
- **Big-O Analysis**: Algorithmic complexity detection
- **Model Fallback**: Automatic failover (gpt-4o-mini → gpt-3.5-turbo)

### Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- AsyncIO for concurrent agent execution
- OpenAI GPT-4o-mini API
- WebSocket for real-time communication
- In-memory rate limiting

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- WebSocket client

---

## Architecture Deep Dive

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  Browser (localhost:3002) ──────────────────────────────────┐   │
│                                                              │   │
└──────────────────────────────────────────────────────────────┼───┘
                                                               │
                                    HTTP/WebSocket             │
                                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (Port 8000)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FastAPI Application (main.py)               │  │
│  │  - CORS middleware                                       │  │
│  │  - Rate limiting (IP-based)                             │  │
│  │  - Admin password bypass                                │  │
│  │  - Endpoints: /review, /ws/review, /contact, etc.      │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Review Orchestrator (orchestrator.py)          │  │
│  │  - Coordinates all agents                                │  │
│  │  - Runs agents in parallel (asyncio.gather)             │  │
│  │  - Deduplicates issues (70% similarity)                 │  │
│  │  - Calculates quality scores                            │  │
│  │  - Generates aggregated report                          │  │
│  └───────────┬─────────────┬─────────────┬──────────────────┘  │
│              │             │             │                      │
│              ▼             ▼             ▼                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  Security   │ │ Performance │ │    Style    │              │
│  │   Agent     │ │    Agent    │ │    Agent    │              │
│  │             │ │             │ │             │              │
│  │ - SQL Inj   │ │ - Big-O     │ │ - Patterns  │              │
│  │ - XSS       │ │ - N+1       │ │ - Best Pr.  │              │
│  │ - Auth      │ │ - Memory    │ │ - Maint.    │              │
│  │ - CWE Tag   │ │ - Re-render │ │ - Tech Debt │              │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   OpenAI API     │
                  │  (gpt-4o-mini)   │
                  │                  │
                  │ - Model fallback │
                  │ - 2.5M free/day  │
                  └──────────────────┘
```

### Request Flow

#### Synchronous REST Review (`POST /review`)

1. **Request arrives** → FastAPI receives POST to `/review`
2. **Rate limit check** → IP extracted, checked against daily limit (5)
3. **Admin bypass** → If `X-Admin-Password` header matches, skip rate limit
4. **Orchestrator starts** → `ReviewOrchestrator.review_code()` called
5. **Parallel agent execution** → All 3 agents run simultaneously via `asyncio.gather()`
6. **Agent analysis** → Each agent calls OpenAI API with specialized prompt
7. **Issue collection** → Agents return findings (issues, summary, thinking)
8. **Deduplication** → Orchestrator merges duplicate issues (>70% similarity)
9. **Quality scoring** → Calculate scores with logarithmic penalty weighting
10. **Response** → Return JSON with review_id, agents, scores, issues

**Average time:** ~20-30 seconds

#### WebSocket Review (`WS /ws/review`)

1. **Connection established** → Client connects to `ws://localhost:8000/ws/review`
2. **Request received** → JSON payload with code, language, context
3. **Acknowledgment sent** → `{"type": "started", "message": "Code review started"}`
4. **Orchestrator starts** → With `status_callback` for real-time updates
5. **Agent status streaming** → Each agent sends status updates:
   ```json
   {"type": "status", "agent": "Security", "message": "Analyzing..."}
   {"type": "status", "agent": "Security", "message": "Found 3 issues"}
   ```
6. **Completion** → Final result sent:
   ```json
   {"type": "complete", "data": { /* full review */ }}
   ```
7. **Connection closed** → WebSocket closes gracefully

**Real-time advantage:** User sees which agent is working, progress updates

---

## Multi-Agent System

### Agent Architecture

Each agent inherits from `BaseAgent` (base_agent.py) and implements:

```python
class BaseAgent(ABC):
    def __init__(self, agent_type: AgentType)

    @abstractmethod
    def get_system_prompt(self) -> str
        """Define agent's specialized role"""

    @abstractmethod
    def get_agent_name(self) -> str
        """Return agent display name"""

    async def review(code, language, context, status_callback) -> AgentReview
        """Execute review with error handling"""

    async def _call_openai_with_fallback(messages, status_callback) -> str
        """Call OpenAI with model fallback"""
```

### Security Agent

**Location:** `backend/agents/security_agent.py`

**Specialization:**
- SQL injection (CWE-89)
- XSS vulnerabilities (CWE-79)
- Authentication flaws (CWE-287)
- Insecure dependencies
- Command injection
- Path traversal

**Prompt Strategy:**
```
You are a security-focused code reviewer specializing in vulnerability detection.
Analyze for: SQL injection, XSS, auth issues, insecure dependencies.
Tag findings with CWE numbers (CWE-79, CWE-89, etc.).
Severity: critical, high, medium, low
```

**Example Output:**
```json
{
  "issues": [
    {
      "severity": "critical",
      "line_number": 12,
      "issue": "SQL injection via string formatting (CWE-89)",
      "suggestion": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))"
    }
  ],
  "summary": "Found 1 critical SQL injection vulnerability",
  "thinking": "The code uses f-strings to build SQL queries..."
}
```

### Performance Agent

**Location:** `backend/agents/performance_agent.py`

**Specialization:**
- Big-O complexity analysis
- N+1 query detection
- Memory leaks
- Unnecessary re-renders (React)
- Inefficient algorithms
- Database optimization

**Prompt Strategy:**
```
You are a performance optimization expert.
Analyze for: Big-O complexity, N+1 queries, memory leaks, re-renders.
Provide timing estimates: "O(n²) - ~500ms at 1k records"
```

**Example Output:**
```json
{
  "issues": [
    {
      "severity": "high",
      "line_number": 15,
      "issue": "N+1 query pattern. O(n) database calls where n = users. ~2s for 100 users.",
      "suggestion": "Use JOIN or prefetch: User.objects.select_related('profile').all()"
    }
  ],
  "summary": "Found 1 high-severity N+1 query",
  "thinking": "Loop makes separate DB call for each user..."
}
```

### Style Agent

**Location:** `backend/agents/style_agent.py`

**Specialization:**
- Code patterns
- Best practices
- Maintainability
- Technical debt
- Consistency
- Documentation

**Prompt Strategy:**
```
You are a code quality and maintainability expert.
Analyze for: patterns, best practices, consistency, documentation.
Focus on long-term maintainability, not just style preferences.
```

**Example Output:**
```json
{
  "issues": [
    {
      "severity": "medium",
      "line_number": null,
      "issue": "Missing error handling. Functions lack try/catch blocks.",
      "suggestion": "Wrap API calls in try/catch to handle network failures gracefully"
    }
  ],
  "summary": "Code has moderate maintainability issues",
  "thinking": "Functions are readable but lack defensive programming..."
}
```

### Orchestrator Logic

**Location:** `backend/agents/orchestrator.py`

#### 1. Parallel Execution

```python
agent_reviews = await asyncio.gather(
    self.security_agent.review(code, language, context, status_callback),
    self.performance_agent.review(code, language, context, status_callback),
    self.style_agent.review(code, language, context, status_callback),
    return_exceptions=False
)
```

**Why parallel?** Reduces total time from ~60s (sequential) to ~20s (parallel)

#### 2. Issue Deduplication

**Algorithm:** (Lines 98-161)

```python
for each agent's issues:
    for each unique issue:
        if same_line OR text_similarity > 70%:
            merge issues:
                - combine found_by arrays
                - use highest severity
                - append alternative suggestions
        else:
            add as new unique issue

sort by: severity (critical→low), then line_number
```

**Example:**
```
Security finds: "Missing dependency array in useEffect (line 10)"
Style finds: "useEffect missing dependencies (line 10)"
→ Merged into 1 issue, found_by: ["Security", "Style"]
```

#### 3. Quality Scoring

**Algorithm:** (Lines 163-317)

**Base Severity Weights:**
```python
critical: 30 points
high: 15 points
medium: 6 points
low: 2 points
info: 1 point
```

**Logarithmic Scaling (for critical/high):**
```python
if severity == "critical":
    deduction = base_weight * count * (1 + log10(count + 1))
    # 1 critical = -39 points
    # 2 critical = -89 points
    # 3+ critical = -100 points (F grade)

if severity == "high":
    deduction = base_weight * count * (1 + 0.5 * log10(count + 1))
```

**Per-Agent Scores:**
```python
security_score = 100 - calculate_deduction(security_issues)
performance_score = 100 - calculate_deduction(performance_issues)
style_score = 100 - calculate_deduction(style_issues)
```

**Overall Score (Weighted Average):**
```python
overall_score = (
    security_score * 0.4 +      # Security most important
    performance_score * 0.35 +
    style_score * 0.25
)
```

**Grade Mapping:**
```python
>= 95: A+
>= 90: A
>= 80: B
>= 70: C
>= 60: D
< 60: F
```

**Failed Agent Handling:**
```python
if agent.status != COMPLETED:
    agent_score = 0.0  # Worst possible score
    # Prevents vulnerable code from getting A+ when agents fail
```

---

## API Reference

### Endpoints

#### `GET /`

**Description:** API information

**Response:**
```json
{
  "message": "AI Code Review Team API",
  "version": "1.0.0",
  "agents": ["security", "performance", "style"]
}
```

#### `GET /health`

**Description:** Health check

**Response:**
```json
{
  "status": "healthy",
  "openai_configured": true
}
```

#### `POST /review`

**Description:** Submit code for synchronous review

**Rate Limit:** 5 per day per IP (bypass with admin password)

**Headers:**
- `Content-Type: application/json`
- `X-Admin-Password: <password>` (optional, for unlimited access)

**Request Body:**
```json
{
  "code": "def vulnerable():\n    query = f\"SELECT * FROM users WHERE id = {user_id}\"",
  "language": "python",
  "context": "User authentication function"
}
```

**Response (200 OK):**
```json
{
  "review_id": "abc123-def456",
  "agent_reviews": [
    {
      "agent_type": "security",
      "status": "completed",
      "issues": [
        {
          "severity": "critical",
          "line_number": 2,
          "issue": "SQL injection via f-string (CWE-89)",
          "suggestion": "Use parameterized queries",
          "found_by": ["Security"]
        }
      ],
      "summary": "Found 1 critical SQL injection",
      "thinking": "Code uses f-string for SQL query..."
    },
    // ... performance and style agents
  ],
  "overall_summary": "**Code Review Complete** | Grade: **F** (25.0/100)...",
  "total_issues": 3,
  "unique_issues": [...],
  "quality_score": {
    "overall_score": 25.0,
    "security_score": 0.0,
    "performance_score": 100.0,
    "style_score": 75.0,
    "grade": "F",
    "projected_score": 100.0,
    "projected_grade": "A+"
  }
}
```

**Response (429 Rate Limit):**
```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "You've reached your daily limit of 5 free reviews. Resets at midnight UTC.",
    "reviews_used": 5,
    "reviews_remaining": 0,
    "upgrade_url": "/contact"
  }
}
```

#### `WS /ws/review`

**Description:** WebSocket endpoint for real-time review with live updates

**Connection:** `ws://localhost:8000/ws/review`

**Send:**
```json
{
  "code": "def test(): pass",
  "language": "python",
  "context": "test function"
}
```

**Receive (Stream):**
```json
{"type": "started", "message": "Code review started"}
{"type": "status", "agent": "Orchestrator", "message": "Initializing..."}
{"type": "status", "agent": "Security", "message": "Analyzing vulnerabilities..."}
{"type": "status", "agent": "Security", "message": "Found 0 issues"}
{"type": "status", "agent": "Performance", "message": "Analyzing performance..."}
// ... more status updates
{"type": "complete", "data": { /* same as POST /review response */ }}
```

**Error:**
```json
{"type": "error", "message": "Invalid JSON format"}
```

#### `GET /rate-limit-status`

**Description:** Check current rate limit usage

**Response:**
```json
{
  "reviews_used": 3,
  "reviews_remaining": 2,
  "max_reviews_per_day": 5,
  "reset_time": "midnight UTC"
}
```

#### `POST /contact`

**Description:** Submit contact form for premium tier inquiries

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "tech_stack": "React, Node.js, PostgreSQL",
  "message": "Interested in custom agents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your interest! We'll get back to you within 24 hours."
}
```

**Note:** Currently logs to console. In production, integrate with email service.

---

## Rate Limiting & Access Control

### IP-Based Rate Limiting

**Implementation:** `backend/rate_limiter.py`

**Mechanism:**
- In-memory dictionary: `{ip_address: (count, last_request_date)}`
- Thread-safe with `threading.Lock()`
- Auto-cleans old entries daily
- Resets at midnight UTC

**Code:**
```python
def check_rate_limit(self, ip_address: str) -> Tuple[bool, int, int]:
    """
    Returns: (allowed, requests_used, requests_remaining)
    """
    if count >= max_requests_per_day:
        return (False, count, 0)  # Rate limit exceeded
    else:
        increment_counter()
        return (True, count + 1, max - count - 1)
```

**Limitations:**
- **Resets on server restart** (in-memory)
- **No persistence** (use Redis for production)
- **IP spoofing possible** (behind proxy)

**IP Extraction:**
```python
def get_client_ip(request: Request) -> str:
    """Extract IP, handling proxies"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host
```

### Admin Password Bypass

**Configuration:** `backend/config.py`
```python
ADMIN_PASSWORD = "alhgeuisy90uwjfcp2349snfdjvegiru"
```

**Usage:**
```bash
curl -X POST http://localhost:8000/review \
  -H "X-Admin-Password: alhgeuisy90uwjfcp2349snfdjvegiru" \
  -d '{ ... }'
```

**Check:**
```python
admin_password = request.headers.get("X-Admin-Password")
is_admin = admin_password == Config.ADMIN_PASSWORD

if not is_admin:
    # Apply rate limiting
```

**Security Considerations:**
- Password in plaintext (OK for MVP)
- No expiration
- No audit logging
- **Production:** Use environment variable + hash comparison

---

## Code Structure

### Backend (`/backend`)

```
backend/
├── main.py                    # FastAPI application entry point
├── config.py                  # Configuration (API keys, models, admin password)
├── rate_limiter.py            # IP-based rate limiting logic
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (OpenAI API key)
│
├── models/
│   └── review.py              # Pydantic models for requests/responses
│       ├── CodeReviewRequest
│       ├── CodeReviewResponse
│       ├── AgentReview
│       ├── ReviewIssue
│       ├── CodeQualityScore
│       └── AgentType (Enum)
│
├── agents/
│   ├── base_agent.py          # Abstract base class for all agents
│   ├── orchestrator.py        # Coordinates agents, deduplicates, scores
│   ├── security_agent.py      # Security vulnerability detection
│   ├── performance_agent.py   # Performance & optimization analysis
│   └── style_agent.py         # Code quality & maintainability
│
└── venv/                      # Python virtual environment
```

### Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── layout.tsx             # Root layout (metadata, fonts)
│   ├── page.tsx               # Main review interface
│   └── globals.css            # Global styles
│
├── components/
│   ├── CodeInput.tsx          # Code editor textarea
│   ├── ReviewResults.tsx      # Display review results
│   ├── AgentStatus.tsx        # Real-time agent status
│   └── QualityScore.tsx       # Score/grade visualization
│
├── lib/
│   └── utils.ts               # Utility functions
│
├── public/                    # Static assets
├── package.json               # Node dependencies
└── tsconfig.json              # TypeScript configuration
```

### Root Directory

```
.
├── README.md                  # Marketing/quick-start guide
├── TECHNICAL_DOCUMENTATION.md # This file (complete technical reference)
├── SHIP_READY.md             # Launch checklist and guide
├── VALIDATION_REPORT.md      # Validation test results
│
├── test_rate_limit.sh        # Rate limiting test script
├── test_react_concrete.json  # Test case (React with 4 issues)
├── test_websocket.py         # WebSocket integration test
├── test_agent_value.py       # Agent quality validation
├── test_aggregation.py       # Deduplication test
├── test_robustness.py        # Large files, edge cases
└── test_operational.py       # Security, CORS, latency tests
```

---

## Configuration

### Environment Variables

**Backend `.env`:**
```env
# Required
OPENAI_API_KEY=sk-...your-key-here

# Optional (defaults shown)
OPENAI_MODEL=gpt-4o-mini
API_TIMEOUT=60
MAX_RETRIES=2
TEMPERATURE=0.3
MAX_CODE_LENGTH=10000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Model Configuration

**Location:** `backend/config.py`

```python
PRIMARY_MODEL = "gpt-4o-mini"
FALLBACK_MODELS = [
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0125"
]
```

**Fallback Logic:**
- Try `gpt-4o-mini` first
- If rate limit/error → try `gpt-3.5-turbo`
- If still fails → try `gpt-3.5-turbo-0125`
- If all fail → return error to user

### CORS Configuration

**Location:** `backend/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

**Production:** Replace with actual domain(s)

---

## Deployment Guide

### Local Development

**Start Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
# Or specify port: PORT=3002 npm run dev
```

### Production Deployment

#### Backend (Railway, Render, Fly.io)

**1. Add Procfile:**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**2. Set Environment Variables:**
```
OPENAI_API_KEY=sk-...
PORT=8000
```

**3. Deploy:**
```bash
# Railway
railway up

# Render
# Connect GitHub repo, auto-deploys

# Fly.io
fly deploy
```

#### Frontend (Vercel, Netlify)

**1. Update `.env.local`:**
```
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**2. Deploy:**
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod
```

### Database Migration (Optional)

**For persistent rate limiting, replace in-memory with Redis:**

```python
# rate_limiter.py
import redis

class RateLimiter:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)

    def check_rate_limit(self, ip):
        key = f"rate_limit:{ip}:{datetime.now().date()}"
        count = self.redis.incr(key)
        self.redis.expire(key, 86400)  # 24 hours
        return count <= 5
```

---

## Development Workflow

### Adding a New Agent

**1. Create agent file:** `backend/agents/new_agent.py`

```python
from agents.base_agent import BaseAgent
from models.review import AgentType, AgentReview

class NewAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentType.NEW)

    def get_system_prompt(self) -> str:
        return """
        You are a [specialty] expert.
        Analyze code for: [specific issues]
        """

    def get_agent_name(self) -> str:
        return "New Specialist"
```

**2. Add to orchestrator:** `backend/agents/orchestrator.py`

```python
from agents.new_agent import NewAgent

class ReviewOrchestrator:
    def __init__(self):
        self.security_agent = SecurityAgent()
        self.performance_agent = PerformanceAgent()
        self.style_agent = StyleAgent()
        self.new_agent = NewAgent()  # Add this

    async def review_code(self, request, status_callback):
        agent_reviews = await asyncio.gather(
            self.security_agent.review(...),
            self.performance_agent.review(...),
            self.style_agent.review(...),
            self.new_agent.review(...),  # Add this
        )
```

**3. Update models:** `backend/models/review.py`

```python
class AgentType(str, Enum):
    SECURITY = "security"
    PERFORMANCE = "performance"
    STYLE = "style"
    NEW = "new"  # Add this
```

### Running Tests

**Rate Limiting:**
```bash
./test_rate_limit.sh
```

**Agent Quality:**
```bash
source venv/bin/activate
python test_agent_value.py
```

**WebSocket Flow:**
```bash
python test_websocket.py
```

**Full Validation Suite:**
```bash
python test_agent_value.py
python test_aggregation.py
python test_robustness.py
python test_operational.py
```

### Debugging

**Enable verbose logging:**

```python
# main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Check agent responses:**

```python
# In orchestrator.py review_code()
print(f"Agent {review.agent_type}: {review.summary}")
print(f"Issues: {len(review.issues)}")
```

**Monitor WebSocket:**

```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8000/ws/review');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

---

## Testing & Validation

### Validation Criteria

All 6 criteria passed (see `VALIDATION_REPORT.md`):

1. ✅ **Core Flow Works** - REST + WebSocket functional
2. ✅ **Agent Value** - Each agent finds unique issues
3. ✅ **Aggregation Logic** - Deduplication working (40% reduction)
4. ✅ **Robustness** - Handles large files, edge cases
5. ✅ **Operational Sanity** - Security, CORS, latency validated
6. ✅ **Presentation Quality** - README matches functionality

### Test Coverage

**Unit Tests:**
- Agent response parsing
- Deduplication algorithm
- Quality score calculation
- Rate limiting logic

**Integration Tests:**
- End-to-end review flow
- WebSocket message streaming
- Multi-agent coordination
- Error handling

**Validation Tests:**
- React component (4 known issues) → 8 detected (includes duplicates)
- SQL injection code → detected by Security agent
- N+1 query pattern → detected by Performance agent
- Large file (150 lines) → processed successfully
- Empty input → handled gracefully

### Known Limitations

**Backend:**
- Rate limiter resets on server restart (in-memory)
- No email notifications for contact forms
- Admin password in plaintext
- No user authentication/accounts

**Frontend:**
- No rate limit display in UI
- No contact form page
- Results not persisted (disappear on refresh)
- No review history

**Agents:**
- Language support limited to 6+ (Python, JS, TS, Java, Go, Rust)
- No framework-specific analysis (e.g., Django-specific, React-specific)
- Dependent on OpenAI API availability

---

## Performance & Costs

### Latency Breakdown

**Average Review Time: ~25 seconds**

- Network latency: ~1-2s
- Agent execution (parallel): ~20-25s
  - Security agent: ~7-10s
  - Performance agent: ~7-10s
  - Style agent: ~7-10s
- Deduplication: ~0.1s
- Quality scoring: ~0.1s
- Response formatting: ~0.1s

**Optimization Opportunities:**
- Caching for identical code
- Smaller model for simple checks
- Parallel API calls within agents

### Cost Analysis

**OpenAI Pricing (gpt-4o-mini):**
- Input: $0.15 / 1M tokens (~$0.00015 per 1K tokens)
- Output: $0.60 / 1M tokens (~$0.0006 per 1K tokens)

**Per Review Costs:**
```
Input tokens:  ~1,000 × 3 agents = 3,000 tokens = $0.00045
Output tokens: ~1,000 × 3 agents = 3,000 tokens = $0.0018
Total: ~$0.00225 per review (~0.2 cents)
```

**With OpenAI Free Tier (data sharing enabled):**
- Daily allowance: 2.5M tokens
- Reviews per day: ~400+ (within free tier)
- **Cost: $0** for typical usage

**Projected Monthly Costs:**
- 100 users × 5 reviews/day = 500 reviews/day
- 500 × $0.00225 = **$1.13/day** = **$34/month**
- **Still within 2.5M daily free tier = $0/month**

**Break-even point:** ~1,100 reviews/day before paying

### Scaling Considerations

**Current Setup:**
- Single server
- No caching
- No load balancing
- In-memory rate limiting

**At 1,000 Daily Users:**
- 5,000 reviews/day
- ~$11.25/day = $337.50/month
- Need Redis for rate limiting
- Consider response caching

**At 10,000 Daily Users:**
- 50,000 reviews/day
- ~$112.50/day = $3,375/month
- Need horizontal scaling (multiple backend instances)
- Database for persistence
- CDN for frontend

---

## Troubleshooting

### Common Issues

#### "Rate limit exceeded" (HTTP 429)

**Cause:** Exceeded 5 reviews/day for your IP

**Solutions:**
1. Wait until midnight UTC for reset
2. Use admin password: `-H "X-Admin-Password: alhgeuisy90uwjfcp2349snfdjvegiru"`
3. Change IP address (different network)

#### "All agents failed" with OpenAI error

**Cause:** OpenAI API quota exhausted or invalid key

**Solutions:**
1. Check `.env` file has valid `OPENAI_API_KEY`
2. Add credits to OpenAI account
3. Enable data sharing for 2.5M free tokens/day
4. Wait for rate limit reset (if hitting requests/minute)

#### WebSocket connection fails

**Cause:** Backend not running or CORS issue

**Solutions:**
1. Verify backend running: `curl http://localhost:8000/health`
2. Check CORS settings include your frontend URL
3. Use correct WebSocket URL: `ws://` not `wss://` locally

#### Frontend shows "Loading..." forever

**Cause:** API request hanging or failed

**Solutions:**
1. Open browser DevTools → Network tab
2. Check for failed requests
3. Verify backend URL in `.env.local`
4. Check backend logs for errors

#### Agents return generic/low-quality issues

**Cause:** Model not understanding code or low temperature

**Solutions:**
1. Increase `TEMPERATURE` in `config.py` (0.5 instead of 0.3)
2. Improve system prompts in agent files
3. Provide more `context` in request
4. Use gpt-4 instead of gpt-4o-mini (higher quality, higher cost)

### Debug Commands

**Check backend status:**
```bash
curl http://localhost:8000/health
```

**Check rate limit:**
```bash
curl http://localhost:8000/rate-limit-status
```

**Test review with curl:**
```bash
curl -X POST http://localhost:8000/review \
  -H "Content-Type: application/json" \
  -d '{"code":"def test(): pass","language":"python","context":"test"}' \
  | python -m json.tool
```

**View backend logs:**
```bash
# If running in background
tail -f nohup.out

# If running directly
# Logs appear in terminal
```

**Check OpenAI API key:**
```bash
cd backend
source venv/bin/activate
python -c "from config import Config; print('Key:', Config.OPENAI_API_KEY[:10] + '...')"
```

---

## Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and test:**
   ```bash
   ./test_rate_limit.sh
   python test_agent_value.py
   ```
4. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: add custom agent support"
   git commit -m "fix: correct deduplication threshold"
   git commit -m "docs: update API reference"
   ```
5. **Push and create PR:**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Standards

**Backend (Python):**
- Black formatter
- Type hints required
- Docstrings for all public methods
- Max line length: 100

**Frontend (TypeScript):**
- ESLint + Prettier
- Strict TypeScript
- Functional components
- Named exports

### Pull Request Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log() in production code
- [ ] Environment variables documented
- [ ] Breaking changes noted in PR description

---

## Additional Resources

### Related Files

- `README.md` - Quick start and marketing
- `SHIP_READY.md` - Launch guide and next steps
- `VALIDATION_REPORT.md` - Test results

### External Links

- [OpenAI API Docs](https://platform.openai.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [CWE List](https://cwe.mitre.org/data/index.html)

### Contact

For questions about this documentation:
- Check `README.md` for general info
- Read `TROUBLESHOOTING` section above
- Review validation tests in project root

---

**Last Updated:** November 7, 2025
**Maintained By:** AI Code Review Team
**License:** MIT
