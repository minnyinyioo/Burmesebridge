export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "ဝင်ရန်",
      subtitle: "BurmeseBridge အကောင့်ဖြင့် ဝင်ရောက်ရန်",
      email: "Email",
      password: "Password",
      button: "Login",
      note: "နောက်ပိုင်း Supabase Login နှင့် ချိတ်ဆက်မည်။",
    },
    zh: {
      title: "登录",
      subtitle: "登录 BurmeseBridge 账号",
      email: "邮箱",
      password: "密码",
      button: "登录",
      note: "后面会接 Supabase 登录系统。",
    },
    en: {
      title: "Login",
      subtitle: "Login to your BurmeseBridge account",
      email: "Email",
      password: "Password",
      button: "Login",
      note: "This will connect to Supabase Auth later.",
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <main
      style={{
        padding: "48px 24px 96px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          background: "white",
          padding: "36px",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
          {t.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.8,
            marginBottom: "28px",
          }}
        >
          {t.subtitle}
        </p>

        <label style={label}>
          {t.email}
          <input type="email" style={input} />
        </label>

        <label style={label}>
          {t.password}
          <input type="password" style={input} />
        </label>

        <button style={button}>{t.button}</button>

        <p
          style={{
            marginTop: "20px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {t.note}
        </p>
      </section>
    </main>
  );
}

const label = {
  display: "grid",
  gap: "8px",
  marginBottom: "18px",
  fontWeight: 700,
};

const input = {
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

const button = {
  width: "100%",
  marginTop: "8px",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontSize: "16px",
  fontWeight: 700,
};