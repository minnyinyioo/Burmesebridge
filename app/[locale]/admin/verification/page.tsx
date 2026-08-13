"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Clock3, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

type RequestRow = {
  id: number;
  user_id: string;
  requested_badge: "teacher" | "company" | "author";
  evidence: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  profiles?: { display_name: string | null; email: string | null } | null;
};

export default function VerificationAdminPage() {
  return <AdminGuard><VerificationContent /></AdminGuard>;
}

function VerificationContent() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});

  const copy = locale === "zh" ? {
    title: "身份审核", subtitle: "审核教师、企业和作者的专业身份申请", pending: "待审核", approved: "已通过", rejected: "已拒绝", approve: "通过", reject: "拒绝", empty: "暂无申请", teacher: "教师", company: "企业", author: "作者", note: "审核备注；拒绝时必须填写原因", reasonRequired: "请填写拒绝原因", reviewed: "审核时间",
  } : locale === "en" ? {
    title: "Identity verification", subtitle: "Review teacher, company, and author applications", pending: "Pending", approved: "Approved", rejected: "Rejected", approve: "Approve", reject: "Reject", empty: "No applications", teacher: "Teacher", company: "Company", author: "Author", note: "Review note; a reason is required when rejecting", reasonRequired: "Enter a rejection reason", reviewed: "Reviewed",
  } : {
    title: "အထောက်အထား စစ်ဆေးခြင်း", subtitle: "ဆရာ၊ ကုမ္ပဏီနှင့် စာရေးသူ လျှောက်လွှာများကို စစ်ဆေးပါ", pending: "စောင့်ဆိုင်း", approved: "အတည်ပြုပြီး", rejected: "ပယ်ချပြီး", approve: "အတည်ပြု", reject: "ပယ်ချ", empty: "လျှောက်လွှာ မရှိသေးပါ", teacher: "ဆရာ", company: "ကုမ္ပဏီ", author: "စာရေးသူ", note: "စစ်ဆေးမှတ်ချက်၊ ပယ်ချလျှင် အကြောင်းပြချက် လိုအပ်သည်", reasonRequired: "ပယ်ချရသည့် အကြောင်းပြချက် ရေးပါ", reviewed: "စစ်ဆေးချိန်",
  };

  const loadRequests = useCallback(async (nextFilter = filter) => {
    const { data, error } = await supabase.from("verification_requests")
      .select("id, user_id, requested_badge, evidence, status, created_at, reviewed_at, review_note, profiles(display_name, email)")
      .eq("status", nextFilter).order("created_at", { ascending: true });
    if (error) { setMessage(error.message); return; }
    setRequests((data || []) as unknown as RequestRow[]);
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function review(id: number, decision: "approved" | "rejected") {
    setBusy(id); setMessage("");
    const note = notes[id]?.trim() || null;
    if (decision === "rejected" && !note) { setMessage(copy.reasonRequired); setBusy(null); return; }
    const { error } = await supabase.rpc("review_verification_request", { request_id: id, decision, note });
    setBusy(null);
    if (error) { setMessage(error.message); return; }
    await loadRequests();
  }

  return (
    <div className="adminShell"><AdminSidebar /><div className="adminContent verification-admin">
      <header className="admin-page-head"><div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><Clock3 size={24} /></header>
      <div className="verification-filters">
        {(["pending", "approved", "rejected"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => { setFilter(item); loadRequests(item); }}>{copy[item]}</button>)}
      </div>
      {message && <p className="verification-message">{message}</p>}
      <div className="verification-list">
        {requests.length === 0 && <div className="feedCard home-empty">{copy.empty}</div>}
        {requests.map((request) => <article className="feedCard verification-card" key={request.id}>
          <div className="verification-detail"><span className="verification-type">{copy[request.requested_badge]}</span><h2>{request.profiles?.display_name || request.profiles?.email || request.user_id}</h2><p>{request.evidence}</p><time>{new Date(request.created_at).toLocaleString()}</time>{request.review_note && <blockquote>{request.review_note}</blockquote>}{request.reviewed_at && <time>{copy.reviewed}: {new Date(request.reviewed_at).toLocaleString()}</time>}</div>
          {request.status === "pending" && <div className="verification-review"><textarea value={notes[request.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder={copy.note} rows={3} /><div className="verification-actions"><button disabled={busy === request.id} onClick={() => review(request.id, "approved")}><Check size={16} />{copy.approve}</button><button className="reject" disabled={busy === request.id} onClick={() => review(request.id, "rejected")}><X size={16} />{copy.reject}</button></div></div>}
        </article>)}
      </div>
    </div></div>
  );
}
