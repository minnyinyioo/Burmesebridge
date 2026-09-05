"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileCheck2, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

type KycStatus = "pending" | "in_review" | "approved" | "rejected" | "expired";
type KycRow = {
  id: number;
  user_id: string;
  application_kind: "student" | "teacher" | "author" | "company";
  legal_name: string;
  date_of_birth: string;
  nationality: string;
  country: string;
  address: string;
  document_type: string;
  document_last4: string;
  document_front_path: string | null;
  document_back_path: string | null;
  didit_session_id: string | null;
  didit_session_status: string | null;
  didit_verified_at: string | null;
  didit_updated_at: string | null;
  didit_decision: Record<string, unknown> | null;
  status: KycStatus;
  review_note: string | null;
  consent_version: string;
  consented_at: string;
  retention_until: string;
  created_at: string;
  reviewed_at: string | null;
  profiles?: { display_name: string | null; email: string | null } | null;
};

export default function KycAdminPage() { return <AdminGuard><KycAdminContent /></AdminGuard>; }

function KycAdminContent() {
  const locale = String(useParams().locale || "en");
  const [filter, setFilter] = useState<KycStatus>("pending");
  const [rows, setRows] = useState<KycRow[]>([]);
  const [urls, setUrls] = useState<Record<number, { front?: string; back?: string }>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const copy = locale === "zh" ? { title: "KYC 身份审核", intro: "审查结构化身份资料、Didit 验证结果和私有证件文件。最终决定只属于 Admin；系统不会自动批准。", pending: "待审核", in_review: "审核中", approved: "已通过", rejected: "已拒绝", expired: "已过期", empty: "暂无 KYC 申请", applicant: "申请人", kind: "申请类型", identity: "身份资料", document: "证件", didit: "Didit 验证", diditMissing: "未启动 Didit", diditPassed: "Didit 已通过", address: "地址", consent: "条款版本", reviewNote: "审核说明；拒绝时必填", approve: "通过", reject: "拒绝", clear: "清理证件文件", cleared: "证件文件已清理", view: "查看私有文件", reason: "请填写拒绝原因", protected: "证件链接为短期签名链接；完整证件号码不会展示或保存。Didit 结果仅作为 Admin 审核参考，不会自动发证。", student: "学生", teacher: "教师", author: "作者", company: "企业" } : locale === "my" ? { title: "KYC အထောက်အထား စစ်ဆေးခြင်း", intro: "ကိုယ်ရေးအချက်အလက်၊ Didit ရလဒ်နှင့် private စာရွက်စာတမ်းများကို စစ်ဆေးပါ။ နောက်ဆုံးဆုံးဖြတ်ချက်သည် Admin သာ ဖြစ်ပြီး အလိုအလျောက် အတည်မပြုပါ။", pending: "စစ်ဆေးရန်", in_review: "စစ်ဆေးနေသည်", approved: "အတည်ပြု", rejected: "ပယ်ချ", expired: "သက်တမ်းကုန်", empty: "KYC လျှောက်ထားမှု မရှိပါ", applicant: "လျှောက်ထားသူ", kind: "အမျိုးအစား", identity: "ကိုယ်ရေးအချက်အလက်", document: "စာရွက်စာတမ်း", didit: "Didit စစ်ဆေးမှု", diditMissing: "Didit မစတင်ရသေး", diditPassed: "Didit အတည်ပြုပြီး", address: "လိပ်စာ", consent: "စည်းမျဉ်းဗားရှင်း", reviewNote: "စစ်ဆေးချက် (ပယ်ချလျှင် မဖြစ်မနေ)", approve: "အတည်ပြု", reject: "ပယ်ချ", clear: "စာရွက်စာတမ်း ဖျက်ရန်", cleared: "စာရွက်စာတမ်း ဖျက်ပြီးပါပြီ", view: "Private ဖိုင်ကြည့်ရန်", reason: "ပယ်ချရသည့်အကြောင်းပြချက် ရေးပါ", protected: "ဖိုင်လင့်ခ်သည် ကာလတို signed link ဖြစ်သည်။ Didit ရလဒ်သည် Admin review အတွက်သာ ဖြစ်ပြီး အလိုအလျောက် certificate မထုတ်ပါ။", student: "ကျောင်းသား", teacher: "ဆရာ", author: "စာရေးသူ", company: "ကုမ္ပဏီ" } : { title: "KYC identity review", intro: "Review structured identity data, Didit results, and private document files. Admin makes the final decision; the system never auto-approves.", pending: "Pending", in_review: "In review", approved: "Approved", rejected: "Rejected", expired: "Expired", empty: "No KYC applications", applicant: "Applicant", kind: "Application", identity: "Identity data", document: "Document", didit: "Didit verification", diditMissing: "Didit not started", diditPassed: "Didit verified", address: "Address", consent: "Consent version", reviewNote: "Review note; required when rejecting", approve: "Approve", reject: "Reject", clear: "Clear document files", cleared: "Document files cleared", view: "View private file", reason: "Enter a rejection reason", protected: "Document links are short-lived signed URLs; the full document number is never displayed or stored. Didit results inform Admin review only and never issue credentials automatically.", student: "Student", teacher: "Teacher", author: "Author", company: "Company" };

  const load = useCallback(async () => {
    setMessage("");
    const { data, error } = await supabase.from("kyc_verifications").select("id,user_id,application_kind,legal_name,date_of_birth,nationality,country,address,document_type,document_last4,document_front_path,document_back_path,didit_session_id,didit_session_status,didit_verified_at,didit_updated_at,didit_decision,status,review_note,consent_version,consented_at,retention_until,created_at,reviewed_at,profiles!kyc_verifications_user_id_fkey(display_name,email)").eq("status", filter).order("created_at", { ascending: filter === "pending" });
    if (error) { setMessage(error.message); return; }
    const nextRows = (data || []) as unknown as KycRow[];
    const signed = await Promise.all(nextRows.map(async row => {
      const result: { front?: string; back?: string } = {};
      if (row.document_front_path) result.front = (await supabase.storage.from("kyc-documents").createSignedUrl(row.document_front_path, 300)).data?.signedUrl;
      if (row.document_back_path) result.back = (await supabase.storage.from("kyc-documents").createSignedUrl(row.document_back_path, 300)).data?.signedUrl;
      return [row.id, result] as const;
    }));
    setUrls(Object.fromEntries(signed)); setRows(nextRows);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function review(row: KycRow, decision: "approved" | "rejected") {
    const note = notes[row.id]?.trim() || null;
    if (decision === "rejected" && !note) { setMessage(copy.reason); return; }
    setBusy(row.id); setMessage("");
    const { error } = await supabase.rpc("review_kyc_application", { p_id: row.id, p_decision: decision, p_note: note });
    setBusy(null);
    if (error) { setMessage(error.message); return; }
    await load();
  }

  async function clearDocuments(row: KycRow) {
    setBusy(row.id); setMessage("");
    const paths = [row.document_front_path, row.document_back_path].filter(Boolean) as string[];
    if (paths.length) {
      const { error: removeError } = await supabase.storage.from("kyc-documents").remove(paths);
      if (removeError) { setBusy(null); setMessage(removeError.message); return; }
    }
    const { error } = await supabase.rpc("clear_kyc_documents", { p_id: row.id });
    setBusy(null);
    setMessage(error ? error.message : copy.cleared);
    if (!error) await load();
  }

  const kinds = { student: copy.student, teacher: copy.teacher, author: copy.author, company: copy.company };
  return <div className="adminShell"><AdminSidebar /><main className="adminContent kyc-admin"><header className="admin-page-head"><div><span className="admin-eyebrow"><ShieldCheck size={17}/>{copy.title}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><LockKeyhole size={24}/></header><p className="kyc-admin-protected"><LockKeyhole size={15}/>{copy.protected}</p><div className="verification-filters">{(["pending", "in_review", "approved", "rejected", "expired"] as KycStatus[]).map(status => <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{copy[status]}</button>)}</div>{message ? <p className="verification-message" role="status">{message}</p> : null}<div className="kyc-admin-list">{!rows.length ? <div className="feedCard home-empty">{copy.empty}</div> : rows.map(row => <article className="feedCard kyc-admin-card" key={row.id}><header><div><span className="verification-type">{kinds[row.application_kind]}</span><h2>{row.legal_name}</h2><p>{row.profiles?.email || row.user_id}</p></div><time>{new Date(row.created_at).toLocaleString(locale)}</time></header><div className="kyc-admin-details"><section><h3>{copy.identity}</h3><dl><div><dt>{copy.applicant}</dt><dd>{row.profiles?.display_name || row.profiles?.email || row.user_id}</dd></div><div><dt>{copy.kind}</dt><dd>{kinds[row.application_kind]}</dd></div><div><dt>Country / nationality</dt><dd>{row.country} · {row.nationality}</dd></div><div><dt>Date of birth</dt><dd>{row.date_of_birth}</dd></div><div><dt>Document</dt><dd>{row.document_type} · ••••{row.document_last4}</dd></div></dl></section><section><h3>{copy.didit}</h3><p className={row.didit_verified_at ? "kyc-didit-pass" : ""}>{row.didit_verified_at ? copy.diditPassed : row.didit_session_status || copy.diditMissing}</p><small>{row.didit_session_id || ""}</small><h3>{copy.address}</h3><p>{row.address}</p><h3>{copy.consent}</h3><p>{row.consent_version} · {new Date(row.consented_at).toLocaleString(locale)}</p></section></div><div className="kyc-admin-documents"><strong>{copy.document}</strong>{urls[row.id]?.front ? <a href={urls[row.id].front} target="_blank" rel="noreferrer"><FileCheck2 size={15}/>{copy.view} · front<ExternalLink size={13}/></a> : null}{urls[row.id]?.back ? <a href={urls[row.id].back} target="_blank" rel="noreferrer"><FileCheck2 size={15}/>{copy.view} · back<ExternalLink size={13}/></a> : null}</div>{row.review_note ? <blockquote>{row.review_note}</blockquote> : null}{row.status === "pending" || row.status === "in_review" ? <div className="kyc-admin-actions"><textarea value={notes[row.id] || ""} onChange={event => setNotes(current => ({ ...current, [row.id]: event.target.value }))} placeholder={copy.reviewNote} rows={2}/><div><button type="button" disabled={busy === row.id} onClick={() => void review(row, "approved")}><ShieldCheck size={15}/>{copy.approve}</button><button type="button" className="reject" disabled={busy === row.id} onClick={() => void review(row, "rejected")}><X size={15}/>{copy.reject}</button></div></div> : null}<footer><button type="button" disabled={busy === row.id || (!row.document_front_path && !row.document_back_path)} onClick={() => void clearDocuments(row)}>{copy.clear}</button></footer></article>)}</div></main></div>;
}
