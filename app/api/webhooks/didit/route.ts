import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { diditWebhookSecret, parseDiditVendorData, verifyDiditSignature } from "@/lib/diditServer";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, service: "didit-webhook", accepts: "signed POST" });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = diditWebhookSecret();
  const signature = request.headers.get("x-signature") || request.headers.get("x-didit-signature") || request.headers.get("didit-signature") || "";
  if (!secret) return NextResponse.json({ error: "Didit webhook secret is not configured." }, { status: 503 });
  if (!verifyDiditSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(raw) as Record<string, unknown>;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

  const data = (event.data && typeof event.data === "object" ? event.data : event) as Record<string, unknown>;
  const sessionId = String(data.id || data.session_id || data.sessionId || data.verification_id || event.session_id || "");
  const eventId = String(event.id || event.event_id || `${sessionId}-${event.type || data.status || Date.now()}`);
  const vendor = parseDiditVendorData(data.vendor_data || data.vendorData || data.reference || data.metadata);
  const kycId = Number(vendor.kycId || vendor.kyc_id || String(data.reference_id || "").replace(/^kyc-/, ""));
  const status = String(data.status || data.state || data.decision || event.type || "updated").toLowerCase();
  const verified = /approved|verified|completed|success|accept|passed/.test(status);
  const failed = /declined|rejected|failed|abandon|expired|canceled|cancelled/.test(status);

  await admin.from("didit_webhook_events").upsert({
    event_id: eventId,
    session_id: sessionId || null,
    event_type: String(event.type || data.type || status),
    payload: event,
  }, { onConflict: "event_id" });

  if (Number.isInteger(kycId) && kycId > 0) {
    const update: Record<string, unknown> = {
      didit_session_id: sessionId || null,
      didit_session_status: status,
      didit_decision: data,
      didit_updated_at: new Date().toISOString(),
    };
    if (verified) update.didit_verified_at = new Date().toISOString();
    if (failed) update.review_note = "Didit identity verification did not pass. Admin should review before making a final decision.";
    await admin.from("kyc_verifications").update(update).eq("id", kycId);
  }

  return NextResponse.json({ received: true });
}
