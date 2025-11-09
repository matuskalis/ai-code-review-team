# GitHub OAuth Setup Instructions

The GitHub OAuth integration is now implemented in the frontend. To enable it, you need to configure the OAuth credentials.

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: AskNim (or your preferred name)
   - **Homepage URL**: `https://asknim.com`
   - **Authorization callback URL**: `https://asknim.com/api/auth/github/callback`
4. Click "Register application"
5. Note down the **Client ID**
6. Generate a new **Client Secret** and note it down

## Step 2: Configure Environment Variables in Vercel

Add the following environment variables to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

   ```
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

   **Important**:
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID` is visible to the client (required for OAuth initiation)
   - `GITHUB_CLIENT_SECRET` is server-only (never exposed to the client)

4. Make sure to add these for all environments (Production, Preview, Development)

## Step 3: Redeploy

After adding the environment variables, trigger a new deployment:

```bash
cd /Users/matuskalis/ai-code-review-team/frontend
vercel --prod
```

## Step 4: Test the Integration

1. Visit https://asknim.com
2. Click "Sign in with GitHub"
3. Authorize the application
4. You should be redirected back with your GitHub profile displayed
5. Click "Import from Repository" to see your repositories

## Features Implemented

- ✅ GitHub OAuth 2.0 flow with CSRF protection
- ✅ Secure token storage in httpOnly cookies
- ✅ User authentication state management
- ✅ Repository listing
- ✅ User profile display with avatar
- ✅ Sign out functionality
- 🚧 File browser (coming soon - currently shows repository selection)

## Security Notes

- State parameter validates CSRF attacks
- Access tokens stored in httpOnly cookies (not accessible via JavaScript)
- Tokens expire after 30 days
- Client secret is never exposed to the browser
