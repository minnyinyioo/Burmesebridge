"use client";

import { FormEvent, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter(); // 引入 router

  // 新增：检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace(`/${locale}/me`);
      }
    }

    checkUser();
  }, [locale, router]);

  const text = {
    my: {
      title: "ဝင်ရန်",
      email: "အီးမေးလ်",
      password: "စကားဝှက်",
      button: "ဝင်မည်",
      loading: "ခေတ္တစောင့်ပါ...",
      register: "အကောင့်မရှိသေးဘူးလား? အကောင့်ဖွင့်ရန်",
      success: "ဝင်ရောက်မှု အောင်မြင်ပါသည်",
      intro: "BurmeseBridge မှ ကြိုဆိုပါတယ်",
      forgot: "စကားဝှက် မေ့နေပါသလား?",
    },
    zh: {
      title: "登录",
      email: "邮箱",
      password: "密码",
      button: "登录",
      loading: "加载中...",
      register: "没有账号？创建账号",
      success: "登录成功",
      intro: "欢迎回到 BurmeseBridge",
      forgot: "忘记密码？",
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      button: "Login",
      loading: "Loading...",
      register: "No account? Create one",
      success: "Login success",
      intro: "Welcome back to BurmeseBridge",
      forgot: "Forgot password?",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = `/${locale}/me`;
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">BurmeseBridge</span>
        <h1>{t.title}</h1>
        <p className="auth-copy">{t.intro}</p>

        <form onSubmit={handleLogin}>
          <input
          type="email"
          autoComplete="email"
          aria-label={t.email}
          placeholder={t.email}
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />

          <input
          type="password"
          autoComplete="current-password"
          aria-label={t.password}
          placeholder={t.password}
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />

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
          href={`/${locale}/register`}
          className="auth-switch"
        >
          {t.register}
        </a>
      </div>
    </main>
  );
}
