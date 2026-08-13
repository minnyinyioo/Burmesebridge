"use client";

import { FormEvent, useState } from "react";
import { Flag, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReportButton({ postId, locale }: { postId: number; locale: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const copy = locale === "zh" ? { report: "举报", title: "举报这条帖子", hint: "请选择最符合的原因。管理员会根据社区规则审核。", details: "补充说明（可选）", cancel: "取消", submit: "提交举报", sent: "举报已提交，感谢你的帮助。", login: "请先登录后举报。", duplicate: "你已经举报过这条帖子。", reasons: { spam: "垃圾广告", harassment: "骚扰或欺凌", hate: "仇恨内容", misinformation: "虚假信息", copyright: "侵犯版权", illegal: "违法内容", other: "其他" } } : locale === "my" ? { report: "တိုင်ကြားရန်", title: "ဤပို့စ်ကို တိုင်ကြားရန်", hint: "အသင့်တော်ဆုံး အကြောင်းရင်းကို ရွေးပါ။", details: "အပိုရှင်းလင်းချက် (မဖြစ်မနေမဟုတ်)", cancel: "ပယ်ဖျက်", submit: "ပို့မည်", sent: "တိုင်ကြားချက် ပို့ပြီးပါပြီ။", login: "အရင် အကောင့်ဝင်ပါ။", duplicate: "ဤပို့စ်ကို တိုင်ကြားပြီးပါပြီ။", reasons: { spam: "ကြော်ငြာအမှိုက်", harassment: "နှောင့်ယှက်မှု", hate: "မုန်းတီးစကား", misinformation: "သတင်းမှား", copyright: "မူပိုင်ခွင့်", illegal: "တရားမဝင်", other: "အခြား" } } : { report: "Report", title: "Report this post", hint: "Choose the reason that best describes the problem.", details: "Additional details (optional)", cancel: "Cancel", submit: "Submit report", sent: "Report submitted. Thank you.", login: "Please sign in to report.", duplicate: "You have already reported this post.", reasons: { spam: "Spam", harassment: "Harassment or bullying", hate: "Hateful content", misinformation: "Misinformation", copyright: "Copyright", illegal: "Illegal content", other: "Other" } };

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage(copy.login); setBusy(false); return; }
    const { error } = await supabase.from("content_reports").insert({ reporter_id: user.id, target_type: "post", target_id: String(postId), reason, details: details.trim() || null });
    if (error) setMessage(error.code === "23505" ? copy.duplicate : error.message);
    else { setMessage(copy.sent); setDetails(""); setTimeout(() => setOpen(false), 1200); }
    setBusy(false);
  }

  return <>
    <button className="forum-report-button" onClick={() => { setMessage(""); setOpen(true); }}><Flag size={16} />{copy.report}</button>
    {open && <div className="report-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="report-modal" role="dialog" aria-modal="true" aria-labelledby={`report-title-${postId}`}>
        <button className="report-modal-close" onClick={() => setOpen(false)} aria-label={copy.cancel}><X size={18} /></button>
        <span className="report-modal-icon"><Flag size={21} /></span><h2 id={`report-title-${postId}`}>{copy.title}</h2><p>{copy.hint}</p>
        <form onSubmit={submit}><div className="report-reasons">{Object.entries(copy.reasons).map(([value, label]) => <label className={reason === value ? "active" : ""} key={value}><input type="radio" name={`reason-${postId}`} value={value} checked={reason === value} onChange={() => setReason(value)} />{label}</label>)}</div>
          <textarea value={details} maxLength={1000} onChange={(event) => setDetails(event.target.value)} placeholder={copy.details} />
          {message && <div className="report-message">{message}</div>}
          <div className="report-modal-actions"><button type="button" onClick={() => setOpen(false)}>{copy.cancel}</button><button className="primary" disabled={busy}>{copy.submit}</button></div>
        </form>
      </div>
    </div>}
  </>;
}
