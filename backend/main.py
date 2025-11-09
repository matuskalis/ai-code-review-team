from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models.review import CodeReviewRequest, CodeReviewResponse
from agents.orchestrator import ReviewOrchestrator
from rate_limiter import rate_limiter
from pydantic import BaseModel
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Verify OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable is required")

app = FastAPI(title="AI Code Review Team", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://frontend-m3kalis-3804s-projects.vercel.app",
        "https://frontend-black-eta-45.vercel.app",
        "https://frontend-matuskalis-m3kalis-3804s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = ReviewOrchestrator()


# Helper function to get client IP
def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# Contact form model
class ContactRequest(BaseModel):
    name: str
    email: str
    company: str = ""
    tech_stack: str = ""
    message: str = ""


@app.get("/")
async def root():
    return {
        "message": "AI Code Review Team API",
        "version": "1.0.0",
        "agents": ["security", "performance", "style"]
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
    }


@app.post("/review", response_model=CodeReviewResponse)
async def review_code(code_request: CodeReviewRequest, request: Request):
    """
    Synchronous code review endpoint (no real-time updates)
    Free tier: 5 reviews per day per IP address
    Premium: Use X-Admin-Password header to bypass rate limit
    """
    from config import Config

    # Check for admin password (bypass rate limiting)
    admin_password = request.headers.get("X-Admin-Password")
    is_admin = admin_password == Config.ADMIN_PASSWORD

    if not is_admin:
        # Check rate limit for non-admin users
        client_ip = get_client_ip(request)
        allowed, used, remaining = rate_limiter.check_rate_limit(client_ip)

        if not allowed:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": "You've reached your daily limit of 5 free reviews. Resets at midnight UTC.",
                    "reviews_used": used,
                    "reviews_remaining": 0,
                    "upgrade_url": "/contact"
                }
            )

    try:
        response = await orchestrator.review_code(code_request)
        # Add rate limit info to response metadata
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/review")
async def websocket_review(websocket: WebSocket):
    """
    WebSocket endpoint for real-time code review with agent updates
    """
    await websocket.accept()

    try:
        # Receive code review request
        data = await websocket.receive_text()
        request_data = json.loads(data)
        request = CodeReviewRequest(**request_data)

        # Define callback for real-time updates
        async def send_status(agent_name: str, message: str):
            await websocket.send_json({
                "type": "status",
                "agent": agent_name,
                "message": message
            })

        # Send initial acknowledgment
        await websocket.send_json({
            "type": "started",
            "message": "Code review started"
        })

        # Perform review with real-time updates
        response = await orchestrator.review_code(request, status_callback=send_status)

        # Send final result
        await websocket.send_json({
            "type": "complete",
            "data": response.model_dump()
        })

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except json.JSONDecodeError:
        await websocket.send_json({
            "type": "error",
            "message": "Invalid JSON format"
        })
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        try:
            await websocket.close()
        except:
            pass


@app.post("/contact")
async def contact_form(contact: ContactRequest):
    """
    Handle contact form submissions for premium tier inquiries
    """
    # In production, you'd send this to your email or save to database
    # For now, just log it and return success
    print(f"\n{'='*60}")
    print("NEW PREMIUM INQUIRY")
    print(f"{'='*60}")
    print(f"Name: {contact.name}")
    print(f"Email: {contact.email}")
    print(f"Company: {contact.company or 'N/A'}")
    print(f"Tech Stack: {contact.tech_stack or 'N/A'}")
    print(f"Message: {contact.message or 'N/A'}")
    print(f"{'='*60}\n")

    return {
        "success": True,
        "message": "Thank you for your interest! We'll get back to you within 24 hours."
    }


@app.get("/rate-limit-status")
async def rate_limit_status(request: Request):
    """
    Check rate limit status for current IP
    """
    client_ip = get_client_ip(request)
    allowed, used, remaining = rate_limiter.check_rate_limit(client_ip)

    # Undo the increment from the check (since this is just a status query)
    if allowed and used > 0:
        rate_limiter.request_counts[client_ip] = (
            used - 1,
            rate_limiter.request_counts[client_ip][1]
        )

    return {
        "reviews_used": max(0, used - 1) if allowed else used,
        "reviews_remaining": remaining + 1 if allowed else 0,
        "max_reviews_per_day": rate_limiter.max_requests_per_day,
        "reset_time": "midnight UTC"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
