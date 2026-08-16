import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function json(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "cache-control": "no-store" } });
}
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) return json("Password service is not configured.", 503);
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: actor, error: actorError } = await publicClient.auth.getUser(token);
  if (actorError || !actor.user?.email) return json("Authentication required.", 401);

  const body = await request.json().catch(() => null) as { currentPassword?: unknown; newPassword?: unknown } | null;
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 8 || newPassword.length > 128) return json("New password must contain 8 to 128 characters.", 400);
  if (newPassword === currentPassword) return json("Choose a different password.", 400);

  const verifier = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: verified, error: verifyError } = await verifier.auth.signInWithPassword({ email: actor.user.email, password: currentPassword });
  if (verifyError || verified.user?.id !== actor.user.id) return json("Current password is incorrect.", 403);

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: updateError } = await adminClient.auth.admin.updateUserById(actor.user.id, { password: newPassword });
  if (updateError) return json("Password could not be changed.", 500);
  await adminClient.from("admin_audit_logs").insert({ actor_id: actor.user.id, action: "PASSWORD_CHANGED", target_table: "auth.users", target_id: actor.user.id, after_data: { changed_at: new Date().toISOString() } });
  await verifier.auth.signOut();
  return json("Password changed.", 200);
}
