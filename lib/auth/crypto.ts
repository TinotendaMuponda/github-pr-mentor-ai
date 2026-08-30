import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual
} from "node:crypto";

const AES_GCM_IV_BYTES = 12;
const AES_GCM_TAG_BYTES = 16;

export function randomBase64Url(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

export function sha256Base64Url(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function hmacBase64Url(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createPkceChallenge(verifier: string) {
  return sha256Base64Url(verifier);
}

export function createSessionCookieValue(sessionId: string, sessionSecret: string) {
  const rawToken = randomBase64Url(32);
  const payload = `${sessionId}.${rawToken}`;
  const signature = hmacBase64Url(payload, sessionSecret);

  return {
    cookieValue: `${payload}.${signature}`,
    tokenHash: sha256Base64Url(rawToken)
  };
}

export function verifySessionCookieValue(
  cookieValue: string | undefined,
  sessionSecret: string
) {
  if (!cookieValue) {
    return null;
  }

  const [sessionId, rawToken, signature] = cookieValue.split(".");

  if (!sessionId || !rawToken || !signature) {
    return null;
  }

  const payload = `${sessionId}.${rawToken}`;
  const expectedSignature = hmacBase64Url(payload, sessionSecret);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  return {
    sessionId,
    tokenHash: sha256Base64Url(rawToken)
  };
}

export function encryptText(plainText: string, keyText: string) {
  const key = parseEncryptionKey(keyText);
  const iv = randomBytes(AES_GCM_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, ciphertext]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptText(encryptedText: string, keyText: string) {
  const key = parseEncryptionKey(keyText);
  const [ivText, tagText, ciphertextText] = encryptedText.split(".");

  if (!ivText || !tagText || !ciphertextText) {
    throw new Error("Encrypted text is not in the expected format.");
  }

  const iv = Buffer.from(ivText, "base64url");
  const tag = Buffer.from(tagText, "base64url");
  const ciphertext = Buffer.from(ciphertextText, "base64url");

  if (iv.length !== AES_GCM_IV_BYTES || tag.length !== AES_GCM_TAG_BYTES) {
    throw new Error("Encrypted text contains invalid AES-GCM parts.");
  }

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8"
  );
}

function parseEncryptionKey(keyText: string) {
  const trimmed = keyText.trim();
  const key = /^[a-f0-9]{64}$/i.test(trimmed)
    ? Buffer.from(trimmed, "hex")
    : Buffer.from(trimmed, "base64");

  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes. Generate one with: openssl rand -base64 32"
    );
  }

  return key;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
