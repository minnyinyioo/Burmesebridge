import Link from "next/link";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const nav = {
    my: {
      home: "ပင်မ",
      learn: "သင်ယူရန်",
      forum: "အသိုင်းအဝိုင်း",
      jobs: "အလုပ်",
      news: "သတင်း",
      checkin: "Check In",
      me: "ကျွန်ုပ်",
    },
    zh: {
      home: "首页",
      learn: "学习",
      forum: "社区",
      jobs: "工作",
      news: "新闻",
      checkin: "签到",
      me: "我的",
    },
    en: {
      home: "Home",
      learn: "Learn",
      forum: "Forum",
      jobs: "Jobs",
      news: "News",
      checkin: "Check In",
      me: "Me",
    },
  };

  const t = nav[locale as keyof typeof nav] || nav.en;

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          borderBottom: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        <Link
          href={`/${locale}`}
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          BurmeseBridge
        </Link>

        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href={`/${locale}`}>{t.home}</Link>
          <Link href={`/${locale}/learn`}>{t.learn}</Link>
          <Link href={`/${locale}/forum`}>{t.forum}</Link>
          <Link href={`/${locale}/jobs`}>{t.jobs}</Link>
          <Link href={`/${locale}/news`}>{t.news}</Link>
          <Link href={`/${locale}/checkin`}>{t.checkin}</Link>
          <Link href={`/${locale}/me`}>{t.me}</Link>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginLeft: "16px",
              fontWeight: 700,
            }}
          >
            <Link href="/my">MY</Link>
            <Link href="/zh">中文</Link>
            <Link href="/en">EN</Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

<footer
  style={{
    marginTop: "80px",
    padding: "40px 24px",
    background: "#0f172a",
    color: "white",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "20px",
    }}
  >
    <div>
      <h2
        style={{
          marginBottom: "12px",
          color: "#60a5fa",
        }}
      >
        BurmeseBridge
      </h2>

      <p
        style={{
          opacity: 0.8,
          lineHeight: 1.8,
        }}
      >
        Myanmar Chinese Learning Platform
      </p>
    </div>

    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <Link href={`/${locale}/learn`}>
        {t.learn}
      </Link>

      <Link href={`/${locale}/forum`}>
        {t.forum}
      </Link>

      <Link href={`/${locale}/jobs`}>
        {t.jobs}
      </Link>

      <Link href={`/${locale}/news`}>
        {t.news}
      </Link>
    </div>
  </div>
</footer>
    </div>
  );
}