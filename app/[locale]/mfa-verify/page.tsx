"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

export default function MfaVerifyPage() {
  const locale = String(useParams().locale || "en");
  const router = useRouter();
  const search = useSearchParams();
  const rawNext = search.get("next") || `/${locale}/me`;
  const next = rawNext.startsWith(`/${locale}/`) && !rawNext.includes("//") ? rawNext : `/${locale}/me`;
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const copy = locale === "zh" ? { title: "两步验证", intro: "输入身份验证器应用生成的 6 位验证码。", code: "6 位验证码", submit: "验证并登录", loading: "正在验证…", missing: "没有找到已启用的验证器，请联系管理员。", invalid: "验证码无效或已过期。" }
    : locale === "my" ? { title: "နှစ်ဆင့်အတည်ပြုခြင်း", intro: "Authenticator app မှ ဂဏန်း ၆ လုံး code ကို ထည့်ပါ။", code: "ဂဏန်း ၆ လုံး", submit: "အတည်ပြုပြီး ဝင်မည်", loading: "စစ်ဆေးနေသည်…", missing: "ဖွင့်ထားသော authenticator မတွေ့ပါ။", invalid: "Code မမှန်ပါ သို့မဟုတ် သက်တမ်းကုန်ပါပြီ။" }
    : { title: "Two-factor authentication", intro: "Enter the 6-digit code from your authenticator app.", code: "6-digit code", submit: "Verify and continue", loading: "Verifying…", missing: "No verified authenticator was found.", invalid: "The code is invalid or expired." };

  useEffect(() => {
    async function prepare() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.replace(`/${locale}/login`); return; }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") { router.replace(next); return; }
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp.find((factor) => factor.status === "verified");
      if (listError || !verified) { setError(copy.missing); return; }
      setFactorId(verified.id);
    }
    void prepare();
  }, [copy.missing, locale, next, router]);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code)) { setError(copy.invalid); return; }
    setBusy(true); setError("");
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (verifyError) { setError(copy.invalid); return; }
    router.replace(next); router.refresh();
  }

  return <main className="auth-page"><section className="auth-card"><BrandLogo size={30} className="auth-brand" /><KeyRound className="auth-heading-icon" />
    <h1>{copy.title}</h1><p className="auth-copy">{copy.intro}</p>
    <form onSubmit={verify}><input className="auth-input mfa-code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label={copy.code} placeholder={copy.code} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
      {error ? <p className="auth-error" role="alert">{error}</p> : null}<button className="auth-submit" type="submit" disabled={busy || !factorId}>{busy ? copy.loading : copy.submit}</button></form>
  </section></main>;
}
