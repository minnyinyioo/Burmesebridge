"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard, ShieldCheck, XCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";

type Verification = { valid: boolean; status: "active" | "revoked" | "expired"; card_type?: "student" | "teacher"; card_no?: string; verification_code?: string; holder_name?: string; issued_at?: string; expires_at?: string; issuer?: string; government_credential?: boolean };

export default function EducationIdVerificationPage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const code = decodeURIComponent(String(params.code || "")).toUpperCase();
  const [data, setData] = useState<Verification | null>(null);
  const [loaded, setLoaded] = useState(false);
  const copy = locale === "zh"
    ? { title: "教育证件查验", valid: "有效的 BurmeseBridge 平台证件", invalid: "没有找到此证件", revoked: "此证件已被撤销", expired: "此证件已过期", student: "学生证", teacher: "教师证", holder: "持有人", number: "证件编号", anti: "防伪码", issued: "签发日期", expires: "有效期至", issuer: "签发方", again: "查询其他证件", home: "返回首页", notice: "该证件仅证明持有人在 BurmeseBridge 私立学习平台内的学习或教学身份；不是政府身份证件、教师资格证、学历或政府教育机构认证。" }
    : locale === "my"
      ? { title: "ပညာရေးကတ် စစ်ဆေးခြင်း", valid: "အသုံးပြုနိုင်သော BurmeseBridge platform ကတ်", invalid: "ဤကတ်ကို မတွေ့ပါ", revoked: "ဤကတ်ကို ရုပ်သိမ်းထားသည်", expired: "ဤကတ် သက်တမ်းကုန်ပြီ", student: "ကျောင်းသားကတ်", teacher: "ဆရာကတ်", holder: "ကတ်ကိုင်ဆောင်သူ", number: "ကတ်အမှတ်", anti: "အတုအပကာကွယ်ရေးကုဒ်", issued: "ထုတ်ပေးသည့်ရက်", expires: "သက်တမ်းကုန်ရက်", issuer: "ထုတ်ပေးသူ", again: "အခြားကတ် စစ်ဆေးရန်", home: "ပင်မစာမျက်နှာ", notice: "ဤကတ်သည် BurmeseBridge ပုဂ္ဂလိကသင်ယူရေးပလက်ဖောင်းအတွင်း သင်ယူသူ/သင်ကြားသူအဖြစ်သာ သက်သေပြသည်။ အစိုးရ ID၊ ဆရာလိုင်စင်၊ ဘွဲ့ သို့မဟုတ် အစိုးရပညာရေးအသိအမှတ်ပြုမှု မဟုတ်ပါ။" }
      : { title: "Education ID verification", valid: "Valid BurmeseBridge platform ID", invalid: "ID not found", revoked: "This ID has been revoked", expired: "This ID has expired", student: "Student ID", teacher: "Teacher ID", holder: "Holder", number: "Card number", anti: "Authenticity code", issued: "Issued", expires: "Valid until", issuer: "Issuer", again: "Check another ID", home: "Back to home", notice: "This card only confirms learning or teaching status within the private BurmeseBridge learning platform. It is not a government ID, teaching licence, academic qualification, or government education accreditation." };
  const teacherNotice = locale === "zh"
    ? "教师证仅证明持有人已通过 BurmeseBridge 的教师身份审核并在本站担任经认证的教师，不是教师资格证，也不代表任何政府教育机构。"
    : locale === "my"
      ? "ဆရာကတ်သည် BurmeseBridge တွင် စစ်ဆေးအတည်ပြုထားသော ဆရာအဖြစ်သာ သက်သေပြသည်။ ဆရာလိုင်စင် သို့မဟုတ် အစိုးရပညာရေးအဖွဲ့၏ အရည်အချင်းအထောက်အထား မဟုတ်ပါ။"
      : "This teacher ID only confirms that the holder has passed BurmeseBridge's internal teacher verification and is an instructor certified by this platform. It is not a teaching licence or a credential from any government education institution.";

  useEffect(() => {
    let active = true;
    void supabase.rpc("verify_education_id_card", { p_code: code }).then(({ data: result }) => {
      if (active) { setData(result as Verification | null); setLoaded(true); }
    });
    return () => { active = false; };
  }, [code]);

  const invalidTitle = data?.status === "revoked" ? copy.revoked : data?.status === "expired" ? copy.expired : copy.invalid;
  return <main className="certificate-verify-page"><BrandLogo size={46} /><header><CreditCard size={28} /><h1>{copy.title}</h1></header>
    {!loaded ? <div className="certificate-verify-card">…</div> : data?.valid ? <div className="certificate-verify-card valid"><ShieldCheck size={44} /><h2>{copy.valid}</h2><strong className="education-card-type">{data.card_type ? copy[data.card_type] : ""}</strong>
      <dl><div><dt>{copy.holder}</dt><dd>{data.holder_name}</dd></div><div><dt>{copy.number}</dt><dd>{data.card_no}</dd></div><div><dt>{copy.anti}</dt><dd>{data.verification_code}</dd></div><div><dt>{copy.issued}</dt><dd>{data.issued_at ? new Date(data.issued_at).toLocaleDateString(locale) : "—"}</dd></div><div><dt>{copy.expires}</dt><dd>{data.expires_at ? new Date(data.expires_at).toLocaleDateString(locale) : "—"}</dd></div><div><dt>{copy.issuer}</dt><dd>{data.issuer}</dd></div></dl>
      <p className="education-legal-notice">{data.card_type === "teacher" ? teacherNotice : copy.notice}</p>
    </div> : <div className="certificate-verify-card invalid"><XCircle size={44} /><h2>{invalidTitle}</h2>{data?.card_no ? <p>{copy.number}: {data.card_no}</p> : null}</div>}
    <div className="certificate-verify-links"><Link href={`/${locale}/education-id`}>{copy.again}</Link><Link href={`/${locale}`}>{copy.home}</Link></div>
  </main>;
}
