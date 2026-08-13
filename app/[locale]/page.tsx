"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Crown,
  GraduationCap,
  Globe,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";

type Category = "news" | "jobs" | "learn";

type HomeItem = {
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
};

export default function HomePage() {
  const params = useParams();
  const locale = String(params.locale || "my");

  const text = {
    my: {
      heroBadge: "ထိုင်းနိုင်ငံရှိ မြန်မာများအတွက်",
      heroTitle: "အလုပ်၊ သတင်း၊ တရုတ်စာ နှင့် လူမှုအသိုင်းအဝိုင်း",
      heroSub:
        "BurmeseBridge သည် မြန်မာများအတွက် သင်ယူရေး၊ အလုပ်အကိုင်နှင့် သတင်းအချက်အလက် ပလက်ဖောင်းဖြစ်သည်။",
      register: "အခမဲ့ စာရင်းသွင်းရန်",
      member: "အသင်းဝင်",
      news: "သတင်း",
      jobs: "အလုပ်အကိုင်",
      learn: "လေ့လာရန်",
      forum: "ဖိုရမ်",
      checkin: "ချက်အင်",
      community: "လူမှုအသိုင်းအဝိုင်း",
      pinned: "ထိပ်ဆုံး အချက်အလက်",
      hotJobs: "လူကြိုက်များသော အလုပ်",
      featuredLearn: "အကြံပြု လေ့လာရေး",
      latestNews: "နောက်ဆုံးသတင်း",
      readMore: "ဆက်ဖတ်ရန်",
      go: "ဝင်ကြည့်ရန်",
      checkinTitle: "နေ့စဉ် ချက်အင်",
      checkinText: "နေ့စဉ် ဝင်ရောက်ပြီး အမှတ်စုဆောင်းပါ",
      memberTitle: "အသင်းဝင် အစီအစဉ်",
      memberText: "နောက်ပိုင်းတွင် ပရီမီယံ သင်ခန်းစာများနှင့် အထူးအကြောင်းအရာများ ထည့်နိုင်သည်။",
      empty: "ထုတ်ပြန်ထားသော အချက်အလက် မရှိသေးပါ",
    },
    zh: {
      heroBadge: "泰国 · 缅甸同胞专属平台",
      heroTitle: "劳务、新闻、汉语学习与社区",
      heroSub: "BurmeseBridge 是面向缅甸用户的学习、求职、资讯与社区平台。",
      register: "免费注册",
      member: "了解会员",
      news: "新闻",
      jobs: "工作",
      learn: "学习",
      forum: "论坛",
      checkin: "签到",
      community: "社区",
      pinned: "置顶内容",
      hotJobs: "热门工作",
      featuredLearn: "推荐学习",
      latestNews: "最新新闻",
      readMore: "阅读全文",
      go: "进入",
      checkinTitle: "每日签到",
      checkinText: "每天签到，积累积分与学习记录",
      memberTitle: "会员体系预留",
      memberText: "后期可接入付费课程、会员内容和高级资料库。",
      empty: "暂无发布内容",
    },
    en: {
      heroBadge: "For Myanmar nationals in Thailand",
      heroTitle: "Jobs, News, Chinese Learning and Community",
      heroSub:
        "BurmeseBridge is a learning, job, news and community platform for Myanmar users.",
      register: "Sign up free",
      member: "Membership",
      news: "News",
      jobs: "Jobs",
      learn: "Learn",
      forum: "Forum",
      checkin: "Check-in",
      community: "Community",
      pinned: "Pinned Content",
      hotJobs: "Hot Jobs",
      featuredLearn: "Featured Learning",
      latestNews: "Latest News",
      readMore: "Read more",
      go: "Open",
      checkinTitle: "Daily Check-in",
      checkinText: "Check in daily and collect points.",
      memberTitle: "Membership Ready",
      memberText: "Premium lessons, member content and resource library can be added later.",
      empty: "No published content yet",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;
  const [items, setItems] = useState<HomeItem[]>([]);

  async function loadItems() {
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, category, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, created_at"
      )
      .eq("status", "published")
      .order("pinned", { ascending: false })
      .order("hot", { ascending: false })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.log(error.message);
      return;
    }

    setItems((data || []) as HomeItem[]);
  }

  useEffect(() => {
    // Initial remote data synchronization; state updates happen after Supabase resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();

    const channel = supabase
      .channel("home-news-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        () => loadItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function getTitle(item: HomeItem) {
    if (locale === "zh") return item.title_zh || item.title_my || item.title_en || "";
    if (locale === "en") return item.title_en || item.title_my || item.title_zh || "";
    return item.title_my || item.title_zh || item.title_en || "";
  }

  function getContent(item: HomeItem) {
    if (locale === "zh") return item.content_zh || item.content_my || item.content_en || "";
    if (locale === "en") return item.content_en || item.content_my || item.content_zh || "";
    return item.content_my || item.content_zh || item.content_en || "";
  }

  const pinnedItems = items.filter((item) => item.pinned).slice(0, 3);
  const hotJobs = items.filter((item) => item.category === "jobs" && item.hot).slice(0, 3);
  const featuredLearn = items.filter((item) => item.category === "learn" && item.featured).slice(0, 3);
  const latestNews = items.filter((item) => item.category === "news").slice(0, 3);

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
        <div className="home-eyebrow">
          <Globe size={15} />
          {t.heroBadge}
        </div>

        <h1>{t.heroTitle}</h1>
        <p>{t.heroSub}</p>

        <div className="home-hero-actions">
          <Link href={`/${locale}/login`} className="home-primary-button">
            <Users size={16} />
            {t.register}
          </Link>

          <Link href={`/${locale}/learn`} className="home-secondary-button">
            <Crown size={16} />
            {t.member}
          </Link>
        </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <span>မြန်မာ</span><span>中文</span><span>TH</span>
          <div><Globe size={46} /></div>
        </div>
      </section>

      <section className="home-quick-grid" aria-label="Quick links">
        <HomeLink href={`/${locale}/learn`} icon={<GraduationCap />} label={t.learn} />
        <HomeLink href={`/${locale}/jobs`} icon={<Briefcase />} label={t.jobs} />
        <HomeLink href={`/${locale}/news`} icon={<Newspaper />} label={t.news} />
        <HomeLink href={`/${locale}/forum`} icon={<MessageSquare />} label={t.forum} />
        <HomeLink href={`/${locale}/checkin`} icon={<CalendarCheck />} label={t.checkin} />
        <HomeLink href={`/${locale}/forum`} icon={<Users />} label={t.community} />
      </section>

      <ContentSection title={t.pinned} icon={<ShieldCheck size={20} />}>
        {pinnedItems.length === 0 ? (
          <Empty text={t.empty} />
        ) : (
          pinnedItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/${item.category || "news"}`}
              action={t.readMore}
            />
          ))
        )}
      </ContentSection>

      <ContentSection title={t.hotJobs} icon={<TrendingUp size={20} />}>
        {hotJobs.length === 0 ? (
          <Empty text={t.empty} />
        ) : (
          hotJobs.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/jobs`}
              action={t.go}
            />
          ))
        )}
      </ContentSection>

      <ContentSection title={t.featuredLearn} icon={<Sparkles size={20} />}>
        {featuredLearn.length === 0 ? (
          <Empty text={t.empty} />
        ) : (
          featuredLearn.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/learn`}
              action={t.go}
            />
          ))
        )}
      </ContentSection>

      <ContentSection title={t.latestNews} icon={<Newspaper size={20} />}>
        {latestNews.length === 0 ? (
          <Empty text={t.empty} />
        ) : (
          latestNews.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/news`}
              action={t.readMore}
            />
          ))
        )}
      </ContentSection>

      <section className="home-support-grid">
        <div className="feedCard">
          <div className="small-head">
            <CalendarCheck size={22} color="#c8a65b" />
            <strong>{t.checkinTitle}</strong>
          </div>
          <p className="muted-copy">{t.checkinText}</p>
          <Link href={`/${locale}/checkin`} className="text-link">
            {t.go}
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="feedCard">
          <div className="small-head">
            <Crown size={22} color="#c8a65b" />
            <strong>{t.memberTitle}</strong>
          </div>
          <p className="muted-copy">{t.memberText}</p>
          <Link href={`/${locale}/learn`} className="text-link">
            {t.go}
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
function HomeLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="home-quick-link">
      <span>{icon}</span>
      <strong>{label}</strong>
      <ChevronRight size={16} />
    </Link>
  );
}

function ContentSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="home-section-head">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="home-content-grid">{children}</div>
    </section>
  );
}

function ContentCard({
  item,
  title,
  content,
  href,
  action,
}: {
  item: HomeItem;
  title: string;
  content: string;
  href: string;
  action: string;
}) {
  return (
    <article className="feedCard">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h3>{title}</h3>
        {item.pinned && <Badge type="pinned" />}
        {item.hot && <Badge type="hot" />}
        {item.featured && <Badge type="featured" />}
      </div>

      <p className="home-card-copy">
        {content.length > 160 ? `${content.slice(0, 160)}...` : content}
      </p>

      <Link href={href} className="text-link">
        {action}
        <ChevronRight size={15} />
      </Link>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="feedCard home-empty">
      {text}
    </div>
  );
}

