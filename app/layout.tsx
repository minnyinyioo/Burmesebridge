import type { Metadata } from "next";
import { Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const appFont = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: "BurmeseBridge | 缅甸人中文学习平台",
  description:
    "BurmeseBridge 是面向缅甸人的中文学习、社区交流、工作信息和新闻资讯平台。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <body className={appFont.variable}>
        {children}
      </body>
    </html>
  );
}
