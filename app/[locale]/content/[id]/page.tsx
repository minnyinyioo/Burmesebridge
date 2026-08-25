"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Badge from "@/components/Badges";
import RichMediaBlocks, { type MediaBlock } from "@/components/RichMediaBlocks";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";

type Category = "news" | "jobs" | "learn";
type ContentItem = {
  id: number;
  category: Category | null;
  pinned: boolean | null;
  featured: boolean | null;
  hot: boolean | null;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  content_my: string | null;
  content_zh: string | null;
  content_en: string | null;
  created_at: string;
  media_blocks: MediaBlock[] | null;
};

const copy = {
  my: { back: "နောက်သို့", loading: "ဖတ်နေသည်...", missing: "ဤအကြောင်းအရာကို ရှာမတွေ့ပါ", news: "သတင်း", jobs: "အလုပ်အကိုင်", learn: "လေ့လာရန်" },
  zh: { back: "返回列表", loading: "正在加载...", missing: "未找到该内容或内容尚未发布", news: "新闻", jobs: "工作", learn: "学习" },
  en: { back: "Back to list", loading: "Loading...", missing: "This content was not found or is not published", news: "News", jobs: "Jobs", learn: "Learning" },
};

export default function ContentDetailPage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const id = Number(params.id);
  const t = copy[locale as keyof typeof copy] || copy.en;
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!Number.isInteger(id) || id < 1) { setLoading(false); return; }
      const { data } = await supabase.from("news").select("id, category, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, created_at, media_blocks").eq("id", id).eq("status", "published").neq("category", "jobs").maybeSingle();
      if (active) { setItem(data as ContentItem | null); setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [id]);

  const title = item ? (locale === "zh" ? item.title_zh || item.title_my || item.title_en : locale === "en" ? item.title_en || item.title_my || item.title_zh : item.title_my || item.title_zh || item.title_en) || "" : "";
  const content = item ? (locale === "zh" ? item.content_zh || item.content_my || item.content_en : locale === "en" ? item.content_en || item.content_my || item.content_zh : item.content_my || item.content_zh || item.content_en) || "" : "";
  const category: Category = item?.category === "learn" ? "learn" : "news";

  return (
    <main className="content-detail-shell">
      <Link href={`/${locale}/${category}`} className="content-detail-back"><ArrowLeft size={17} />{t.back}</Link>
      {loading ? <div className="feedCard content-detail-state">{t.loading}</div> : !item ? <div className="feedCard content-detail-state">{t.missing}</div> : (
        <article className="feedCard content-detail-card">
          <div className="content-detail-meta"><span className={`content-detail-category is-${category}`}>{t[category]}</span><time>{new Date(item.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "my" ? "my-MM" : "en-US")}</time></div>
          <div className="content-detail-heading"><h1>{title}</h1>{item.pinned && <Badge type="pinned" />}{item.hot && <Badge type="hot" />}{item.featured && <Badge type="featured" />}</div>
          <div className="content-detail-copy">{content}</div>
          <RichMediaBlocks blocks={item.media_blocks} />
          <ContentInteractions type="news" contentId={item.id} locale={locale} title={title} />
        </article>
      )}
    </main>
  );
}
