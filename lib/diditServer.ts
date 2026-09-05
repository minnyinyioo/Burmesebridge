import { createHmac, timingSafeEqual } from "crypto";
import { appConfig } from "@/lib/config";

export type DiditSessionPayload = {
  kycId: number;
  userId: string;
  email?: string | null;
  legalName: string;
  locale: string;
};

export function diditConfigured() {
  return Boolean(process.env.DIDIT_API_KEY);
}

function diditBaseUrl() {
  return (process.env.DIDIT_API_BASE_URL || "https://verification.didit.me").replace(/\/+$/, "");
}

export function diditWebhookSecret() {
  return process.env.DIDIT_WEBHOOK_SECRET || "";
}

export function verifyDiditSignature(rawBody: string, signatureHeader: string, secret: string) {
  if (!signatureHeader || !secret) return false;
  const signatures = signatureHeader.split(",").map((part) => part.trim()).filter(Boolean);
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return signatures.some((signature) => {
    const candidate = signature.includes("=") ? signature.split("=").pop() || "" : signature;
    try {
      const left = Buffer.from(candidate, "hex");
      const right = Buffer.from(expected, "hex");
      return left.length === right.length && timingSafeEqual(left, right);
    } catch {
      return false;
    }
  });
}

export async function createDiditSession(payload: DiditSessionPayload) {
  const endpoint = process.env.DIDIT_CREATE_SESSION_URL || `${diditBaseUrl()}/v2/session/`;
  const callbackUrl = `${appConfig.domain}/api/webhooks/didit`;
  const vendorData = JSON.stringify({ kycId: payload.kycId, userId: payload.userId });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.DIDIT_API_KEY || "",
    },
    body: JSON.stringify({
      workflow_id: process.env.DIDIT_WORKFLOW_ID || undefined,
      callback: callbackUrl,
      callback_url: callbackUrl,
      vendor_data: vendorData,
      reference_id: `kyc-${payload.kycId}`,
      contact_details: payload.email ? { email: payload.email } : undefined,
      user: {
        id: payload.userId,
        email: payload.email || undefined,
        name: payload.legalName,
      },
      metadata: {
        kyc_id: payload.kycId,
        user_id: payload.userId,
        source: "burmesebridge",
      },
      language: payload.locale,
      redirect_url: `${appConfig.domain}/${payload.locale}/kyc`,
    }),
  });
  const data = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const detail = data?.message || data?.error || data?.detail || response.statusText;
    throw new Error(`Didit session creation failed: ${String(detail)}`);
  }
  return data || {};
}

export function extractDiditSession(data: Record<string, unknown>) {
  const nested = (data.data && typeof data.data === "object" ? data.data : data) as Record<string, unknown>;
  return {
    id: String(nested.id || nested.session_id || nested.sessionId || nested.verification_id || ""),
    url: String(nested.url || nested.session_url || nested.hosted_url || nested.redirect_url || ""),
    status: String(nested.status || nested.state || "created"),
  };
}

export function parseDiditVendorData(value: unknown) {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}
