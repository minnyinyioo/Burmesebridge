"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const copy = locale === "zh" ? {
    title: "设置新密码", intro: "请设置一个至少 8 位的新密码。使用管理员临时密码登录的用户必须先完成此步骤。", password: "新密码", confirm: "确认新密码", save: "更新密码", loading: "正在更新…", checking: "正在验证链接…", mismatch: "两次输入的密码不一致。", short: "密码至少需要 8 位。", invalid: "链接无效或已过期，请重新申请。", requestNew: "重新获取链接", done: "密码已更新", doneCopy: "现在可以使用新密码登录。", login: "前往登录", acknowledge: "密码已更新，但安全状态同步失败，请重新登录后再试。",
  } : locale === "my" ? {
    title: "စကားဝှက်အသစ် သတ်မှတ်ရန်", intro: "အနည်းဆုံး စာလုံး ၈ လုံးပါသော စကားဝှက်အသစ် သတ်မှတ်ပါ။ ယာယီစကားဝှက်ဖြင့် ဝင်ထားပါက ဤအဆင့်ကို အရင်ပြီးရပါမည်။", password: "စကားဝှက်အသစ်", confirm: "စကားဝှက်ကို အတည်ပြုပါ", save: "စကားဝှက် ပြောင်းမည်", loading: "ပြောင်းနေသည်…", checking: "လင့်ခ်ကို စစ်ဆေးနေသည်…", mismatch: "စကားဝှက်နှစ်ခု မတူပါ။", short: "စကားဝှက်သည် အနည်းဆုံး စာလုံး ၈ လုံး ရှိရမည်။", invalid: "လင့်ခ်သည် မမှန်ကန်ပါ သို့မဟုတ် သက်တမ်းကုန်သွားပါပြီ။", requestNew: "လင့်ခ်အသစ် ရယူမည်", done: "စကားဝှက် ပြောင်းပြီးပါပြီ", doneCopy: "စကားဝှက်အသစ်ဖြင့် အကောင့်ဝင်နိုင်ပါပြီ။", login: "အကောင့်ဝင်ရန်", acknowledge: "စကားဝှက် ပြောင်းပြီးသော်လည်း လုံခြုံရေးအခြေအနေကို အတည်မပြုနိုင်ပါ။ ပြန်ဝင်ပြီး ထပ်စမ်းပါ။",
  } : {
    title: "Choose a new password", intro: "Use at least 8 characters. Users signed in with an administrator-issued temporary password must complete this step first.", password: "New password", confirm: "Confirm new password", save: "Update password", loading: "Updating…", checking: "Checking your link…", mismatch: "The passwords do not match.", short: "Password must be at least 8 characters.", invalid: "This reset link is invalid or has expired. Request a new one.", requestNew: "Request a new link", done: "Password updated", doneCopy: "You can now sign in with your new password.", login: "Continue to login", acknowledge: "The password changed, but its security status could not be synchronized. Sign in and try again.",
  };

  useEffect(() => {
    let mounted = true;
    async function prepareRecovery() {
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");
      const tokenHash = query.get("token_hash");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      if (tokenHash) await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
      const { data } = await supabase.auth.getSession();
      if (mounted) { setReady(Boolean(data.session)); setChecking(false); }
    }
    prepareRecovery();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === "PASSWORD_RECOVERY" || session)) { setReady(true); setChecking(false); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function updatePassword() {
    setError("");
    if (password.length < 8) { setError(copy.short); return; }
    if (password !== confirmPassword) { setError(copy.mismatch); return; }
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const mustAcknowledge = sessionData.session?.user.app_metadata?.must_change_password === true;
    if (mustAcknowledge) {
      const response = await fetch("/api/auth/password-changed", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sessionData.session?.access_token || ""}`,
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) { setLoading(false); setError(copy.acknowledge); return; }
    } else {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setLoading(false); setError(updateError.message); return; }
    }
    await supabase.auth.signOut();
    setLoading(false);
    setComplete(true);
  }

  return <main className="auth-page"><div className="auth-card">
    <BrandLogo size={30} className="auth-brand" />
    {complete ? <div className="auth-success"><CheckCircle2 size={34} /><h1>{copy.done}</h1><p>{copy.doneCopy}</p><a href={`/${locale}/login`} className="auth-submit auth-submit-link">{copy.login}</a></div> : <>
      <KeyRound className="auth-heading-icon" size={28} /><h1>{copy.title}</h1><p className="auth-copy">{copy.intro}</p>
      {checking ? <p className="auth-copy">{copy.checking}</p> : !ready ? <><p className="auth-error" role="alert">{copy.invalid}</p><a href={`/${locale}/forgot-password`} className="auth-submit auth-submit-link">{copy.requestNew}</a></> : <>
        <input type="password" autoComplete="new-password" className="auth-input" aria-label={copy.password} placeholder={copy.password} value={password} onChange={(event) => setPassword(event.target.value)} />
        <input type="password" autoComplete="new-password" className="auth-input" aria-label={copy.confirm} placeholder={copy.confirm} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" onClick={updatePassword} disabled={loading}>{loading ? copy.loading : copy.save}</button>
      </>}
    </>}
  </div></main>;
}
