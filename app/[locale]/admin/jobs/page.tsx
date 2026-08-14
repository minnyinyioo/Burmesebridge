"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, ExternalLink, MapPin } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

type Verification = "unverified" | "reviewed" | "verified";
type Job = {
  id: number; title_my: string | null; title_zh: string | null; title_en: string | null;
  employer_name: string | null; employer_registration: string | null; job_location: string | null;
  salary_details: string | null; application_contact: string | null;
  recruitment_verification: Verification; recruitment_review_note: string | null;
  recruitment_reviewer_id: string | null; recruitment_reviewed_at: string | null; created_at: string;
};

export default function AdminJobsPage() { return <AdminGuard><JobReviews /></AdminGuard>; }

function JobReviews() {
  const locale = String(useParams().locale || "en");
  const [items, setItems] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Verification>("unverified");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [reviewers, setReviewers] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const c = locale === "zh" ? {
    title: "招聘审核中心", empty: "该状态暂无职位", employer: "雇主", registration: "登记/许可", location: "地点", salary: "工资", contact: "申请方式", note: "审核说明", noteHint: "记录核验过程、风险或退回原因（退回时必填）", review: "标记已审核", verify: "管理员核验", back: "退回未核验", open: "查看公开页面", reviewer: "最后审核", confirm: "确认修改该招聘信息的审核状态？", required: "退回未核验时必须填写原因。", saved: "审核状态已更新。", states: { unverified: "未核验", reviewed: "已审核", verified: "已验证" },
  } : locale === "my" ? {
    title: "အလုပ်ကြော်ငြာ စိစစ်ရေး", empty: "ဤအခြေအနေတွင် အလုပ်မရှိပါ", employer: "အလုပ်ရှင်", registration: "မှတ်ပုံတင်/လိုင်စင်", location: "နေရာ", salary: "လစာ", contact: "လျှောက်ထားရန်", note: "စိစစ်မှတ်ချက်", noteHint: "စိစစ်မှု၊ အန္တရာယ် သို့မဟုတ် ပြန်ပို့ရသည့်အကြောင်းရင်း", review: "စိစစ်ပြီး", verify: "Admin အတည်ပြု", back: "မစိစစ်ရသေးအဖြစ်", open: "အများမြင်စာမျက်နှာ", reviewer: "နောက်ဆုံးစိစစ်မှု", confirm: "စိစစ်မှုအခြေအနေ ပြောင်းရန် သေချာပါသလား။", required: "ပြန်ပို့သည့်အကြောင်းရင်း ရေးပါ။", saved: "စိစစ်မှုအခြေအနေ ပြင်ဆင်ပြီးပါပြီ။", states: { unverified: "မစိစစ်ရသေး", reviewed: "စိစစ်ပြီး", verified: "အတည်ပြုပြီး" },
  } : {
    title: "Job review center", empty: "No jobs with this status", employer: "Employer", registration: "Registration/licence", location: "Location", salary: "Salary", contact: "Apply", note: "Review note", noteHint: "Record checks, risks, or the return reason (required when returning)", review: "Mark reviewed", verify: "Admin verify", back: "Return to unverified", open: "Open public page", reviewer: "Last review", confirm: "Change this job's review status?", required: "A return reason is required.", saved: "Review status updated.", states: { unverified: "Unverified", reviewed: "Reviewed", verified: "Verified" },
  };

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("news").select("id,title_my,title_zh,title_en,employer_name,employer_registration,job_location,salary_details,application_contact,recruitment_verification,recruitment_review_note,recruitment_reviewer_id,recruitment_reviewed_at,created_at").eq("category", "jobs").eq("recruitment_verification", filter).order("created_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    const jobs = (data || []) as Job[];
    setItems(jobs);
    setNotes(Object.fromEntries(jobs.map((job) => [job.id, job.recruitment_review_note || ""])));
    const ids = [...new Set(jobs.map((job) => job.recruitment_reviewer_id).filter(Boolean))] as string[];
    if (!ids.length) { setReviewers({}); return; }
    const { data: profiles } = await supabase.from("profiles").select("id,display_name").in("id", ids);
    setReviewers(Object.fromEntries((profiles || []).map((profile) => [profile.id, profile.display_name || profile.id])));
  }, [filter]);

  useEffect(() => {
    void load();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      setIsAdmin(profile?.role === "admin");
    });
  }, [load]);

  async function review(job: Job, value: Verification) {
    const note = (notes[job.id] || "").trim();
    if (value === "unverified" && !note) { setMessage(c.required); return; }
    if (!window.confirm(c.confirm)) return;
    setBusyId(job.id); setMessage("");
    const { error } = await supabase.from("news").update({ recruitment_verification: value, recruitment_review_note: note || null }).eq("id", job.id).eq("category", "jobs");
    setBusyId(null);
    if (error) setMessage(error.message); else { setMessage(c.saved); await load(); }
  }

  const title = (job: Job) => locale === "zh" ? job.title_zh || job.title_my || job.title_en : locale === "en" ? job.title_en || job.title_my || job.title_zh : job.title_my || job.title_zh || job.title_en;

  return <div className="adminShell"><AdminSidebar /><main className="adminContent">
    <header className="admin-report-head"><div><BriefcaseBusiness /><h1>{c.title}</h1></div><div>{(["unverified", "reviewed", "verified"] as Verification[]).map((state) => <button type="button" className={filter === state ? "active" : ""} aria-pressed={filter === state} onClick={() => setFilter(state)} key={state}>{c.states[state]}</button>)}</div></header>
    {message && <p className="admin-access-message" role="status">{message}</p>}
    <div className="admin-job-list">{!items.length && <div className="feedCard">{c.empty}</div>}{items.map((job) => <article className="feedCard admin-job-card" key={job.id}>
      <header><div><span className={`job-verification is-${job.recruitment_verification}`}>{c.states[job.recruitment_verification]}</span><h2>{title(job)}</h2></div><time>{new Date(job.created_at).toLocaleDateString()}</time></header>
      <dl><div><dt>{c.employer}</dt><dd>{job.employer_name || "—"}</dd></div><div><dt>{c.registration}</dt><dd>{job.employer_registration || "—"}</dd></div><div><dt><MapPin size={13} />{c.location}</dt><dd>{job.job_location || "—"}</dd></div><div><dt>{c.salary}</dt><dd>{job.salary_details || "—"}</dd></div><div className="wide"><dt>{c.contact}</dt><dd>{job.application_contact || "—"}</dd></div></dl>
      <Link className="admin-job-open" href={`/${locale}/content/${job.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />{c.open}</Link>
      <label className="admin-job-note"><span>{c.note}</span><textarea maxLength={1500} value={notes[job.id] || ""} placeholder={c.noteHint} onChange={(event) => setNotes((current) => ({ ...current, [job.id]: event.target.value }))} /></label>
      {job.recruitment_reviewed_at && <p className="admin-job-reviewer">{c.reviewer}: {job.recruitment_reviewer_id ? reviewers[job.recruitment_reviewer_id] || job.recruitment_reviewer_id : "—"} · {new Date(job.recruitment_reviewed_at).toLocaleString()}</p>}
      <footer><button type="button" disabled={busyId === job.id} onClick={() => review(job, "unverified")}>{c.back}</button>{job.recruitment_verification === "unverified" && <button type="button" disabled={busyId === job.id} onClick={() => review(job, "reviewed")}>{c.review}</button>}{isAdmin && job.recruitment_verification !== "verified" && <button type="button" className="primary" disabled={busyId === job.id} onClick={() => review(job, "verified")}><BadgeCheck size={16} />{c.verify}</button>}</footer>
    </article>)}</div>
  </main></div>;
}
