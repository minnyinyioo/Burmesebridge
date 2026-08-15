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

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return json("Authentication required.", 401);

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await publicClient.auth.getUser(accessToken);
  if (error || !data.user) return json("Invalid or expired session.", 401);

  if (data.user.app_metadata?.must_change_password !== true) {
    return json("A forced password change is not required.", 400);
  }

  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 128) return json("Password must contain 8 to 128 characters.", 400);

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: updateError } = await adminClient.auth.admin.updateUserById(data.user.id, {
    password,
    app_metadata: {
      ...data.user.app_metadata,
      must_change_password: false,
      password_changed_at: new Date().toISOString(),
    },
  });
  if (updateError) return json("Password change could not be acknowledged.", 500);
  return json("Password changed.", 200);
}
