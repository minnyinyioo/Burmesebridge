"use client";

import Link from "next/link";
import { Home, MessageCircle, PlaySquare, Search, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileTabBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const labels = locale === "zh"
    ? { home: "首页", learn: "学习视频", forum: "社区", search: "搜索", me: "我的" }
    : locale === "my"
      ? { home: "ပင်မ", learn: "လေ့လာဗီဒီယို", forum: "Community", search: "ရှာရန်", me: "ကျွန်ုပ်" }
      : { home: "Home", learn: "Learn video", forum: "Community", search: "Search", me: "Me" };
  const tabs = [
    { key: "home", href: `/${locale}`, icon: Home, exact: true },
    { key: "learn", href: `/${locale}/videos`, icon: PlaySquare, exact: false },
    { key: "forum", href: `/${locale}/forum`, icon: MessageCircle, exact: false },
    { key: "search", href: `/${locale}/search`, icon: Search, exact: false },
    { key: "me", href: `/${locale}/me`, icon: UserRound, exact: false },
  ] as const;

  return <nav className="mobile-tabbar" aria-label="Mobile navigation">
    {tabs.map((tab) => {
      const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
      const Icon = tab.icon;
      return <Link href={tab.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} key={tab.key}>
        <Icon size={19} strokeWidth={active ? 2.5 : 2} />
        {labels[tab.key]}
      </Link>;
    })}
  </nav>;
}
