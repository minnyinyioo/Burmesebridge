"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, Save, Settings2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import { DirectoryState } from "@/components/ui/content-directory";

type VerificationRequest = {
  id: number;
  requested_badge: "teacher" | "company" | "author";
  evidence: string;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export default function ProfilePage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const router = useRouter();

  const text = {
    my: {
      title: "ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန်",
      email: "အီးမေးလ်လိပ်စာ",
      name: "ဖော်ပြမည့်အမည်",
      placeholder: "သင့်အမည်ကို ထည့်သွင်းပါ",
      save: "ပြောင်းလဲမှုများကို သိမ်းဆည်းရန်",
      saved: "ပြောင်းလဲမှုများကို သိမ်းဆည်းပြီးပါပြီ။",
      loading: "အချက်အလက်များ တင်နေပါသည်…",
      eyebrow: "အကောင့်ဆက်တင်များ",
      subtitle: "အများမြင် ကိုယ်ရေးအချက်အလက်နှင့် Professional Verification ကို စီမံပါ။",
      nameRule: "ဖော်ပြမည့်အမည်ကို ရက် ၃၀ လျှင် တစ်ကြိမ်သာ ပြောင်းနိုင်သည်။",
      nameLocked: "နောက်တစ်ကြိမ် ပြောင်းနိုင်မည့်ရက်",
      cooldownError: "ဖော်ပြမည့်အမည်ကို ရက် ၃၀ ပြည့်ပြီးမှ ထပ်မံပြောင်းနိုင်သည်။",
      verifyTitle: "အသက်မွေးဝမ်းကျောင်းဆိုင်ရာ အထောက်အထား စိစစ်ခြင်း", verifyCopy: "ဆရာ၊ ကုမ္ပဏီ သို့မဟုတ် စာရေးသူအဖြစ် အထောက်အထား စိစစ်ပေးရန် လျှောက်ထားနိုင်ပါသည်။", teacher: "ဆရာ", company: "ကုမ္ပဏီ", author: "စာရေးသူ", evidence: "လုပ်ငန်းအတွေ့အကြုံ၊ သက်ဆိုင်ရာအဖွဲ့အစည်း သို့မဟုတ် အထောက်အထားလင့်ခ်များ", submit: "စိစစ်ရန် လျှောက်ထားမည်", pending: "သင့်လျှောက်ထားချက်ကို စိစစ်နေပါသည်။", submitted: "လျှောက်ထားချက်ကို တင်သွင်းပြီးပါပြီ။", history: "လျှောက်ထားမှုမှတ်တမ်း", approved: "အတည်ပြုပြီး", rejected: "အတည်မပြုပါ", reason: "စိစစ်ရေးမှတ်ချက်", verified: "သင့်အသက်မွေးဝမ်းကျောင်းဆိုင်ရာ အထောက်အထားကို အတည်ပြုပြီးပါပြီ။", reapply: "အထောက်အထားများကို ပြင်ဆင်ပြီး ထပ်မံလျှောက်ထားနိုင်ပါသည်။", submittedAt: "တင်သွင်းသည့်အချိန်",
    },
    zh: {
      title: "编辑个人资料",
      email: "邮箱",
      name: "显示名称",
      placeholder: "请输入你的名字",
      save: "保存",
      saved: "保存成功",
      loading: "加载中...",
      eyebrow: "账户设置",
      subtitle: "管理公开个人资料和专业身份认证申请。",
      nameRule: "显示名称每 30 天只能修改一次。",
      nameLocked: "下次可修改日期",
      cooldownError: "显示名称尚在 30 天修改冷却期内。",
      verifyTitle: "专业身份认证", verifyCopy: "申请教师、企业或作者认证，审核通过后将展示认证徽章。", teacher: "教师", company: "企业", author: "作者", evidence: "请填写经历、所属机构或证明链接", submit: "提交申请", pending: "你的申请正在审核中", submitted: "申请已提交", history: "申请记录", approved: "已通过", rejected: "已拒绝", reason: "审核备注", verified: "你的专业身份已经通过认证。", reapply: "可以更新证明材料后重新申请。", submittedAt: "提交时间",
    },
    en: {
      title: "Edit Profile",
      email: "Email",
      name: "Display Name",
      placeholder: "Your name",
      save: "Save",
      saved: "Saved successfully",
      loading: "Loading...",
      eyebrow: "Account settings",
      subtitle: "Manage your public profile and professional verification.",
      nameRule: "Your display name can be changed once every 30 days.",
      nameLocked: "Next change available",
      cooldownError: "Your display name is still within the 30-day change cooldown.",
      verifyTitle: "Professional verification", verifyCopy: "Apply as a teacher, company, or author. Approved profiles receive a public badge.", teacher: "Teacher", company: "Company", author: "Author", evidence: "Describe your experience, organization, or supporting links", submit: "Submit application", pending: "Your application is under review", submitted: "Application submitted", history: "Application history", approved: "Approved", rejected: "Rejected", reason: "Review note", verified: "Your professional identity is verified.", reapply: "You may update the evidence and apply again.", submittedAt: "Submitted",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameUpdatedAt, setDisplayNameUpdatedAt] = useState<string | null>(null);
  const [pageOpenedAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [verificationType, setVerificationType] = useState<"teacher" | "company" | "author">("teacher");
  const [evidence, setEvidence] = useState("");
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);

  const loadProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.replace(`/${locale}/login`);
      return;
    }

    const user = userData.user;

    const { data } = await supabase
      .from("profiles")
      .select("email, display_name, display_name_updated_at, verified")
      .eq("id", user.id)
      .maybeSingle();

    setEmail(data?.email || user.email || "");
    setDisplayName(data?.display_name || "");
    setDisplayNameUpdatedAt(data?.display_name_updated_at || null);
    setIsVerified(Boolean(data?.verified));
    const { data: requestRows } = await supabase.from("verification_requests")
      .select("id, requested_badge, evidence, status, review_note, created_at, reviewed_at")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    const history = (requestRows || []) as VerificationRequest[];
    setRequests(history);
    setHasPendingRequest(history.some((request) => request.status === "pending"));
    setLoading(false);
  }, [locale, router]);

  useEffect(() => {
    // Initial Supabase fetch resolves asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  async function saveProfile() {
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.replace(`/${locale}/login`);
      return;
    }

    const user = userData.user;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      display_name: displayName,
    });

    if (error) {
      setMessage(error.message.includes("display_name_change_cooldown") ? t.cooldownError : error.message);
      return;
    }

    setMessage(t.saved);
    await loadProfile();
  }

  async function submitVerification() {
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.replace(`/${locale}/login`); return; }
    if (!evidence.trim()) return;
    const { error } = await supabase.from("verification_requests").insert({
      user_id: userData.user.id,
      requested_badge: verificationType,
      evidence: evidence.trim(),
    });
    if (error) { setMessage(error.message); return; }
    setEvidence(""); setHasPendingRequest(true); setMessage(t.submitted);
  }

  if (loading) {
    return <PageContainer className="profile-settings"><DirectoryState kind="loading" title={t.loading}/></PageContainer>;
  }

  const nextNameChange = displayNameUpdatedAt ? new Date(new Date(displayNameUpdatedAt).getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const nameChangeLocked = Boolean(nextNameChange && nextNameChange.getTime() > pageOpenedAt);

  return (
    <PageContainer className="profile-settings">
      <PageIntro eyebrow={<><Settings2 size={18}/>{t.eyebrow}</>} title={t.title} description={t.subtitle}/>
      <div className="profile-settings-grid">
        <section className="profile-settings-card profile-basic-card">
          <div className="settings-card-head"><UserRound size={20}/><div><h2>{t.title}</h2><p>{email}</p></div></div>
          <label>
            {t.email}
            <input value={email} disabled />
          </label>
          <label>
            {t.name}
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t.placeholder} disabled={nameChangeLocked}/>
          </label>
          <p className="profile-field-help">{t.nameRule}{nameChangeLocked && nextNameChange ? <><br/><strong>{t.nameLocked}: {nextNameChange.toLocaleDateString(locale)}</strong></> : null}</p>
          <button type="button" onClick={saveProfile} disabled={nameChangeLocked}><Save size={16}/>{t.save}</button>
        </section>
        <section className="profile-settings-card verification-apply-card">
          <div className="settings-card-head"><BadgeCheck size={20}/><div><h2>{t.verifyTitle}</h2><p>{t.verifyCopy}</p></div></div>
          {isVerified ? <div className="verification-approved">{t.verified}</div> : hasPendingRequest ? <div className="verification-pending">{t.pending}</div> : <>
            <select value={verificationType} onChange={(event) => setVerificationType(event.target.value as typeof verificationType)}>
              <option value="teacher">{t.teacher}</option><option value="company">{t.company}</option><option value="author">{t.author}</option>
            </select>
            <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder={t.evidence} rows={5} />
            <button onClick={submitVerification} disabled={!evidence.trim()}>{t.submit}</button>
          </>}
          {requests.length > 0 && <div className="verification-history"><h3>{t.history}</h3>{requests.map((request) => <article key={request.id}><div><span className={`verification-status ${request.status}`}>{t[request.status]}</span><strong>{t[request.requested_badge]}</strong></div><p>{request.evidence}</p><time>{t.submittedAt}: {new Date(request.created_at).toLocaleString()}</time>{request.review_note && <blockquote><b>{t.reason}:</b> {request.review_note}</blockquote>}{request.status === "rejected" && <small>{t.reapply}</small>}</article>)}</div>}
        </section>
      </div>
      {message ? <p className="profile-settings-message" role="status">{message}</p> : null}
    </PageContainer>
  );
}
