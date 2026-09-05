import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signMuxPlaybackToken } from "@/lib/muxServer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const lessonId = Number(new URL(request.url).searchParams.get("lessonId"));
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service || !token || !Number.isInteger(lessonId)) return NextResponse.json({ error: "Authentication and lessonId are required." }, { status: 401 });
  const publicClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data: userData } = await publicClient.auth.getUser(token);
  if (!userData.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: lesson } = await admin.from("knowledge_lessons").select("id,product_id,free_preview,status,knowledge_products!inner(status,price)").eq("id", lessonId).single();
  const product = Array.isArray(lesson?.knowledge_products) ? lesson.knowledge_products[0] : lesson?.knowledge_products;
  if (!lesson || lesson.status !== "published" || product?.status !== "published") return NextResponse.json({ error: "Lesson is not available." }, { status: 404 });
  if (!lesson.free_preview && Number(product.price) > 0) {
    const { data: access } = await admin.from("knowledge_access").select("product_id").eq("product_id", lesson.product_id).eq("user_id", userData.user.id).maybeSingle();
    if (!access) return NextResponse.json({ error: "Course purchase required." }, { status: 403 });
  }
  const { data: content } = await admin.from("knowledge_lesson_content").select("mux_playback_id,mux_status").eq("lesson_id", lessonId).single();
  if (!content?.mux_playback_id || content.mux_status !== "ready") return NextResponse.json({ error: "Video is still processing." }, { status: 409 });
  const signedToken = await signMuxPlaybackToken(content.mux_playback_id);
  return NextResponse.json({ playbackId: content.mux_playback_id, token: signedToken, expiresIn: 900 });
}
