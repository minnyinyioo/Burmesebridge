"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter();

  // 新增：加一个状态用来判断是否还在检查用户信息
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace(`/${locale}/me`);
      } else {
        // 新增：确认没有登录，才放行，允许渲染表单
        setIsChecking(false);
      }
    }

    checkUser();
  }, [locale, router]);

  const text = {
    my: { title: "အကောင့်ဖွင့်ရန်", intro: "သင်ယူရန်၊ အလုပ်ရှာရန်နှင့် Community နှင့် ချိတ်ဆက်ရန်", email: "အီးမေးလ်", password: "စကားဝှက်", button: "အကောင့်ဖွင့်မည်", loading: "ခေတ္တစောင့်ပါ...", login: "အကောင့်ရှိပြီးသားလား? ဝင်ရန်", success: "အကောင့်ဖွင့်မှု အောင်မြင်ပါသည်" },
    zh: { title: "注册", intro: "开始学习、找工作并加入社区", email: "邮箱", password: "密码", button: "创建账号", loading: "加载中...", login: "已有账号？去登录", success: "注册成功" },
    en: { title: "Register", intro: "Learn, find opportunities, and join the community", email: "Email", password: "Password", button: "Create Account", loading: "Loading...", login: "Already have an account? Login", success: "Register success" },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert(t.success);
      window.location.href = `/${locale}/login`;
    }
    setLoading(false);
  }

  // 新增：如果还在检查登录状态，直接返回 null（白屏）或者加载动画，不渲染下面的表单
  if (isChecking) {
    return null; 
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">BurmeseBridge</span>
        <h1>{t.title}</h1>
        <p className="auth-copy">{t.intro}</p>
        <input type="email" placeholder={t.email} className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder={t.password} className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="auth-submit" onClick={handleRegister} disabled={loading}>{loading ? t.loading : t.button}</button>
        <a href={`/${locale}/login`} className="auth-switch">{t.login}</a>
      </div>
    </main>
  );
}
