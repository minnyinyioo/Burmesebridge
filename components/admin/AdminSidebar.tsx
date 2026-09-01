"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  LayoutDashboard,
  Users,
  FileText,
  Newspaper,
  Shield,
  BadgeCheck,
  Video,
  LibraryBig,
  Flag,
  Gavel,
  ScrollText,
  Bug,
  Megaphone,
  BriefcaseBusiness,
  GraduationCap,
  UserCog,
  CreditCard,
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
      students: "ကျောင်းသား စီမံခန့်ခွဲမှု",
      posts: "ပို့စ်များ",
      publish: "အချက်အလက်တင်ရန်",
      ban: "ပိတ်ပင်မှု စင်တာ",
      verification: "အတည်ပြုလျှောက်ထားမှု",
      videos: "ဗီဒီယို",
      knowledge: "အခပေးသင်တန်း",
      reports: "တိုင်ကြားချက်များ",
      appeals: "အယူခံများ", audit: "လုပ်ဆောင်ချက်မှတ်တမ်း",
    },
    zh: {
      dashboard: "总览",
      users: "用户",
      students: "学生管理",
      staff: "后台人员权限",
      posts: "帖子",
      publish: "发布信息",
      ban: "封禁中心",
      verification: "身份审核",
      videos: "视频管理",
      knowledge: "知识付费",
      reports: "举报审核",
      appeals: "申诉审核", audit: "操作日志",
    },
    en: {
      dashboard: "Dashboard",
      users: "Users",
      students: "Students",
      staff: "Staff access",
      posts: "Posts",
      publish: "Publish",
      ban: "Ban Center",
      verification: "Verification",
      videos: "Videos",
      knowledge: "Knowledge",
      reports: "Reports",
      appeals: "Appeals", audit: "Audit log",
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
    { label: "staff" in t ? t.staff : "ဝန်ထမ်းခွင့်ပြုချက်", href: `/${locale}/admin/staff`, icon: UserCog },
    { label: t.students, href: `/${locale}/admin/students`, icon: GraduationCap },
    { label: locale === "zh" ? "实体 NFC 卡" : locale === "my" ? "NFC ကတ်" : "Physical NFC cards", href: `/${locale}/admin/physical-cards`, icon: CreditCard },
    { label: locale === "zh" ? "招聘审核" : locale === "my" ? "အလုပ်ကြော်ငြာ စိစစ်ရေး" : "Job reviews", href: `/${locale}/admin/jobs`, icon: BriefcaseBusiness },
    { label: t.videos, href: `/${locale}/admin/videos`, icon: Video },
    { label: t.knowledge, href: `/${locale}/admin/knowledge`, icon: LibraryBig },
    { label: t.reports, href: `/${locale}/admin/reports`, icon: Flag },
    { label: t.appeals, href: `/${locale}/admin/appeals`, icon: Gavel },
    { label: t.audit, href: `/${locale}/admin/audit`, icon: ScrollText },
    { label: locale === "zh" ? "反馈与 BUG" : locale === "my" ? "အကြံပြုချက် / BUG" : "Feedback & bugs", href: `/${locale}/admin/feedback`, icon: Bug },
    { label: locale === "zh" ? "广告管理" : locale === "my" ? "ကြော်ငြာ" : "Ads", href: `/${locale}/admin/ads`, icon: Megaphone },
    {
      label: t.ban,
      href: `/${locale}/admin/ban`,
      icon: Shield,
    },
  ];

  return (
    <div className="adminSidebar">
      <Link href={`/${locale}`} className="adminBrand" aria-label="BurmeseBridge">
        <BrandLogo size={38} />
      </Link>
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
