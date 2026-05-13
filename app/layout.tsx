import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BurmeseBridge | 缅甸人中文学习平台",
  description:
    "BurmeseBridge 是面向缅甸人的中文学习、社区交流、工作信息和新闻资讯平台。",
  keywords: [
    "BurmeseBridge",
    "缅甸人学中文",
    "中文学习",
    "缅甸劳工",
    "打工中文",
    "Myanmar Chinese learning",
  ],
  openGraph: {
    title: "BurmeseBridge",
    description: "缅甸人中文学习与交流社区",
    type: "website",
    locale: "my_MM",
    siteName: "BurmeseBridge",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <body>{children}</body>
    </html>
  );
}