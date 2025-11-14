#!/usr/bin/env python3
"""Test WebSocket /ws/review endpoint"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/review"

    print("=" * 60)
    print("VALIDATION 1.2: WebSocket /ws/review Flow")
    print("=" * 60)

    status_messages = []
    final_data = None

    async with websockets.connect(uri) as websocket:
        # Send request
        request = {
            "code": "def get_user(id):\n    return db.execute(f\"SELECT * FROM users WHERE id={id}\").fetchone()",
            "language": "python",
            "context": "User lookup function"
        }

        print("✓ Connected to WebSocket")
        await websocket.send(json.dumps(request))
        print("✓ Sent review request")

        # Receive messages
        while True:
            try:
                message_raw = await websocket.recv()
                message = json.loads(message_raw)

                if message.get("type") == "started":
                    print(f"✓ Received 'started' message: {message.get('message')}")

                elif message.get("type") == "status":
                    agent = message.get("agent")
                    msg = message.get("message")
                    status_messages.append((agent, msg))
                    print(f"  → {agent}: {msg}")

                elif message.get("type") == "complete":
                    print(f"✓ Received 'complete' message")
                    final_data = message.get("data")
                    break

                elif message.get("type") == "error":
                    print(f"✗ Error: {message.get('message')}")
                    break

            except websockets.exceptions.ConnectionClosed:
                print("✓ Connection closed")
                break

    # Validate results
    print("\n" + "=" * 60)
    print("WebSocket Flow Validation")
    print("=" * 60)

    checks = {
        "Received at least one status message": len(status_messages) > 0,
        "Received complete message with data": final_data is not None,
        "Final data has agent_reviews": final_data and "agent_reviews" in final_data if final_data else False,
        "Final data has unique_issues": final_data and "unique_issues" in final_data if final_data else False,
        "Final data has quality_score": final_data and "quality_score" in final_data if final_data else False,
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    print(f"\nTotal status messages: {len(status_messages)}")
    print(f"Agents that sent status: {set([agent for agent, _ in status_messages])}")

    if final_data:
        print(f"Final data structure matches /review: {set(final_data.keys()) == {'review_id', 'agent_reviews', 'overall_summary', 'total_issues', 'unique_issues', 'quality_score'}}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
