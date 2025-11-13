#!/bin/bash

echo "🚀 Starting AI Code Review Backend..."
echo ""

cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install pydantic-settings > /dev/null 2>&1

# Start the backend server
echo "✓ Virtual environment activated"
echo "✓ Starting FastAPI server on http://localhost:8000"
echo ""

python3 main.py
