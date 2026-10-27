// Uses only the Web Crypto API (globalThis.crypto.subtle) so this works
// unmodified in both the Edge Runtime (middleware) and the Node.js runtime
// (API routes) \u2014 no 'node:crypto' import, which the Edge Runtime rejects.

const COOKIE_NAME = "ksy_admin_session";
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it as an environment variable (any long random string)."
    );
  }
  return secret;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value) {
  const key = await hmacKey(getSecret());
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sigBuffer);
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Builds a cookie value: "<expiryEpoch>.<signature>"
export async function createSessionToken() {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  const expected = await sign(payload);
  if (!constantTimeEqual(expected, signature)) return false;
  return Number(payload) > Date.now();
}

export async function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set as an environment variable.");
  }
  if (!candidate || candidate.length !== expected.length) return false;
  return constantTimeEqual(candidate, expected);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
