import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGitHubAuthorizeUrl } from "@/lib/auth/github-oauth";

describe("GitHub OAuth URL builder", () => {
  it("builds an authorize URL with state and PKCE", () => {
    const url = buildGitHubAuthorizeUrl({
      clientId: "client-id",
      redirectUri: "http://localhost:3000/api/auth/github/callback",
      scope: "read:user user:email",
      state: "state-value",
      codeChallenge: "challenge-value"
    });

    assert.equal(url.origin, "https://github.com");
    assert.equal(url.pathname, "/login/oauth/authorize");
    assert.equal(url.searchParams.get("client_id"), "client-id");
    assert.equal(
      url.searchParams.get("redirect_uri"),
      "http://localhost:3000/api/auth/github/callback"
    );
    assert.equal(url.searchParams.get("scope"), "read:user user:email");
    assert.equal(url.searchParams.get("state"), "state-value");
    assert.equal(url.searchParams.get("code_challenge"), "challenge-value");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  });
});
