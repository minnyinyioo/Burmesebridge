import LanguageMenu from "@/components/LanguageMenu";
import AuthMenu from "@/components/AuthMenu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationLink from "@/components/NotificationLink";
import GlobalSearch from "@/components/GlobalSearch";
import MobileTabBar from "@/components/MobileTabBar";
import SocialFooter from "@/components/SocialFooter";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import PasswordChangeGuard from "@/components/PasswordChangeGuard";
import MfaGuard from "@/components/MfaGuard";
import {
  BriefcaseBusiness,
  Home,
  LibraryBig,
  MessageCircle,
  Newspaper,
  PlaySquare,
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
      <PasswordChangeGuard locale={locale} />
      <MfaGuard locale={locale} />
      <nav className="site-nav">
        <Link href={`/${locale}`} className="site-logo">
          <BrandLogo size={36} priority />
        </Link>

        <div className="site-menu">
          <Link href={`/${locale}`}>
            <Home size={16} />
            {t.home}
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
            {locale === "zh" ? "学习视频" : locale === "my" ? "လေ့လာရေးဗီဒီယို" : "Learn & videos"}
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
          <div className="site-footer-main">
            <div className="site-footer-brand">
              <Link href={`/${locale}`} className="site-footer-logo" aria-label="BurmeseBridge">
                <BrandLogo size={44} />
              </Link>
              <p>{locale === "zh" ? "连接缅甸与中文世界的学习、资讯和社区平台。" : locale === "my" ? "မြန်မာနှင့် တရုတ်ဘာသာကမ္ဘာကို ချိတ်ဆက်ပေးသည့် သင်ယူမှု၊ သတင်းနှင့် community platform။" : "A learning, information, and community platform connecting Myanmar and the Chinese-speaking world."}</p>
            </div>
            <nav className="site-footer-column" aria-label="Platform">
              <strong>{locale === "zh" ? "平台" : locale === "my" ? "Platform" : "Platform"}</strong>
              <Link href={`/${locale}/videos`}>{locale === "zh" ? "学习视频" : locale === "my" ? "လေ့လာရေးဗီဒီယို" : "Learn & videos"}</Link>
              <Link href={`/${locale}/news`}>{locale === "zh" ? "新闻" : locale === "my" ? "သတင်း" : "News"}</Link>
              <Link href={`/${locale}/forum`}>{locale === "zh" ? "社区" : locale === "my" ? "Community" : "Community"}</Link>
              <Link href={`/${locale}/knowledge`}>{locale === "zh" ? "知识内容" : locale === "my" ? "သင်တန်း" : "Knowledge"}</Link>
            </nav>
            <nav className="site-footer-column" aria-label="Support and legal">
              <strong>{locale === "zh" ? "支持" : locale === "my" ? "အကူအညီ" : "Support"}</strong>
              <Link href={`/${locale}/feedback`}>{locale === "zh" ? "反馈与报告 BUG" : locale === "my" ? "အကြံပြုချက် / BUG" : "Feedback & bugs"}</Link>
              <Link href={`/${locale}/safety`}>{locale === "zh" ? "求职安全中心" : locale === "my" ? "အလုပ်ရှာဖွေသူ လုံခြုံရေး" : "Jobseeker safety"}</Link>
              <Link href={`/${locale}/privacy`}>{locale === "zh" ? "隐私政策" : locale === "my" ? "ကိုယ်ရေးအချက်အလက် မူဝါဒ" : "Privacy policy"}</Link>
              <Link href={`/${locale}/terms`}>{locale === "zh" ? "服务条款" : locale === "my" ? "ဝန်ဆောင်မှု စည်းမျဉ်းများ" : "Terms of service"}</Link>
              <Link href={`/${locale}/community-guidelines`}>{locale === "zh" ? "社区规则" : locale === "my" ? "Community စည်းမျဉ်းများ" : "Community guidelines"}</Link>
              <Link href={`/${locale}/copyright`}>{locale === "zh" ? "版权投诉" : locale === "my" ? "Copyright တိုင်ကြားရန်" : "Copyright complaints"}</Link>
              <Link href={`/${locale}/data-deletion`}>{locale === "zh" ? "用户数据删除" : locale === "my" ? "အသုံးပြုသူဒေတာ ဖျက်ရန်" : "User data deletion"}</Link>
            </nav>
            <div className="site-footer-connect">
              <strong>{locale === "zh" ? "关注我们" : locale === "my" ? "Follow လုပ်ရန်" : "Connect"}</strong>
              <SocialFooter />
            </div>
          </div>
          <div className="site-footer-bottom">
            <div>© 2026 BurmeseBridge · {locale === "zh" ? "保留所有权利" : locale === "my" ? "မူပိုင်ခွင့်အားလုံး ရယူထားသည်" : "All rights reserved"}</div>
            <nav className="footer-legal" aria-label="Legal">
              <Link href={`/${locale}/privacy`}>{locale === "zh" ? "隐私政策" : locale === "my" ? "ကိုယ်ရေးမူဝါဒ" : "Privacy"}</Link>
              <Link href={`/${locale}/terms`}>{locale === "zh" ? "服务条款" : locale === "my" ? "ဝန်ဆောင်မှုစည်းမျဉ်း" : "Terms"}</Link>
              <Link href={`/${locale}/data-deletion`}>{locale === "zh" ? "数据删除" : locale === "my" ? "ဒေတာဖျက်ရန်" : "Data deletion"}</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
