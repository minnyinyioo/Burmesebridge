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
  const workflowId = process.env.DIDIT_WORKFLOW_ID?.trim();
  if (!workflowId) throw new Error("Didit workflow is not configured. Set DIDIT_WORKFLOW_ID in Vercel.");
  // Didit's current Sessions API is hosted at verification.didit.me/v3.
  // Do not derive this from the legacy API base URL, which may still be set
  // to apx.didit.me/auth from the old v2 integration.
  const endpoint = process.env.DIDIT_CREATE_SESSION_URL || "https://verification.didit.me/v3/session/";
  const callbackUrl = `${appConfig.domain}/api/webhooks/didit`;
  const vendorData = `kyc-${payload.kycId}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.DIDIT_API_KEY || "",
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      callback: callbackUrl,
      callback_method: "both",
      vendor_data: vendorData,
      contact_details: payload.email ? { email: payload.email, send_notification_emails: false } : undefined,
      metadata: {
        kyc_id: payload.kycId,
        user_id: payload.userId,
        source: "burmesebridge",
      },
      language: payload.locale,
    }),
  });
  const data = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const detail = data?.message || data?.error || data?.detail || (data && Object.keys(data).length ? JSON.stringify(data) : response.statusText);
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
