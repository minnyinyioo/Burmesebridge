import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createDiditSession, diditConfigured, extractDiditSession } from "@/lib/diditServer";

export const runtime = "nodejs";

function json(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ message, ...extra }, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceRoleKey) return json("KYC service is not configured.", 503);
    if (!diditConfigured()) return json("Didit is not configured.", 503);

    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!accessToken) return json("Authentication required.", 401);

    const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await publicClient.auth.getUser(accessToken);
    if (userError || !userData.user) return json("Invalid or expired session.", 401);

    const body = await request.json().catch(() => null) as { kycId?: unknown; locale?: unknown } | null;
    const kycId = Number(body?.kycId);
    if (!Number.isInteger(kycId) || kycId <= 0) return json("A valid KYC application is required.", 400);
    const locale = typeof body?.locale === "string" && /^(my|zh|en)$/.test(body.locale) ? body.locale : "en";

    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: row, error: rowError } = await admin
      .from("kyc_verifications")
      .select("id,user_id,legal_name,status,didit_session_id,didit_session_url,profiles!kyc_verifications_user_id_fkey(email)")
      .eq("id", kycId)
      .eq("user_id", userData.user.id)
      .single();
    if (rowError || !row) return json("KYC application not found.", 404);
    if (!["pending", "in_review"].includes(String(row.status))) return json("This KYC application is no longer open.", 409);
    if (row.didit_session_url) return json("Didit session already exists.", 200, { sessionUrl: row.didit_session_url, sessionId: row.didit_session_id });

    const profile = row.profiles as unknown as { email?: string | null } | { email?: string | null }[] | null;
    const email = Array.isArray(profile) ? profile[0]?.email : profile?.email;
    const result = await createDiditSession({
      kycId: row.id,
      userId: row.user_id,
      email: email || userData.user.email,
      legalName: row.legal_name,
      locale,
    });
    const session = extractDiditSession(result);
    if (!session.url) return json("Didit did not return a hosted verification URL.", 502, { didit: result });

    await admin.from("kyc_verifications").update({
      status: "in_review",
      didit_session_id: session.id || null,
      didit_session_url: session.url,
      didit_session_status: session.status,
      didit_updated_at: new Date().toISOString(),
    }).eq("id", row.id);

    await admin.from("admin_audit_logs").insert({
      actor_id: userData.user.id,
      action: "DIDIT_KYC_SESSION_CREATED",
      target_table: "kyc_verifications",
      target_id: String(row.id),
      after_data: { didit_session_id: session.id || null },
    });

    return json("Didit session created.", 200, { sessionUrl: session.url, sessionId: session.id });
  } catch (error) {
    return json(error instanceof Error ? error.message : "Didit session could not be created.", 500);
  }
}
