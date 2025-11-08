# AI Code Review Team - Deployment Guide

**Estimated Time: 30 minutes**

This guide will help you deploy your AI Code Review Team to production.

---

## 🚀 Quick Deployment Steps

### Prerequisites
- GitHub account (already set up ✅)
- Render account (free tier)
- Vercel account (free tier)
- OpenAI API key (you have it ✅)

---

## Part 1: Deploy Backend to Render (15 minutes)

### Step 1: Push Your Code to GitHub

```bash
# From your project root
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your repository:**
   - Select `matuskalis/ai-code-review-team`
   - Click "Connect"

4. **Configure the service:**
   - **Name:** `ai-code-review-backend`
   - **Region:** Oregon (US West) - or closest to you
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

5. **Add Environment Variable:**
   - Click "Advanced" → "Add Environment Variable"
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `your-actual-openai-api-key`

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)
   - You'll see build logs
   - Once complete, you'll get a URL like: `https://ai-code-review-backend.onrender.com`

8. **Test your backend:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   # Should return: {"status": "healthy", "openai_configured": true}
   ```

**Save your backend URL - you'll need it for frontend deployment!**

---

## Part 2: Deploy Frontend to Vercel (10 minutes)

### Step 1: Login to Vercel

```bash
vercel login
# Follow the prompts to authenticate
```

### Step 2: Deploy Frontend

```bash
# From your project root
cd frontend
vercel
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? **(select your account)**
- Link to existing project? **N**
- What's your project's name? **ai-code-review-frontend** (or press Enter)
- In which directory is your code located? **./frontend** (or press Enter)
- Want to override the settings? **N**

### Step 3: Add Environment Variables

```bash
# Add production API URL
vercel env add NEXT_PUBLIC_API_URL

# When prompted:
# - What's the value? https://your-backend-url.onrender.com
# - Add to which environments? Select "Production"

# Add WebSocket URL
vercel env add NEXT_PUBLIC_WS_URL

# When prompted:
# - What's the value? wss://your-backend-url.onrender.com
# - Add to which environments? Select "Production"
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

**Your frontend will be live at:** `https://your-app.vercel.app`

---

## Part 3: Update CORS Configuration

After deploying, you need to update your backend CORS settings:

1. **Edit** `backend/main.py` line 21-27:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "https://your-app.vercel.app",  # ← ADD YOUR VERCEL URL HERE
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Commit and push:**

```bash
git add backend/main.py
git commit -m "Update CORS for production frontend"
git push origin main
```

3. **Render will auto-redeploy** (watch the dashboard)

---

## Part 4: Verify Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Rate limit status
curl https://your-backend-url.onrender.com/rate-limit-status

# Submit a test review
curl -X POST https://your-backend-url.onrender.com/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def test(): pass",
    "language": "python",
    "context": "Test function"
  }'
```

### Test Frontend
1. Visit `https://your-app.vercel.app`
2. Paste some code
3. Click "Run Review"
4. Watch agents stream results
5. Verify you see CWE tags, scores, and grades

---

## Part 5: Update Documentation

### Update README.md

Replace placeholders with your actual URLs:

**Line 13:**
```markdown
[Live Demo](https://your-app.vercel.app)
```

**Line 112:**
```markdown
git clone https://github.com/matuskalis/ai-code-review-team.git
```

### Commit and Push
```bash
git add README.md
git commit -m "Add production URLs to README"
git push origin main
```

---

## 🎉 You're Live!

**Your Production URLs:**
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend-url.onrender.com`
- **GitHub:** `https://github.com/matuskalis/ai-code-review-team`

---

## 📊 Monitoring & Maintenance

### Render Dashboard
- View logs: Render Dashboard → Your Service → Logs
- Monitor usage: Check metrics tab
- Redeploy: Manual deploy button or auto-deploys on git push

### Vercel Dashboard
- View analytics: Vercel Dashboard → Your Project → Analytics
- Check builds: Deployments tab
- View logs: Click on any deployment

### Cost Monitoring
- Render: 750 free hours/month (always on = ~720 hours)
- Vercel: 100GB bandwidth/month on free tier
- OpenAI: Track at platform.openai.com/usage

---

## 🐛 Troubleshooting

### Backend Health Check Fails
```bash
# Check Render logs in dashboard
# Verify OPENAI_API_KEY is set correctly
# Check that build completed successfully
```

### Frontend Can't Connect to Backend
```bash
# Verify environment variables are set:
vercel env ls

# Check CORS includes your Vercel URL
# Check browser console for errors
```

### CORS Errors
- Make sure backend CORS includes your Vercel URL
- Redeploy backend after updating CORS
- Clear browser cache

### Rate Limiting Issues
- Free tier: 5 reviews/day/IP
- Use X-Admin-Password header to bypass (see config.py)
- Rate limits reset at midnight UTC

---

## 🔐 Security Checklist

- [ ] `.env` is in `.gitignore` (already done ✅)
- [ ] OPENAI_API_KEY is only in Render environment variables
- [ ] Never commit API keys to git
- [ ] CORS only allows your domains
- [ ] Admin password is secure (change in production)

---

## 📈 Next Steps

1. **Take Screenshots** for README
2. **Run Validation Tests** against production
3. **Update VALIDATION_REPORT.md** with production results
4. **Add to CV/Portfolio**
5. **Share on LinkedIn/Twitter**

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Issues:** https://github.com/matuskalis/ai-code-review-team/issues

---

**Deployment created by:** Claude Code
**Last updated:** 2025-11-08
