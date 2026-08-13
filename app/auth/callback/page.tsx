"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finish() {
      const { supabase } = await import("@/lib/supabase");
      const params = new URLSearchParams(window.location.search);
      const locale = params.get("locale") || "zh";
      const next = params.get("next") || `/${locale}/reset-password`;
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type") || "recovery";
      let authError: Error | null = null;

      if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        authError = result.error;
      } else if (tokenHash) {
        const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "recovery" });
        authError = result.error;
      } else if (window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const result = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          authError = result.error;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (authError || !data.session) {
        setError(authError?.message || "The recovery link is invalid or expired.");
        return;
      }
      router.replace(next.startsWith("/") ? next : `/${locale}/reset-password`);
    }
    void finish();
  }, [router]);

  return <main className="auth-page"><div className="auth-card"><span className="auth-eyebrow">BurmeseBridge</span>{error ? <><h1>Recovery link error</h1><p className="auth-error">{error}</p><a className="auth-submit auth-submit-link" href="/zh/forgot-password">Request a new link</a></> : <p className="auth-copy">Verifying your recovery link…</p>}</div></main>;
}
