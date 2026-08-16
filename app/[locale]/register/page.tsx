"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/BrandLogo";

export default function RegisterPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const copy = locale === "zh" ? {
    title: "创建账号", intro: "加入 BurmeseBridge，开始学习、交流和发现机会。", name: "显示名称", email: "邮箱", password: "密码（至少 8 位）", confirm: "确认密码", button: "创建账号", loading: "正在创建…", login: "已有账号？前往登录", mismatch: "两次输入的密码不一致。", short: "密码至少需要 8 位。", required: "请完整填写名称、邮箱和密码。", sentTitle: "检查你的邮箱", sent: "我们已发送验证链接。请完成邮箱验证后登录，也请检查垃圾邮件。", back: "返回登录", smtp: "注册资料已提交，但验证邮件发送失败。请检查 Brevo SMTP 发件人、用户名和 SMTP Key。", rate: "邮件请求过多，请稍后再试。", exists: "该邮箱已注册，请直接登录或找回密码。", generic: "暂时无法注册，请稍后重试。",
  } : locale === "my" ? {
    title: "အကောင့်ဖွင့်ရန်", intro: "BurmeseBridge တွင် သင်ယူရန်၊ ဆက်သွယ်ရန်နှင့် အခွင့်အလမ်းများ ရှာရန်။", name: "ပြသမည့်အမည်", email: "အီးမေးလ်", password: "စကားဝှက် (အနည်းဆုံး ၈ လုံး)", confirm: "စကားဝှက် အတည်ပြုရန်", button: "အကောင့်ဖွင့်မည်", loading: "ဖန်တီးနေသည်…", login: "အကောင့်ရှိပြီးသားလား? ဝင်ရန်", mismatch: "စကားဝှက်နှစ်ခု မတူပါ။", short: "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ရှိရမည်။", required: "အမည်၊ အီးမေးလ်နှင့် စကားဝှက်ကို ပြည့်စုံစွာ ဖြည့်ပါ။", sentTitle: "အီးမေးလ်ကို စစ်ဆေးပါ", sent: "အတည်ပြုလင့်ခ် ပို့ထားပါသည်။ အီးမေးလ်အတည်ပြုပြီးနောက် ဝင်နိုင်ပါသည်။ Spam ဖိုလ်ဒါကိုလည်း စစ်ဆေးပါ။", back: "အကောင့်ဝင်ရန်", smtp: "အတည်ပြု email ပို့၍မရပါ။ Brevo SMTP setting ကို စစ်ပါ။", rate: "Email တောင်းဆိုမှုများလွန်းပါသည်။ နောက်မှ ထပ်စမ်းပါ။", exists: "ဤ email ဖြင့် account ရှိပြီးသားပါ။", generic: "လောလောဆယ် အကောင့်ဖွင့်၍မရပါ။",
  } : {
    title: "Create your account", intro: "Join BurmeseBridge to learn, connect, and discover opportunities.", name: "Display name", email: "Email", password: "Password (at least 8 characters)", confirm: "Confirm password", button: "Create account", loading: "Creating…", login: "Already have an account? Log in", mismatch: "The passwords do not match.", short: "Password must be at least 8 characters.", required: "Complete your name, email, and password.", sentTitle: "Check your inbox", sent: "We sent you a verification link. Verify your email before signing in, and check your spam folder too.", back: "Back to login", smtp: "The account request was received, but the verification email failed. Check the Brevo SMTP sender, username, and SMTP key.", rate: "Too many email requests. Please try again later.", exists: "This email is already registered. Sign in or reset the password.", generic: "Registration is temporarily unavailable. Please try again.",
  };

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.replace(`/${locale}/me`);
      else setChecking(false);
    }
    checkUser();
  }, [locale, router]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!name.trim() || !email.trim() || !password) { setError(copy.required); return; }
    if (password.length < 8) { setError(copy.short); return; }
    if (password !== confirmPassword) { setError(copy.mismatch); return; }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?locale=${encodeURIComponent(locale)}&next=${encodeURIComponent(`/${locale}/me`)}`,
      },
    });
    setLoading(false);
    if (signUpError) {
      const code = signUpError.code || "";
      const raw = signUpError.message.toLowerCase();
      if (/smtp|email.*send|sending.*email/.test(raw)) setError(copy.smtp);
      else if (/rate|too many/.test(raw) || code.includes("rate_limit")) setError(copy.rate);
      else if (/already|exists/.test(raw) || code === "user_already_exists" || code === "email_exists") setError(copy.exists);
      else setError(`${copy.generic} (${code || "auth_error"})`);
      return;
    }
    if (data.session) { router.replace(`/${locale}/me`); return; }
    setSubmitted(true);
  }

  if (checking) return <main className="auth-page"><p className="account-loading">{copy.loading}</p></main>;

  return <main className="auth-page"><div className="auth-card">
    <BrandLogo size={30} className="auth-brand" />
    {submitted ? <div className="auth-success"><MailCheck size={34} /><h1>{copy.sentTitle}</h1><p>{copy.sent}</p><a href={`/${locale}/login`} className="auth-submit auth-submit-link">{copy.back}</a></div> : <>
      <h1>{copy.title}</h1><p className="auth-copy">{copy.intro}</p>
      <form onSubmit={handleRegister}>
        <input type="text" autoComplete="name" className="auth-input" aria-label={copy.name} placeholder={copy.name} value={name} onChange={(event) => setName(event.target.value)} />
        <input type="email" autoComplete="email" className="auth-input" aria-label={copy.email} placeholder={copy.email} value={email} onChange={(event) => setEmail(event.target.value)} />
        <input type="password" autoComplete="new-password" className="auth-input" aria-label={copy.password} placeholder={copy.password} value={password} onChange={(event) => setPassword(event.target.value)} />
        <input type="password" autoComplete="new-password" className="auth-input" aria-label={copy.confirm} placeholder={copy.confirm} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={loading}>{loading ? copy.loading : copy.button}</button>
      </form>
      <SocialLoginButtons locale={locale} />
      <a href={`/${locale}/login`} className="auth-switch">{copy.login}</a>
    </>}
  </div></main>;
}
