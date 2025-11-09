import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Verify state parameter (CSRF protection)
  const savedState = request.cookies.get('github_oauth_state')?.value;

  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=invalid_state`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=no_code`
    );
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=config_missing`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/?error=${tokenData.error}`
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const reposData = await reposResponse.json();

    // Create response and store auth data in secure cookie
    const response = NextResponse.redirect(
      `${request.nextUrl.origin}/?github_auth=success`
    );

    // Store access token securely (httpOnly cookie)
    response.cookies.set('github_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    // Store user data in a readable cookie (for frontend)
    response.cookies.set('github_user', JSON.stringify({
      id: userData.id,
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      email: userData.email,
    }), {
      httpOnly: false, // Readable by frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    });

    // Clear state cookie
    response.cookies.delete('github_oauth_state');

    return response;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=auth_failed`
    );
  }
}
