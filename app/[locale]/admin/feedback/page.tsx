"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImageIcon } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

type Row = { id: number; category: string; title: string; description: string; page_url: string | null; contact: string | null; attachment_path: string | null; status: string; created_at: string };

export default function Page() { return <AdminGuard><Body /></AdminGuard>; }

function Body() {
  const locale = String(useParams().locale || "en");
  const [items, setItems] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const attachmentLabel = locale === "zh" ? "查看截图" : locale === "my" ? "Screenshot ကြည့်ရန်" : "View screenshot";
  const load = useCallback(async () => {
    const { data } = await supabase.from("feedback_reports").select("id,category,title,description,page_url,contact,attachment_path,status,created_at").order("created_at", { ascending: false });
    setItems((data || []) as Row[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function status(id: number, value: string) { await supabase.from("feedback_reports").update({ status: value, updated_at: new Date().toISOString() }).eq("id", id); await load(); }
  async function openAttachment(path: string) {
    setMessage("");
    const { data, error } = await supabase.storage.from("feedback-attachments").createSignedUrl(path, 120);
    if (error || !data?.signedUrl) { setMessage(locale === "zh" ? "截图暂时无法打开。" : locale === "my" ? "Screenshot ကို ဖွင့်၍မရပါ။" : "The screenshot could not be opened."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  return <div className="adminShell"><AdminSidebar /><main className="adminContent"><h1>{locale === "zh" ? "反馈与 BUG" : locale === "my" ? "အကြံပြုချက်နှင့် BUG" : "Feedback & bugs"}</h1>{message ? <p className="feedback-message error" role="alert">{message}</p> : null}<div className="admin-report-list">{items.map((item) => <article className="feedCard admin-report-card" key={item.id}><strong>{item.category} · {item.title}</strong><p>{item.description}</p>{item.attachment_path ? <button className="admin-feedback-attachment" type="button" onClick={() => void openAttachment(item.attachment_path!)}><ImageIcon size={16} />{attachmentLabel}</button> : null}{item.page_url ? <a href={item.page_url} target="_blank" rel="noreferrer">{item.page_url}</a> : null}<small>{item.contact || "—"} · {new Date(item.created_at).toLocaleString()}</small><select value={item.status} onChange={(event) => void status(item.id, event.target.value)}><option>open</option><option>reviewing</option><option>resolved</option><option>closed</option></select></article>)}</div></main></div>;
}
