"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Search, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function EducationIdLookupPage(){
 const params=useParams();const router=useRouter();const locale=String(params.locale||"my");const[code,setCode]=useState("");
 const copy=locale==="zh"?{title:"学生证 / 教师证查询",intro:"输入证件编号或防伪码，核验 BurmeseBridge 平台教育证件。",label:"证件编号 / 防伪码",placeholder:"BBS-… / BBT-… / BBID-…",submit:"立即查验",notice:"本查询仅核验 BurmeseBridge 私立学习平台内部证件，不代表政府教育机构、政府学校或法定学历认证。"}:locale==="my"?{title:"ကျောင်းသား / ဆရာကတ် စစ်ဆေးရန်",intro:"BurmeseBridge ပညာရေးကတ်ကို စစ်ဆေးရန် ကတ်အမှတ် သို့မဟုတ် အတုအပကာကွယ်ရေးကုဒ်ကို ထည့်ပါ။",label:"ကတ်အမှတ် / အတုအပကာကွယ်ရေးကုဒ်",placeholder:"BBS-… / BBT-… / BBID-…",submit:"ယခု စစ်ဆေးရန်",notice:"ဤစစ်ဆေးမှုသည် BurmeseBridge ပုဂ္ဂလိကသင်ယူရေးပလက်ဖောင်း၏ အတွင်းကတ်ကိုသာ အတည်ပြုသည်။ အစိုးရပညာရေးအဖွဲ့၊ အစိုးရကျောင်း သို့မဟုတ် တရားဝင်ဘွဲ့အသိအမှတ်ပြုမှုကို မဆိုလိုပါ။"}:{title:"Student / teacher ID lookup",intro:"Enter a card number or authenticity code to verify a BurmeseBridge education ID.",label:"Card number / authenticity code",placeholder:"BBS-… / BBT-… / BBID-…",submit:"Verify now",notice:"This lookup only verifies an internal credential of the private BurmeseBridge learning platform. It does not represent a government education authority, government school, or statutory academic accreditation."};
 function submit(e:FormEvent){e.preventDefault();const value=code.trim().toUpperCase();if(value)router.push(`/${locale}/education-id/${encodeURIComponent(value)}`)}
 return <main className="certificate-lookup-page"><BrandLogo size={48}/><section className="certificate-lookup-card"><span className="certificate-lookup-icon"><CreditCard size={30}/></span><h1>{copy.title}</h1><p>{copy.intro}</p><form onSubmit={submit}><label htmlFor="education-id-code">{copy.label}</label><div><Search size={19}/><input id="education-id-code" value={code} onChange={e=>setCode(e.target.value)} placeholder={copy.placeholder} maxLength={64} autoCapitalize="characters" autoComplete="off" required/></div><button><ShieldCheck size={18}/>{copy.submit}</button></form><small><ShieldCheck size={15}/>{copy.notice}</small></section></main>
}
