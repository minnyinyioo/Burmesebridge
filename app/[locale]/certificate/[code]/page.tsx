"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Award, CreditCard, FileText, ShieldCheck, XCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

type CourseVerification = { valid: boolean; status: "active" | "revoked"; certificate_no?: string; authenticity_code?: string; recipient_name?: string; course_title?: string; issued_at?: string };
type EducationVerification = { valid: boolean; status: "active" | "revoked" | "expired"; card_type?: "student" | "teacher"; card_no?: string; verification_code?: string; holder_name?: string; issued_at?: string };
type HskResult = { report_code: string; display_name: string | null; estimated_level: number | null; cefr_level: string | null; score: number; correct_answers: number; total_questions: number; created_at: string };
type UnifiedVerification = { kind: "course"; data: CourseVerification } | { kind: "education"; data: EducationVerification } | { kind: "hsk"; data: HskResult } | { kind: "none" };

export default function CertificateVerificationPage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const code = decodeURIComponent(String(params.code || "")).trim().toUpperCase();
  const [result, setResult] = useState<UnifiedVerification | null>(null);
  const [loaded, setLoaded] = useState(false);
  const copy = locale === "zh"
    ? { title: "统一查证", validCourse: "有效课程证书", validEducation: "有效平台证件", validHsk: "有效 HSK 测试报告", invalid: "没有找到此编号", revoked: "此记录已被撤销", expired: "此证件已过期", recipient: "获得者", holder: "持有人", course: "课程", issued: "签发日期", generated: "生成日期", number: "证书编号", reportNo: "报告编号", cardNo: "证件编号", authenticity: "防伪码", score: "得分", level: "建议级别", student: "学生证", teacher: "教师证", again: "查询其他编号", home: "返回首页", notice: "学生证、教师证和平台证书仅证明 BurmeseBridge 私立学习平台内的学习、教学或审核状态；不是政府证件、教师资格证、学历或政府教育机构认证。" }
    : locale === "my"
      ? { title: "စုစည်းစစ်ဆေးရန်", validCourse: "တရားဝင်သင်တန်းလက်မှတ်", validEducation: "အသုံးပြုနိုင်သော platform ကတ်", validHsk: "တရားဝင် HSK စစ်ဆေးမှု Report", invalid: "ဤအမှတ်ကို မတွေ့ပါ", revoked: "ဤမှတ်တမ်းကို ရုပ်သိမ်းထားသည်", expired: "ဤကတ် သက်တမ်းကုန်ပြီ", recipient: "လက်ခံသူ", holder: "ကတ်ကိုင်ဆောင်သူ", course: "သင်တန်း", issued: "ထုတ်ပေးသည့်ရက်", generated: "ထုတ်လုပ်သည့်ရက်", number: "လက်မှတ်အမှတ်", reportNo: "Report အမှတ်", cardNo: "ကတ်အမှတ်", authenticity: "အတုအပကာကွယ်ရေးကုဒ်", score: "ရမှတ်", level: "အကြံပြုအဆင့်", student: "ကျောင်းသားကတ်", teacher: "ဆရာကတ်", again: "အခြားအမှတ် စစ်ဆေးရန်", home: "ပင်မစာမျက်နှာ", notice: "ကျောင်းသားကတ်၊ ဆရာကတ်နှင့် platform လက်မှတ်များသည် BurmeseBridge ပုဂ္ဂလိကသင်ယူရေးပလက်ဖောင်းအတွင်း သင်ယူမှု၊ သင်ကြားမှု သို့မဟုတ် စစ်ဆေးမှုအခြေအနေကိုသာ သက်သေပြသည်။ အစိုးရ ID၊ ဆရာလိုင်စင်၊ ဘွဲ့ သို့မဟုတ် အစိုးရပညာရေးအသိအမှတ်ပြုမှု မဟုတ်ပါ။" }
      : { title: "Unified verification", validCourse: "Valid course certificate", validEducation: "Valid platform ID", validHsk: "Valid HSK assessment report", invalid: "No record found for this code", revoked: "This record has been revoked", expired: "This ID has expired", recipient: "Recipient", holder: "Holder", course: "Course", issued: "Issued", generated: "Generated", number: "Certificate number", reportNo: "Report ID", cardNo: "Card number", authenticity: "Authenticity code", score: "Score", level: "Recommended level", student: "Student ID", teacher: "Teacher ID", again: "Check another code", home: "Back to home", notice: "Student IDs, teacher IDs, and platform certificates only confirm learning, teaching, or review status within the private BurmeseBridge learning platform. They are not government IDs, teaching licences, academic qualifications, or government education accreditation." };

  useEffect(() => {
    let active = true;
    setLoaded(false);
    void Promise.all([
      supabase.from("hsk_public_results").select("report_code,display_name,estimated_level,cefr_level,score,correct_answers,total_questions,created_at").eq("report_code", code).maybeSingle(),
      supabase.rpc("verify_education_id_card", { p_code: code }),
      supabase.rpc("verify_knowledge_certificate", { p_certificate_no: code }),
    ]).then(([hsk, education, course]) => {
      if (!active) return;
      const hskData = hsk.data as HskResult | null;
      const educationData = education.data as EducationVerification | null;
      const courseData = course.data as CourseVerification | null;
      if (hskData) setResult({ kind: "hsk", data: hskData });
      else if (educationData?.valid || educationData?.status === "revoked" || educationData?.status === "expired") setResult({ kind: "education", data: educationData });
      else if (courseData?.valid || courseData?.status === "revoked") setResult({ kind: "course", data: courseData });
      else setResult({ kind: "none" });
      setLoaded(true);
    });
    return () => { active = false; };
  }, [code]);

  const invalidTitle = result?.kind === "education" && result.data.status === "expired" ? copy.expired : (result?.kind === "education" || result?.kind === "course") && result.data.status === "revoked" ? copy.revoked : copy.invalid;

  return <main className="certificate-verify-page"><BrandLogo size={46} /><header><ShieldCheck size={28} /><h1>{copy.title}</h1></header>
    {!loaded ? <div className="certificate-verify-card">…</div> : result?.kind === "hsk" ? <div className="certificate-verify-card valid"><FileText size={44} /><h2>{copy.validHsk}</h2><dl><div><dt>{copy.recipient}</dt><dd>{result.data.display_name || "—"}</dd></div><div><dt>{copy.reportNo}</dt><dd>{result.data.report_code}</dd></div><div><dt>{copy.level}</dt><dd>{result.data.estimated_level ? `HSK ${result.data.estimated_level}` : "Pre-HSK"} · {result.data.cefr_level || "—"}</dd></div><div><dt>{copy.score}</dt><dd>{result.data.score}% · {result.data.correct_answers}/{result.data.total_questions}</dd></div><div><dt>{copy.generated}</dt><dd>{new Date(result.data.created_at).toLocaleString(locale)}</dd></div></dl><p className="education-legal-notice">{copy.notice}</p></div>
      : result?.kind === "education" && result.data.valid ? <div className="certificate-verify-card valid"><CreditCard size={44} /><h2>{copy.validEducation}</h2><strong className="education-card-type">{result.data.card_type ? copy[result.data.card_type] : ""}</strong><dl><div><dt>{copy.holder}</dt><dd>{result.data.holder_name}</dd></div><div><dt>{copy.cardNo}</dt><dd>{result.data.card_no}</dd></div><div><dt>{copy.authenticity}</dt><dd>{result.data.verification_code}</dd></div><div><dt>{copy.issued}</dt><dd>{result.data.issued_at ? new Date(result.data.issued_at).toLocaleDateString(locale) : "—"}</dd></div></dl><p className="education-legal-notice">{copy.notice}</p></div>
        : result?.kind === "course" && result.data.valid ? <div className="certificate-verify-card valid"><Award size={44} /><h2>{copy.validCourse}</h2><dl><div><dt>{copy.recipient}</dt><dd>{result.data.recipient_name}</dd></div><div><dt>{copy.course}</dt><dd>{result.data.course_title}</dd></div><div><dt>{copy.issued}</dt><dd>{result.data.issued_at ? new Date(result.data.issued_at).toLocaleDateString(locale) : "—"}</dd></div><div><dt>{copy.number}</dt><dd>{result.data.certificate_no}</dd></div><div><dt>{copy.authenticity}</dt><dd>{result.data.authenticity_code}</dd></div></dl><p className="education-legal-notice">{copy.notice}</p></div>
          : <div className="certificate-verify-card invalid"><XCircle size={44} /><h2>{invalidTitle}</h2></div>}
    <div className="certificate-verify-links"><Link href={`/${locale}/certificate`}>{copy.again}</Link><Link href={`/${locale}`}>{copy.home}</Link></div>
  </main>;
}
