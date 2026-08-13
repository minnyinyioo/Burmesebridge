"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const copy = locale === "zh" ? {
    title: "找回密码", intro: "输入注册邮箱，我们会发送安全的密码重置链接。", email: "邮箱", send: "发送重置链接", loading: "正在发送…", sentTitle: "检查你的邮箱", sent: "如果该邮箱已注册，你会收到密码重置链接。请同时检查垃圾邮件。", back: "返回登录",
  } : locale === "my" ? {
    title: "စကားဝှက် ပြန်လည်ရယူရန်", intro: "မှတ်ပုံတင်ထားသော အီးမေးလ်ကို ထည့်ပါ။ လုံခြုံသော စကားဝှက်ပြောင်းလဲရန် လင့်ခ် ပို့ပေးပါမည်။", email: "အီးမေးလ်", send: "ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ပို့မည်", loading: "ပို့နေသည်…", sentTitle: "အီးမေးလ်ကို စစ်ဆေးပါ", sent: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပါက စကားဝှက်ပြောင်းလဲရန် လင့်ခ်ကို ရရှိပါမည်။ Spam ဖိုလ်ဒါကိုလည်း စစ်ဆေးပါ။", back: "အကောင့်ဝင်ရန် ပြန်သွားမည်",
  } : {
    title: "Reset your password", intro: "Enter your account email and we’ll send you a secure reset link.", email: "Email", send: "Send reset link", loading: "Sending…", sentTitle: "Check your inbox", sent: "If an account exists for this email, a reset link is on its way. Check your spam folder too.", back: "Back to login",
  };

  async function sendResetLink() {
    if (!email.trim()) return;
    setLoading(true); setError("");
    const redirectTo = `${window.location.origin}/${locale}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  }

  return <main className="auth-page"><div className="auth-card">
    <span className="auth-eyebrow">BurmeseBridge</span>
    {sent ? <div className="auth-success"><MailCheck size={34} /><h1>{copy.sentTitle}</h1><p>{copy.sent}</p></div> : <>
      <h1>{copy.title}</h1><p className="auth-copy">{copy.intro}</p>
      <input type="email" autoComplete="email" className="auth-input" aria-label={copy.email} placeholder={copy.email} value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendResetLink(); }} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" onClick={sendResetLink} disabled={loading || !email.trim()}>{loading ? copy.loading : copy.send}</button>
    </>}
    <a href={`/${locale}/login`} className="auth-switch"><ArrowLeft size={15} />{copy.back}</a>
  </div></main>;
}
