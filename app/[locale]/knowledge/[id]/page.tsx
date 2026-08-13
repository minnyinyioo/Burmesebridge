"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";
type Product = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  description_my: string | null;
  description_zh: string | null;
  description_en: string | null;
  price: number;
  currency: string;
};
type Lesson = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
  free_preview: boolean;
};
type LessonContent = {
  lesson_id: number;
  body_my: string | null;
  body_zh: string | null;
  body_en: string | null;
  youtube_id: string | null;
};
export default function CoursePage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const id = Number(params.id);
  const copy =
    locale === "zh"
      ? {
          back: "返回知识课堂",
          lessons: "课程目录",
          preview: "免费试看",
          locked: "购买后解锁",
          empty: "课程还没有添加课时",
          missing: "课程不存在或已下架",
          complete: "标记完成",
          completed: "已完成",
          progress: "学习进度",
          loginProgress: "登录后可保存学习进度",
        }
      : locale === "my"
        ? {
            back: "သင်တန်းများသို့",
            lessons: "သင်ခန်းစာများ",
            preview: "အခမဲ့အစမ်း",
            locked: "ဝယ်ပြီးမှ ဖွင့်မည်",
            empty: "သင်ခန်းစာ မရှိသေးပါ",
            missing: "သင်တန်းမရှိပါ",
            complete: "ပြီးဆုံးကြောင်း မှတ်မည်",
            completed: "ပြီးဆုံး",
            progress: "သင်ယူမှု တိုးတက်မှု",
            loginProgress: "အကောင့်ဝင်ပြီး တိုးတက်မှု သိမ်းပါ",
          }
        : {
            back: "Back to courses",
            lessons: "Course lessons",
            preview: "Free preview",
            locked: "Unlock after purchase",
            empty: "No lessons have been added",
            missing: "Course not found or offline",
            complete: "Mark complete",
            completed: "Completed",
            progress: "Course progress",
            loginProgress: "Sign in to save progress",
          };
  const [product, setProduct] = useState<Product | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const load = useCallback(async () => {
    if (!Number.isSafeInteger(id) || id < 1) {
      setLoaded(true);
      return;
    }
    const [
      { data: p },
      { data: l },
      { data: c },
      {
        data: { user },
      },
    ] = await Promise.all([
      supabase
        .from("knowledge_products")
        .select(
          "id,title_my,title_zh,title_en,description_my,description_zh,description_en,price,currency",
        )
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle(),
      supabase
        .from("knowledge_lessons")
        .select("id,title_my,title_zh,title_en,position,free_preview")
        .eq("product_id", id)
        .eq("status", "published")
        .order("position")
        .order("id"),
      supabase
        .from("knowledge_lesson_content")
        .select("lesson_id,body_my,body_zh,body_en,youtube_id"),
      supabase.auth.getUser(),
    ]);
    setProduct(p as Product | null);
    setLessons((l || []) as Lesson[]);
    setContents((c || []) as LessonContent[]);
    setUserId(user?.id || null);
    if (user) {
      const { data: progress } = await supabase
        .from("knowledge_lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);
      setCompleted((progress || []).map((item) => item.lesson_id));
    }
    setLoaded(true);
  }, [id]);
  useEffect(() => {
    // Initial Supabase request; updates happen after the promise resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function toggleComplete(lessonId: number) {
    if (!userId) return;
    const isCompleted = completed.includes(lessonId);
    if (isCompleted) {
      const { error } = await supabase
        .from("knowledge_lesson_progress")
        .delete()
        .eq("lesson_id", lessonId)
        .eq("user_id", userId);
      if (!error)
        setCompleted((current) => current.filter((id) => id !== lessonId));
    } else {
      const { error } = await supabase
        .from("knowledge_lesson_progress")
        .upsert({
          lesson_id: lessonId,
          user_id: userId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      if (!error) setCompleted((current) => [...current, lessonId]);
    }
  }
  const localize = (
    item: Product | Lesson | LessonContent,
    field: "title" | "description" | "body",
  ) => {
    const row = item as unknown as Record<string, string | null>;
    const values =
      locale === "zh"
        ? [row[`${field}_zh`], row[`${field}_my`], row[`${field}_en`]]
        : locale === "en"
          ? [row[`${field}_en`], row[`${field}_my`], row[`${field}_zh`]]
          : [row[`${field}_my`], row[`${field}_zh`], row[`${field}_en`]];
    return values.find(Boolean) || "";
  };
  if (!loaded)
    return (
      <main className="course-detail">
        <div className="feedCard">…</div>
      </main>
    );
  if (!product)
    return (
      <main className="course-detail">
        <Link href={`/${locale}/knowledge`} className="course-back">
          <ArrowLeft size={17} />
          {copy.back}
        </Link>
        <div className="feedCard">{copy.missing}</div>
      </main>
    );
  return (
    <main className="course-detail">
      <Link href={`/${locale}/knowledge`} className="course-back">
        <ArrowLeft size={17} />
        {copy.back}
      </Link>
      <header>
        <div>
          <span>
            {Number(product.price) === 0
              ? "Free"
              : `${Number(product.price).toLocaleString()} ${product.currency}`}
          </span>
          <h1>{localize(product, "title")}</h1>
          <p>{localize(product, "description")}</p>
        </div>
      </header>
      <h2 className="course-section-title">{copy.lessons}</h2>
      <div className="course-progress">
        <div>
          <strong>{copy.progress}</strong>
          <span>
            {lessons.length
              ? Math.round(
                  (completed.filter((item) =>
                    lessons.some((lesson) => lesson.id === item),
                  ).length /
                    lessons.length) *
                    100,
                )
              : 0}
            %
          </span>
        </div>
        <div>
          <i
            style={{
              width: `${lessons.length ? (completed.filter((item) => lessons.some((lesson) => lesson.id === item)).length / lessons.length) * 100 : 0}%`,
            }}
          />
        </div>
        {!userId && <small>{copy.loginProgress}</small>}
      </div>
      <div className="lesson-list">
        {lessons.length === 0 && <div className="feedCard">{copy.empty}</div>}
        {lessons.map((lesson, index) => {
          const content = contents.find((item) => item.lesson_id === lesson.id);
          return (
            <article
              className={`lesson-card ${content ? "" : "locked"}`}
              key={lesson.id}
            >
              <div className="lesson-number">{index + 1}</div>
              <div className="lesson-main">
                <div className="lesson-heading">
                  <h3>{localize(lesson, "title")}</h3>
                  {lesson.free_preview && (
                    <span>
                      <PlayCircle size={14} />
                      {copy.preview}
                    </span>
                  )}
                </div>
                {content ? (
                  <>
                    <strong className="lesson-access">
                      <CheckCircle2 size={16} />
                      {lesson.free_preview ? copy.preview : "Unlocked"}
                    </strong>
                    {content.youtube_id && (
                      <div className="rich-video-frame">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${content.youtube_id}?rel=0`}
                          title={localize(lesson, "title")}
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    )}
                    <p>{localize(content, "body")}</p>
                    {userId && (
                      <button
                        type="button"
                        className={`lesson-complete ${completed.includes(lesson.id) ? "active" : ""}`}
                        onClick={() => toggleComplete(lesson.id)}
                      >
                        {completed.includes(lesson.id) ? (
                          <Check size={16} />
                        ) : (
                          <Circle size={16} />
                        )}{" "}
                        {completed.includes(lesson.id)
                          ? copy.completed
                          : copy.complete}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="lesson-lock">
                    <LockKeyhole size={18} />
                    {copy.locked}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <ContentInteractions type="knowledge" contentId={product.id} locale={locale} title={localize(product, "title")} />
    </main>
  );
}
