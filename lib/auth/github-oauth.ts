import { z } from "zod";

type BuildAuthorizeUrlInput = {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
};

const accessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  expires_in: z.number().optional()
});

const githubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  html_url: z.string().url()
});

const githubEmailSchema = z.object({
  email: z.string().email(),
  primary: z.boolean(),
  verified: z.boolean()
});

export type GitHubUserProfile = z.infer<typeof githubUserSchema>;

export function buildGitHubAuthorizeUrl(input: BuildAuthorizeUrlInput) {
  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", input.scope);
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url;
}

export async function exchangeCodeForGitHubToken(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
      code_verifier: input.codeVerifier
    })
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with ${response.status}.`);
  }

  if (
    typeof body === "object" &&
    body &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    throw new Error(`GitHub token exchange failed: ${body.error}`);
  }

  return accessTokenSchema.parse(body);
}

export async function fetchGitHubUserProfile(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed with ${response.status}.`);
  }

  return githubUserSchema.parse(await response.json());
}

export async function fetchPrimaryGitHubEmail(accessToken: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    return null;
  }

  const emails = z.array(githubEmailSchema).parse(await response.json());
  const primaryEmail = emails.find((email) => email.primary && email.verified);

  return primaryEmail?.email ?? null;
}
