"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function CertificateLookupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = String(params.locale || "my");
  const [code, setCode] = useState("");
  const copy = locale === "zh"
    ? { title: "统一查证", intro: "输入 HSK 报告编号、课程证书编号、学生证/教师证编号或防伪码，一次查询真实状态。", label: "编号 / 防伪码", placeholder: "BB-HSK-… / BB-… / BBV-… / BBS-… / BBT-…", submit: "立即查证", note: "结果直接来自平台数据库；已撤销、过期或不存在的记录不会显示为有效。" }
    : locale === "my"
      ? { title: "စုစည်းစစ်ဆေးရန်", intro: "HSK report၊ သင်တန်းလက်မှတ်၊ ကျောင်းသား/ဆရာကတ် အမှတ် သို့မဟုတ် အတုအပကာကွယ်ရေးကုဒ်ကို တစ်နေရာတည်းတွင် စစ်ဆေးပါ။", label: "အမှတ် / အတုအပကာကွယ်ရေးကုဒ်", placeholder: "BB-HSK-… / BB-… / BBV-… / BBS-… / BBT-…", submit: "ယခု စစ်ဆေးရန်", note: "ရလဒ်ကို platform database မှ တိုက်ရိုက်စစ်ဆေးသည်။ ရုပ်သိမ်း၊ သက်တမ်းကုန် သို့မဟုတ် မရှိသော record ကို valid ဟု မပြပါ။" }
      : { title: "Unified verification", intro: "Enter an HSK report ID, course certificate number, student/teacher ID number, or authenticity code to verify it in one place.", label: "Number / authenticity code", placeholder: "BB-HSK-… / BB-… / BBV-… / BBS-… / BBT-…", submit: "Verify now", note: "Results come directly from the platform database. Revoked, expired, or unknown records are never shown as valid." };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) router.push(`/${locale}/certificate/${encodeURIComponent(normalized)}`);
  }

  return <main className="certificate-lookup-page">
    <BrandLogo size={48} />
    <section className="certificate-lookup-card">
      <span className="certificate-lookup-icon"><ShieldCheck size={30} /></span>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
      <form onSubmit={submit}>
        <label htmlFor="certificate-code">{copy.label}</label>
        <div><Search size={19} /><input id="certificate-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder={copy.placeholder} maxLength={80} autoCapitalize="characters" autoComplete="off" required /></div>
        <button type="submit"><ShieldCheck size={18} />{copy.submit}</button>
      </form>
      <small><ShieldCheck size={15} />{copy.note}</small>
    </section>
  </main>;
}
