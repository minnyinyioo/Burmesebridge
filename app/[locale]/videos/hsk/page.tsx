"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Headphones,
  Mic2,
  PenLine,
  BookOpenText,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock3,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { hskCourses, hskSkills, type HskSkill } from "@/lib/hskCourses";
import { PageContainer, PageIntro } from "@/components/ui/page-container";
import { supabase } from "@/lib/supabase";

type PublishedCourse = { id: number; catalog_key: string | null };
type CourseMetric = {
  product_id: number;
  lesson_count: number;
  learner_count: number;
  completion_rate: number;
};

const icons = {
  listening: Headphones,
  speaking: Mic2,
  reading: BookOpenText,
  writing: PenLine,
};
export default function HskCourseLibrary() {
  const locale = String(useParams().locale || "my");
  const zh = locale === "zh";
  const my = locale === "my";
  const labels: Record<HskSkill, string> = zh
    ? { listening: "听力", speaking: "口语", reading: "阅读", writing: "书写" }
    : my
      ? {
          listening: "နားထောင်ခြင်း",
          speaking: "ပြောဆိုခြင်း",
          reading: "ဖတ်ရှုခြင်း",
          writing: "ရေးသားခြင်း",
        }
      : {
          listening: "Listening",
          speaking: "Speaking",
          reading: "Reading",
          writing: "Writing",
        };
  const title = zh
    ? "HSK 1–6 四技能课程"
    : my
      ? "HSK ၁–၆ ဘာသာစကားစွမ်းရည် လေးမျိုး"
      : "HSK 1–6 four-skill courses";
  const intro = zh
    ? "按等级系统学习听、说、读、写。课程按已授权资源提供视频或互动音频，并包含分级练习、作业和进度记录。"
    : my
      ? "အဆင့်အလိုက် နားထောင်၊ ပြော၊ ဖတ်၊ ရေး စနစ်တကျ လေ့လာပါ။ ခွင့်ပြုချက်ရရင်းမြစ်အလိုက် ဗီဒီယို သို့မဟုတ် အပြန်အလှန်အသံ၊ လေ့ကျင့်ခန်း၊ အိမ်စာနှင့် တိုးတက်မှုမှတ်တမ်း ပါဝင်သည်။"
      : "Structured listening, speaking, reading and writing with licensed video or interactive audio, graded practice, assignments and progress tracking.";
  const [publishedMap, setPublishedMap] = useState<
    Map<string | null, PublishedCourse>
  >(new Map());
  const [metricMap, setMetricMap] = useState<Map<number, CourseMetric>>(
    new Map(),
  );
  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase
        .from("knowledge_products")
        .select("id,catalog_key")
        .eq("status", "published")
        .like("catalog_key", "hsk-%"),
      supabase.rpc("get_public_knowledge_course_metrics"),
    ]).then(([productsResult, metricsResult]) => {
      if (!active) return;
      setPublishedMap(
        new Map(
          ((productsResult.data || []) as PublishedCourse[]).map((item) => [
            item.catalog_key,
            item,
          ]),
        ),
      );
      setMetricMap(
        new Map(
          ((metricsResult.data || []) as CourseMetric[]).map((item) => [
            item.product_id,
            item,
          ]),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <PageContainer className="hsk-library">
      <PageIntro
        eyebrow={
          <>
            <BookOpenText size={18} />
            {zh ? "课程中心" : my ? "သင်တန်းစင်တာ" : "Course center"}
          </>
        }
        title={title}
        description={intro}
      />
      <aside>
        <ShieldCheck size={18} />
        {zh
          ? "仅采用许可清晰、可追溯来源的开放学习资源。"
          : my
            ? "လိုင်စင်ရှင်းလင်းပြီး ရင်းမြစ်စစ်ဆေးနိုင်သော Open Educational Resources များကိုသာ အသုံးပြုသည်။"
            : "Only traceable learning resources with clear reuse terms are used."}
      </aside>
      <Link className="hsk-vocabulary-entry" href={`/${locale}/videos/hsk/vocabulary`}>
        <div><BookOpenText size={22}/><span><b>{zh?"学习完整 HSK 词库":my?"HSK ဝေါဟာရအပြည့်အစုံ လေ့လာရန်":"Study the complete HSK vocabulary"}</b><small>{zh?"六级全量词条 · 搜索 · 拼音 · 发音":my?"အဆင့်ခြောက်ဆင့် · ရှာဖွေ · Pinyin · အသံထွက်":"All six levels · search · pinyin · pronunciation"}</small></span></div><ArrowRight size={19}/>
      </Link>
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <section key={level}>
          <div className="hsk-level-title">
            <b>HSK {level}</b>
            <span>
              {zh
                ? "真实课程数据"
                : my
                  ? "သင်တန်းအချက်အလက်အမှန်"
                  : "Live course data"}
            </span>
          </div>
          <div>
            {hskSkills.map((skill) => {
              const course = hskCourses.find(
                (item) => item.level === level && item.skill === skill,
              )!;
              const Icon = icons[skill];
              const publishedCourse = publishedMap.get(`hsk-${level}-${skill}`);
              const metric = publishedCourse
                ? metricMap.get(publishedCourse.id)
                : null;
              return (
                <Link
                  href={
                    publishedCourse
                      ? `/${locale}/knowledge/${publishedCourse.id}`
                      : "#"
                  }
                  aria-disabled={!publishedCourse}
                  className={!publishedCourse ? "is-preparing" : ""}
                  key={skill}
                >
                  <div className="hsk-card-head">
                    <span>
                      <Icon size={22} />
                    </span>
                    <b>HSK {level}</b>
                  </div>
                  <strong>{labels[skill]}</strong>
                  <p>
                    {
                      course.focus[
                        locale === "zh" ? "zh" : locale === "my" ? "my" : "en"
                      ]
                    }
                  </p>
                  <div className="hsk-card-stats">
                    {publishedCourse ? (
                      <>
                        <small>
                          <Clock3 size={13} />
                          {metric?.lesson_count || 0}
                        </small>
                        <small>
                          <Users size={13} />
                          {metric?.learner_count || 0}
                        </small>
                        <small>
                          <ChartNoAxesColumnIncreasing size={13} />
                          {metric?.completion_rate || 0}%
                        </small>
                      </>
                    ) : (
                      <small>
                        {zh
                          ? "课程准备中"
                          : my
                            ? "သင်တန်း ပြင်ဆင်နေသည်"
                            : "Course in preparation"}
                      </small>
                    )}
                  </div>
                  <span>
                    {publishedCourse
                      ? zh
                        ? "查看课程"
                        : my
                          ? "သင်တန်းကြည့်ရန်"
                          : "View course"
                      : zh
                        ? "尚未发布"
                        : my
                          ? "မထုတ်ဝေရသေး"
                          : "Not published"}
                    <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </PageContainer>
  );
}
