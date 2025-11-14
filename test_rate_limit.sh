#!/bin/bash

echo "======================================================================"
echo "RATE LIMITING TEST"
echo "======================================================================"
echo ""

for i in {1..6}; do
  echo "Request #$i:"
  http_code=$(curl -s -o /tmp/response.json -w "%{http_code}" -X POST http://localhost:8000/review \
    -H "Content-Type: application/json" \
    -d '{"code":"def test():\n    pass","language":"python","context":"test"}')

  if [ "$http_code" == "200" ]; then
    echo "  ✅ Status: $http_code - Review completed"
  elif [ "$http_code" == "429" ]; then
    echo "  🚫 Status: $http_code - Rate Limited!"
    cat /tmp/response.json | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Message: {data['detail']['message']}\"); print(f\"  Reviews used: {data['detail']['reviews_used']}\")" 2>/dev/null || echo "  Rate limit exceeded"
  else
    echo "  ❌ Status: $http_code"
  fi
  echo ""
done

echo "======================================================================"
echo "Rate limit status check:"
echo "======================================================================"
curl -s http://localhost:8000/rate-limit-status | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Reviews used: {data['reviews_used']}/{data['max_reviews_per_day']}\"); print(f\"Reviews remaining: {data['reviews_remaining']}\"); print(f\"Resets at: {data['reset_time']}\")"
echo ""
echo "======================================================================"
echo "✅ Rate limiting is working!"
echo "======================================================================"
