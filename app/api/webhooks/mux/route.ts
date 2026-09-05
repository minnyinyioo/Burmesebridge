import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { muxWebhookSecret, verifyMuxSignature } from "@/lib/muxServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("mux-signature") || "";
  const secret = muxWebhookSecret();
  if (!secret || !verifyMuxSignature(raw, signature, secret)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  const event = JSON.parse(raw) as { type?: string; data?: Record<string, unknown> };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const data = event.data || {};
  if (event.type === "video.upload.asset_created") {
    await admin.from("knowledge_lesson_content").update({ mux_asset_id: String(data.asset_id || ""), mux_status: "preparing" }).eq("mux_upload_id", String(data.id || ""));
  } else if (event.type === "video.asset.ready") {
    const playback = Array.isArray(data.playback_ids) ? data.playback_ids.find((item) => (item as { policy?: string }).policy === "signed") : null;
    await admin.from("knowledge_lesson_content").update({ mux_playback_id: playback ? String((playback as { id: string }).id) : null, mux_status: "ready" }).eq("mux_asset_id", String(data.id || ""));
  } else if (event.type === "video.asset.errored") {
    await admin.from("knowledge_lesson_content").update({ mux_status: "errored" }).eq("mux_asset_id", String(data.id || ""));
  } else if (event.type === "video.asset.deleted") {
    await admin.from("knowledge_lesson_content").update({ mux_asset_id: null, mux_playback_id: null, mux_status: "none" }).eq("mux_asset_id", String(data.id || ""));
  }
  return NextResponse.json({ received: true });
}
