import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service || !token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const publicClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data } = await publicClient.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  const body = await request.json();
  const lessonId = Number(body.lessonId);
  const position = Math.max(0, Math.floor(Number(body.positionSeconds) || 0));
  if (!Number.isInteger(lessonId) || lessonId <= 0) return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { error } = await admin.from("knowledge_lesson_progress").upsert({ lesson_id: lessonId, user_id: data.user.id, position_seconds: position, completed: Boolean(body.completed), updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true });
}
