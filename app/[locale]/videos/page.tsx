"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, LibraryBig, PlayCircle, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import {
  ContentDirectory,
  DirectoryGrid,
  DirectoryState,
} from "@/components/ui/content-directory";

type VideoItem = {
  id: number;
  youtube_id: string;
  title: string;
  description: string;
  featured: boolean;
  created_at: string;
};

export default function VideosPage() {
  const locale = String(useParams().locale || "en");
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const copy =
    locale === "zh"
      ? {
          title: "视频课堂",
          intro: "免费、稳定的视频学习内容。",
          empty: "暂时还没有视频。",
          loading: "正在加载视频",
          featured: "精选",
          eyebrow: "学习视频",
          test: "HSK 中文水平测试",
          testCopy: "42 道题综合诊断 HSK 1–6 水平",
          beginCourse: "开始学习",
          beginTest: "开始测试",
        }
      : locale === "my"
        ? {
            title: "ဗီဒီယို သင်ခန်းစာ",
            intro: "အခမဲ့နှင့် တည်ငြိမ်သော ဗီဒီယို သင်ယူမှုများ။",
            empty: "ဗီဒီယို မရှိသေးပါ။",
            loading: "ဗီဒီယိုများ ရယူနေသည်",
            featured: "ရွေးချယ်ထားသည်",
            eyebrow: "သင်ယူမှု ဗီဒီယို",
            test: "HSK တရုတ်ဘာသာအဆင့် စစ်ဆေးမှု",
            testCopy: "မေးခွန်း ၄၂ ခုဖြင့် HSK အဆင့် ၁–၆ ကို စစ်ဆေးပါ",
            beginCourse: "စတင်လေ့လာရန်",
            beginTest: "စတင်စစ်ဆေးရန်",
          }
        : {
            title: "Video learning",
            intro: "Free, reliable video lessons and community resources.",
            empty: "No videos published yet.",
            loading: "Loading videos",
            featured: "Featured",
            eyebrow: "Learning library",
            test: "HSK Chinese placement test",
            testCopy: "Estimate HSK 1–6 with 42 diagnostic questions",
            beginCourse: "Start learning",
            beginTest: "Start test",
          };

  useEffect(() => {
    let active = true;
    supabase
      .from("videos")
      .select("id, youtube_id, title, description, featured, created_at")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setItems((data || []) as VideoItem[]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageContainer className="video-page">
      <PageIntro
        eyebrow={
          <>
            <Video size={18} />
            {copy.eyebrow}
          </>
        }
        title={copy.title}
        description={copy.intro}
      />
      <div className="video-feature-links">
        <Link className="hsk-video-banner" href={`/${locale}/videos/hsk/vocabulary?level=1`}>
          <span><BookOpen size={24} /></span>
          <div>
            <strong>{locale === "zh" ? "HSK 1–6 词汇卡片" : locale === "my" ? "HSK ၁–၆ ဝေါဟာရကတ်များ" : "HSK 1–6 vocabulary cards"}</strong>
            <p>{locale === "zh" ? "汉字、拼音、专业缅甸语解释与发音" : locale === "my" ? "တရုတ်စာလုံး၊ Pinyin၊ မြန်မာအဓိပ္ပာယ်နှင့် အသံထွက်" : "Characters, Pinyin, professional Burmese meanings and audio"}</p>
          </div>
          <b>{copy.beginCourse}<ArrowRight size={17} /></b>
        </Link>
        <Link className="hsk-video-banner" href={`/${locale}/videos/hsk`}>
          <span>
            <PlayCircle size={24} />
          </span>
          <div>
            <strong>
              {locale === "zh"
                ? "HSK 1–6 四技能课程"
                : locale === "my"
                  ? "HSK ၁–၆ 4Skill သင်တန်း"
                  : "HSK 1–6 four-skill courses"}
            </strong>
            <p>
              {locale === "zh"
                ? "听力、口语、阅读、书写、视频课与作业"
                : locale === "my"
                  ? "နားထောင်၊ ပြော၊ ဖတ်၊ ရေး၊ ဗီဒီယိုနှင့် အိမ်စာ"
                  : "Listening, speaking, reading, writing, video and homework"}
            </p>
          </div>
          <b>
            {copy.beginCourse}
            <ArrowRight size={17} />
          </b>
        </Link>
        <Link className="hsk-video-banner" href={`/${locale}/hsk-test`}>
          <span>
            <ClipboardCheck size={24} />
          </span>
          <div>
            <strong>{copy.test}</strong>
            <p>{copy.testCopy}</p>
          </div>
          <b>
            {copy.beginTest}
            <ArrowRight size={17} />
          </b>
        </Link>
        <Link className="hsk-video-banner" href={`/${locale}/knowledge`}>
          <span><LibraryBig size={24} /></span>
          <div>
            <strong>{locale === "zh" ? "课程中心" : locale === "my" ? "သင်တန်းစင်တာ" : "Course center"}</strong>
            <p>{locale === "zh" ? "免费与付费课程、作业、测验和学习进度" : locale === "my" ? "အခမဲ့နှင့် အခပေးသင်တန်း၊ အိမ်စာ၊ စစ်ဆေးမှုနှင့် တိုးတက်မှု" : "Free and paid courses, assignments, assessments and progress"}</p>
          </div>
          <b>{copy.beginCourse}<ArrowRight size={17} /></b>
        </Link>
      </div>
      <ContentDirectory>
        {loading ? (
          <DirectoryState kind="loading" title={copy.loading} />
        ) : items.length === 0 ? (
          <DirectoryState title={copy.empty} />
        ) : (
          <DirectoryGrid className="video-grid">
            {items.map((item) => (
              <article
                className="video-card"
                id={`video-${item.id}`}
                key={item.id}
              >
                <div className="video-player">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${item.youtube_id}?rel=0`}
                    title={item.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="video-card-copy">
                  {item.featured && <span>{copy.featured}</span>}
                  <h2>{item.title}</h2>
                  {item.description && <p>{item.description}</p>}
                  <ContentInteractions
                    type="video"
                    contentId={item.id}
                    locale={locale}
                    title={item.title}
                  />
                </div>
              </article>
            ))}
          </DirectoryGrid>
        )}
      </ContentDirectory>
    </PageContainer>
  );
}
