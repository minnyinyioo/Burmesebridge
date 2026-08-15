import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function json(message: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ message, ...extra }, { status, headers: { "cache-control": "no-store" } });
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

  const body = await request.json().catch(() => null) as { userId?: unknown; confirmation?: unknown } | null;
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(userId)) return json("A valid user ID is required.", 400);
  if (body?.confirmation !== userId) return json("A second confirmation is required.", 400);
  if (userId === actorData.user.id) return json("Administrators cannot use this tool on their own account.", 400);

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [{ count: recentActorResets }, { count: recentTargetResets }] = await Promise.all([
    adminClient.from("admin_audit_logs").select("id", { count: "exact", head: true })
      .eq("actor_id", actorData.user.id).eq("action", "PASSWORD_RESET").gte("created_at", fifteenMinutesAgo),
    adminClient.from("admin_audit_logs").select("id", { count: "exact", head: true })
      .eq("target_id", userId).eq("action", "PASSWORD_RESET").gte("created_at", oneHourAgo),
  ]);
  if ((recentActorResets || 0) >= 5) return json("Too many password resets. Try again in 15 minutes.", 429);
  if ((recentTargetResets || 0) >= 1) return json("This account was reset recently. Try again in one hour.", 429);

  const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(userId);
  if (targetError || !targetData.user) return json("User not found.", 404);

  const temporaryPassword = `${randomBytes(18).toString("base64url")}!9a`;
  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
    user_metadata: {
      ...targetData.user.user_metadata,
      password_reset_by_admin_at: new Date().toISOString(),
    },
    app_metadata: {
      ...targetData.user.app_metadata,
      must_change_password: true,
    },
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
