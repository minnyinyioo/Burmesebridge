"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
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
    my: { title: "အလုပ်အကိုင်", empty: "အလုပ်အကိုင် အချက်အလက် မရှိသေးပါ", detail: "အသေးစိတ်ဖတ်ရန်", safetyTitle:"အလုပ်ရှာဖွေသူ လုံခြုံရေး", safety:"BurmeseBridge သည် အလုပ်ရှာဖွေရေးအေဂျင်စီ မဟုတ်ပါ။ ပိုက်ဆံကြိုတောင်းခြင်း၊ passport/ID သိမ်းခြင်း၊ ခြိမ်းခြောက်ခြင်း၊ သွားလာခွင့်ကန့်သတ်ခြင်း သို့မဟုတ် ဖော်ပြချက်နှင့်မတူသောအလုပ်ကို မယုံကြည်ပါနှင့်။ အလုပ်ရှင်နှင့် စာချုပ်ကို ကိုယ်တိုင်စစ်ဆေးပြီး သံသယရှိပါက report လုပ်ပါ။" },
    zh: { title: "工作信息", empty: "暂无工作信息", detail: "查看详情", safetyTitle:"求职安全提醒", safety:"BurmeseBridge 不是劳务中介，也不担保职位真实性。不要支付不明招聘费，不要交出护照或身份证；遇到限制人身自由、威胁、强迫劳动、实际工作与描述不符或疑似人口贩卖，请立即停止联系并向平台及当地执法机构举报。" },
    en: { title: "Jobs", empty: "No jobs yet", detail: "Read more", safetyTitle:"Jobseeker safety", safety:"BurmeseBridge is not a recruitment agency and does not guarantee listings. Do not pay unexplained recruitment fees or surrender passports/IDs. Stop and report threats, restricted movement, forced labour, materially different work, or suspected human trafficking to the platform and local authorities." },
  }[locale as "my" | "zh" | "en"] || {
    title: "Jobs",
    empty: "No jobs yet",
    detail: "Read more", safetyTitle:"Jobseeker safety", safety:"Verify employers independently. Never pay unexplained fees or surrender identity documents. Report suspected trafficking, coercion, or forced labour.",
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

      <aside className="job-safety-notice" role="note">
        <ShieldAlert aria-hidden="true" />
        <div><strong>{t.safetyTitle}</strong><p>{t.safety}</p><Link href={`/${locale}/terms`}>{locale === "zh" ? "查看招聘条款" : locale === "my" ? "အလုပ်ခန့်အပ်မှု စည်းမျဉ်းကို ကြည့်ရန်" : "Read recruitment terms"} <ArrowRight size={14} /></Link></div>
      </aside>

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
