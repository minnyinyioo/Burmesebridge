"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, PlayCircle, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";

type VideoItem = { id: number; youtube_id: string; title: string; description: string; featured: boolean; created_at: string };

export default function VideosPage() {
  const locale = String(useParams().locale || "en");
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = locale === "zh" ? { title: "视频课堂", intro: "免费、稳定的视频学习内容。", empty: "暂时还没有视频。", featured: "精选", test:"HSK 中文水平测试", testCopy:"24 道题快速诊断 HSK 1–6 水平", begin:"开始测试" } : locale === "my" ? { title: "ဗီဒီယို သင်ခန်းစာ", intro: "အခမဲ့နှင့် တည်ငြိမ်သော ဗီဒီယို သင်ယူမှုများ။", empty: "ဗီဒီယို မရှိသေးပါ။", featured: "ရွေးချယ်ထားသည်", test:"HSK တရုတ်ဘာသာအဆင့် စစ်ဆေးမှု", testCopy:"မေးခွန်း ၂၄ ခုဖြင့် HSK အဆင့် ၁–၆ ကို စစ်ဆေးပါ", begin:"စတင်ရန်" } : { title: "Video learning", intro: "Free, reliable video lessons and community resources.", empty: "No videos published yet.", featured: "Featured", test:"HSK Chinese placement test", testCopy:"Estimate HSK 1–6 with 24 diagnostic questions", begin:"Start test" };

  useEffect(() => {
    let active = true;
    supabase.from("videos").select("id, youtube_id, title, description, featured, created_at").eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => {
      if (active) { setItems((data || []) as VideoItem[]); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  return <main className="video-page"><header className="video-page-head"><span><Video size={22} /></span><div><h1>{copy.title}</h1><p>{copy.intro}</p></div></header><div className="video-feature-links"><Link className="hsk-video-banner" href={`/${locale}/videos/hsk`}><span><PlayCircle size={24}/></span><div><strong>{locale==="zh"?"HSK 1–6 四技能课程":locale==="my"?"HSK ၁–၆ 4Skill သင်တန်း":"HSK 1–6 four-skill courses"}</strong><p>{locale==="zh"?"听力、口语、阅读、书写、视频课与作业":locale==="my"?"နားထောင်၊ ပြော၊ ဖတ်၊ ရေး၊ ဗီဒီယိုနှင့် အိမ်စာ":"Listening, speaking, reading, writing, video and homework"}</p></div><b>{copy.begin}<ArrowRight size={17}/></b></Link><Link className="hsk-video-banner" href={`/${locale}/hsk-test`}><span><ClipboardCheck size={24}/></span><div><strong>{copy.test}</strong><p>{copy.testCopy}</p></div><b>{copy.begin}<ArrowRight size={17}/></b></Link></div>
    <div className="video-grid">{!loading && items.length === 0 && <div className="feedCard video-empty"><PlayCircle size={28} />{copy.empty}</div>}{items.map((item) => <article className="video-card" id={`video-${item.id}`} key={item.id}>
      <div className="video-player"><iframe src={`https://www.youtube-nocookie.com/embed/${item.youtube_id}?rel=0`} title={item.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
      <div className="video-card-copy">{item.featured && <span>{copy.featured}</span>}<h2>{item.title}</h2>{item.description && <p>{item.description}</p>}<ContentInteractions type="video" contentId={item.id} locale={locale} title={item.title} /></div>
    </article>)}</div>
  </main>;
}
