import { SignJWT, importPKCS8 } from "jose";

export function muxConfigured() {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

function muxAuth() {
  const id = process.env.MUX_TOKEN_ID;
  const secret = process.env.MUX_TOKEN_SECRET;
  if (!id || !secret) throw new Error("Mux API credentials are not configured");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function muxRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", muxAuth());
  headers.set("Content-Type", "application/json");
  const response = await fetch(`https://api.mux.com${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`Mux API ${response.status}: ${await response.text()}`);
  return response.json();
}

function privateKeyPem() {
  const raw = process.env.MUX_SIGNING_PRIVATE_KEY;
  if (!raw) throw new Error("Mux signing key is not configured");
  if (raw.includes("BEGIN")) return raw.replace(/\\n/g, "\n");
  return Buffer.from(raw, "base64").toString("utf8");
}

export async function signMuxPlaybackToken(playbackId: string, expirationSeconds = 900) {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  if (!keyId) throw new Error("Mux signing key ID is not configured");
  const key = await importPKCS8(privateKeyPem(), "RS256");
  return new SignJWT({ sub: playbackId, aud: "v" })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
    .sign(key);
}

export function muxWebhookSecret() {
  return process.env.MUX_WEBHOOK_SECRET || "";
}

export function verifyMuxSignature(rawBody: string, signature: string, secret: string) {
  const values = Object.fromEntries(signature.split(",").map((part) => part.split("=")));
  const timestamp = values.t;
  const received = values.v1;
  if (!timestamp || !received) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
