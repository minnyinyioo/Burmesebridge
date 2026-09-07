"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import BrandLogo from "@/components/BrandLogo";

function sessionAal(accessToken?: string) {
  if (!accessToken) return "aal1";
  try {
    const payload = accessToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return (JSON.parse(atob(normalized)) as { aal?: string }).aal || "aal1";
  } catch {
    return "aal1";
  }
}

function destinationForSession(locale: string, safeNext: string, session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
  const hasVerifiedFactor = session?.user.factors?.some((factor) => factor.status === "verified");
  return hasVerifiedFactor && sessionAal(session?.access_token) !== "aal2" ? `/${locale}/mfa-verify` : safeNext;
}

export default function LoginPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter(); // 引入 router
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const safeNext = requestedNext?.startsWith(`/${locale}/`)
    ? requestedNext
    : `/${locale}/me`;

  // 新增：检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(destinationForSession(locale, safeNext, session));
      }
    }

    checkUser();
  }, [locale, router, safeNext]);

  const text = {
    my: {
      title: "အကောင့်ဝင်ရန်",
      email: "အီးမေးလ်",
      password: "စကားဝှက်",
      button: "အကောင့်ဝင်မည်",
      loading: "အကောင့်ဝင်နေပါသည်…",
      register: "အကောင့်မရှိသေးပါသလား။ အကောင့်အသစ် ဖွင့်ရန်",
      success: "အကောင့်ဝင်ရောက်မှု အောင်မြင်ပါသည်။",
      intro: "သင်တန်း၊ community နှင့် account tools များကို ဆက်လက်အသုံးပြုရန် ဝင်ပါ။",
      forgot: "စကားဝှက် မေ့သွားပါသလား။",
      back: "ပင်မစာမျက်နှာ",
      show: "စကားဝှက်ပြရန်",
      hide: "စကားဝှက်ဖျောက်ရန်",
      error: "အီးမေးလ် သို့မဟုတ် စကားဝှက်ကို စစ်ဆေးပြီး ထပ်စမ်းပါ။",
    },
    zh: {
      title: "欢迎回来",
      email: "邮箱",
      password: "密码",
      button: "登录账号",
      loading: "正在登录…",
      register: "没有账号？创建账号",
      success: "登录成功",
      intro: "登录后继续使用课程、论坛、会员与个人中心。",
      forgot: "忘记密码？",
      back: "返回首页",
      show: "显示密码",
      hide: "隐藏密码",
      error: "邮箱或密码不正确，请检查后重试。",
    },
    en: {
      title: "Welcome back",
      email: "Email",
      password: "Password",
      button: "Sign in",
      loading: "Signing in…",
      register: "No account? Create one",
      success: "Login success",
      intro: "Sign in to continue with courses, community, membership, and your profile.",
      forgot: "Forgot password?",
      back: "Home",
      show: "Show password",
      hide: "Hide password",
      error: "Check your email and password, then try again.",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(t.error);
    } else {
      router.replace(destinationForSession(locale, safeNext, data.session));
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href={`/${locale}`} className="auth-back-link">
          <ArrowLeft size={15} />
          {t.back}
        </Link>
        <div className="auth-card-head">
          <BrandLogo size={34} className="auth-brand" />
          <h1>{t.title}</h1>
          <p className="auth-copy">{t.intro}</p>
        </div>

        <form onSubmit={handleLogin}>
          <label className="auth-field">
            <span>{t.email}</span>
            <span className="auth-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                autoComplete="email"
                aria-label={t.email}
                placeholder="name@example.com"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>

          <label className="auth-field">
            <span>{t.password}</span>
            <span className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-label={t.password}
                placeholder={t.password}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={showPassword ? t.hide : t.show}
                title={showPassword ? t.hide : t.show}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <a href={`/${locale}/forgot-password`} className="auth-forgot-link">
            {t.forgot}
          </a>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? t.loading : t.button}
          </button>
        </form>

        <SocialLoginButtons locale={locale} />

        <a
          href={`/${locale}/signup`}
          className="auth-switch"
        >
          {t.register}
        </a>
      </div>
    </main>
  );
}
