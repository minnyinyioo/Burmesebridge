"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  email: string | null;
  display_name: string | null;
  points: number | null;
};

export default function DashboardPage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      title: "ဒက်ရှ်ဘုတ်",
      profile: "ပရိုဖိုင်",
      email: "အီးမေးလ်",
      name: "အမည်",
      noName: "အမည် မသတ်မှတ်ရသေးပါ",
      points: "အမှတ်",
      account: "ကျွန်ုပ်အကောင့်",
      checkin: "ချက်အင်",
      learn: "သင်ယူရန်",
      loading: "ခေတ္တစောင့်ပါ...",
    },
    zh: {
      title: "控制台",
      profile: "个人资料",
      email: "邮箱",
      name: "显示名称",
      noName: "还没有设置名称",
      points: "积分",
      account: "我的账号",
      checkin: "签到",
      learn: "学习",
      loading: "加载中...",
    },
    en: {
      title: "Dashboard",
      profile: "Profile",
      email: "Email",
      name: "Name",
      noName: "No name yet",
      points: "Points",
      account: "My Account",
      checkin: "Check In",
      learn: "Learning",
      loading: "Loading...",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setErrorText("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setErrorText(userError.message);
      setLoading(false);
      return;
    }

    if (!userData.user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const user = userData.user;

    let { data: profile, error: selectError } = await supabase
      .from("profiles")
      .select("email, display_name, points")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      setErrorText(selectError.message);
      setLoading(false);
      return;
    }

    if (!profile) {
      const { data: newProfile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          display_name: "",
          role: "user",
          points: 0,
        })
        .select("email, display_name, points")
        .single();

      if (upsertError) {
        setErrorText(upsertError.message);
        setLoading(false);
        return;
      }

      profile = newProfile;
    }
const { count } = await supabase
  .from("checkins")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);

setPoints(count || 0);
    showProfile(profile, user.email || "");
    setLoading(false);
  }

  function showProfile(profile: Profile, fallbackEmail: string) {
    setEmail(profile.email || fallbackEmail);
    setDisplayName(profile.display_name || "");
  }

  if (loading) {
    return <main style={{ padding: 40 }}>{t.loading}</main>;
  }

  if (errorText) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Dashboard Error</h1>
        <p style={{ color: "red", marginTop: 16 }}>{errorText}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "48px 24px", minHeight: "100vh" }}>
      <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>{t.title}</h1>

        <div style={card}>
          <h2>{t.profile}</h2>
          <p>
            {t.email}: {email}
          </p>
          <p>
            {t.name}: {displayName || t.noName}
          </p>
          <p>
            {t.points}: {points}
          </p>
        </div>

        <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
          <a href={`/${locale}/me`} style={button}>
            {t.account}
          </a>

          <a href={`/${locale}/checkin`} style={button}>
            {t.checkin}
          </a>

          <a href={`/${locale}/learn`} style={button}>
            {t.learn}
          </a>
        </div>
      </section>
    </main>
  );
}

const card = {
  background: "white",
  color: "#0f172a",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
};

const button = {
  display: "block",
  background: "var(--brand-primary)",
  color: "white",
  padding: "14px 18px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 700,
};
