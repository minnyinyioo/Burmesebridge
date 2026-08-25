"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Clock3, GraduationCap, MessageCircle, Newspaper, PlaySquare, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Result = { id: string; title: string; excerpt: string; type: "news" | "learn" | "forum" | "video" | "knowledge"; href: string };
type ResultType = Result["type"];

const icons = { news: Newspaper, learn: GraduationCap, forum: MessageCircle, video: PlaySquare, knowledge: BookOpen };

export default function SearchPage() {
  const locale = String(useParams().locale || "my");
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | ResultType>("all");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const copy = locale === "zh" ? { title: "全局搜索", hint: "搜索新闻、学习、社区、视频和课程", placeholder: "输入关键词", button: "搜索", empty: "没有找到相关内容", initial: "输入关键词开始搜索", count: "条结果", all: "全部", failed: "搜索暂时不可用，请稍后重试", recent: "最近搜索", clear: "清除", types: { news: "新闻", learn: "学习", forum: "社区", video: "视频", knowledge: "课程" } } : locale === "my" ? { title: "အကြောင်းအရာ ရှာဖွေရန်", hint: "သတင်း၊ သင်ခန်းစာ၊ Community နှင့် ဗီဒီယိုများကို ရှာပါ", placeholder: "ရှာလိုသော စာလုံး", button: "ရှာမည်", empty: "အကြောင်းအရာ မတွေ့ပါ", initial: "ရှာဖွေရန် စာလုံးထည့်ပါ", count: " ခု တွေ့ရှိသည်", all: "အားလုံး", failed: "ရှာဖွေ၍ မရသေးပါ။ နောက်မှ ထပ်စမ်းပါ", recent: "မကြာသေးမီက ရှာဖွေမှု", clear: "ဖျက်မည်", types: { news: "သတင်း", learn: "လေ့လာရန်", forum: "Community", video: "ဗီဒီယို", knowledge: "သင်တန်း" } } : { title: "Search", hint: "Search news, learning, community, videos and courses", placeholder: "Enter keywords", button: "Search", empty: "No matching content found", initial: "Enter a keyword to start searching", count: " results", all: "All", failed: "Search is temporarily unavailable. Please try again.", recent: "Recent searches", clear: "Clear", types: { news: "News", learn: "Learning", forum: "Community", video: "Videos", knowledge: "Courses" } };

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem("bb-recent-searches") || "[]")); } catch { setRecent([]); }
  }, []);

  useEffect(() => {
    setInput(query);
    if (query.length < 1) { setResults([]); setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError("");
    const safe = query.replace(/[%_,()]/g, " ").trim().slice(0, 80);
    if (!safe) { setResults([]); setLoading(false); return; }
    const pattern = `%${safe}%`;
    Promise.all([
      supabase.from("news").select("id,category,title_my,title_zh,title_en,content_my,content_zh,content_en").eq("status", "published").neq("category", "jobs").or(`title_my.ilike.${pattern},title_zh.ilike.${pattern},title_en.ilike.${pattern},content_my.ilike.${pattern},content_zh.ilike.${pattern},content_en.ilike.${pattern}`).limit(20),
      supabase.from("posts").select("id,content").ilike("content", pattern).limit(12),
      supabase.from("videos").select("id,title,description").eq("status", "published").or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(12),
      supabase.from("knowledge_products").select("id,title_my,title_zh,title_en,description_my,description_zh,description_en").eq("status", "published").or(`title_my.ilike.${pattern},title_zh.ilike.${pattern},title_en.ilike.${pattern},description_my.ilike.${pattern},description_zh.ilike.${pattern},description_en.ilike.${pattern}`).limit(12),
    ]).then(([news, posts, videos, products]) => {
      if (!active) return;
      if (news.error && posts.error && videos.error && products.error) {
        setError(copy.failed); setResults([]); setLoading(false); return;
      }
      const localized = (row: Record<string, unknown>, field: string) => String((locale === "zh" ? row[`${field}_zh`] || row[`${field}_my`] || row[`${field}_en`] : locale === "en" ? row[`${field}_en`] || row[`${field}_my`] || row[`${field}_zh`] : row[`${field}_my`] || row[`${field}_zh`] || row[`${field}_en`]) || "");
      const all: Result[] = [];
      for (const row of news.data || []) { const category = row.category === "learn" ? "learn" : "news"; all.push({ id: `content-${row.id}`, title: localized(row, "title"), excerpt: localized(row, "content"), type: category, href: `/${locale}/content/${row.id}` }); }
      for (const row of posts.data || []) all.push({ id: `post-${row.id}`, title: String(row.content).slice(0, 72), excerpt: String(row.content), type: "forum", href: `/${locale}/forum#post-${row.id}` });
      for (const row of videos.data || []) all.push({ id: `video-${row.id}`, title: row.title, excerpt: row.description || "", type: "video", href: `/${locale}/videos#video-${row.id}` });
      for (const row of products.data || []) all.push({ id: `course-${row.id}`, title: localized(row, "title"), excerpt: localized(row, "description"), type: "knowledge", href: `/${locale}/knowledge/${row.id}` });
      setResults(all); setLoading(false);
    }).catch(() => { if (active) { setError(copy.failed); setResults([]); setLoading(false); } });
    return () => { active = false; };
  }, [query, locale]);

  function remember(value: string) {
    const next = [value, ...recent.filter((item) => item.toLocaleLowerCase() !== value.toLocaleLowerCase())].slice(0, 8);
    setRecent(next); localStorage.setItem("bb-recent-searches", JSON.stringify(next));
  }
  function runSearch(value: string) { const clean = value.trim(); if (clean) remember(clean); router.push(clean ? `/${locale}/search?q=${encodeURIComponent(clean)}` : `/${locale}/search`); }
  function submit(event: FormEvent) { event.preventDefault(); runSearch(input); }
  function clearRecent() { setRecent([]); localStorage.removeItem("bb-recent-searches"); }
  const visible = filter === "all" ? results : results.filter((result) => result.type === filter);
  const filters: ("all" | ResultType)[] = ["all", "news", "learn", "forum", "video", "knowledge"];
  function highlight(text: string) {
    if (!query) return text;
    const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (index < 0) return text;
    return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
  }

  return <main className="search-page">
    <header className="search-hero"><span><Search size={20} /></span><div><h1>{copy.title}</h1><p>{copy.hint}</p></div></header>
    <form className="search-page-form" onSubmit={submit}><Search size={20} /><input autoFocus value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} aria-label={copy.placeholder} /><button>{copy.button}</button></form>
    {!query && recent.length > 0 && <section className="recent-searches"><div><h2><Clock3 size={17} />{copy.recent}</h2><button onClick={clearRecent}><Trash2 size={14} />{copy.clear}</button></div><ul>{recent.map((item) => <li key={item}><button onClick={() => { setInput(item); runSearch(item); }}><Search size={14} />{item}</button></li>)}</ul></section>}
    {query && !loading && !error && <><p className="search-count">{results.length}{copy.count}</p><div className="search-filters" aria-label={copy.title}>{filters.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "all" ? copy.all : copy.types[item]}{item !== "all" && <span>{results.filter((result) => result.type === item).length}</span>}</button>)}</div></>}
    {error && <div className="search-error">{error}</div>}
    <div className="search-results">{loading ? Array.from({ length: 4 }, (_, index) => <div className="search-skeleton" key={index} />) : visible.map((result) => { const Icon = icons[result.type]; const excerpt = result.excerpt.length > 150 ? `${result.excerpt.slice(0, 150)}…` : result.excerpt; return <Link href={result.href} className="search-result" key={result.id}><span className={`search-result-icon is-${result.type}`}><Icon size={19} /></span><div><small>{copy.types[result.type]}</small><h2>{highlight(result.title)}</h2>{excerpt && <p>{highlight(excerpt)}</p>}</div></Link>; })}</div>
    {!loading && !error && <div className="search-empty">{query ? visible.length === 0 && copy.empty : copy.initial}</div>}
  </main>;
}
