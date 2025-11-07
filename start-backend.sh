#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Run the server
echo "Starting AI Code Review Backend..."
python main.py
