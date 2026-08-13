"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, BriefcaseBusiness, GraduationCap, MessageCircle, Newspaper, PlaySquare, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Result = { id: string; title: string; excerpt: string; type: "news" | "jobs" | "learn" | "forum" | "video" | "knowledge"; href: string };

const icons = { news: Newspaper, jobs: BriefcaseBusiness, learn: GraduationCap, forum: MessageCircle, video: PlaySquare, knowledge: BookOpen };

export default function SearchPage() {
  const locale = String(useParams().locale || "my");
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const copy = locale === "zh" ? { title: "全局搜索", hint: "搜索新闻、工作、学习、社区、视频和课程", placeholder: "输入关键词", button: "搜索", empty: "没有找到相关内容", initial: "输入关键词开始搜索", count: "条结果", types: { news: "新闻", jobs: "工作", learn: "学习", forum: "社区", video: "视频", knowledge: "课程" } } : locale === "my" ? { title: "အကြောင်းအရာ ရှာဖွေရန်", hint: "သတင်း၊ အလုပ်၊ သင်ခန်းစာ၊ Community နှင့် ဗီဒီယိုများကို ရှာပါ", placeholder: "ရှာလိုသော စာလုံး", button: "ရှာမည်", empty: "အကြောင်းအရာ မတွေ့ပါ", initial: "ရှာဖွေရန် စာလုံးထည့်ပါ", count: " ခု တွေ့ရှိသည်", types: { news: "သတင်း", jobs: "အလုပ်", learn: "လေ့လာရန်", forum: "Community", video: "ဗီဒီယို", knowledge: "သင်တန်း" } } : { title: "Search", hint: "Search news, jobs, learning, community, videos and courses", placeholder: "Enter keywords", button: "Search", empty: "No matching content found", initial: "Enter a keyword to start searching", count: " results", types: { news: "News", jobs: "Jobs", learn: "Learning", forum: "Community", video: "Videos", knowledge: "Courses" } };

  useEffect(() => {
    setInput(query);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    let active = true;
    setLoading(true);
    const safe = query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    const pattern = `%${safe}%`;
    Promise.all([
      supabase.from("news").select("id,category,title_my,title_zh,title_en,content_my,content_zh,content_en").eq("status", "published").or(`title_my.ilike.${pattern},title_zh.ilike.${pattern},title_en.ilike.${pattern},content_my.ilike.${pattern},content_zh.ilike.${pattern},content_en.ilike.${pattern}`).limit(20),
      supabase.from("posts").select("id,content").ilike("content", pattern).limit(12),
      supabase.from("videos").select("id,title,description").eq("status", "published").or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(12),
      supabase.from("knowledge_products").select("id,title_my,title_zh,title_en,description_my,description_zh,description_en").eq("status", "published").or(`title_my.ilike.${pattern},title_zh.ilike.${pattern},title_en.ilike.${pattern},description_my.ilike.${pattern},description_zh.ilike.${pattern},description_en.ilike.${pattern}`).limit(12),
    ]).then(([news, posts, videos, products]) => {
      if (!active) return;
      const localized = (row: Record<string, unknown>, field: string) => String((locale === "zh" ? row[`${field}_zh`] || row[`${field}_my`] || row[`${field}_en`] : locale === "en" ? row[`${field}_en`] || row[`${field}_my`] || row[`${field}_zh`] : row[`${field}_my`] || row[`${field}_zh`] || row[`${field}_en`]) || "");
      const all: Result[] = [];
      for (const row of news.data || []) { const category = row.category === "jobs" || row.category === "learn" ? row.category : "news"; all.push({ id: `content-${row.id}`, title: localized(row, "title"), excerpt: localized(row, "content"), type: category, href: `/${locale}/content/${row.id}` }); }
      for (const row of posts.data || []) all.push({ id: `post-${row.id}`, title: String(row.content).slice(0, 72), excerpt: String(row.content), type: "forum", href: `/${locale}/forum#post-${row.id}` });
      for (const row of videos.data || []) all.push({ id: `video-${row.id}`, title: row.title, excerpt: row.description || "", type: "video", href: `/${locale}/videos#video-${row.id}` });
      for (const row of products.data || []) all.push({ id: `course-${row.id}`, title: localized(row, "title"), excerpt: localized(row, "description"), type: "knowledge", href: `/${locale}/knowledge/${row.id}` });
      setResults(all); setLoading(false);
    });
    return () => { active = false; };
  }, [query, locale]);

  function submit(event: FormEvent) { event.preventDefault(); const value = input.trim(); router.push(value ? `/${locale}/search?q=${encodeURIComponent(value)}` : `/${locale}/search`); }

  return <main className="search-page">
    <header className="search-hero"><span><Search size={20} /></span><div><h1>{copy.title}</h1><p>{copy.hint}</p></div></header>
    <form className="search-page-form" onSubmit={submit}><Search size={20} /><input autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} aria-label={copy.placeholder} /><button>{copy.button}</button></form>
    {query && !loading && <p className="search-count">{results.length}{copy.count}</p>}
    <div className="search-results">{loading ? Array.from({ length: 4 }, (_, index) => <div className="search-skeleton" key={index} />) : results.map((result) => { const Icon = icons[result.type]; return <Link href={result.href} className="search-result" key={result.id}><span className={`search-result-icon is-${result.type}`}><Icon size={19} /></span><div><small>{copy.types[result.type]}</small><h2>{result.title}</h2>{result.excerpt && <p>{result.excerpt.length > 150 ? `${result.excerpt.slice(0, 150)}…` : result.excerpt}</p>}</div></Link>; })}</div>
    {!loading && <div className="search-empty">{query ? results.length === 0 && copy.empty : copy.initial}</div>}
  </main>;
}
