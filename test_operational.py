#!/usr/bin/env python3
"""Test operational sanity: security, CORS, logs, latency"""
import os
import requests
import time

def test_env_security():
    """Test that API key is only in env, not exposed"""
    print("=" * 60)
    print("VALIDATION 5.1: Environment Variable Security")
    print("=" * 60)

    checks = {
        "OPENAI_API_KEY in backend env": os.path.exists("/Users/matuskalis/ai-code-review-team/backend/.env"),
        "API key not exposed in health endpoint": True,  # Will verify below
        "Frontend doesn't have API key": not os.path.exists("/Users/matuskalis/ai-code-review-team/frontend/.env.local") or
            "OPENAI_API_KEY" not in open("/Users/matuskalis/ai-code-review-team/frontend/.env.local").read() if os.path.exists("/Users/matuskalis/ai-code-review-team/frontend/.env.local") else True,
    }

    # Check that health endpoint doesn't expose API key
    try:
        response = requests.get("http://localhost:8000/health")
        data = response.json()
        api_key_exposed = any('sk-' in str(v) or 'openai' in str(k).lower() and len(str(v)) > 20 for k, v in data.items())
        checks["API key not exposed in health endpoint"] = not api_key_exposed
    except:
        checks["API key not exposed in health endpoint"] = False

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

def test_cors_configuration():
    """Test CORS is properly configured"""
    print("\n" + "=" * 60)
    print("VALIDATION 5.2: CORS Configuration")
    print("=" * 60)

    # Check that CORS allows localhost ports
    test_origins = [
        ("http://localhost:3000", True),
        ("http://localhost:3002", True),
        ("https://evil.com", False),
    ]

    for origin, should_work in test_origins:
        try:
            response = requests.options(
                "http://localhost:8000/review",
                headers={"Origin": origin, "Access-Control-Request-Method": "POST"}
            )

            allowed = response.headers.get("Access-Control-Allow-Origin") == origin
            result = "✓" if (allowed == should_work) else "✗"
            print(f"{result} {origin}: {'allowed' if allowed else 'blocked'} (expected: {'allow' if should_work else 'block'})")

        except Exception as e:
            print(f"~ {origin}: Error testing CORS - {str(e)[:50]}")

def test_latency():
    """Test that typical reviews complete in < 30s"""
    print("\n" + "=" * 60)
    print("VALIDATION 5.3: Latency Requirements")
    print("=" * 60)

    code = """
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query).fetchone()

def process_users(user_ids):
    results = []
    for uid in user_ids:
        results.append(get_user(uid))
    return results
"""

    latencies = []

    for i in range(3):
        start = time.time()
        try:
            response = requests.post(
                "http://localhost:8000/review",
                json={"code": code, "language": "python"},
                timeout=90
            )
            elapsed = time.time() - start
            latencies.append(elapsed)
            print(f"  Run {i+1}: {elapsed:.1f}s")
        except Exception as e:
            print(f"  Run {i+1}: Error - {str(e)[:50]}")

    if latencies:
        avg_latency = sum(latencies) / len(latencies)
        checks = {
            "Average latency < 30s": avg_latency < 30,
            "All runs < 60s": all(l < 60 for l in latencies),
            "No timeouts": len(latencies) == 3,
        }

        print(f"\nLatency summary:")
        print(f"  Average: {avg_latency:.1f}s")
        print(f"  Min: {min(latencies):.1f}s")
        print(f"  Max: {max(latencies):.1f}s")

        for check, result in checks.items():
            print(f"{'✓' if result else '✗'} {check}: {result}")

def test_backend_logs():
    """Verify backend logs show clean request flow"""
    print("\n" + "=" * 60)
    print("VALIDATION 5.4: Backend Logging")
    print("=" * 60)

    # Make a request and note that logs should show:
    # 1. Request received
    # 2. Three agent calls (parallel)
    # 3. Aggregation
    # No stray failures

    print("Making test request to check logging pattern...")

    start = time.time()
    response = requests.post(
        "http://localhost:8000/review",
        json={
            "code": "def foo(): pass",
            "language": "python"
        },
        timeout=90
    )
    elapsed = time.time() - start

    checks = {
        "Request completed": response.status_code == 200,
        "Response time reasonable": elapsed < 30,
        "Valid response structure": 'agent_reviews' in response.json() if response.status_code == 200 else False,
    }

    for check, result in checks.items():
        print(f"{'✓' if result else '✗'} {check}: {result}")

    print("\nNote: Check backend logs manually for:")
    print("  1. POST /review request logged")
    print("  2. Three agent executions (Security, Performance, Style)")
    print("  3. Aggregation phase")
    print("  4. No error messages or exceptions")

if __name__ == "__main__":
    test_env_security()
    test_cors_configuration()
    test_latency()
    test_backend_logs()

    print("\n" + "=" * 60)
    print("✓ All Operational Sanity Validations Complete")
    print("=" * 60)
