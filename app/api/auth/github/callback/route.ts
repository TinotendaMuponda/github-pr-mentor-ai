import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_CODE_VERIFIER_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import { encryptText } from "@/lib/auth/crypto";
import { getOAuthEnv } from "@/lib/auth/env";
import {
  exchangeCodeForGitHubToken,
  fetchGitHubUserProfile,
  fetchPrimaryGitHubEmail
} from "@/lib/auth/github-oauth";
import { createUserSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getOAuthEnv();
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const codeVerifier = request.cookies.get(OAUTH_CODE_VERIFIER_COOKIE_NAME)?.value;

  if (error) {
    return redirectWithAuthError(env.APP_URL, error);
  }

  if (!code || !returnedState || !expectedState || !codeVerifier) {
    return redirectWithAuthError(env.APP_URL, "missing_oauth_parameters");
  }

  if (returnedState !== expectedState) {
    return redirectWithAuthError(env.APP_URL, "invalid_oauth_state");
  }

  const token = await exchangeCodeForGitHubToken({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    code,
    redirectUri: env.GITHUB_OAUTH_REDIRECT_URI,
    codeVerifier
  });

  const [profile, primaryEmail] = await Promise.all([
    fetchGitHubUserProfile(token.access_token),
    fetchPrimaryGitHubEmail(token.access_token)
  ]);

  const user = await prisma.user.upsert({
    where: {
      githubId: String(profile.id)
    },
    update: {
      login: profile.login,
      name: profile.name,
      email: primaryEmail ?? profile.email,
      avatarUrl: profile.avatar_url
    },
    create: {
      githubId: String(profile.id),
      login: profile.login,
      name: profile.name,
      email: primaryEmail ?? profile.email,
      avatarUrl: profile.avatar_url
    }
  });

  await prisma.gitHubAccount.upsert({
    where: {
      providerAccountId: String(profile.id)
    },
    update: {
      userId: user.id,
      accessTokenCiphertext: encryptText(
        token.access_token,
        env.TOKEN_ENCRYPTION_KEY
      ),
      tokenScope: token.scope,
      tokenType: token.token_type,
      expiresAt: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000)
        : null
    },
    create: {
      userId: user.id,
      providerAccountId: String(profile.id),
      accessTokenCiphertext: encryptText(
        token.access_token,
        env.TOKEN_ENCRYPTION_KEY
      ),
      tokenScope: token.scope,
      tokenType: token.token_type,
      expiresAt: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000)
        : null
    }
  });

  const session = await createUserSession(user.id);
  const response = NextResponse.redirect(new URL("/dashboard", env.APP_URL));
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(SESSION_COOKIE_NAME, session.cookieValue, {
    expires: session.expiresAt,
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure
  });
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  response.cookies.delete(OAUTH_CODE_VERIFIER_COOKIE_NAME);

  return response;
}

function redirectWithAuthError(appUrl: string, error: string) {
  const redirectUrl = new URL("/", appUrl);
  redirectUrl.searchParams.set("auth_error", error);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  response.cookies.delete(OAUTH_CODE_VERIFIER_COOKIE_NAME);

  return response;
}
