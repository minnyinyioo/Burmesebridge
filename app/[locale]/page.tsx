"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardCheck,
  Globe,
  GraduationCap,
  MessageCircleMore,
  Newspaper,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import HomeAds from "@/components/HomeAds";

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
type Course = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  description_my: string | null;
  description_zh: string | null;
  description_en: string | null;
  cover_url: string | null;
  level: string | null;
  skill: string | null;
  price: number;
  currency: string;
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
      explore: "သင်တန်းများ ကြည့်ရန်",
      test: "HSK အဆင့် စစ်ဆေးရန်",
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
      memberText:
        "နောက်ပိုင်းတွင် ပရီမီယံ သင်ခန်းစာများနှင့် အထူးအကြောင်းအရာများ ထည့်နိုင်သည်။",
      empty: "ထုတ်ပြန်ထားသော အချက်အလက် မရှိသေးပါ",
      services: "လိုအပ်သမျှကို တစ်နေရာတည်းတွင်",
      servicesSub:
        "သင်ယူခြင်းမှ အလုပ်အကိုင်နှင့် လူမှုအသိုင်းအဝိုင်းအထိ နေ့စဉ်အသုံးဝင်သော ဝန်ဆောင်မှုများ။",
      courses: "အကြံပြုသင်တန်းများ",
      allCourses: "သင်တန်းအားလုံး",
      courseOpen: "သင်တန်းကြည့်ရန်",
      free: "အခမဲ့",
      hskTitle: "သင့်တရုတ်ဘာသာအဆင့်ကို သိပါ",
      hskText:
        "နားထောင်၊ ဖတ်၊ ရေး၊ ဝေါဟာရနှင့် သဒ္ဒါ စစ်ဆေးမှုမှ သင့်တော်သော HSK အဆင့်ကို အကြံပြုပေးသည်။",
      hskAction: "အခမဲ့စမ်းသပ်ရန်",
      safe: "စစ်ဆေးထားသော အချက်အလက်နှင့် လုံခြုံရေးအခြေခံမူများ",
      safeText:
        "အလုပ်ရှာဖွေသူများအတွက် လုံခြုံရေးသတိပေးချက်၊ report စနစ်နှင့် ရှင်းလင်းသော platform စည်းမျဉ်းများ။",
      safety: "လုံခြုံရေးစင်တာ",
    },
    zh: {
      heroBadge: "泰国 · 缅甸同胞专属平台",
      heroTitle: "劳务、新闻、汉语学习与社区",
      heroSub: "BurmeseBridge 是面向缅甸用户的学习、求职、资讯与社区平台。",
      explore: "浏览课程",
      test: "测试 HSK 水平",
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
      services: "一个平台，连接学习与生活",
      servicesSub:
        "围绕缅甸用户在泰国的真实需求，提供学习、求职、资讯与社区服务。",
      courses: "精选课程",
      allCourses: "查看全部课程",
      courseOpen: "查看课程",
      free: "免费",
      hskTitle: "先了解你的中文水平",
      hskText:
        "通过听力、阅读、书写、词汇与语法测试，获得适合你的 HSK 学习建议。",
      hskAction: "免费开始测试",
      safe: "信息透明，安全优先",
      safeText:
        "提供求职安全提醒、举报机制和清晰的平台规则，帮助用户识别风险。",
      safety: "进入安全中心",
    },
    en: {
      heroBadge: "For Myanmar nationals in Thailand",
      heroTitle: "Jobs, News, Chinese Learning and Community",
      heroSub:
        "BurmeseBridge is a learning, job, news and community platform for Myanmar users.",
      explore: "Explore courses",
      test: "Check HSK level",
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
      memberText:
        "Premium lessons, member content and resource library can be added later.",
      empty: "No published content yet",
      services: "Learning and daily life, connected",
      servicesSub:
        "Practical learning, jobs, information and community services built around Myanmar users in Thailand.",
      courses: "Featured courses",
      allCourses: "View all courses",
      courseOpen: "View course",
      free: "Free",
      hskTitle: "Know your Chinese level first",
      hskText:
        "Assess listening, reading, writing, vocabulary and grammar, then get an HSK learning recommendation.",
      hskAction: "Start free assessment",
      safe: "Transparent information, safety first",
      safeText:
        "Jobseeker guidance, reporting tools and clear platform rules help users recognize risk.",
      safety: "Safety center",
    },
  };

  const t = text[locale as keyof typeof text] || text.en;
  const [items, setItems] = useState<HomeItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  async function loadItems() {
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, category, pinned, featured, hot, title_my, title_zh, title_en, content_my, content_zh, content_en, created_at",
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
        () => loadItems(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    supabase
      .from("knowledge_products")
      .select(
        "id,title_my,title_zh,title_en,description_my,description_zh,description_en,cover_url,level,skill,price,currency",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setCourses((data || []) as Course[]));
  }, []);

  function getTitle(item: HomeItem) {
    if (locale === "zh")
      return item.title_zh || item.title_my || item.title_en || "";
    if (locale === "en")
      return item.title_en || item.title_my || item.title_zh || "";
    return item.title_my || item.title_zh || item.title_en || "";
  }

  function getContent(item: HomeItem) {
    if (locale === "zh")
      return item.content_zh || item.content_my || item.content_en || "";
    if (locale === "en")
      return item.content_en || item.content_my || item.content_zh || "";
    return item.content_my || item.content_zh || item.content_en || "";
  }
  function courseText(item: Course, field: "title" | "description") {
    const row = item as unknown as Record<string, string | null>;
    const order =
      locale === "zh"
        ? ["zh", "my", "en"]
        : locale === "en"
          ? ["en", "my", "zh"]
          : ["my", "zh", "en"];
    return order.map((s) => row[`${field}_${s}`]).find(Boolean) || "";
  }

  const pinnedItems = items.filter((item) => item.pinned).slice(0, 3);
  const hotJobs = items
    .filter((item) => item.category === "jobs" && item.hot)
    .slice(0, 3);
  const featuredLearn = items
    .filter((item) => item.category === "learn" && item.featured)
    .slice(0, 3);
  const latestNews = items
    .filter((item) => item.category === "news")
    .slice(0, 3);

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
            <Link href={`/${locale}/knowledge`} className="home-primary-button">
              <BookOpen size={17} />
              {t.explore}
            </Link>
            <Link
              href={`/${locale}/hsk-test`}
              className="home-secondary-button"
            >
              <ClipboardCheck size={17} />
              {t.test}
            </Link>
          </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <span>မြန်မာ</span>
          <span>中文</span>
          <span>TH</span>
          <div>
            <Globe size={46} />
          </div>
        </div>
      </section>
      <HomeAds />

      <section className="home-services">
        <div className="home-section-intro">
          <span>{t.services}</span>
          <h2>{t.services}</h2>
          <p>{t.servicesSub}</p>
        </div>
        <div className="home-service-grid">
          <ServiceCard
            icon={<GraduationCap />}
            title={t.learn}
            text={
              locale === "zh"
                ? "HSK 课程、四技能训练、作业与学习进度"
                : locale === "my"
                  ? "HSK သင်တန်း၊ ကျွမ်းကျင်မှု ၄ မျိုး၊ အိမ်စာနှင့် တိုးတက်မှု"
                  : "HSK courses, four-skill practice, assignments and progress"
            }
            href={`/${locale}/knowledge`}
          />
          <ServiceCard
            icon={<BriefcaseBusiness />}
            title={t.jobs}
            text={
              locale === "zh"
                ? "工作信息、求职安全提醒与举报入口"
                : locale === "my"
                  ? "အလုပ်အကိုင်၊ လုံခြုံရေးသတိပေးချက်နှင့် report"
                  : "Job listings, safety guidance and reporting"
            }
            href={`/${locale}/jobs`}
          />
          <ServiceCard
            icon={<Newspaper />}
            title={t.news}
            text={
              locale === "zh"
                ? "面向缅甸用户的重要资讯与实用内容"
                : locale === "my"
                  ? "မြန်မာအသုံးပြုသူများအတွက် သတင်းနှင့် အသုံးဝင်သောအချက်အလက်"
                  : "News and practical information for Myanmar users"
            }
            href={`/${locale}/news`}
          />
          <ServiceCard
            icon={<MessageCircleMore />}
            title={t.community}
            text={
              locale === "zh"
                ? "交流经验、提问并获得社区回应"
                : locale === "my"
                  ? "အတွေ့အကြုံမျှဝေ၊ မေးခွန်းမေးပြီး တုံ့ပြန်မှုရယူ"
                  : "Share experience, ask questions and connect"
            }
            href={`/${locale}/forum`}
          />
        </div>
      </section>

      <section className="home-feature-band">
        <div>
          <span>
            <Sparkles size={16} />
            {t.hskTitle}
          </span>
          <h2>{t.hskTitle}</h2>
          <p>{t.hskText}</p>
          <Link href={`/${locale}/hsk-test`}>
            {t.hskAction}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="home-hsk-levels" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <span key={level}>
              HSK <b>{level}</b>
            </span>
          ))}
        </div>
      </section>

      {courses.length ? (
        <ContentSection
          title={t.courses}
          icon={<PlayCircle size={20} />}
          action={{ label: t.allCourses, href: `/${locale}/knowledge` }}
        >
          {courses.map((course) => (
            <article className="home-course-card" key={course.id}>
              <Link
                href={`/${locale}/knowledge/${course.id}`}
                className="home-course-cover"
              >
                {course.cover_url ? (
                  <span
                    style={{ backgroundImage: `url(${course.cover_url})` }}
                  />
                ) : (
                  <BookOpen size={34} />
                )}
                <i>
                  <PlayCircle size={18} />
                </i>
              </Link>
              <div>
                <div className="home-course-tags">
                  {course.level ? <span>{course.level}</span> : null}
                  {course.skill ? <span>{course.skill}</span> : null}
                </div>
                <h3>{courseText(course, "title")}</h3>
                <p>{courseText(course, "description")}</p>
                <footer>
                  <b>
                    {Number(course.price) === 0
                      ? t.free
                      : `${Number(course.price).toLocaleString()} ${course.currency}`}
                  </b>
                  <Link href={`/${locale}/knowledge/${course.id}`}>
                    {t.courseOpen}
                    <ChevronRight size={15} />
                  </Link>
                </footer>
              </div>
            </article>
          ))}
        </ContentSection>
      ) : null}

      {pinnedItems.length ? (
        <ContentSection title={t.pinned} icon={<ShieldCheck size={20} />}>
          {pinnedItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/content/${item.id}`}
              action={t.readMore}
            />
          ))}
        </ContentSection>
      ) : null}

      {hotJobs.length ? (
        <ContentSection title={t.hotJobs} icon={<TrendingUp size={20} />}>
          {hotJobs.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/content/${item.id}`}
              action={t.go}
            />
          ))}
        </ContentSection>
      ) : null}

      {featuredLearn.length ? (
        <ContentSection title={t.featuredLearn} icon={<Sparkles size={20} />}>
          {featuredLearn.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/content/${item.id}`}
              action={t.go}
            />
          ))}
        </ContentSection>
      ) : null}

      {latestNews.length ? (
        <ContentSection title={t.latestNews} icon={<Newspaper size={20} />}>
          {latestNews.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              title={getTitle(item)}
              content={getContent(item)}
              href={`/${locale}/content/${item.id}`}
              action={t.readMore}
            />
          ))}
        </ContentSection>
      ) : null}

      <section className="home-trust">
        <div>
          <ShieldCheck size={24} />
          <span>
            <b>{t.safe}</b>
            <p>{t.safeText}</p>
          </span>
        </div>
        <Link href={`/${locale}/safety`}>
          {t.safety}
          <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
function ContentSection({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <section>
      <div className="home-section-head">
        <span>{icon}</span>
        <h2>{title}</h2>
        {action ? (
          <Link href={action.href}>
            {action.label}
            <ArrowRight size={15} />
          </Link>
        ) : null}
      </div>
      <div className="home-content-grid">{children}</div>
    </section>
  );
}

function ServiceCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link className="home-service-card" href={href}>
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <ChevronRight size={18} />
    </Link>
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
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
