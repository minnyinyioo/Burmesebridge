export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "ကျွန်ုပ်",
      subtitle: "အသုံးပြုသူအချက်အလက်၊ အမှတ်၊ အဆင့်နှင့် အတည်ပြုမှုအခြေအနေ",
      username: "BurmeseBridge အသုံးပြုသူ",
      desc: "မြန်မာလူမျိုးများအတွက် တရုတ်စာလေ့လာရေး ပလက်ဖောင်း",
      progress: "သင်ယူမှုတိုးတက်မှု",
      points: "Check In အမှတ်",
      level: "လက်ရှိအဆင့်",
      lessons: "လေ့လာပြီး သင်ခန်းစာ",
      quick: "အမြန်ဝင်ရန်",
      learn: "သင်ယူရန်",
      checkin: "Check In",
      forum: "အသိုင်းအဝိုင်း",
      jobs: "အလုပ်အကိုင်",
    },
    zh: {
      title: "我的",
      subtitle: "用户资料、学习记录、积分等级和认证状态",
      username: "BurmeseBridge 用户",
      desc: "缅甸中文学习平台 · 测试版本",
      progress: "学习进度",
      points: "签到积分",
      level: "当前等级",
      lessons: "已学习课程",
      quick: "快捷入口",
      learn: "学习中心",
      checkin: "每日签到",
      forum: "社区论坛",
      jobs: "工作招聘",
    },
    en: {
      title: "Me",
      subtitle: "Profile, learning records, points, level and verification status",
      username: "BurmeseBridge User",
      desc: "Chinese learning platform for Burmese users · Test version",
      progress: "Learning Progress",
      points: "Check-in Points",
      level: "Current Level",
      lessons: "Lessons Completed",
      quick: "Quick Links",
      learn: "Learning Center",
      checkin: "Check In",
      forum: "Community Forum",
      jobs: "Jobs",
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "14px" }}>{t.title}</h1>

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
            borderRadius: "24px",
            padding: "40px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
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
                width: "90px",
                height: "90px",
                borderRadius: "9999px",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              B
            </div>

            <div>
              <h2
                style={{
                  fontSize: "36px",
                  marginBottom: "8px",
                }}
              >
                {t.username}
              </h2>

              <p style={{ color: "#64748b", lineHeight: 1.8 }}>{t.desc}</p>
            </div>
          </div>

          <div
            style={{
              marginTop: "40px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "18px",
            }}
          >
            <div style={card}>
              <h3>{t.progress}</h3>
              <p>12%</p>
            </div>

            <div style={card}>
              <h3>{t.points}</h3>
              <p>20</p>
            </div>

            <div style={card}>
              <h3>{t.level}</h3>
              <p>Lv.1</p>
            </div>

            <div style={card}>
              <h3>{t.lessons}</h3>
              <p>3</p>
            </div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <h2 style={{ marginBottom: "18px" }}>{t.quick}</h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
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
        </div>
      </section>
    </main>
  );
}

const card = {
  background: "#f8fafc",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
};

const button = {
  padding: "14px 18px",
  borderRadius: "12px",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
};