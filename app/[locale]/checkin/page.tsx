"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckinPage() {
  const params = useParams();
  const locale = String(params.locale || "en");

  const text = {
    my: {
      title: "နေ့စဉ်ချက်အင်",
      checked: "✅ ဒီနေ့ချက်အင်လုပ်ပြီးပါပြီ",
      button: "ချက်အင် လုပ်မည်",
      login: "ကျေးဇူးပြု၍ Login ဝင်ပါ",
      loading: "Loading...",
    },
    zh: {
      title: "每日签到",
      checked: "✅ 今天已经签到",
      button: "立即签到",
      login: "请先登录",
      loading: "加载中...",
    },
    en: {
      title: "Daily Check In",
      checked: "✅ Already checked in today",
      button: "Check In Now",
      login: "Please login first",
      loading: "Loading...",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToday();
  }, []);

  async function checkToday() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", today);

    setChecked(!!data && data.length > 0);
    setLoading(false);
  }

  async function handleCheckin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(t.login);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      checkin_date: today,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setChecked(true);
  }

  if (loading) {
    return <main style={{ padding: 40 }}>{t.loading}</main>;
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
          background: "white",
          padding: "40px",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>{t.title}</h1>

        {checked ? (
          <p style={{ color: "#10b981", fontSize: "20px", fontWeight: 700 }}>
            {t.checked}
          </p>
        ) : (
          <button onClick={handleCheckin} style={button}>
            {t.button}
          </button>
        )}
      </div>
    </main>
  );
}

const button = {
  padding: "16px 28px",
  borderRadius: "14px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontSize: "18px",
  fontWeight: 700,
  cursor: "pointer",
};