"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bug, ImagePlus, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FeedbackPage() {
  const locale = String(useParams().locale || "en");
  const router = useRouter();
  const [category, setCategory] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [busy, setBusy] = useState(false);
  const c = locale === "zh" ? {
    head: "反馈与报告 BUG", intro: "请描述遇到的问题、建议或内容错误，我们会在后台跟进。提交反馈需要先登录，以防止垃圾信息。", category: "反馈类型", title: "问题标题", desc: "详细描述（操作步骤、预期结果和实际结果）", contact: "联系方式（可选）", image: "上传问题截图（可选）", imageHint: "JPG、PNG 或 WebP，最大 5MB", removeImage: "移除图片", imageInvalid: "请选择 JPG、PNG 或 WebP 图片，且大小不能超过 5MB。", send: "提交反馈", sending: "提交中…", invalid: "问题标题至少需要 3 个字符，详细描述至少需要 10 个字符。", ok: "反馈已成功提交", login: "请先登录后提交反馈。", failed: "提交失败，请稍后重试。",
  } : locale === "my" ? {
    head: "အကြံပြုချက်နှင့် BUG တိုင်ကြားရန်", intro: "တွေ့ရှိသည့် ပြဿနာ သို့မဟုတ် အကြံပြုချက်ကို ရေးပါ။ Spam ကာကွယ်ရန် အရင်ဝင်ရောက်ပါ။", category: "အမျိုးအစား", title: "ခေါင်းစဉ်", desc: "အသေးစိတ်ဖော်ပြချက်", contact: "ဆက်သွယ်ရန် (မဖြစ်မနေမဟုတ်)", image: "ပြဿနာ Screenshot တင်ရန် (မဖြစ်မနေမဟုတ်)", imageHint: "JPG၊ PNG သို့မဟုတ် WebP၊ အများဆုံး 5MB", removeImage: "ပုံကိုဖယ်ရှားရန်", imageInvalid: "5MB အောက် JPG၊ PNG သို့မဟုတ် WebP ပုံကို ရွေးပါ။", send: "ပို့မည်", sending: "ပို့နေသည်…", invalid: "ခေါင်းစဉ် အနည်းဆုံး ၃ လုံးနှင့် အသေးစိတ် အနည်းဆုံး ၁၀ လုံး ရေးပါ။", ok: "အကြံပြုချက် ပို့ပြီးပါပြီ", login: "အကြံပြုချက်ပို့ရန် အရင်ဝင်ရောက်ပါ။", failed: "ပို့၍မရပါ။ ခဏအကြာ ပြန်ကြိုးစားပါ။",
  } : {
    head: "Feedback & bug report", intro: "Tell us about a bug, suggestion, or content issue. Sign-in is required to prevent spam.", category: "Feedback type", title: "Issue title", desc: "Details, steps, expected and actual result", contact: "Contact (optional)", image: "Upload a screenshot (optional)", imageHint: "JPG, PNG or WebP, up to 5MB", removeImage: "Remove image", imageInvalid: "Choose a JPG, PNG or WebP image no larger than 5MB.", send: "Submit feedback", sending: "Submitting…", invalid: "The title needs at least 3 characters and the description at least 10.", ok: "Feedback submitted successfully", login: "Please sign in before submitting feedback.", failed: "Submission failed. Please try again later.",
  };

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(""); setImage(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      clearImage(); setMessageType("error"); setMessage(c.imageInvalid); return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file); setPreview(URL.createObjectURL(file)); setMessage("");
  }

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
    let attachmentPath: string | null = null;
    if (image) {
      const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
      attachmentPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("feedback-attachments").upload(attachmentPath, image, { contentType: image.type, upsert: false });
      if (uploadError) {
        setBusy(false); setMessageType("error"); setMessage(c.failed); return;
      }
    }
    const { data, error } = await supabase.from("feedback_reports").insert({ user_id: user.id, category, title: cleanTitle, description: cleanDescription, contact: contact.trim() || null, page_url: window.location.href.slice(0, 1000), attachment_path: attachmentPath, attachment_mime: image?.type || null, attachment_size: image?.size || null, status: "open" }).select("id").single();
    setBusy(false);
    if (error) {
      if (attachmentPath) await supabase.storage.from("feedback-attachments").remove([attachmentPath]);
      console.error("Feedback submission failed", error);
      setMessageType("error"); setMessage(`${c.failed} (${error.code || "unknown"})`); return;
    }
    setTitle(""); setDescription(""); setContact(""); clearImage(); setMessageType("success"); setMessage(`${c.ok} · #${data.id}`);
  }

  return <main className="feedback-page"><header><Bug aria-hidden="true" /><div><h1>{c.head}</h1><p>{c.intro}</p></div></header>
    <form className="feedCard feedback-form" onSubmit={submit}>
      <label><span>{c.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="bug">BUG</option><option value="suggestion">Suggestion</option><option value="content">Content</option><option value="other">Other</option></select></label>
      <label><span>{c.title}</span><input required minLength={3} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label><span>{c.desc}</span><textarea required minLength={10} maxLength={5000} rows={8} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <label><span>{c.contact}</span><input maxLength={200} value={contact} onChange={(event) => setContact(event.target.value)} /></label>
      <div className="feedback-upload-field"><span>{c.image}</span><label className="feedback-upload"><ImagePlus aria-hidden="true" size={22} /><strong>{c.image}</strong><small>{c.imageHint}</small><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /></label>{preview ? <div className="feedback-image-preview"><img src={preview} alt="" /><button type="button" onClick={clearImage} aria-label={c.removeImage}><X aria-hidden="true" size={16} />{c.removeImage}</button></div> : null}</div>
      <button type="submit" disabled={busy}><Send aria-hidden="true" size={17} />{busy ? c.sending : c.send}</button>
      {message ? <p className={`feedback-message ${messageType}`} role={messageType === "error" ? "alert" : "status"} aria-live="polite">{message}</p> : null}
    </form>
  </main>;
}
