import { z } from "zod";

const oauthEnvSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required."),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required."),
  GITHUB_OAUTH_REDIRECT_URI: z.string().url(),
  GITHUB_OAUTH_SCOPES: z.string().default("read:user user:email"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters."),
  TOKEN_ENCRYPTION_KEY: z.string().min(1, "TOKEN_ENCRYPTION_KEY is required.")
});

export type OAuthEnv = z.infer<typeof oauthEnvSchema>;

export function getOAuthEnv() {
  return oauthEnvSchema.parse(process.env);
}

export function getOAuthEnvResult() {
  return oauthEnvSchema.safeParse(process.env);
}

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return secret;
}

export function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}
