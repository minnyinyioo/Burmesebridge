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
 * 后台左侧导航，自动跟随当前语言路径。
 */
export default function AdminSidebar() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const items = [
    {
      label: "Dashboard",
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      label: "Posts",
      href: `/${locale}/admin/posts`,
      icon: FileText,
    },
    {
      label: "News",
      href: `/${locale}/admin/news`,
      icon: Newspaper,
    },
    {
      label: "Ban Center",
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