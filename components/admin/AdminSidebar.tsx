"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Newspaper,
  Shield,
  BadgeCheck,
  Video,
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
      verification: "အတည်ပြုလျှောက်ထားမှု",
      videos: "ဗီဒီယို",
    },
    zh: {
      dashboard: "总览",
      users: "用户",
      posts: "帖子",
      publish: "发布信息",
      ban: "封禁中心",
      verification: "身份审核",
      videos: "视频管理",
    },
    en: {
      dashboard: "Dashboard",
      users: "Users",
      posts: "Posts",
      publish: "Publish",
      ban: "Ban Center",
      verification: "Verification",
      videos: "Videos",
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
      label: t.verification,
      href: `/${locale}/admin/verification`,
      icon: BadgeCheck,
    },
    { label: t.videos, href: `/${locale}/admin/videos`, icon: Video },
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
