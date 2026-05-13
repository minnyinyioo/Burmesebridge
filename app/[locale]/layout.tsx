import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  return (
    <div
      style={{
        fontFamily: "Noto Serif Myanmar, serif",
        minHeight: "100vh",
        background: "#f8f8f8",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e5e5",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "22px",
            color: "#1d4ed8",
          }}
        >
          BurmeseBridge
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "15px",
          }}
        >
          <Link href={`/${locale}`}>首页</Link>
          <Link href={`/${locale}/learn`}>学习</Link>
          <Link href={`/${locale}/forum`}>社区</Link>
          <Link href={`/${locale}/jobs`}>工作</Link>
          <Link href={`/${locale}/news`}>新闻</Link>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}