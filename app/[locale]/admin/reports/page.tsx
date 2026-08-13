"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Flag, XCircle } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

type Report = { id: number; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string; created_at: string };

export default function ReportsPage() { return <AdminGuard><Reports /></AdminGuard>; }
function Reports() {
  const locale = String(useParams().locale || "my");
  const [items, setItems] = useState<Report[]>([]); const [filter, setFilter] = useState("pending"); const [busy, setBusy] = useState<number | null>(null);
  const copy = locale === "zh" ? { title: "举报审核", empty: "当前没有举报", pending: "待审核", reviewing: "处理中", resolved: "已处理", rejected: "不成立", resolve: "确认处理", reject: "驳回举报", view: "查看内容", note: "请输入处理说明（可选）" } : locale === "my" ? { title: "တိုင်ကြားချက် စစ်ဆေးရန်", empty: "တိုင်ကြားချက် မရှိပါ", pending: "စောင့်ဆိုင်း", reviewing: "စစ်ဆေးနေ", resolved: "ဖြေရှင်းပြီး", rejected: "ပယ်ချ", resolve: "ဖြေရှင်းမည်", reject: "ပယ်ချမည်", view: "ကြည့်ရန်", note: "မှတ်ချက် (မဖြစ်မနေမဟုတ်)" } : { title: "Report review", empty: "No reports found", pending: "Pending", reviewing: "Reviewing", resolved: "Resolved", rejected: "Rejected", resolve: "Resolve", reject: "Reject", view: "View content", note: "Resolution note (optional)" };
  async function load() { const { data } = await supabase.from("content_reports").select("id,reporter_id,target_type,target_id,reason,details,status,created_at").eq("status", filter).order("created_at", { ascending: false }); setItems((data || []) as Report[]); }
  useEffect(() => { void load(); }, [filter]);
  async function review(item: Report, status: "resolved" | "rejected") { const note = prompt(copy.note) || null; setBusy(item.id); const { data: { user } } = await supabase.auth.getUser(); const { error } = await supabase.from("content_reports").update({ status, reviewer_id: user?.id, resolution_note: note, reviewed_at: new Date().toISOString() }).eq("id", item.id); if (error) alert(error.message); else await load(); setBusy(null); }
  return <div className="adminShell"><AdminSidebar /><main className="adminContent"><div className="admin-report-head"><div><span><Flag size={18} /></span><h1>{copy.title}</h1></div><div>{(["pending","reviewing","resolved","rejected"] as const).map((status) => <button className={filter === status ? "active" : ""} onClick={() => setFilter(status)} key={status}>{copy[status]}</button>)}</div></div>
    <div className="admin-report-list">{items.length === 0 && <div className="feedCard admin-report-empty">{copy.empty}</div>}{items.map((item) => <article className="feedCard admin-report-card" key={item.id}><div className="admin-report-meta"><strong>{item.reason}</strong><time>{new Date(item.created_at).toLocaleString()}</time></div><p>{item.details || "—"}</p><div className="admin-report-target"><span>{item.target_type} #{item.target_id}</span>{item.target_type === "post" && <a href={`/${locale}/forum#post-${item.target_id}`} target="_blank">{copy.view}<ExternalLink size={14} /></a>}</div>{item.status === "pending" && <div className="admin-report-actions"><button disabled={busy === item.id} onClick={() => review(item,"rejected")}><XCircle size={16} />{copy.reject}</button><button className="primary" disabled={busy === item.id} onClick={() => review(item,"resolved")}><CheckCircle2 size={16} />{copy.resolve}</button></div>}</article>)}</div>
  </main></div>;
}
