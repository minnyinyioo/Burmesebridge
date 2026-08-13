"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import RichMediaBlocks, { type MediaBlock } from "@/components/RichMediaBlocks";
type Item = {
  id: number;
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

export default function JobsPage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const t = {
    my: { title: "အလုပ်အကိုင်", empty: "အလုပ်အကိုင် အချက်အလက် မရှိသေးပါ", detail: "အသေးစိတ်ဖတ်ရန်" },
    zh: { title: "工作信息", empty: "暂无工作信息", detail: "查看详情" },
    en: { title: "Jobs", empty: "No jobs yet", detail: "Read more" },
  }[locale as "my" | "zh" | "en"] || {
    title: "Jobs",
    empty: "No jobs yet",
    detail: "Read more",
  };

  const [items, setItems] = useState<Item[]>([]);

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
      .select("id, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, media_blocks, created_at")
      .eq("status", "published")
      .eq("category", "jobs")
      .order("pinned", { ascending: false })
      .order("hot", { ascending: false })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setItems((data || []) as Item[]);
  }

  function getTitle(item: Item) {
    if (locale === "zh") return item.title_zh || item.title_my || item.title_en || "";
    if (locale === "en") return item.title_en || item.title_my || item.title_zh || "";
    return item.title_my || item.title_zh || item.title_en || "";
  }

  function getContent(item: Item) {
    if (locale === "zh") return item.content_zh || item.content_my || item.content_en || "";
    if (locale === "en") return item.content_en || item.content_my || item.content_zh || "";
    return item.content_my || item.content_zh || item.content_en || "";
  }

  return (
    <main className="feedShell">
      <h1 className="feedTitle">{t.title}</h1>

      <div style={{ display: "grid", gap: 18 }}>
        {items.length === 0 && <div className="feedCard">{t.empty}</div>}

        {items.map((item) => (
          <article key={item.id} className="feedCard">
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
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
              {getContent(item).length > 240 ? `${getContent(item).slice(0, 240)}…` : getContent(item)}
            </p>
            <RichMediaBlocks blocks={item.media_blocks?.slice(0, 1) || null} />
            <Link href={`/${locale}/content/${item.id}`} className="content-card-detail-link">
              {t.detail}<ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
