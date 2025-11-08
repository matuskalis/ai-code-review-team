#!/bin/bash

# AI Code Review Team - Quick Deployment Script
# This script helps you deploy both frontend and backend

set -e  # Exit on error

echo "🚀 AI Code Review Team - Deployment Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo ""

# Step 2: Commit deployment files
echo "📦 Committing deployment files..."
git add .
git commit -m "Add deployment configuration and guide" || echo "No changes to commit"
git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 3: Backend deployment instructions
echo "🔧 BACKEND DEPLOYMENT"
echo "===================="
echo ""
echo "Your backend code is ready to deploy to Render."
echo ""
echo "Next steps:"
echo "1. Go to: https://render.com"
echo "2. Sign up/login with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Select 'matuskalis/ai-code-review-team'"
echo "5. Configure:"
echo "   - Root Directory: backend"
echo "   - Build: pip install -r requirements.txt"
echo "   - Start: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "   - Add Environment Variable: OPENAI_API_KEY"
echo ""
read -p "Press Enter when backend is deployed and you have the URL..."
echo ""

# Step 4: Get backend URL
read -p "Enter your backend URL (e.g., https://your-app.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required${NC}"
    exit 1
fi

# Remove trailing slash
BACKEND_URL="${BACKEND_URL%/}"

# Convert https to wss for WebSocket
WS_URL="${BACKEND_URL/https/wss}"

echo ""
echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}✅ WebSocket URL: $WS_URL${NC}"
echo ""

# Step 5: Test backend
echo "🧪 Testing backend..."
if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend health check passed!${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Please verify your backend is running correctly"
    exit 1
fi
echo ""

# Step 6: Deploy frontend
echo "🎨 FRONTEND DEPLOYMENT"
echo "====================="
echo ""
echo "Logging into Vercel..."
vercel login

echo ""
echo "Deploying frontend..."
cd frontend

# Set environment variables
echo "Setting environment variables..."
vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL" || true
vercel env add NEXT_PUBLIC_WS_URL production <<< "$WS_URL" || true

# Deploy to production
echo "Deploying to production..."
FRONTEND_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*')

cd ..

echo ""
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo ""

# Step 7: Update CORS
echo "🔒 Updating CORS configuration..."

# Update main.py with the frontend URL
sed -i.bak "s|\"http://localhost:3002\"|\"http://localhost:3002\",\n        \"$FRONTEND_URL\"|" backend/main.py

git add backend/main.py
git commit -m "Update CORS for production frontend: $FRONTEND_URL"
git push origin main

echo -e "${GREEN}✅ CORS updated and pushed to GitHub${NC}"
echo "⏳ Render will auto-redeploy in ~2 minutes"
echo ""

# Step 8: Summary
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo -e "${GREEN}Frontend: $FRONTEND_URL${NC}"
echo -e "${GREEN}Backend:  $BACKEND_URL${NC}"
echo -e "${GREEN}GitHub:   https://github.com/matuskalis/ai-code-review-team${NC}"
echo ""
echo "Next steps:"
echo "1. Wait 2 minutes for Render to redeploy with new CORS settings"
echo "2. Visit $FRONTEND_URL and test the app"
echo "3. Take screenshots for README"
echo "4. Update README with production URLs"
echo "5. Run validation tests against production"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
