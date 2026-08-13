import LanguageMenu from "@/components/LanguageMenu";
import AuthMenu from "@/components/AuthMenu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationLink from "@/components/NotificationLink";
import GlobalSearch from "@/components/GlobalSearch";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarCheck,
  GraduationCap,
  Home,
  LibraryBig,
  MessageCircle,
  Newspaper,
  PlaySquare,
  Search,
  Waypoints,
} from "lucide-react";

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
      learn: "လေ့လာရန်",
      forum: "Community",
      jobs: "အလုပ်",
      news: "သတင်း",
      checkin: "ချက်အင်",
      knowledge: "သင်တန်း",
    },
    zh: {
      home: "首页",
      learn: "学习",
      forum: "社区",
      jobs: "工作",
      news: "新闻",
      checkin: "签到",
      knowledge: "知识付费",
    },
    en: {
      home: "Home",
      learn: "Learn",
      forum: "Community",
      jobs: "Jobs",
      news: "News",
      checkin: "Check In",
      knowledge: "Knowledge",
    },
  };

  const t = nav[locale as keyof typeof nav] || nav.en;

  return (
    <div className="site-shell" lang={locale}>
      <nav className="site-nav">
        <Link href={`/${locale}`} className="site-logo">
          <span className="site-logo-mark" aria-hidden="true">
            <Waypoints size={20} />
          </span>
          <span>
            Burmese<span>Bridge</span>
          </span>
        </Link>

        <div className="site-menu">
          <Link href={`/${locale}`}>
            <Home size={16} />
            {t.home}
          </Link>
          <Link href={`/${locale}/learn`}>
            <GraduationCap size={16} />
            {t.learn}
          </Link>
          <Link href={`/${locale}/jobs`}>
            <BriefcaseBusiness size={16} />
            {t.jobs}
          </Link>
          <Link href={`/${locale}/news`}>
            <Newspaper size={16} />
            {t.news}
          </Link>
          <Link href={`/${locale}/forum`}>
            <MessageCircle size={16} />
            {t.forum}
          </Link>
          <Link href={`/${locale}/videos`}>
            <PlaySquare size={16} />
            {locale === "zh" ? "视频" : locale === "my" ? "ဗီဒီယို" : "Videos"}
          </Link>
          <Link href={`/${locale}/knowledge`}>
            <LibraryBig size={16} />
            {t.knowledge}
          </Link>
        </div>

        <div className="site-actions">
          <GlobalSearch locale={locale} />
          <NotificationLink locale={locale} />
          <AuthMenu locale={locale} />
          <ThemeToggle locale={locale} />
          <LanguageMenu locale={locale} />
        </div>
      </nav>

      <main className="site-main">{children}</main>

      {/* 手机底部导航保留：这是移动端主要入口，不能删。 */}
      <div className="mobile-tabbar">
        <Link href={`/${locale}`}>
          <Home size={19} />
          {t.home}
        </Link>
        <Link href={`/${locale}/learn`}>
          <GraduationCap size={19} />
          {t.learn}
        </Link>
        <Link href={`/${locale}/forum`}>
          <MessageCircle size={19} />
          {t.forum}
        </Link>
        <Link href={`/${locale}/search`}>
          <Search size={19} />
          {locale === "zh" ? "搜索" : locale === "my" ? "ရှာရန်" : "Search"}
        </Link>
        <Link href={`/${locale}/checkin`}>
          <CalendarCheck size={19} />
          {t.checkin}
        </Link>
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
