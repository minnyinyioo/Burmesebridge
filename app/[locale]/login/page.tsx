"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const params = useParams();
  const locale = String(params.locale || "en");

  const text = {
    my: {
      title: "ဝင်ရန်",
      email: "အီးမေးလ်",
      password: "စကားဝှက်",
      button: "ဝင်မည်",
      loading: "ခေတ္တစောင့်ပါ...",
      register: "အကောင့်မရှိသေးဘူးလား? အကောင့်ဖွင့်ရန်",
      success: "ဝင်ရောက်မှု အောင်မြင်ပါသည်",
    },
    zh: {
      title: "登录",
      email: "邮箱",
      password: "密码",
      button: "登录",
      loading: "加载中...",
      register: "没有账号？创建账号",
      success: "登录成功",
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      button: "Login",
      loading: "Loading...",
      register: "No account? Create one",
      success: "Login success",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(t.success);
      window.location.href = `/${locale}/me`;
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

        <button style={button} onClick={handleLogin}>
          {loading ? t.loading : t.button}
        </button>

        <a
          href={`/${locale}/register`}
          style={{
            display: "block",
            marginTop: "18px",
            textAlign: "center",
            color: "#2563eb",
            fontWeight: 700,
          }}
        >
          {t.register}
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
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};