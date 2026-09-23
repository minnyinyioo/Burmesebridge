"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, UserCog } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

type Staff = { email: string; access_role: "admin" | "teacher"; enabled: boolean; note: string | null; created_at: string; profile_id: string | null; display_name: string | null; verified: boolean | null; badge: string | null; course_count: number };

const copies = {
  zh: { eyebrow: "后台安全", title: "管理人员与邮箱白名单", intro: "只有这里启用的邮箱，并同时满足账号角色、身份认证、课程分配和 MFA，才能进入对应后台。", email: "注册邮箱", emailHint: "输入已注册的账号邮箱", role: "后台类型", note: "备注（可选）", noteHint: "例如：负责的课程或工作范围", teacher: "教师", admin: "管理员", enable: "绑定并启用", saving: "保存中…", saved: "人员权限已保存", updated: "权限状态已更新", disable: "停用后台权限", reenable: "重新启用", courses: "负责课程", verified: "已认证", unverified: "未认证", noBadge: "无徽章", empty: "尚未添加后台人员。" },
  my: { eyebrow: "Backoffice လုံခြုံရေး", title: "ဝန်ထမ်းနှင့် အီးမေးလ် Allowlist", intro: "ဤနေရာတွင် ဖွင့်ထားသော အီးမေးလ်သည် မှန်ကန်သော အကောင့်အခန်းကဏ္ဍ၊ အတည်ပြုခြင်း၊ သင်တန်းတာဝန်နှင့် MFA တို့ကို ပြည့်မီမှ သက်ဆိုင်ရာ Backoffice သို့ ဝင်နိုင်သည်။", email: "မှတ်ပုံတင်ထားသော အီးမေးလ်", emailHint: "မှတ်ပုံတင်ထားသော အကောင့်အီးမေးလ်ကို ထည့်ပါ", role: "Backoffice အခန်းကဏ္ဍ", note: "မှတ်ချက် (မဖြစ်မနေမဟုတ်)", noteHint: "ဥပမာ — တာဝန်ယူသော သင်တန်း သို့မဟုတ် အလုပ်နယ်ပယ်", teacher: "ဆရာ", admin: "အက်မင်", enable: "ချိတ်ဆက်ပြီး ဖွင့်မည်", saving: "သိမ်းဆည်းနေသည်…", saved: "ဝန်ထမ်းအသုံးပြုခွင့်ကို သိမ်းဆည်းပြီးပါပြီ", updated: "အသုံးပြုခွင့်အခြေအနေကို ပြင်ဆင်ပြီးပါပြီ", disable: "Backoffice အသုံးပြုခွင့်ပိတ်မည်", reenable: "ပြန်ဖွင့်မည်", courses: "တာဝန်ယူသော သင်တန်း", verified: "အတည်ပြုပြီး", unverified: "အတည်မပြုရသေး", noBadge: "徽章 မရှိ", empty: "Backoffice ဝန်ထမ်း မထည့်ရသေးပါ။" },
  en: { eyebrow: "Backoffice security", title: "Staff and email allowlist", intro: "Portal access requires an enabled email here plus the correct account role, verification, assignment and MFA.", email: "Registered email", emailHint: "Enter the email of a registered account", role: "Portal role", note: "Note (optional)", noteHint: "For example, assigned courses or responsibilities", teacher: "Teacher", admin: "Admin", enable: "Allowlist and enable", saving: "Saving…", saved: "Staff access saved", updated: "Access status updated", disable: "Disable", reenable: "Enable again", courses: "courses", verified: "verified", unverified: "unverified", noBadge: "no badge", empty: "No backoffice staff have been added yet." },
} as const;

export default function Page() { return <AdminGuard><StaffAccess /></AdminGuard> }

function StaffAccess() {
  const locale = String(useParams().locale || "en") as keyof typeof copies;
  const copy = copies[locale] || copies.en;
  const [rows, setRows] = useState<Staff[]>([]), [email, setEmail] = useState(""), [role, setRole] = useState<"admin" | "teacher">("teacher"), [note, setNote] = useState(""), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const { data, error } = await supabase.rpc("list_backoffice_staff_access"); if (error) setMessage(error.message); else setRows((data || []) as Staff[]) }, []);
  useEffect(() => { /* eslint-disable-next-line react-hooks/set-state-in-effect */ void load() }, [load]);
  async function save(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); const { error } = await supabase.rpc("set_backoffice_staff_access", { p_email: email.trim(), p_access_role: role, p_enabled: true, p_note: note.trim() || null }); setBusy(false); setMessage(error ? error.message : copy.saved); if (!error) { setEmail(""); setNote(""); await load() } }
  async function toggle(staff: Staff) { const { error } = await supabase.rpc("set_backoffice_staff_access", { p_email: staff.email, p_access_role: staff.access_role, p_enabled: !staff.enabled, p_note: staff.note }); setMessage(error ? error.message : copy.updated); if (!error) await load() }
  return <div className="adminShell"><AdminSidebar /><main className="adminContent">
    <header className="admin-page-head"><div><span className="admin-eyebrow"><ShieldCheck size={17} />{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div></header>
    <form className="feedCard staff-access-form" onSubmit={save}>
      <label><span>{copy.email}</span><input type="email" autoComplete="email" required value={email} placeholder={copy.emailHint} onChange={(event) => setEmail(event.target.value)} /></label>
      <label><span>{copy.role}</span><select value={role} onChange={(event) => setRole(event.target.value as "admin" | "teacher")}><option value="teacher">{copy.teacher}</option><option value="admin">{copy.admin}</option></select></label>
      <label className="staff-access-note"><span>{copy.note}</span><input value={note} placeholder={copy.noteHint} onChange={(event) => setNote(event.target.value)} /></label>
      <button type="submit" disabled={busy || !email.trim()}><UserCog size={16} />{busy ? copy.saving : copy.enable}</button>
    </form>
    <div className="certificate-issued-list staff-access-list">{!rows.length ? <p className="staff-access-empty">{copy.empty}</p> : rows.map((staff) => <article key={staff.email}><div><strong>{staff.display_name || staff.email}</strong><p>{staff.email} · {staff.access_role === "admin" ? copy.admin : copy.teacher} · {copy.courses} {staff.course_count}</p><small>{staff.verified ? copy.verified : copy.unverified} · {staff.badge || copy.noBadge}</small></div><button type="button" className={staff.enabled ? "reject" : ""} onClick={() => void toggle(staff)}>{staff.enabled ? copy.disable : copy.reenable}</button></article>)}</div>
    {message ? <p className="verification-message" role="status">{message}</p> : null}
  </main></div>
}
