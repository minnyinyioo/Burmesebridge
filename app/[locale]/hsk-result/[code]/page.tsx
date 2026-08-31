"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Breakdown={level?:number;skill?:string;correct:number;total:number;rate:number};
type PublicResult={report_code:string;estimated_level:number;cefr_level:string;score:number;correct_answers:number;total_questions:number;level_breakdown:Breakdown[];skill_breakdown:Breakdown[];created_at:string};

export default function HskVerifiedResult(){
  const params=useParams<{locale:string;code:string}>(),locale=params.locale||"zh",code=decodeURIComponent(params.code||"");
  const [result,setResult]=useState<PublicResult|null>(null),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;void supabase.from("hsk_public_results").select("*").eq("report_code",code).maybeSingle().then(({data})=>{if(active){setResult(data as PublicResult|null);setLoading(false)}});return()=>{active=false}},[code]);
  const copy=locale==="zh"?{title:"HSK 结果核验",valid:"报告编号有效，以下数据来自 BurmeseBridge 数据库。",missing:"未找到该报告，编号可能无效或已撤销。",level:"建议级别",score:"总正确率",correct:"答对题数",levels:"分级表现",skills:"专项能力",date:"测试日期",back:"开始新的测试"}:locale==="my"?{title:"HSK ရလဒ် စစ်ဆေးခြင်း",valid:"Report အမှတ် မှန်ကန်ပြီး အောက်ပါဒေတာကို BurmeseBridge Database မှ ရယူထားသည်။",missing:"ဤ Report ကို မတွေ့ပါ။ အမှတ်မမှန်ခြင်း သို့မဟုတ် ရုပ်သိမ်းထားခြင်း ဖြစ်နိုင်သည်။",level:"အကြံပြုအဆင့်",score:"မှန်ကန်မှုရာခိုင်နှုန်း",correct:"အဖြေမှန်",levels:"အဆင့်အလိုက်ရလဒ်",skills:"ကျွမ်းကျင်မှုအလိုက်ရလဒ်",date:"စစ်ဆေးသည့်ရက်",back:"စစ်ဆေးမှုအသစ် စတင်ရန်"}:{title:"HSK result verification",valid:"This report ID is valid. The data below comes from the BurmeseBridge database.",missing:"This report was not found. The code may be invalid or revoked.",level:"Recommended level",score:"Overall accuracy",correct:"Correct answers",levels:"Level performance",skills:"Skill performance",date:"Assessment date",back:"Start a new assessment"};
  if(loading)return <main className="hsk-page"><section className="hsk-verify-card">…</section></main>;
  if(!result)return <main className="hsk-page"><section className="hsk-verify-card"><ShieldCheck size={42}/><h1>{copy.title}</h1><p>{copy.missing}</p><Link className="hsk-primary" href={`/${locale}/hsk-test`}>{copy.back}</Link></section></main>;
  const rows=(items:Breakdown[],kind:"level"|"skill")=><section className="hsk-breakdown"><h2>{kind==="level"?copy.levels:copy.skills}</h2>{items.map((item,index)=><div key={index}><span>{kind==="level"?`HSK ${item.level}`:item.skill}</span><div><i style={{width:`${item.rate*100}%`}}/></div><strong>{item.correct}/{item.total}</strong></div>)}</section>;
  return <main className="hsk-page"><article className="hsk-report hsk-public-report"><header className="hsk-report-brand"><span className="hsk-report-lockup"><Image src="/brand-icon-1024.png" width={48} height={48} alt="BurmeseBridge"/><strong>Burmese<span>Bridge</span></strong></span><div><strong>{copy.title}</strong><span>burmesebridge.com</span></div></header><div className="hsk-verified-banner"><CheckCircle2 size={22}/><p><strong>{copy.valid}</strong><span>{result.report_code}</span></p></div><div className="hsk-result-grid"><article><span>{copy.level}</span><strong>{result.estimated_level?`HSK ${result.estimated_level}`:"Pre-HSK"}</strong><small>CEFR-style: {result.cefr_level}</small></article><article><span>{copy.score}</span><strong>{result.score}%</strong><small>{copy.correct}: {result.correct_answers}/{result.total_questions}</small></article></div>{rows(result.level_breakdown||[],"level")}{rows(result.skill_breakdown||[],"skill")}<footer className="hsk-report-footer"><ShieldCheck size={20}/><p>{copy.date}: {new Date(result.created_at).toLocaleString(locale)}</p><small>admin@burmesebridge.com · This is a learning diagnostic, not an official HSK certificate.</small></footer></article></main>;
}

