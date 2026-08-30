"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, ExternalLink, LoaderCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = { id: number; user_id: string; student_name: string; answer_text: string | null; object_path: string | null; object_mime: string | null; submitted_at: string | null; max_score: number; assignment_title: string; course_title: string; product_id: number };

export default function TeacherAssignmentReview({ locale }: { locale: string }) {
  const copy = locale === "zh"
    ? { title: "待批改作业", empty: "目前没有待批改作业", student: "学生", course: "课程", answer: "文字答案", file: "查看附件", score: "分数", feedback: "教师评语", grade: "完成批改", back: "退回重交", required: "退回前必须填写原因", scoreRequired: "请先填写有效分数", scoreRange: "分数必须在 0 到最高分之间", saved: "批改结果已保存", processing: "处理中…", loadFailed: "作业列表加载失败，请刷新后重试" }
    : locale === "my"
      ? { title: "စစ်ဆေးရန် အိမ်စာ", empty: "စစ်ဆေးရန် အိမ်စာမရှိပါ", student: "ကျောင်းသား", course: "သင်တန်း", answer: "စာသားအဖြေ", file: "ဖိုင်ကြည့်ရန်", score: "ရမှတ်", feedback: "ဆရာမှတ်ချက်", grade: "စစ်ဆေးပြီး", back: "ပြန်လည်တင်ရန်", required: "ပြန်ပို့ရသည့်အကြောင်းရင်း ရေးပါ", scoreRequired: "မှန်ကန်သော ရမှတ်ကို ဦးစွာထည့်ပါ", scoreRange: "ရမှတ်သည် ၀ မှ အများဆုံးရမှတ်အတွင်း ဖြစ်ရမည်", saved: "စစ်ဆေးမှု သိမ်းပြီးပါပြီ", processing: "လုပ်ဆောင်နေသည်…", loadFailed: "အိမ်စာစာရင်း မတင်နိုင်ပါ။ ပြန်လည်စမ်းကြည့်ပါ" }
      : { title: "Assignments to grade", empty: "No assignments awaiting grading", student: "Learner", course: "Course", answer: "Written answer", file: "View attachment", score: "Score", feedback: "Instructor feedback", grade: "Save grade", back: "Return for resubmission", required: "Feedback is required before returning work", scoreRequired: "Enter a valid score before grading", scoreRange: "The score must be between 0 and the maximum score", saved: "Grade saved", processing: "Processing…", loadFailed: "Assignments could not be loaded. Refresh and try again" };
  const [rows, setRows] = useState<Row[]>([]);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_instructor_assignment_queue");
    if (error) setMessage(`${copy.loadFailed}: ${error.message}`);
    else setRows((data || []) as Row[]);
  }, [copy.loadFailed]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function open(path: string) {
    setMessage("");
    const { data, error } = await supabase.storage.from("assignment-submissions").createSignedUrl(path, 300);
    if (error) setMessage(error.message);
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  function finish(rowId: number) {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setScores((current) => { const next = { ...current }; delete next[rowId]; return next; });
    setNotes((current) => { const next = { ...current }; delete next[rowId]; return next; });
    setMessage(copy.saved);
  }
  async function grade(row: Row) {
    const rawScore = scores[row.id]?.trim();
    if (!rawScore) { setMessage(copy.scoreRequired); return; }
    const score = Number(rawScore);
    if (!Number.isFinite(score)) { setMessage(copy.scoreRequired); return; }
    if (score < 0 || score > (row.max_score || 100)) { setMessage(copy.scoreRange); return; }
    setBusyId(row.id); setMessage("");
    const { error } = await supabase.rpc("grade_knowledge_assignment_submission", { p_submission_id: row.id, p_score: score, p_feedback: notes[row.id]?.trim() || null });
    setBusyId(null);
    if (error) setMessage(error.message); else finish(row.id);
  }
  async function returnWork(row: Row) {
    const note = notes[row.id]?.trim();
    if (!note) { setMessage(copy.required); return; }
    setBusyId(row.id); setMessage("");
    const { error } = await supabase.rpc("return_assignment_submission", { p_submission_id: row.id, p_feedback: note });
    setBusyId(null);
    if (error) setMessage(error.message); else finish(row.id);
  }

  return <section className="teacher-assignment-review"><h2><ClipboardCheck size={20} />{copy.title}<span>{rows.length}</span></h2>{!rows.length ? <p className="certificate-review-empty">{copy.empty}</p> : <div>{rows.map((row) => { const busy = busyId === row.id; return <article key={row.id} aria-busy={busy}><header><div><strong>{row.assignment_title}</strong><span>{copy.course}: {row.course_title}</span></div><small>{copy.student}: {row.student_name} · {row.submitted_at ? new Date(row.submitted_at).toLocaleString(locale) : ""}</small></header>{row.answer_text ? <p><b>{copy.answer}:</b> {row.answer_text}</p> : null}{row.object_path ? <button type="button" className="attachment" disabled={busy} onClick={() => void open(row.object_path!)}><ExternalLink size={14} />{copy.file}</button> : null}<div><input type="number" min="0" max={row.max_score || 100} value={scores[row.id] || ""} onChange={(event) => setScores((current) => ({ ...current, [row.id]: event.target.value }))} placeholder={`${copy.score} / ${row.max_score || 100}`} disabled={busy} /><input value={notes[row.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))} placeholder={copy.feedback} disabled={busy} /><button type="button" disabled={busy} onClick={() => void grade(row)}>{busy ? <LoaderCircle className="button-spinner" size={15} /> : <CheckCircle2 size={15} />}{busy ? copy.processing : copy.grade}</button><button type="button" className="return" disabled={busy} onClick={() => void returnWork(row)}><RotateCcw size={15} />{copy.back}</button></div></article>; })}</div>}{message ? <p className="verification-message" role="status" aria-live="polite">{message}</p> : null}</section>;
}
