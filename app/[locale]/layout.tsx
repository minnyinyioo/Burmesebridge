import LanguageMenu from "@/components/LanguageMenu";
import AuthMenu from "@/components/AuthMenu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationLink from "@/components/NotificationLink";
import GlobalSearch from "@/components/GlobalSearch";
import MobileTabBar from "@/components/MobileTabBar";
import SocialFooter from "@/components/SocialFooter";
import Link from "next/link";
import {
  BriefcaseBusiness,
  GraduationCap,
  Home,
  LibraryBig,
  MessageCircle,
  Newspaper,
  PlaySquare,
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

      <MobileTabBar locale={locale} />

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <h3>BurmeseBridge</h3>
            <p>Burmese Chinese Learning Platform</p>
          </div>
          <SocialFooter />
          <nav className="footer-legal" aria-label="Legal and support">
            <Link href={`/${locale}/privacy`}>{locale === "zh" ? "隐私政策" : locale === "my" ? "ကိုယ်ရေးမူဝါဒ" : "Privacy"}</Link>
            <Link href={`/${locale}/terms`}>{locale === "zh" ? "服务条款" : locale === "my" ? "ဝန်ဆောင်မှုစည်းမျဉ်း" : "Terms"}</Link>
            <Link href={`/${locale}/data-deletion`}>{locale === "zh" ? "数据删除" : locale === "my" ? "ဒေတာဖျက်ရန်" : "Data deletion"}</Link>
            <Link href={`/${locale}/feedback`}>{locale === "zh" ? "反馈 / BUG" : locale === "my" ? "အကြံပြုချက် / BUG" : "Feedback / Bug"}</Link>
          </nav>
          <div>© 2026 BurmeseBridge</div>
        </div>
      </footer>
    </div>
  );
}
