export default async function CheckinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "Check In",
      subtitle: "နေ့စဉ် Check In လုပ်ပြီး အမှတ်များ စုဆောင်းနိုင်သည်။",
      today: "ယနေ့ Check In",
      desc: "နောက်ပိုင်း Supabase Login နှင့် Database ချိတ်ပြီး အမှတ်များကို သိမ်းဆည်းမည်။",
      button: "Check In +1 Point",
      streak: "ဆက်တိုက် Check In",
      points: "လက်ရှိအမှတ်",
      level: "အဆင့်",
    },
    zh: {
      title: "签到",
      subtitle: "每天签到获得积分，用于等级、认证和学习成长系统。",
      today: "今日签到",
      desc: "后面会接 Supabase 登录和数据库，真实记录签到和积分。",
      button: "签到 +1 积分",
      streak: "连续签到",
      points: "当前积分",
      level: "等级",
    },
    en: {
      title: "Check In",
      subtitle: "Check in every day to earn points and grow your level.",
      today: "Today’s Check In",
      desc: "Later this will connect to Supabase login and database records.",
      button: "Check In +1 Point",
      streak: "Check-in Streak",
      points: "Current Points",
      level: "Level",
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <main
      style={{
        padding: "48px 24px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "14px" }}>
          {t.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "20px",
            lineHeight: 1.8,
            marginBottom: "36px",
          }}
        >
          {t.subtitle}
        </p>

        <div
          style={{
            background: "white",
            padding: "36px",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>
            {t.today}
          </h2>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.9,
              fontSize: "18px",
            }}
          >
            {t.desc}
          </p>

          <button
            style={{
              marginTop: "24px",
              padding: "14px 24px",
              borderRadius: "14px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {t.button}
          </button>
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "18px",
          }}
        >
          <div style={smallCard}>
            <h3>{t.streak}</h3>
            <p>0</p>
          </div>

          <div style={smallCard}>
            <h3>{t.points}</h3>
            <p>0</p>
          </div>

          <div style={smallCard}>
            <h3>{t.level}</h3>
            <p>Newbie</p>
          </div>
        </div>
      </section>
    </main>
  );
}

const smallCard = {
  background: "white",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};