import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function json(message: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ message, ...extra }, { status });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) return json("Password reset service is not configured.", 503);

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return json("Authentication required.", 401);

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: actorData, error: actorError } = await publicClient.auth.getUser(accessToken);
  if (actorError || !actorData.user) return json("Invalid or expired session.", 401);

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: actorProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", actorData.user.id)
    .single();
  if (actorProfile?.role !== "admin") return json("Only administrators can reset passwords.", 403);

  const body = await request.json().catch(() => null) as { userId?: unknown } | null;
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(userId)) return json("A valid user ID is required.", 400);

  const temporaryPassword = `${randomBytes(18).toString("base64url")}!9a`;
  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
    user_metadata: { password_reset_by_admin_at: new Date().toISOString() },
  });
  if (updateError) return json("The password could not be reset.", 500);

  await adminClient.from("admin_audit_logs").insert({
    actor_id: actorData.user.id,
    action: "PASSWORD_RESET",
    target_table: "auth.users",
    target_id: userId,
    after_data: { reset_at: new Date().toISOString() },
  });

  return json("Temporary password created.", 200, { temporaryPassword });
}
