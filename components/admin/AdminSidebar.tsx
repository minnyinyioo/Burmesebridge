"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Newspaper,
  Shield,
} from "lucide-react";

/**
 * AdminSidebar
 * 后台左侧导航。
 * 注意：
 * URL 仍然保持 /admin/news，
 * 只是显示名称改为“发布信息”。
 */
export default function AdminSidebar() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      dashboard: "ဒက်ရှ်ဘုတ်",
      users: "အသုံးပြုသူများ",
      posts: "ပို့စ်များ",
      publish: "အချက်အလက်တင်ရန်",
      ban: "ပိတ်ပင်မှု စင်တာ",
    },
    zh: {
      dashboard: "总览",
      users: "用户",
      posts: "帖子",
      publish: "发布信息",
      ban: "封禁中心",
    },
    en: {
      dashboard: "Dashboard",
      users: "Users",
      posts: "Posts",
      publish: "Publish",
      ban: "Ban Center",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const items = [
    {
      label: t.dashboard,
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
    {
      label: t.users,
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      label: t.posts,
      href: `/${locale}/admin/posts`,
      icon: FileText,
    },
    {
      label: t.publish,
      href: `/${locale}/admin/news`,
      icon: Newspaper,
    },
    {
      label: t.ban,
      href: `/${locale}/admin/ban`,
      icon: Shield,
    },
  ];

  return (
    <div className="adminSidebar">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="adminLink">
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}