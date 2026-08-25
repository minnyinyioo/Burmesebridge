"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import RichMediaBlocks, { type MediaBlock } from "@/components/RichMediaBlocks";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import { ContentDirectory, DirectoryGrid, DirectoryState } from "@/components/ui/content-directory";

type Category = "news" | "jobs" | "learn";
type NewsItem = { id:number; category:Category|null; pinned:boolean|null; featured:boolean|null; hot:boolean|null; title_my:string|null; title_zh:string|null; title_en:string|null; content_my:string|null; content_zh:string|null; content_en:string|null; created_at:string; media_blocks:MediaBlock[]|null };

export default function NewsPage() {
  const locale = String(useParams().locale || "my");
  const copy = {
    my:{ title:"သတင်းအချက်အလက်", subtitle:"သတင်းနှင့် လေ့လာရေးဆိုင်ရာ နောက်ဆုံးအချက်အလက်များ", eyebrow:"နောက်ဆုံးရ အချက်အလက်", empty:"လက်ရှိ ထုတ်ပြန်ထားသော အချက်အလက် မရှိသေးပါ", loading:"အချက်အလက်များ ရယူနေသည်", error:"အချက်အလက်များကို ရယူ၍ မရပါ", news:"သတင်း", jobs:"အလုပ်အကိုင်", learn:"လေ့လာရန်", detail:"အသေးစိတ်ဖတ်ရန်" },
    zh:{ title:"信息中心", subtitle:"集中查看新闻和学习内容。", eyebrow:"最新资讯", empty:"暂无发布内容", loading:"正在加载内容", error:"内容加载失败，请稍后重试", news:"新闻", jobs:"工作信息", learn:"学习内容", detail:"查看详情" },
    en:{ title:"Information center", subtitle:"News and learning updates in one place.", eyebrow:"Latest updates", empty:"No published content yet", loading:"Loading content", error:"Content could not be loaded. Please try again.", news:"News", jobs:"Jobs", learn:"Learning", detail:"Read more" },
  };
  const t = copy[locale as keyof typeof copy] || copy.en;
  const [items,setItems] = useState<NewsItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const loadItems = useCallback(async () => {
    const result = await supabase.from("news").select("id, category, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, media_blocks, created_at").eq("status","published").neq("category","jobs").order("pinned",{ascending:false}).order("hot",{ascending:false}).order("featured",{ascending:false}).order("created_at",{ascending:false});
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    setItems((result.data || []) as NewsItem[]); setError(""); setLoading(false);
  },[]);

  useEffect(() => {
    let mounted=true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems();
    const channel=supabase.channel("news-live-update").on("postgres_changes",{event:"*",schema:"public",table:"news"},()=>{ if(mounted) void loadItems(); }).subscribe();
    return()=>{ mounted=false; void supabase.removeChannel(channel); };
  },[loadItems]);
  const title=(item:NewsItem)=>locale==="zh"?item.title_zh||item.title_my||item.title_en||"":locale==="en"?item.title_en||item.title_my||item.title_zh||"":item.title_my||item.title_zh||item.title_en||"";
  const content=(item:NewsItem)=>locale==="zh"?item.content_zh||item.content_my||item.content_en||"":locale==="en"?item.content_en||item.content_my||item.content_zh||"":item.content_my||item.content_zh||item.content_en||"";
  const category=(value:Category|null)=>value==="jobs"?t.jobs:value==="learn"?t.learn:t.news;

  return <PageContainer><PageIntro eyebrow={<><Newspaper size={18}/>{t.eyebrow}</>} title={t.title} description={t.subtitle}/><ContentDirectory>
    {loading?<DirectoryState kind="loading" title={t.loading}/>:error?<DirectoryState kind="error" title={t.error} description={error}/>:items.length===0?<DirectoryState title={t.empty}/>:<DirectoryGrid>{items.map(item=><article className="directory-card" key={item.id}>
      <span className={`directory-category is-${item.category||"news"}`}>{category(item.category)}</span>
      <div className="directory-card-title"><h2>{title(item)}</h2>{item.pinned&&<Badge type="pinned"/>}{item.hot&&<Badge type="hot"/>}{item.featured&&<Badge type="featured"/>}</div>
      <p className="directory-card-excerpt">{content(item).length>240?`${content(item).slice(0,240)}…`:content(item)}</p>
      <RichMediaBlocks blocks={item.media_blocks?.slice(0,1)||null}/><Link href={`/${locale}/content/${item.id}`} className="content-card-detail-link">{t.detail}<ArrowRight size={16}/></Link>
      <time className="directory-card-time" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(locale)}</time>
    </article>)}</DirectoryGrid>}
  </ContentDirectory></PageContainer>;
}
