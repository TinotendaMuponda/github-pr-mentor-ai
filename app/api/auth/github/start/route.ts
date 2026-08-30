import { NextResponse } from "next/server";
import {
  OAUTH_CODE_VERIFIER_COOKIE_NAME,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_STATE_COOKIE_NAME
} from "@/lib/auth/constants";
import { createPkceChallenge, randomBase64Url } from "@/lib/auth/crypto";
import { getAppUrl, getOAuthEnvResult } from "@/lib/auth/env";
import { buildGitHubAuthorizeUrl } from "@/lib/auth/github-oauth";

export const runtime = "nodejs";

export async function GET() {
  const envResult = getOAuthEnvResult();

  if (!envResult.success) {
    const setupUrl = new URL("/auth/setup", getAppUrl());
    setupUrl.searchParams.set("missing", "github-oauth");

    return NextResponse.redirect(setupUrl);
  }

  const env = envResult.data;
  const state = randomBase64Url(32);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = createPkceChallenge(codeVerifier);
  const authorizeUrl = buildGitHubAuthorizeUrl({
    clientId: env.GITHUB_CLIENT_ID,
    redirectUri: env.GITHUB_OAUTH_REDIRECT_URI,
    scope: env.GITHUB_OAUTH_SCOPES,
    state,
    codeChallenge
  });

  const response = NextResponse.redirect(authorizeUrl);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure
  });

  response.cookies.set(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure
  });

  return response;
}
