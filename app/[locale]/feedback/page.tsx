"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bug, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FeedbackPage() {
  const locale = String(useParams().locale || "en");
  const router = useRouter();
  const [category, setCategory] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [busy, setBusy] = useState(false);
  const c = locale === "zh" ? {
    head: "反馈与报告 BUG", intro: "请描述遇到的问题、建议或内容错误，我们会在后台跟进。提交反馈需要先登录，以防止垃圾信息。", category: "反馈类型", title: "问题标题", desc: "详细描述（操作步骤、预期结果和实际结果）", contact: "联系方式（可选）", send: "提交反馈", sending: "提交中…", invalid: "问题标题至少需要 3 个字符，详细描述至少需要 10 个字符。", ok: "反馈已成功提交", login: "请先登录后提交反馈。", failed: "提交失败，请稍后重试。",
  } : locale === "my" ? {
    head: "အကြံပြုချက်နှင့် BUG တိုင်ကြားရန်", intro: "တွေ့ရှိသည့် ပြဿနာ သို့မဟုတ် အကြံပြုချက်ကို ရေးပါ။ Spam ကာကွယ်ရန် အရင်ဝင်ရောက်ပါ။", category: "အမျိုးအစား", title: "ခေါင်းစဉ်", desc: "အသေးစိတ်ဖော်ပြချက်", contact: "ဆက်သွယ်ရန် (မဖြစ်မနေမဟုတ်)", send: "ပို့မည်", sending: "ပို့နေသည်…", invalid: "ခေါင်းစဉ် အနည်းဆုံး ၃ လုံးနှင့် အသေးစိတ် အနည်းဆုံး ၁၀ လုံး ရေးပါ။", ok: "အကြံပြုချက် ပို့ပြီးပါပြီ", login: "အကြံပြုချက်ပို့ရန် အရင်ဝင်ရောက်ပါ။", failed: "ပို့၍မရပါ။ ခဏအကြာ ပြန်ကြိုးစားပါ။",
  } : {
    head: "Feedback & bug report", intro: "Tell us about a bug, suggestion, or content issue. Sign-in is required to prevent spam.", category: "Feedback type", title: "Issue title", desc: "Details, steps, expected and actual result", contact: "Contact (optional)", send: "Submit feedback", sending: "Submitting…", invalid: "The title needs at least 3 characters and the description at least 10.", ok: "Feedback submitted successfully", login: "Please sign in before submitting feedback.", failed: "Submission failed. Please try again later.",
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 3 || cleanDescription.length < 10) {
      setMessageType("error"); setMessage(c.invalid); return;
    }
    setBusy(true); setMessage("");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setBusy(false); setMessageType("error"); setMessage(c.login);
      router.push(`/${locale}/login?next=${encodeURIComponent(`/${locale}/feedback`)}`);
      return;
    }
    const { data, error } = await supabase.from("feedback_reports").insert({ user_id: user.id, category, title: cleanTitle, description: cleanDescription, contact: contact.trim() || null, page_url: window.location.href.slice(0, 1000), status: "open" }).select("id").single();
    setBusy(false);
    if (error) {
      console.error("Feedback submission failed", error);
      setMessageType("error"); setMessage(`${c.failed} (${error.code || "unknown"})`); return;
    }
    setTitle(""); setDescription(""); setContact(""); setMessageType("success"); setMessage(`${c.ok} · #${data.id}`);
  }

  return <main className="feedback-page"><header><Bug aria-hidden="true" /><div><h1>{c.head}</h1><p>{c.intro}</p></div></header>
    <form className="feedCard feedback-form" onSubmit={submit}>
      <label><span>{c.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="bug">BUG</option><option value="suggestion">Suggestion</option><option value="content">Content</option><option value="other">Other</option></select></label>
      <label><span>{c.title}</span><input required minLength={3} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label><span>{c.desc}</span><textarea required minLength={10} maxLength={5000} rows={8} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <label><span>{c.contact}</span><input maxLength={200} value={contact} onChange={(event) => setContact(event.target.value)} /></label>
      <button type="submit" disabled={busy}><Send aria-hidden="true" size={17} />{busy ? c.sending : c.send}</button>
      {message ? <p className={`feedback-message ${messageType}`} role={messageType === "error" ? "alert" : "status"} aria-live="polite">{message}</p> : null}
    </form>
  </main>;
}
