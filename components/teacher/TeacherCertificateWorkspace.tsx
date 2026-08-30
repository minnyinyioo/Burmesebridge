"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = { id: number; product_id: number; user_id: string; eligibility_snapshot: Record<string, number>; created_at: string; knowledge_products: { title_zh: string | null; title_my: string | null; title_en: string | null } | null };

export default function TeacherCertificateWorkspace({ locale }: { locale: string }) {
  const copy = locale === "zh"
    ? { title: "教师工作台", intro: "这里只显示分配给您的课程证书申请。", queue: "待审核证书", empty: "目前没有申请", note: "审核意见；驳回时必填", approve: "通过并颁发", reject: "驳回", evidence: "学习与考核记录", denied: "您尚未被分配课程，或教师身份尚未通过认证。", processing: "处理中…", saved: "审核结果已保存" }
    : locale === "my"
      ? { title: "ဆရာ Workbench", intro: "သင့်အား တာဝန်ပေးထားသော သင်တန်းများ၏ လက်မှတ်လျှောက်ထားမှုများကိုသာ ပြသသည်။", queue: "စစ်ဆေးရန် လက်မှတ်များ", empty: "လျှောက်ထားမှုမရှိပါ", note: "စစ်ဆေးမှတ်ချက် (ပယ်ချပါက မဖြစ်မနေ)", approve: "အတည်ပြုပြီး ထုတ်ပေးရန်", reject: "ပယ်ချရန်", evidence: "သင်ယူမှုနှင့် စစ်ဆေးမှုမှတ်တမ်း", denied: "သင်တန်းတာဝန် မပေးရသေးပါ သို့မဟုတ် ဆရာအတည်ပြုချက် မရှိသေးပါ။", processing: "လုပ်ဆောင်နေသည်…", saved: "စစ်ဆေးမှု သိမ်းပြီးပါပြီ" }
      : { title: "Instructor workspace", intro: "Only certificate requests for courses assigned to you are shown here.", queue: "Certificates to review", empty: "No requests awaiting review", note: "Review note; required when rejecting", approve: "Approve and issue", reject: "Reject", evidence: "Learning and assessment evidence", denied: "No course is assigned to you, or your teacher verification is incomplete.", processing: "Processing…", saved: "Review saved" };
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("knowledge_certificate_requests").select("id,product_id,user_id,eligibility_snapshot,created_at,knowledge_products(title_zh,title_my,title_en)").eq("status", "pending").order("created_at", { ascending: true });
    if (error) setMessage(copy.denied); else { setRows((data || []) as unknown as Row[]); setMessage(""); }
    setLoading(false);
  }, [copy.denied]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function review(id: number, decision: "approved" | "rejected") {
    const note = notes[id]?.trim() || null;
    if (decision === "rejected" && !note) { setMessage(copy.note); return; }
    setBusyId(id); setMessage("");
    const { error } = await supabase.rpc("review_knowledge_certificate_request", { p_request_id: id, p_decision: decision, p_review_note: note });
    setBusyId(null);
    if (error) setMessage(error.message); else { setRows((current) => current.filter((row) => row.id !== id)); setMessage(copy.saved); }
  }
  return <main className="teacher-workspace"><header><Award size={26} /><div><h1>{copy.title}</h1><p>{copy.intro}</p></div></header><section><h2>{copy.queue}<span>{rows.length}</span></h2>{loading ? <p>…</p> : !rows.length ? <p className="certificate-review-empty">{message || copy.empty}</p> : <div className="certificate-review-list">{rows.map((row) => { const busy = busyId === row.id; return <article key={row.id} aria-busy={busy}><div><strong>{row.knowledge_products?.title_zh || row.knowledge_products?.title_my || row.knowledge_products?.title_en}</strong><p>{row.user_id}</p><small>{new Date(row.created_at).toLocaleString(locale)}</small><details><summary>{copy.evidence}</summary><pre>{JSON.stringify(row.eligibility_snapshot, null, 2)}</pre></details></div><div><textarea disabled={busy} value={notes[row.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))} placeholder={copy.note} /><button type="button" disabled={busy} onClick={() => void review(row.id, "approved")}>{busy ? <LoaderCircle className="button-spinner" size={15} /> : <CheckCircle2 size={15} />}{busy ? copy.processing : copy.approve}</button><button type="button" className="reject" disabled={busy} onClick={() => void review(row.id, "rejected")}><XCircle size={15} />{copy.reject}</button></div></article>; })}</div>}{message && rows.length ? <p className="verification-message" role="status" aria-live="polite">{message}</p> : null}</section></main>;
}
