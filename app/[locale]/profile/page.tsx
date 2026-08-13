"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  const text = {
    my: {
      title: "ပရိုဖိုင် ပြင်ရန်",
      email: "အီးမေးလ်",
      name: "အမည်",
      placeholder: "သင့်အမည်",
      save: "သိမ်းမည်",
      saved: "သိမ်းပြီးပါပြီ",
      loading: "ခေတ္တစောင့်ပါ...",
      verifyTitle: "ပရော်ဖက်ရှင်နယ် အထောက်အထား", verifyCopy: "ဆရာ၊ ကုမ္ပဏီ သို့မဟုတ် စာရေးသူ အဖြစ် လျှောက်ထားနိုင်ပါသည်။", teacher: "ဆရာ", company: "ကုမ္ပဏီ", author: "စာရေးသူ", evidence: "သင့်အတွေ့အကြုံ၊ အဖွဲ့အစည်း သို့မဟုတ် အထောက်အထား လင့်ခ်များ", submit: "လျှောက်ထားမည်", pending: "သင့်လျှောက်လွှာကို စစ်ဆေးနေပါသည်", submitted: "လျှောက်လွှာ တင်ပြီးပါပြီ", history: "လျှောက်လွှာ မှတ်တမ်း", approved: "အတည်ပြုပြီး", rejected: "ပယ်ချပြီး", reason: "စစ်ဆေးမှတ်ချက်", verified: "သင့်ပရော်ဖက်ရှင်နယ် အထောက်အထားကို အတည်ပြုပြီးပါပြီ။", reapply: "အထောက်အထားကို ပြင်ဆင်ပြီး ထပ်မံလျှောက်ထားနိုင်ပါသည်။", submittedAt: "တင်သွင်းချိန်",
    },
    zh: {
      title: "编辑个人资料",
      email: "邮箱",
      name: "显示名称",
      placeholder: "请输入你的名字",
      save: "保存",
      saved: "保存成功",
      loading: "加载中...",
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
      verifyTitle: "Professional verification", verifyCopy: "Apply as a teacher, company, or author. Approved profiles receive a public badge.", teacher: "Teacher", company: "Company", author: "Author", evidence: "Describe your experience, organization, or supporting links", submit: "Submit application", pending: "Your application is under review", submitted: "Application submitted", history: "Application history", approved: "Approved", rejected: "Rejected", reason: "Review note", verified: "Your professional identity is verified.", reapply: "You may update the evidence and apply again.", submittedAt: "Submitted",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [verificationType, setVerificationType] = useState<"teacher" | "company" | "author">("teacher");
  const [evidence, setEvidence] = useState("");
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);

  const loadProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const user = userData.user;

    const { data } = await supabase
      .from("profiles")
      .select("email, display_name, verified")
      .eq("id", user.id)
      .maybeSingle();

    setEmail(data?.email || user.email || "");
    setDisplayName(data?.display_name || "");
    setIsVerified(Boolean(data?.verified));
    const { data: requestRows } = await supabase.from("verification_requests")
      .select("id, requested_badge, evidence, status, review_note, created_at, reviewed_at")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    const history = (requestRows || []) as VerificationRequest[];
    setRequests(history);
    setHasPendingRequest(history.some((request) => request.status === "pending"));
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function saveProfile() {
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    const user = userData.user;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      display_name: displayName,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(t.saved);
    await loadProfile();
  }

  async function submitVerification() {
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { window.location.href = `/${locale}/login`; return; }
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
    return <main style={{ padding: 40 }}>{t.loading}</main>;
  }

  return (
    <main style={{ padding: "48px 24px", minHeight: "100vh" }}>
      <section style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>{t.title}</h1>

        <div style={card}>
          <label style={label}>
            {t.email}
            <input value={email} disabled style={input} />
          </label>

          <label style={label}>
            {t.name}
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={input}
              placeholder={t.placeholder}
            />
          </label>

          <button onClick={saveProfile} style={button}>
            {t.save}
          </button>

          {message && (
            <p style={{ marginTop: 16, color: "#10b981" }}>{message}</p>
          )}
        </div>

        <div className="verification-apply-card">
          <h2>{t.verifyTitle}</h2><p>{t.verifyCopy}</p>
          {isVerified ? <div className="verification-approved">{t.verified}</div> : hasPendingRequest ? <div className="verification-pending">{t.pending}</div> : <>
            <select value={verificationType} onChange={(event) => setVerificationType(event.target.value as typeof verificationType)}>
              <option value="teacher">{t.teacher}</option><option value="company">{t.company}</option><option value="author">{t.author}</option>
            </select>
            <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder={t.evidence} rows={5} />
            <button onClick={submitVerification} disabled={!evidence.trim()}>{t.submit}</button>
          </>}
          {requests.length > 0 && <div className="verification-history"><h3>{t.history}</h3>{requests.map((request) => <article key={request.id}><div><span className={`verification-status ${request.status}`}>{t[request.status]}</span><strong>{t[request.requested_badge]}</strong></div><p>{request.evidence}</p><time>{t.submittedAt}: {new Date(request.created_at).toLocaleString()}</time>{request.review_note && <blockquote><b>{t.reason}:</b> {request.review_note}</blockquote>}{request.status === "rejected" && <small>{t.reapply}</small>}</article>)}</div>}
        </div>
      </section>
    </main>
  );
}

const card = {
  background: "white",
  color: "#0f172a",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
};

const label = {
  display: "grid",
  gap: "8px",
  marginBottom: "18px",
  fontWeight: 700,
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
};

const button = {
  background: "#2563eb",
  color: "white",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};
