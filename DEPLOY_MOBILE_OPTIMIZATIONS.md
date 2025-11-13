# Deploy Mobile Optimizations to asknim.com

## ⚠️ IMPORTANT: Deploy Order

Deploy in this exact order to avoid downtime:

1. **Backend first** (Railway)
2. **Frontend second** (Vercel)

---

## Step 1: Deploy Backend to Railway

### 1a. Commit Backend Changes

```bash
cd /Users/matuskalis/ai-code-review-team

# Add backend changes
git add backend/

# Commit
git commit -m "feat: add mobile optimizations - backend

- Add GZip compression for faster mobile loading
- Enhanced rate limiter with hourly limits + burst
- Add pydantic-settings for config validation
- Update config to use Pydantic BaseSettings
- Add response compression middleware"
```

### 1b. Push to GitHub

```bash
git push origin main
```

### 1c. Verify Railway Deployment

1. Go to https://railway.app/dashboard
2. Find your `ai-code-review-team` project
3. Watch the deployment logs
4. **WAIT for "Build successful" message**
5. Test the backend:
   ```bash
   curl https://ai-code-review-team-production-7150.up.railway.app/health
   ```

### 1d. If Deployment Fails

Railway logs will show errors. Common issues:
- `ModuleNotFoundError: pydantic_settings`
  - **Fix**: Railway should auto-install from requirements.txt
  - Check that requirements.txt was committed
- Config validation error
  - **Fix**: Check Railway environment has `OPENAI_API_KEY` set

---

## Step 2: Deploy Frontend to Vercel

### 2a. Commit Frontend Changes

```bash
# Add frontend changes
git add frontend/
git add frontend/public/manifest.json

# Add new components
git add frontend/components/MobileNav.tsx
git add frontend/components/BottomSheet.tsx
git add frontend/components/ErrorBoundary.tsx

# Commit
git commit -m "feat: add mobile optimizations - frontend

- Add mobile navigation with hamburger menu
- Add bottom sheet for mobile filters
- Add error boundary for crash recovery
- Add PWA manifest for mobile install
- Make tables responsive with horizontal scroll
- Add sticky filter bar on mobile
- Improve WebSocket reconnection
- Fix floating CTA for mobile
- Add touch-friendly buttons (44x44px)"
```

### 2b. Push to GitHub

```bash
git push origin main
```

### 2c. Verify Vercel Deployment

1. Vercel will auto-deploy from GitHub
2. Watch at https://vercel.com/dashboard
3. **WAIT for "Deployment successful"**
4. Test at https://asknim.com

---

## Step 3: Test Mobile Optimizations

### On Desktop Browser

1. Open https://asknim.com
2. Press `Cmd + Shift + M` (DevTools device mode)
3. Select "iPhone 12 Pro"
4. Test:
   - [ ] Hamburger menu opens
   - [ ] Bottom sheet filters work
   - [ ] Tables scroll horizontally
   - [ ] Floating CTA is positioned correctly
   - [ ] All buttons are tappable (44x44px)

### On Real Mobile Device

1. Open https://asknim.com on your phone
2. Test same features
3. Try installing as PWA (Add to Home Screen)

---

## Step 4: Monitor for Issues

### Check Backend Logs (Railway)

```bash
# In Railway dashboard:
# 1. Click on your service
# 2. Go to "Deployments"
# 3. Click latest deployment
# 4. Check logs for errors
```

### Check Frontend Logs (Vercel)

```bash
# In Vercel dashboard:
# 1. Go to your project
# 2. Click "Deployments"
# 3. Click latest deployment
# 4. Check "Build Logs" and "Function Logs"
```

---

## ⚠️ Rollback Plan (if something breaks)

### Rollback Backend

```bash
# In Railway dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." menu
# 4. Click "Redeploy"
```

### Rollback Frontend

```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous deployment
# 3. Click "..." menu
# 4. Click "Promote to Production"
```

### Or rollback code:

```bash
git log --oneline  # Find the commit hash before changes
git revert <commit-hash>
git push origin main
```

---

## Expected Results

After successful deployment, users on asknim.com will see:

✅ **Mobile Navigation** - Hamburger menu on small screens
✅ **Better Filters** - Bottom sheet on mobile
✅ **Responsive Tables** - Horizontal scroll
✅ **PWA Support** - Can install to home screen
✅ **Better Performance** - GZip compression
✅ **More Reliable** - WebSocket auto-reconnect
✅ **Better Rate Limits** - Hourly limits prevent accidental exhaustion

---

## Questions?

If deployment fails:
1. Check logs in Railway/Vercel dashboards
2. Verify environment variables are set
3. Test backend health endpoint
4. Check browser console for frontend errors
