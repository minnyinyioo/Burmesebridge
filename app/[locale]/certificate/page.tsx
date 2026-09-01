"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Award, Search, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function CertificateLookupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = String(params.locale || "my");
  const [code, setCode] = useState("");
  const copy = locale === "zh"
    ? { title: "证书查询", intro: "输入证书编号或防伪码，核验 BurmeseBridge 正式证书的真实状态。", label: "证书编号 / 防伪码", placeholder: "例如：BB-2026-… 或 BBV-…", submit: "立即查询", note: "查询结果直接来自证书签发数据库；已撤销或不存在的证书不会显示为有效。" }
    : locale === "my"
      ? { title: "လက်မှတ် စစ်ဆေးရန်", intro: "BurmeseBridge မှ တရားဝင်ထုတ်ပေးထားသော လက်မှတ်ကို စစ်ဆေးရန် လက်မှတ်အမှတ် သို့မဟုတ် အတုအပကာကွယ်ရေးကုဒ်ကို ထည့်ပါ။", label: "လက်မှတ်အမှတ် / အတုအပကာကွယ်ရေးကုဒ်", placeholder: "ဥပမာ BB-2026-… သို့မဟုတ် BBV-…", submit: "ယခု စစ်ဆေးရန်", note: "ရလဒ်ကို လက်မှတ်ထုတ်ပေးမှု ဒေတာဘေ့စ်မှ တိုက်ရိုက်စစ်ဆေးသည်။ ရုပ်သိမ်းထားသော သို့မဟုတ် မရှိသော လက်မှတ်ကို တရားဝင်ဟု မပြပါ။" }
      : { title: "Certificate lookup", intro: "Enter a certificate number or authenticity code to verify an official BurmeseBridge certificate.", label: "Certificate number / authenticity code", placeholder: "Example: BB-2026-… or BBV-…", submit: "Verify now", note: "Results come directly from the issuance database. Revoked or unknown certificates are never shown as valid." };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) router.push(`/${locale}/certificate/${encodeURIComponent(normalized)}`);
  }

  return <main className="certificate-lookup-page">
    <BrandLogo size={48} />
    <section className="certificate-lookup-card">
      <span className="certificate-lookup-icon"><Award size={30} /></span>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
      <form onSubmit={submit}>
        <label htmlFor="certificate-code">{copy.label}</label>
        <div><Search size={19} /><input id="certificate-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder={copy.placeholder} maxLength={64} autoCapitalize="characters" autoComplete="off" required /></div>
        <button type="submit"><ShieldCheck size={18} />{copy.submit}</button>
      </form>
      <small><ShieldCheck size={15} />{copy.note}</small>
    </section>
  </main>;
}
