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
  Home,
  MessageCircle,
  Newspaper,
  PlaySquare,
} from "lucide-react";
import type { Metadata } from "next";

const seo = {
  my: {
    title: "BurmeseBridge | မြန်မာများအတွက် သင်ယူရေးနှင့် အချက်အလက်ပလက်ဖောင်း",
    description:
      "ထိုင်းနိုင်ငံရှိ မြန်မာများအတွက် တရုတ်ဘာသာသင်ယူရေး၊ HSK စစ်ဆေးမှု၊ သတင်းနှင့် လူမှုအသိုင်းအဝိုင်း။",
  },
  zh: {
    title: "BurmeseBridge | 面向缅甸用户的学习与资讯平台",
    description:
      "为在泰缅甸用户提供中文学习、HSK 水平测试、新闻资讯与社区交流。",
  },
  en: {
    title: "BurmeseBridge | Learning, News and Community for Myanmar Users",
    description:
      "Chinese learning, HSK assessment, news and community services for Myanmar users in Thailand.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const current = seo[locale as keyof typeof seo] || seo.en;
  const canonical = `https://burmesebridge.com/${locale}`;
  return {
    title: current.title,
    description: current.description,
    alternates: {
      canonical,
      languages: {
        "my-MM": "https://burmesebridge.com/my",
        "zh-CN": "https://burmesebridge.com/zh",
        en: "https://burmesebridge.com/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: "BurmeseBridge",
      url: canonical,
      title: current.title,
      description: current.description,
      images: [
        {
          url: "https://burmesebridge.com/brand-icon-1024.png",
          width: 1024,
          height: 1024,
          alt: "BurmeseBridge",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: current.title,
      description: current.description,
      images: ["https://burmesebridge.com/brand-icon-1024.png"],
    },
  };
}

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
            {locale === "zh"
              ? "学习"
              : locale === "my"
                ? "လေ့လာရန်"
                : "Learn"}
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
              <Link
                href={`/${locale}`}
                className="site-footer-logo"
                aria-label="BurmeseBridge"
              >
                <BrandLogo size={44} />
              </Link>
              <p>
                {locale === "zh"
                  ? "连接缅甸与中文世界的学习、资讯和社区平台。"
                  : locale === "my"
                    ? "မြန်မာဘာသာအသိုင်းအဝိုင်းနှင့် တရုတ်ဘာသာအသိုင်းအဝိုင်းတို့ကို ချိတ်ဆက်ပေးသည့် လေ့လာရေး၊ သတင်းအချက်အလက်နှင့် လူမှုအသိုင်းအဝိုင်းဆိုင်ရာ ပလက်ဖောင်း။"
                    : "A learning, information, and community platform connecting Myanmar and the Chinese-speaking world."}
              </p>
            </div>
            <nav className="site-footer-column" aria-label="Platform">
              <strong>
                {locale === "zh"
                  ? "平台"
                  : locale === "my"
                    ? "ပလက်ဖောင်း"
                    : "Platform"}
              </strong>
              <Link href={`/${locale}/videos`}>
                {locale === "zh"
                  ? "学习中心"
                  : locale === "my"
                    ? "လေ့လာရေးစင်တာ"
                    : "Learning center"}
              </Link>
              <Link href={`/${locale}/videos/hsk/vocabulary?level=1`}>
                {locale === "zh"
                  ? "HSK 1–6 词汇卡片"
                  : locale === "my"
                    ? "HSK ၁–၆ ဝေါဟာရကတ်များ"
                    : "HSK 1–6 vocabulary cards"}
              </Link>
              <Link href={`/${locale}/hsk-test`}>
                {locale === "zh"
                  ? "HSK 中文水平测试"
                  : locale === "my"
                    ? "HSK တရုတ်ဘာသာအဆင့် စစ်ဆေးမှု"
                    : "HSK placement test"}
              </Link>
              <Link href={`/${locale}/certificate`}>
                {locale === "zh"
                  ? "证书查询"
                  : locale === "my"
                    ? "လက်မှတ် စစ်ဆေးရန်"
                    : "Certificate lookup"}
              </Link>
              <Link href={`/${locale}/news`}>
                {locale === "zh" ? "新闻" : locale === "my" ? "သတင်း" : "News"}
              </Link>
              <Link href={`/${locale}/forum`}>
                {locale === "zh"
                  ? "社区"
                  : locale === "my"
                    ? "ဆွေးနွေးခန်း"
                    : "Community"}
              </Link>
              <Link href={`/${locale}/knowledge`}>
                {locale === "zh"
                  ? "知识内容"
                  : locale === "my"
                    ? "အသိပညာဆိုင်ရာ သင်တန်းများ"
                    : "Knowledge"}
              </Link>
            </nav>
            <nav className="site-footer-column" aria-label="Support and legal">
              <strong>
                {locale === "zh"
                  ? "支持"
                  : locale === "my"
                    ? "အကူအညီ"
                    : "Support"}
              </strong>
              <Link href={`/${locale}/feedback`}>
                {locale === "zh"
                  ? "反馈与报告 BUG"
                  : locale === "my"
                    ? "အကြံပြုချက်နှင့် ချို့ယွင်းချက်တိုင်ကြားရန်"
                    : "Feedback & bugs"}
              </Link>
              <Link href={`/${locale}/privacy`}>
                {locale === "zh"
                  ? "隐私政策"
                  : locale === "my"
                    ? "ကိုယ်ရေးအချက်အလက် မူဝါဒ"
                    : "Privacy policy"}
              </Link>
              <Link href={`/${locale}/terms`}>
                {locale === "zh"
                  ? "服务条款"
                  : locale === "my"
                    ? "ဝန်ဆောင်မှု စည်းမျဉ်းများ"
                    : "Terms of service"}
              </Link>
              <Link href={`/${locale}/community-guidelines`}>
                {locale === "zh"
                  ? "社区规则"
                  : locale === "my"
                    ? "လူမှုအသိုင်းအဝိုင်းဆိုင်ရာ စည်းမျဉ်းများ"
                    : "Community guidelines"}
              </Link>
              <Link href={`/${locale}/copyright`}>
                {locale === "zh"
                  ? "版权投诉"
                  : locale === "my"
                    ? "မူပိုင်ခွင့်ချိုးဖောက်မှု တိုင်ကြားရန်"
                    : "Copyright complaints"}
              </Link>
              <Link href={`/${locale}/data-deletion`}>
                {locale === "zh"
                  ? "用户数据删除"
                  : locale === "my"
                    ? "အသုံးပြုသူ၏ အချက်အလက်များကို ဖျက်ရန်"
                    : "User data deletion"}
              </Link>
            </nav>
            <div className="site-footer-connect">
              <strong>
                {locale === "zh"
                  ? "关注我们"
                  : locale === "my"
                    ? "ကျွန်ုပ်တို့နှင့် ချိတ်ဆက်ရန်"
                    : "Connect"}
              </strong>
              <SocialFooter />
            </div>
          </div>
          <div className="trust-footer-container" aria-label="Security and hosting verification">
            <div className="trust-badges-wrapper">
              <a className="trust-card trust-card-producthunt" href="https://www.producthunt.com/products/burmesebridge?utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-burmesebridge" target="_blank" rel="noopener noreferrer" title="View BurmeseBridge on Product Hunt">
                <img className="trust-producthunt-badge" src="/images/trust/product-hunt-featured.svg" alt="BurmeseBridge on Product Hunt" width="250" height="54" loading="lazy" />
              </a>
              <a className="trust-card" href="https://www.ssllabs.com/ssltest/analyze.html?d=burmesebridge.com" target="_blank" rel="noopener noreferrer" title="View the live Qualys SSL Labs report">
                <img className="trust-logo-img trust-logo-qualys" src="/images/trust/qualys-ssl-labs.png" alt="Qualys SSL Labs" width="112" height="36" loading="lazy" />
                <span className="trust-divider" />
                <span className="trust-text"><span className="trust-title">SSL Security</span><span className="trust-status status-green">Grade A+</span></span>
              </a>
              <a className="trust-card" href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer" title="Cloudflare CDN and security">
                <img className="trust-icon-img" src="/images/trust/cloudflare.svg" alt="Cloudflare" width="22" height="22" loading="lazy" />
                <span className="trust-divider" />
                <span className="trust-text"><span className="trust-title">Protected by</span><span className="trust-status status-orange">Cloudflare</span></span>
              </a>
              <a className="trust-card" href="https://transparencyreport.google.com/safe-browsing/search?url=burmesebridge.com" target="_blank" rel="noopener noreferrer" title="View the Google Safe Browsing transparency report">
                <img className="trust-icon-img" src="/images/trust/google.png" alt="Google" width="22" height="22" loading="lazy" />
                <span className="trust-divider" />
                <span className="trust-text"><span className="trust-title">Google Safe Browsing</span><span className="trust-status status-green">Verified Clean</span></span>
              </a>
            </div>
          </div>
          <div className="site-footer-bottom">
            <div>
              © 2026 BurmeseBridge ·{" "}
              {locale === "zh"
                ? "保留所有权利"
                : locale === "my"
                  ? "မူပိုင်ခွင့်အားလုံး ရယူထားသည်"
                  : "All rights reserved"}
            </div>
            <nav className="footer-legal" aria-label="Legal">
              <Link href={`/${locale}/privacy`}>
                {locale === "zh"
                  ? "隐私政策"
                  : locale === "my"
                    ? "ကိုယ်ရေးမူဝါဒ"
                    : "Privacy"}
              </Link>
              <Link href="/privacy-policy">
                {locale === "zh"
                  ? "英文隐私政策完整版"
                  : locale === "my"
                    ? "အင်္ဂလိပ် ကိုယ်ရေးမူဝါဒ အပြည့်အစုံ"
                    : "Full privacy policy"}
              </Link>
              <Link href={`/${locale}/terms`}>
                {locale === "zh"
                  ? "服务条款"
                  : locale === "my"
                    ? "ဝန်ဆောင်မှုစည်းမျဉ်း"
                    : "Terms"}
              </Link>
              <Link href={`/${locale}/data-deletion`}>
                {locale === "zh"
                  ? "数据删除"
                  : locale === "my"
                    ? "ဒေတာဖျက်ရန်"
                    : "Data deletion"}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
