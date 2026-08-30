import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPkceChallenge,
  createSessionCookieValue,
  decryptText,
  encryptText,
  randomBase64Url,
  verifySessionCookieValue
} from "@/lib/auth/crypto";

describe("auth crypto helpers", () => {
  it("creates URL-safe random values", () => {
    const value = randomBase64Url();

    assert.match(value, /^[A-Za-z0-9_-]+$/);
  });

  it("creates a PKCE challenge from a verifier", () => {
    const challenge = createPkceChallenge(
      "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    );

    assert.equal(challenge, "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("verifies signed session cookie values", () => {
    const secret = "a".repeat(32);
    const session = createSessionCookieValue("session_123", secret);

    assert.deepEqual(verifySessionCookieValue(session.cookieValue, secret), {
      sessionId: "session_123",
      tokenHash: session.tokenHash
    });
    assert.equal(
      verifySessionCookieValue(session.cookieValue, "b".repeat(32)),
      null
    );
  });

  it("encrypts and decrypts access tokens", () => {
    const key = Buffer.alloc(32, "learning").toString("base64");
    const encrypted = encryptText("gho_example_token", key);

    assert.notEqual(encrypted, "gho_example_token");
    assert.equal(decryptText(encrypted, key), "gho_example_token");
  });
});
