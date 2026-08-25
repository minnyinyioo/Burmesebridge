import type { Metadata } from "next";
import { Padauk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./home-v2.css";
import ThemeProvider from "@/components/ThemeProvider";

const appFont = Padauk({
  subsets: ["myanmar"],
  weight: ["400", "700"],
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: "BurmeseBridge | 缅甸人中文学习平台",
  description:
    "BurmeseBridge 是面向缅甸人的中文学习、社区交流和新闻资讯平台。",
  verification: {
    google: "-mmaMu3f1WZnYLGzEJEtP3MsSCeFFlzt24FHKDsP_iw",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my" suppressHydrationWarning>
      <head>
        {/* CookieYes consent banner must load before interactive page scripts. */}
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/6c81de09c6e5a628e58a45a2e082c572/script.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={appFont.variable}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
