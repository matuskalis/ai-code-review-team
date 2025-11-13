#!/bin/bash

echo "🎨 Starting AI Code Review Frontend..."
echo ""

cd "$(dirname "$0")/frontend"

echo "✓ Starting Next.js development server"
echo "✓ Frontend will be available at http://localhost:3000"
echo ""

npm run dev
