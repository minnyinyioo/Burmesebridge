import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function json(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "cache-control": "no-store" } });
}

export async function DELETE(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) return json("Account deletion is not configured.", 503);

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return json("Authentication required.", 401);

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await publicClient.auth.getUser(accessToken);
  if (error || !data.user?.email) return json("Invalid or expired session.", 401);

  const body = await request.json().catch(() => null) as { confirmation?: unknown } | null;
  const expected = `DELETE ${data.user.email}`;
  if (body?.confirmation !== expected) return json("Account deletion confirmation did not match.", 400);

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await adminClient.from("admin_audit_logs").insert({
    actor_id: data.user.id,
    action: "ACCOUNT_DELETION_REQUESTED",
    target_table: "auth.users",
    target_id: data.user.id,
    after_data: { requested_at: new Date().toISOString() },
  });

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(data.user.id, false);
  if (deleteAuthError) return json("The account could not be deleted.", 500);
  const { error: deleteProfileError } = await adminClient.from("profiles").delete().eq("id", data.user.id);
  if (deleteProfileError) return json("The account was removed, but profile cleanup requires administrator review.", 202);
  return json("Account deleted.", 200);
}

