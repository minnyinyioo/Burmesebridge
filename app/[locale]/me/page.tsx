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
import { ProfileBadges } from "@/components/Badges";
import VerifiedAvatar from "@/components/VerifiedAvatar";
import AvatarPicker from "@/components/AvatarPicker";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  badge: string | null;
  role: string | null;
  badges: string[] | null;
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
  const [membershipDisplay,setMembershipDisplay]=useState<{membership_badge:string|null;membership_expires_at:string|null}|null>(null);
  const [approvedKinds, setApprovedKinds] = useState<string[]>([]);

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
          verification: "申请教师 / 作者等认证",
          kyc: "KYC 身份核验",
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
            verification: "ဆရာ / စာရေးသူ စစ်ဆေးအတည်ပြုရန်",
            kyc: "KYC ကိုယ်ရေးအထောက်အထား",
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
            verification: "Apply for teacher / author verification",
            kyc: "KYC identity verification",
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
      const [profileResult, checkinResult, postResult, kycResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, verified, badge, badges, role, points, display_name_updated_at")
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
        supabase
          .from("kyc_verifications")
          .select("application_kind")
          .eq("user_id", user.id)
          .eq("status", "approved"),
      ]);

      if (!mounted) return;
      const {data:membershipData}=await supabase.from("public_profiles").select("membership_badge,membership_expires_at").eq("id",user.id).maybeSingle();
      setMembershipDisplay(membershipData);
      setEmail(user.email || "");
      setProfile(profileResult.data);
      setCheckinCount(checkinResult.count || 0);
      setPostCount(postResult.count || 0);
      setApprovedKinds(Array.from(new Set((kycResult.data || []).map((row) => row.application_kind))));
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
  const rank = Math.max(1, Math.floor(Math.sqrt(checkinCount)) + 1);
  const roles = new Set<string>(["member", "student"]);
  if (profile?.verified) roles.add("verified");
  if (profile?.role === "admin") roles.add("admin");
  if (profile?.role === "moderator") roles.add("moderator");
  if (profile?.badge && ["teacher", "author", "company", "vip"].includes(profile.badge)) roles.add(profile.badge);
  (profile?.badges || []).forEach((item) => roles.add(item));
  approvedKinds.forEach((kind) => roles.add(kind));
  const roleLabels: Record<string, { zh: string; my: string; en: string }> = {
    admin: { zh: "管理员", my: "အက်မင်", en: "Admin" }, moderator: { zh: "版主", my: "စီမံခန့်ခွဲသူ", en: "Moderator" }, verified: { zh: "已认证", my: "အတည်ပြုပြီး", en: "Verified" }, teacher: { zh: "老师", my: "ဆရာ", en: "Teacher" }, author: { zh: "作者", my: "စာရေးသူ", en: "Author" }, student: { zh: "学生", my: "ကျောင်းသား", en: "Student" }, company: { zh: "企业", my: "ကုမ္ပဏီ", en: "Company" }, vip: { zh: "VIP 会员", my: "VIP အဖွဲ့ဝင်", en: "VIP" }, premium: { zh: "高级会员", my: "အဆင့်မြင့်အဖွဲ့ဝင်", en: "Premium" }, member: { zh: "会员", my: "အဖွဲ့ဝင်", en: "Member" },
  };
  const badgeItems = Array.from(roles).map((type) => ({ type, label: roleLabels[type]?.[locale as "zh" | "my" | "en"] || roleLabels[type]?.en || type }));
  const links = [
    {href: "/"+locale+"/membership", label: locale==="zh"?"会员中心 · 订购 / 续费":locale==="my"?"အဖွဲ့ဝင်စင်တာ":"Membership · Purchase / Renew", icon: ShieldCheck},
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
    { href: "#profile-settings", label: copy.verification, icon: ShieldCheck },
    { href: `/${locale}/kyc`, label: copy.kyc, icon: ShieldCheck },
    { href: `/${locale}/appeals`, label: locale === "zh" ? "申诉中心" : locale === "my" ? "အယူခံတင်ရန်" : "Appeals", icon: Gavel },
  ];

  return (
    <main className="account-page">
      <section className="account-shell">
        <div className="account-hero">
          <div className="account-avatar"><VerifiedAvatar name={name} avatarUrl={profile?.avatar_url} verified={profile?.verified} size={82}/></div>
          <div className="account-identity">
            <div className="account-name-row">
              <h1>{name}</h1>
              <ProfileBadges badges={badgeItems.map(item=>item.type)} level={rank} membershipBadge={membershipDisplay?.membership_badge} membershipExpiresAt={membershipDisplay?.membership_expires_at}/>
            </div>
            <p>{email}</p>
          </div>
          <div className="account-hero-actions">
            {profile?.id ? <AvatarPicker locale={locale} userId={profile.id} name={name} avatarUrl={profile.avatar_url} verified={Boolean(profile.verified)} onSaved={(url)=>setProfile(current=>current?{...current,avatar_url:url}:current)} /> : null}
            <a href="#profile-settings" className="account-edit">
              {copy.profile}
            </a>
          </div>
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
