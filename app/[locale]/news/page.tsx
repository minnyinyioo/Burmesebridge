"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import RichMediaBlocks, { type MediaBlock } from "@/components/RichMediaBlocks";

type Category = "news" | "jobs" | "learn";

type NewsItem = {
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

export default function NewsPage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      title: "သတင်းအချက်အလက်",
      subtitle: "သတင်း၊ အလုပ်အကိုင် နှင့် လေ့လာရေး အချက်အလက်များ",
      empty: "လက်ရှိ ထုတ်ပြန်ထားသော အချက်အလက် မရှိသေးပါ",
      news: "သတင်း",
      jobs: "အလုပ်အကိုင်",
      learn: "လေ့လာရန်",
      detail: "အသေးစိတ်ဖတ်ရန်",
    },
    zh: {
      title: "信息中心",
      subtitle: "新闻、工作信息和学习内容",
      empty: "暂无发布内容",
      news: "新闻",
      jobs: "工作信息",
      learn: "学习内容",
      detail: "查看详情",
    },
    en: {
      title: "Information Center",
      subtitle: "News, jobs, and learning updates",
      empty: "No published content yet",
      news: "News",
      jobs: "Jobs",
      learn: "Learning",
      detail: "Read more",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;

  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
  let mounted = true;

  async function init() {
    if (!mounted) return;

    // eslint-disable-next-line react-hooks/immutability
    await loadItems();
  }

  init();

  const channel = supabase
    .channel("news-live-update")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "news",
      },
      async () => {
        if (!mounted) return;

        await loadItems();
      }
    )
    .subscribe();

  return () => {
    mounted = false;

    supabase.removeChannel(channel);
  };
}, []);

  async function loadItems() {
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, category,pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, media_blocks, created_at"
      )
      .eq("status", "published")
      .order("pinned", { ascending: false })
      .order("hot", { ascending: false })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setItems((data || []) as NewsItem[]);
  }

  function getTitle(item: NewsItem) {
    if (locale === "zh") {
      return item.title_zh || item.title_my || item.title_en || "";
    }

    if (locale === "en") {
      return item.title_en || item.title_my || item.title_zh || "";
    }

    return item.title_my || item.title_zh || item.title_en || "";
  }

  function getContent(item: NewsItem) {
    if (locale === "zh") {
      return item.content_zh || item.content_my || item.content_en || "";
    }

    if (locale === "en") {
      return item.content_en || item.content_my || item.content_zh || "";
    }

    return item.content_my || item.content_zh || item.content_en || "";
  }

  function getCategoryLabel(category: Category | null) {
    if (category === "jobs") return t.jobs;
    if (category === "learn") return t.learn;
    return t.news;
  }

  function getCategoryStyle(category: Category | null) {
    if (category === "jobs") {
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fed7aa",
      };
    }

    if (category === "learn") {
      return {
        background: "#f5f3ff",
        color: "#6d28d9",
        border: "1px solid #ddd6fe",
      };
    }

    return {
      background: "#eff6ff",
      color: "#2563eb",
      border: "1px solid #bfdbfe",
    };
  }

  return (
    <main className="feedShell">
      <h1 className="feedTitle">{t.title}</h1>

      <p
        style={{
          color: "#64748b",
          fontSize: 18,
          marginBottom: 28,
          lineHeight: 1.8,
        }}
      >
        {t.subtitle}
      </p>

      <div style={{ display: "grid", gap: 18 }}>
        {items.length === 0 && (
          <div className="feedCard" style={{ color: "#64748b" }}>
            {t.empty}
          </div>
        )}

        {items.map((item) => (
          <article key={item.id} className="feedCard" style={{ padding: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 18,
                ...getCategoryStyle(item.category),
              }}
            >
              {getCategoryLabel(item.category)}
            </div>

            <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  }}
>
  <h2>{getTitle(item)}</h2>

  {item.pinned && (
    <Badge type="pinned" />
  )}

  {item.hot && (
    <Badge type="hot" />
  )}

  {item.featured && (
    <Badge type="featured" />
  )}
</div>

            <p
              style={{
                color: "#334155",
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                fontSize: 17,
              }}
            >
              {getContent(item).length > 240 ? `${getContent(item).slice(0, 240)}…` : getContent(item)}
            </p>

            <RichMediaBlocks blocks={item.media_blocks?.slice(0, 1) || null} />

            <Link href={`/${locale}/content/${item.id}`} className="content-card-detail-link">
              {t.detail}<ArrowRight size={16} />
            </Link>

            <div
              style={{
                marginTop: 22,
                paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              {new Date(item.created_at).toLocaleString()}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
