"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Gavel,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import DeleteAccountPanel from "@/components/DeleteAccountPanel";
import AccountSecurityPanel from "@/components/AccountSecurityPanel";
import AccountProfilePanel from "@/components/AccountProfilePanel";
import EducationIdCards from "@/components/EducationIdCards";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  badge: string | null;
  points: number | null;
  display_name_updated_at: string | null;
};

export default function MePage() {
  const params = useParams();
  const locale = String(params.locale || "en");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  const copy =
    locale === "zh"
      ? {
          fallback: "BurmeseBridge 用户",
          member: "普通会员",
          verified: "已认证",
          points: "积分",
          checkins: "累计签到",
          posts: "我的帖子",
          quick: "快捷入口",
          learn: "学习中心",
          checkin: "每日签到",
          forum: "社区论坛",
          jobs: "工作信息",
          profile: "编辑资料",
          logout: "退出登录",
          load: "正在加载账户…",
          day: "天",
        }
      : locale === "my"
        ? {
            fallback: "BurmeseBridge အသုံးပြုသူ",
            member: "အဖွဲ့ဝင်",
            verified: "အတည်ပြုပြီး",
            points: "အမှတ်",
            checkins: "စုစုပေါင်း Check-in",
            posts: "ကျွန်ုပ်၏ ပို့စ်များ",
            quick: "အမြန်ဝင်ရန်",
            learn: "သင်ယူရန်",
            checkin: "နေ့စဉ် Check-in",
            forum: "Community",
            jobs: "အလုပ်အကိုင်",
            profile: "ကိုယ်ရေးအချက်အလက် ပြင်ရန်",
            logout: "အကောင့်ထွက်ရန်",
            load: "အကောင့်ကို ဖွင့်နေသည်…",
            day: "ရက်",
          }
        : {
            fallback: "BurmeseBridge User",
            member: "Member",
            verified: "Verified",
            points: "Points",
            checkins: "Total check-ins",
            posts: "My posts",
            quick: "Quick access",
            learn: "Learning center",
            checkin: "Daily check-in",
            forum: "Community forum",
            jobs: "Jobs",
            profile: "Edit profile",
            logout: "Log out",
            load: "Loading your account…",
            day: "days",
          };

  useEffect(() => {
    let mounted = true;
    async function loadAccount() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace(`/${locale}/login`);
        return;
      }

      const user = authData.user;
      const [profileResult, checkinResult, postResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, verified, badge, points, display_name_updated_at")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("checkins")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (!mounted) return;
      setEmail(user.email || "");
      setProfile(profileResult.data);
      setCheckinCount(checkinResult.count || 0);
      setPostCount(postResult.count || 0);
      setLoading(false);
    }
    loadAccount();
    return () => {
      mounted = false;
    };
  }, [locale, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace(`/${locale}/login`);
  }

  if (loading)
    return (
      <main className="account-page">
        <p className="account-loading">{copy.load}</p>
      </main>
    );

  const name = profile?.display_name || email.split("@")[0] || copy.fallback;
  const badge = profile?.verified
    ? profile.badge || copy.verified
    : copy.member;
  const links = [
    {
      href: `/${locale}/my-courses`,
      label:
        locale === "zh"
          ? "我的课程"
          : locale === "my"
            ? "ကျွန်ုပ်၏ သင်တန်းများ"
            : "My courses",
      icon: BookOpen,
    },
    {
      href: `/${locale}/orders`,
      label:
        locale === "zh"
          ? "购买记录"
          : locale === "my"
            ? "ဝယ်ယူမှု မှတ်တမ်း"
            : "Purchase history",
      icon: ClipboardList,
    },
    { href: `/${locale}/learn`, label: copy.learn, icon: BookOpen },
    { href: `/${locale}/checkin`, label: copy.checkin, icon: CalendarCheck },
    { href: `/${locale}/forum`, label: copy.forum, icon: MessageSquareText },
    { href: `/${locale}/appeals`, label: locale === "zh" ? "申诉中心" : locale === "my" ? "အယူခံတင်ရန်" : "Appeals", icon: Gavel },
  ];

  return (
    <main className="account-page">
      <section className="account-shell">
        <div className="account-hero">
          <div className="account-avatar">
            {profile?.avatar_url ? (
              <span
                style={{ backgroundImage: `url(${profile.avatar_url})` }}
                role="img"
                aria-label={name}
              />
            ) : (
              <UserRound size={36} />
            )}
          </div>
          <div className="account-identity">
            <div className="account-name-row">
              <h1>{name}</h1>
              <span
                className={
                  profile?.verified ? "account-badge verified" : "account-badge"
                }
              >
                {profile?.verified && <ShieldCheck size={14} />}
                {badge}
              </span>
            </div>
            <p>{email}</p>
          </div>
          <a href="#profile-settings" className="account-edit">
            {copy.profile}
          </a>
        </div>

        <div className="account-stats">
          <article>
            <strong>{profile?.points || 0}</strong>
            <span>{copy.points}</span>
          </article>
          <article>
            <strong>{checkinCount}</strong>
            <span>
              {copy.checkins} · {copy.day}
            </span>
          </article>
          <article>
            <strong>{postCount}</strong>
            <span>{copy.posts}</span>
          </article>
        </div>

        <div className="account-section">
          <h2>{copy.quick}</h2>
          <div className="account-links">
            {links.map(({ href, label, icon: Icon }) => (
              <a key={href} href={href}>
                <Icon size={20} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="account-footer">
          <a href={`/${locale}/forum`}>
            <FileText size={17} />
            {copy.posts}
          </a>
          <button type="button" onClick={handleLogout}>
            <LogOut size={17} />
            {copy.logout}
          </button>
        </div>
        <AccountProfilePanel locale={locale} userId={profile?.id || ""} email={email} initialName={profile?.display_name || ""} nameUpdatedAt={profile?.display_name_updated_at || null} verified={Boolean(profile?.verified)} />
        {profile?.id ? <EducationIdCards locale={locale} userId={profile.id} /> : null}
        <AccountSecurityPanel locale={locale} />
        {email ? <DeleteAccountPanel locale={locale} email={email} /> : null}
      </section>
    </main>
  );
}
