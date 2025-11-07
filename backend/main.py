from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.review import CodeReviewRequest, CodeReviewResponse
from agents.orchestrator import ReviewOrchestrator
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
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = ReviewOrchestrator()


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
async def review_code(request: CodeReviewRequest):
    """
    Synchronous code review endpoint (no real-time updates)
    """
    try:
        response = await orchestrator.review_code(request)
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
