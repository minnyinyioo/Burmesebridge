"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const params = useParams();
  const locale = String(params.locale || "en");

  const text = {
    my: {
      title: "အကောင့်ဖွင့်ရန်",
      email: "အီးမေးလ်",
      password: "စကားဝှက်",
      button: "အကောင့်ဖွင့်မည်",
      loading: "ခေတ္တစောင့်ပါ...",
      login: "အကောင့်ရှိပြီးသားလား? ဝင်ရန်",
      success: "အကောင့်ဖွင့်မှု အောင်မြင်ပါသည်",
    },
    zh: {
      title: "注册",
      email: "邮箱",
      password: "密码",
      button: "创建账号",
      loading: "加载中...",
      login: "已有账号？去登录",
      success: "注册成功",
    },
    en: {
      title: "Register",
      email: "Email",
      password: "Password",
      button: "Create Account",
      loading: "Loading...",
      login: "Already have an account? Login",
      success: "Register success",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(t.success);
      window.location.href = `/${locale}/login`;
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        }}
      >
        <h1 style={{ fontSize: "36px", marginBottom: "24px" }}>
          {t.title}
        </h1>

        <input
          type="email"
          placeholder={t.email}
          style={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder={t.password}
          style={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleRegister}>
          {loading ? t.loading : t.button}
        </button>

        <a
          href={`/${locale}/login`}
          style={{
            display: "block",
            marginTop: "18px",
            textAlign: "center",
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          {t.login}
        </a>
      </div>
    </main>
  );
}

const input = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "#10b981",
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};