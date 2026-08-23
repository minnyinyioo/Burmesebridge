"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import RichMediaBlocks, { type MediaBlock } from "@/components/RichMediaBlocks";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import { ContentDirectory, DirectoryGrid, DirectoryState } from "@/components/ui/content-directory";

type Item={id:number;pinned:boolean|null;featured:boolean|null;hot:boolean|null;title_my:string|null;title_zh:string|null;title_en:string|null;content_my:string|null;content_zh:string|null;content_en:string|null;created_at:string;media_blocks:MediaBlock[]|null};

export default function JobsPage(){
  const locale=String(useParams().locale||"my");
  const copy={
    my:{title:"အလုပ်အကိုင်",subtitle:"အလုပ်အကိုင်အခွင့်အလမ်းများကို ရှာဖွေပြီး လျှောက်ထားမီ အလုပ်ရှင်ကို သီးခြားစစ်ဆေးပါ။",eyebrow:"အလုပ်အကိုင်စင်တာ",loading:"အလုပ်အကိုင်များ ရယူနေသည်",error:"အလုပ်အကိုင်များကို ရယူ၍ မရပါ",empty:"အလုပ်အကိုင် အချက်အလက် မရှိသေးပါ",detail:"အသေးစိတ်ဖတ်ရန်",safetyTitle:"အလုပ်ရှာဖွေသူ လုံခြုံရေး",safety:"BurmeseBridge သည် အလုပ်ရှာဖွေရေးအေဂျင်စီ မဟုတ်ပါ။ ပိုက်ဆံကြိုတောင်းခြင်း၊ passport/ID သိမ်းခြင်း၊ ခြိမ်းခြောက်ခြင်း၊ သွားလာခွင့်ကန့်သတ်ခြင်း သို့မဟုတ် ဖော်ပြချက်နှင့်မတူသောအလုပ်ကို မယုံကြည်ပါနှင့်။ အလုပ်ရှင်နှင့် စာချုပ်ကို ကိုယ်တိုင်စစ်ဆေးပြီး သံသယရှိပါက report လုပ်ပါ။",safetyLink:"လုံခြုံရေးစင်တာ ဖွင့်ရန်",terms:"အလုပ်ခန့်စည်းမျဉ်း"},
    zh:{title:"工作信息",subtitle:"发现工作机会，并在申请前独立核实雇主与合同。",eyebrow:"招聘中心",loading:"正在加载工作信息",error:"工作信息加载失败，请稍后重试",empty:"暂无工作信息",detail:"查看详情",safetyTitle:"求职安全提醒",safety:"BurmeseBridge 不是劳务中介，也不担保职位真实性。不要支付不明招聘费，不要交出护照或身份证；遇到限制人身自由、威胁、强迫劳动、实际工作与描述不符或疑似人口贩卖，请立即停止联系并向平台及当地执法机构举报。",safetyLink:"打开求职安全中心",terms:"招聘条款"},
    en:{title:"Jobs",subtitle:"Discover opportunities and independently verify employers before applying.",eyebrow:"Career center",loading:"Loading jobs",error:"Jobs could not be loaded. Please try again.",empty:"No jobs yet",detail:"Read more",safetyTitle:"Jobseeker safety",safety:"BurmeseBridge is not a recruitment agency and does not guarantee listings. Do not pay unexplained recruitment fees or surrender passports/IDs. Stop and report threats, restricted movement, forced labour, materially different work, or suspected human trafficking to the platform and local authorities.",safetyLink:"Open safety center",terms:"Recruitment terms"}
  };
  const t=copy[locale as keyof typeof copy]||copy.en;
  const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const loadItems=useCallback(async()=>{const result=await supabase.from("news").select("id, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, media_blocks, created_at").eq("status","published").eq("category","jobs").order("pinned",{ascending:false}).order("hot",{ascending:false}).order("featured",{ascending:false}).order("created_at",{ascending:false});if(result.error){setError(result.error.message);setLoading(false);return;}setItems((result.data||[]) as Item[]);setError("");setLoading(false);},[]);
  useEffect(()=>{
    let mounted=true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems();
    const channel=supabase.channel("jobs-live-update").on("postgres_changes",{event:"*",schema:"public",table:"news"},()=>{if(mounted)void loadItems();}).subscribe();
    return()=>{mounted=false;void supabase.removeChannel(channel);};
  },[loadItems]);
  const title=(item:Item)=>locale==="zh"?item.title_zh||item.title_my||item.title_en||"":locale==="en"?item.title_en||item.title_my||item.title_zh||"":item.title_my||item.title_zh||item.title_en||"";
  const content=(item:Item)=>locale==="zh"?item.content_zh||item.content_my||item.content_en||"":locale==="en"?item.content_en||item.content_my||item.content_zh||"":item.content_my||item.content_zh||item.content_en||"";
  return <PageContainer><PageIntro eyebrow={<><BriefcaseBusiness size={18}/>{t.eyebrow}</>} title={t.title} description={t.subtitle}/>
    <aside className="job-safety-notice" role="note"><ShieldAlert aria-hidden="true"/><div><strong>{t.safetyTitle}</strong><p>{t.safety}</p><div className="job-safety-links"><Link href={`/${locale}/safety`}>{t.safetyLink}<ArrowRight size={14}/></Link><Link href={`/${locale}/terms`}>{t.terms}</Link></div></div></aside>
    <ContentDirectory>{loading?<DirectoryState kind="loading" title={t.loading}/>:error?<DirectoryState kind="error" title={t.error} description={error}/>:items.length===0?<DirectoryState title={t.empty}/>:<DirectoryGrid>{items.map(item=><article className="directory-card" key={item.id}>
      <span className="directory-category is-jobs">{t.title}</span><div className="directory-card-title"><h2>{title(item)}</h2>{item.pinned&&<Badge type="pinned"/>}{item.hot&&<Badge type="hot"/>}{item.featured&&<Badge type="featured"/>}</div>
      <p className="directory-card-excerpt">{content(item).length>240?`${content(item).slice(0,240)}…`:content(item)}</p><RichMediaBlocks blocks={item.media_blocks?.slice(0,1)||null}/><Link href={`/${locale}/content/${item.id}`} className="content-card-detail-link">{t.detail}<ArrowRight size={16}/></Link><time className="directory-card-time" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString(locale)}</time>
    </article>)}</DirectoryGrid>}</ContentDirectory>
  </PageContainer>;
}
