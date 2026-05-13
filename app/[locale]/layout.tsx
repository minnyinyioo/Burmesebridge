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
      <nav className="site-nav">
        <Link href={`/${locale}`} className="site-logo">
          BurmeseBridge
        </Link>

        <div className="site-menu">
          <Link href={`/${locale}`}>{t.home}</Link>
          <Link href={`/${locale}/learn`}>{t.learn}</Link>
          <Link href={`/${locale}/forum`}>{t.forum}</Link>
          <Link href={`/${locale}/jobs`}>{t.jobs}</Link>
          <Link href={`/${locale}/news`}>{t.news}</Link>
          <Link href={`/${locale}/checkin`}>{t.checkin}</Link>
          <Link href={`/${locale}/me`}>{t.me}</Link>
        </div>

        <div className="language-switch">
          <Link href="/my">MM</Link>
          <Link href="/zh">中文</Link>
          <Link href="/en">EN</Link>
        </div>
      </nav>

      {children}
      <div className="mobile-tabbar">
        <Link href={`/${locale}`}>{t.home}</Link>
        <Link href={`/${locale}/learn`}>{t.learn}</Link>
        <Link href={`/${locale}/forum`}>{t.forum}</Link>
        <Link href={`/${locale}/checkin`}>{t.checkin}</Link>
        <Link href={`/${locale}/me`}>{t.me}</Link>
      </div>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <h3>BurmeseBridge</h3>
            <p>Burmese Chinese Learning Platform</p>
          </div>

          <div>© 2026 BurmeseBridge</div>
        </div>
      </footer>
    </div>
  );
}
