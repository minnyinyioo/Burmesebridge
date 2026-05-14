"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MePage() {
  const params = useParams();
  const locale = String(params.locale || "en");

  const text = {
    my: {
      user: "BurmeseBridge အသုံးပြုသူ",
      verified: "အတည်ပြုပြီးသော အဖွဲ့ဝင်",
      points: "အမှတ်",
      streak: "ဆက်တိုက် ချက်အင်",
      progress: "သင်ယူမှု",
      posts: "ကျွန်ုပ်၏ Post များ",
      learn: "သင်ယူရန်",
      checkin: "နေ့စဉ်ချက်အင်",
      forum: "Community",
      jobs: "အလုပ်အကိုင်",
      logout: "အကောင့်ထွက်ရန်",
      notlogin: "အကောင့်မဝင်ရသေးပါ",
      day: "ရက်",
      quick: "အမြန်ဝင်ရန်",
    },
    zh: {
      user: "BurmeseBridge 用户",
      verified: "已认证会员",
      points: "积分",
      streak: "连续签到",
      progress: "学习进度",
      posts: "我的帖子",
      learn: "学习中心",
      checkin: "每日签到",
      forum: "社区论坛",
      jobs: "工作信息",
      logout: "退出登录",
      notlogin: "未登录",
      day: "天",
      quick: "快捷入口",
    },
    en: {
      user: "BurmeseBridge User",
      verified: "Verified Member",
      points: "Points",
      streak: "Check In Streak",
      progress: "Learning Progress",
      posts: "My Posts",
      learn: "Learning Center",
      checkin: "Daily Check In",
      forum: "Community Forum",
      jobs: "Jobs",
      logout: "Logout",
      notlogin: "Not logged in",
      day: "days",
      quick: "Quick Access",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [email, setEmail] = useState<string | null>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setEmail(null);
        return;
      }

      setEmail(data.user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      setDisplayName(profile?.display_name || "");

      const { count } = await supabase
        .from("checkins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.user.id);

      setCheckinCount(count || 0);
    }

    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  return (
    <main
      style={{
        padding: "48px 24px 96px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            padding: "36px",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "999px",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: 700,
              }}
            >
              B
            </div>

            <div>
              <h1 style={{ fontSize: "38px", marginBottom: "8px" }}>
                {displayName || t.user}
              </h1>

              <p style={{ color: "#64748b" }}>
                {email ? email : t.notlogin}
              </p>

              <p style={{ color: "#10b981", fontWeight: 700 }}>
                {t.verified}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "36px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "18px",
            }}
          >
            <div style={card}>
              <h3>{t.points}</h3>
              <p>{checkinCount}</p>
            </div>

            <div style={card}>
              <h3>{t.streak}</h3>
              <p>
                {checkinCount} {t.day}
              </p>
            </div>

            <div style={card}>
              <h3>{t.progress}</h3>
              <p>0%</p>
            </div>

            <div style={card}>
              <h3>{t.posts}</h3>
              <p>0</p>
            </div>
          </div>

          <div style={{ marginTop: "36px" }}>
            <h2>{t.quick}</h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              <a href={`/${locale}/learn`} style={button}>
                {t.learn}
              </a>

              <a href={`/${locale}/checkin`} style={button}>
                {t.checkin}
              </a>

              <a href={`/${locale}/forum`} style={button}>
                {t.forum}
              </a>

              <a href={`/${locale}/jobs`} style={button}>
                {t.jobs}
              </a>
            </div>
          </div>

          {email && (
            <button
              onClick={handleLogout}
              style={{
                marginTop: "36px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                background: "#ef4444",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.logout}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

const card = {
  background: "#f8fafc",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
};

const button = {
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  textDecoration: "none",
};