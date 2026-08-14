"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

/**
 * 全站统一外壳组件
 * 负责：
 * - 顶部导航
 * - 页面最大宽度
 * - 背景
 * - 三语入口链接
 *
 * 注意：
 * 这里不处理登录逻辑，先只做整站结构统一。
 */
export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      home: "ပင်မစာမျက်နှာ",
      learn: "သင်ယူရန်",
      forum: "Community",
      jobs: "အလုပ်အကိုင်",
      me: "ပရိုဖိုင်",
    },
    zh: {
      home: "首页",
      learn: "学习",
      forum: "社区",
      jobs: "工作",
      me: "我的",
    },
    en: {
      home: "Home",
      learn: "Learn",
      forum: "Community",
      jobs: "Jobs",
      me: "Me",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  return (
    <div style={shell}>
      <header style={header}>
        <Link href={`/${locale}`} style={logo}>
          <BrandLogo size={36} />
        </Link>

        <nav style={nav}>
          <Link href={`/${locale}`} style={navItem}>
            {t.home}
          </Link>

          <Link href={`/${locale}/learn`} style={navItem}>
            {t.learn}
          </Link>

          <Link href={`/${locale}/forum`} style={navItem}>
            {t.forum}
          </Link>

          <Link href={`/${locale}/jobs`} style={navItem}>
            {t.jobs}
          </Link>

          <Link href={`/${locale}/me`} style={profileButton}>
            {t.me}
          </Link>
        </nav>
      </header>

      <main style={main}>{children}</main>
    </div>
  );
}

const shell = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)",
};

const header = {
  position: "sticky" as const,
  top: 0,
  zIndex: 50,
  height: "72px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid rgba(226,232,240,0.9)",
};

const logo = {
  fontSize: "22px",
  fontWeight: 900,
  color: "#0f172a",
  textDecoration: "none",
};

const nav = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap" as const,
};

const navItem = {
  padding: "10px 12px",
  borderRadius: "999px",
  color: "#475569",
  fontWeight: 700,
  textDecoration: "none",
};

const profileButton = {
  padding: "10px 16px",
  borderRadius: "999px",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  textDecoration: "none",
};

const main = {
  width: "100%",
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "32px 20px 96px",
};
