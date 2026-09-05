import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { muxConfigured, muxRequest } from "@/lib/muxServer";

export const runtime = "nodejs";

async function authorize(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anon || !service || !token) return { error: "Authentication required.", status: 401 };
  const publicClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await publicClient.auth.getUser(token);
  if (!data.user) return { error: "Invalid session.", status: 401 };
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).single();
  if (!profile || !["admin", "moderator"].includes(profile.role)) return { error: "Admin review access required.", status: 403 };
  return { error: null, status: 200, admin };
}

export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (!muxConfigured()) return NextResponse.json({ error: "Mux is not configured." }, { status: 503 });
    const body = await request.json();
    const lessonId = Number(body.lessonId);
    if (!Number.isInteger(lessonId) || lessonId <= 0) return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
    const result = await muxRequest("/video/v1/uploads", {
      method: "POST",
      body: JSON.stringify({
        cors_origin: process.env.NEXT_PUBLIC_SITE_URL || "https://burmesebridge.com",
        new_asset_settings: {
          playback_policies: ["signed"],
          video_quality: "basic",
          passthrough: JSON.stringify({ lessonId }),
        },
      }),
    });
    const upload = result.data;
    await auth.admin!.from("knowledge_lesson_content").update({ mux_upload_id: upload.id, mux_status: "waiting" }).eq("lesson_id", lessonId);
    return NextResponse.json({ uploadId: upload.id, uploadUrl: upload.url, status: upload.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Mux upload creation failed." }, { status: 500 });
  }
}
