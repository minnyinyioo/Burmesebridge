"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Flame,
  Headphones,
  ListVideo,
  LockKeyhole,
  PlayCircle,
  Target,
  UserRound,
  Users,
  Languages,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";
import CourseCheckout from "@/components/knowledge/CourseCheckout";
import TrackedYouTubePlayer from "@/components/knowledge/TrackedYouTubePlayer";
import AssignmentPanel from "@/components/knowledge/AssignmentPanel";
import QuizPanel from "@/components/knowledge/QuizPanel";
import CourseCertificate from "@/components/knowledge/CourseCertificate";
import MandarinSpeechButton from "@/components/knowledge/MandarinSpeechButton";

type Product = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  description_my: string | null;
  description_zh: string | null;
  description_en: string | null;
  preview_youtube_id: string | null;
  price: number;
  currency: string;
  level: string | null;
  skill: string | null;
  teacher_name: string | null;
  teacher_bio: string | null;
  learning_objectives: string[] | null;
  target_audience: string[] | null;
  estimated_minutes: number | null;
};
type Lesson = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
  free_preview: boolean;
  section_id: number | null;
};
type LessonContent = {
  lesson_id: number;
  body_my: string | null;
  body_zh: string | null;
  body_en: string | null;
  youtube_id: string | null;
  captions: unknown;
  vocabulary: unknown;
  handout_my: string | null;
  handout_zh: string | null;
  handout_en: string | null;
};
type LessonAttachment = {
  id: number;
  lesson_id: number;
  title: string;
  object_path: string;
};
type CourseSection = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
};
type LessonProgress = {
  lesson_id: number;
  completed: boolean;
  last_position_seconds: number;
  updated_at: string;
};

export default function CoursePage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const id = Number(params.id);
  const copy =
    locale === "zh"
      ? {
          back: "返回课程",
          syllabus: "课程目录",
          preview: "免费试看",
          locked: "购买后解锁",
          empty: "课程还没有添加课时",
          missing: "课程不存在或已下架",
          complete: "标记完成",
          completed: "已完成",
          progress: "学习进度",
          loginProgress: "登录后可保存进度",
          select: "从右侧课程表选择课时",
          audioLesson: "互动音频课",
          noVideo:
            "本课暂未配置经授权的视频，先使用逐词普通话朗读、讲义和练习学习。",
          intro: "课程介绍",
          unlocked: "课程已解锁",
          teacher: "授课教师",
          objectives: "学习目标",
          audience: "适用对象",
          captions: "字幕",
          vocabulary: "重点词汇",
          handout: "课程讲义",
        }
      : locale === "my"
        ? {
            back: "သင်တန်းများသို့",
            syllabus: "သင်ခန်းစာစာရင်း",
            preview: "အခမဲ့အစမ်း",
            locked: "ဝယ်ပြီးမှ ဖွင့်မည်",
            empty: "သင်ခန်းစာ မရှိသေးပါ",
            missing: "သင်တန်းမရှိပါ",
            complete: "ပြီးဆုံးကြောင်း မှတ်မည်",
            completed: "ပြီးဆုံး",
            progress: "သင်ယူမှု",
            loginProgress: "ဝင်ပြီး တိုးတက်မှုသိမ်းပါ",
            select: "စာရင်းမှ သင်ခန်းစာရွေးပါ",
            audioLesson: "အပြန်အလှန် အသံသင်ခန်းစာ",
            noVideo:
              "ဤသင်ခန်းစာအတွက် ခွင့်ပြုချက်ရ ဗီဒီယို မထည့်ရသေးပါ။ Mandarin စကားလုံးအသံထွက်၊ မှတ်စုနှင့် လေ့ကျင့်ခန်းဖြင့် ဦးစွာလေ့လာနိုင်သည်။",
            intro: "သင်တန်းအကြောင်း",
            unlocked: "သင်တန်းဖွင့်ပြီး",
            teacher: "သင်ကြားသူ",
            objectives: "သင်ယူမှုရည်မှန်းချက်",
            audience: "သင့်တော်သူများ",
            captions: "စာတန်းထိုး",
            vocabulary: "အဓိကဝေါဟာရ",
            handout: "သင်ခန်းစာမှတ်စု",
          }
        : {
            back: "Back to courses",
            syllabus: "Course syllabus",
            preview: "Free preview",
            locked: "Unlock after purchase",
            empty: "No lessons have been added",
            missing: "Course not found",
            complete: "Mark complete",
            completed: "Completed",
            progress: "Progress",
            loginProgress: "Sign in to save progress",
            select: "Choose a lesson from the syllabus",
            audioLesson: "Interactive audio lesson",
            noVideo:
              "No licensed video has been assigned to this lesson yet. Use the Mandarin word playback, handout and exercises for now.",
            intro: "About this course",
            unlocked: "Course unlocked",
            teacher: "Instructor",
            objectives: "Learning objectives",
            audience: "Who this is for",
            captions: "Captions",
            vocabulary: "Key vocabulary",
            handout: "Lesson handout",
          };
  const [product, setProduct] = useState<Product | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    if (!Number.isSafeInteger(id) || id < 1) {
      setLoaded(true);
      return;
    }
    const [
      { data: p },
      { data: l },
      { data: c },
      { data: a },
      { data: s },
      { data: auth },
    ] = await Promise.all([
      supabase
        .from("knowledge_products")
        .select(
          "id,title_my,title_zh,title_en,description_my,description_zh,description_en,preview_youtube_id,price,currency,level,skill,teacher_name,teacher_bio,learning_objectives,target_audience,estimated_minutes",
        )
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle(),
      supabase
        .from("knowledge_lessons")
        .select(
          "id,title_my,title_zh,title_en,position,free_preview,section_id",
        )
        .eq("product_id", id)
        .eq("status", "published")
        .order("position")
        .order("id"),
      supabase
        .from("knowledge_lesson_content")
        .select(
          "lesson_id,body_my,body_zh,body_en,youtube_id,captions,vocabulary,handout_my,handout_zh,handout_en",
        ),
      supabase
        .from("knowledge_lesson_attachments")
        .select("id,lesson_id,title,object_path"),
      supabase
        .from("knowledge_course_sections")
        .select("id,title_my,title_zh,title_en,position")
        .eq("product_id", id)
        .eq("status", "published")
        .order("position")
        .order("id"),
      supabase.auth.getUser(),
    ]);
    const nextLessons = (l || []) as Lesson[];
    const nextContents = (c || []) as LessonContent[];
    setProduct(p as Product | null);
    setLessons(nextLessons);
    setContents(nextContents);
    setAttachments((a || []) as LessonAttachment[]);
    setSections((s || []) as CourseSection[]);
    setUserId(auth.user?.id || null);
    setSelectedId(
      (current) =>
        current ||
        nextLessons.find((lesson) =>
          nextContents.some((content) => content.lesson_id === lesson.id),
        )?.id ||
        nextLessons[0]?.id ||
        null,
    );
    if (auth.user) {
      const [
        { data: access },
        { data: membership },
        { data: request },
        { data: progress },
        { data: streakData },
      ] = await Promise.all([
        supabase
          .from("knowledge_access")
          .select("product_id")
          .eq("product_id", id)
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("knowledge_memberships")
          .select("expires_at")
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("knowledge_purchase_requests")
          .select("status")
          .eq("product_id", id)
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("knowledge_lesson_progress")
          .select("lesson_id,completed,last_position_seconds,updated_at")
          .eq("user_id", auth.user.id)
          .order("updated_at", { ascending: false }),
        supabase.rpc("get_my_knowledge_streak"),
      ]);
      const membershipActive = Boolean(
        membership &&
        (!membership.expires_at ||
          new Date(membership.expires_at).getTime() > Date.now()),
      );
      const progressRows = (progress || []) as LessonProgress[];
      const courseProgress = progressRows.filter((item) =>
        nextLessons.some((lesson) => lesson.id === item.lesson_id),
      );
      setHasAccess(Boolean(access) || membershipActive);
      setRequestStatus(request?.status || null);
      setProgress(courseProgress);
      setCompleted(
        courseProgress
          .filter((item) => item.completed)
          .map((item) => item.lesson_id),
      );
      setSelectedId((current) => courseProgress[0]?.lesson_id || current);
      setStreak(Number(streakData?.[0]?.current_streak || 0));
    }
    setLoaded(true);
  }, [id]);
  useEffect(() => {
    // Initial Supabase fetch resolves asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const localize = (
    item: Product | Lesson | LessonContent | CourseSection,
    field: "title" | "description" | "body",
  ) => {
    const row = item as unknown as Record<string, string | null>;
    const order =
      locale === "zh"
        ? ["zh", "my", "en"]
        : locale === "en"
          ? ["en", "my", "zh"]
          : ["my", "zh", "en"];
    return order.map((suffix) => row[`${field}_${suffix}`]).find(Boolean) || "";
  };
  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedId) || null;
  const selectedContent =
    contents.find((content) => content.lesson_id === selectedId) || null;
  const accessible = Number(product?.price || 0) === 0 || hasAccess;
  const progressValue = lessons.length
    ? Math.round(
        (completed.filter((item) =>
          lessons.some((lesson) => lesson.id === item),
        ).length /
          lessons.length) *
          100,
      )
    : 0;
  const previewVideo = useMemo(
    () => selectedContent?.youtube_id || product?.preview_youtube_id || null,
    [product?.preview_youtube_id, selectedContent?.youtube_id],
  );
  const groupedSections = useMemo(
    () =>
      [
        ...sections.map((section) => ({
          section,
          lessons: lessons.filter((lesson) => lesson.section_id === section.id),
        })),
        {
          section: null,
          lessons: lessons.filter((lesson) => !lesson.section_id),
        },
      ].filter((group) => group.lessons.length),
    [lessons, sections],
  );
  const normalizeList = (value: unknown): string[] =>
    Array.isArray(value)
      ? value
          .map((item) =>
            typeof item === "string" ? item : JSON.stringify(item),
          )
          .filter(Boolean)
      : [];
  const normalizeCaptions = (value: unknown): string[] => {
    let parsed: unknown = value;
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch {
        return value.trim() ? [value] : [];
      }
    }
    if (!Array.isArray(parsed)) return [];
    const languageOrder =
      locale === "zh"
        ? ["zh", "my", "en"]
        : locale === "en"
          ? ["en", "my", "zh"]
          : ["my", "zh", "en"];
    return parsed
      .map((entry) => {
        let item: unknown = entry;
        if (typeof item === "string" && item.trim().startsWith("{")) {
          try {
            item = JSON.parse(item);
          } catch {
            return item;
          }
        }
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        const row = item as Record<string, unknown>;
        const caption = languageOrder
          .map((key) => row[key])
          .find((text) => typeof text === "string" && text.trim());
        const start = typeof row.start === "string" ? row.start.trim() : "";
        return `${start ? `${start}  ` : ""}${typeof caption === "string" ? caption : ""}`.trim();
      })
      .filter((item): item is string => Boolean(item));
  };
  const handout = selectedContent
    ? locale === "zh"
      ? selectedContent.handout_zh ||
        selectedContent.handout_my ||
        selectedContent.handout_en
      : locale === "en"
        ? selectedContent.handout_en ||
          selectedContent.handout_my ||
          selectedContent.handout_zh
        : selectedContent.handout_my ||
          selectedContent.handout_zh ||
          selectedContent.handout_en
    : null;

  async function toggleComplete(lessonId: number) {
    if (!userId) return;
    const done = completed.includes(lessonId);
    const { error } = done
      ? await supabase
          .from("knowledge_lesson_progress")
          .delete()
          .eq("lesson_id", lessonId)
          .eq("user_id", userId)
      : await supabase.from("knowledge_lesson_progress").upsert({
          lesson_id: lessonId,
          user_id: userId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    if (!error)
      setCompleted((current) =>
        done
          ? current.filter((item) => item !== lessonId)
          : [...current, lessonId],
      );
  }
  async function openAttachment(path: string) {
    const { data } = await supabase.storage
      .from("course-attachments")
      .createSignedUrl(path, 120);
    if (data?.signedUrl)
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
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
    <main className="course-detail course-classroom">
      <Link href={`/${locale}/knowledge`} className="course-back">
        <ArrowLeft size={17} />
        {copy.back}
      </Link>
      <header className="course-titlebar">
        <div>
          <span>
            {accessible && Number(product.price) > 0
              ? copy.unlocked
              : Number(product.price) === 0
                ? "Free"
                : `${Number(product.price).toLocaleString()} ${product.currency}`}
          </span>
          <h1>{localize(product, "title")}</h1>
          <p>{localize(product, "description")}</p>
          <div className="course-title-meta">
            {product.level ? <span>{product.level}</span> : null}
            {product.skill ? <span>{product.skill}</span> : null}
            {product.estimated_minutes ? (
              <span>{product.estimated_minutes} min</span>
            ) : null}
          </div>
        </div>
      </header>
      {product.teacher_name ||
      product.learning_objectives?.length ||
      product.target_audience?.length ? (
        <section className="course-overview-grid">
          {product.teacher_name ? (
            <article>
              <UserRound />
              <div>
                <strong>{copy.teacher}</strong>
                <h2>{product.teacher_name}</h2>
                {product.teacher_bio ? <p>{product.teacher_bio}</p> : null}
              </div>
            </article>
          ) : null}
          {product.learning_objectives?.length ? (
            <article>
              <Target />
              <div>
                <strong>{copy.objectives}</strong>
                <ul>
                  {product.learning_objectives.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ) : null}
          {product.target_audience?.length ? (
            <article>
              <Users />
              <div>
                <strong>{copy.audience}</strong>
                <ul>
                  {product.target_audience.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ) : null}
        </section>
      ) : null}
      <section className="course-workspace">
        <div className="course-player-column">
          <div className="course-video-stage">
            {previewVideo ? (
              <TrackedYouTubePlayer
                youtubeId={previewVideo}
                title={
                  selectedLesson
                    ? localize(selectedLesson, "title")
                    : localize(product, "title")
                }
                lessonId={selectedLesson?.id || null}
                userId={userId}
                initialPosition={
                  progress.find((item) => item.lesson_id === selectedLesson?.id)
                    ?.last_position_seconds || 0
                }
              />
            ) : selectedLesson && selectedContent ? (
              <div className="course-audio-stage">
                <Headphones size={48} />
                <strong>{copy.audioLesson}</strong>
                <p>{copy.noVideo}</p>
                {normalizeList(selectedContent.vocabulary).length ? (
                  <div className="course-audio-actions">
                    {normalizeList(selectedContent.vocabulary)
                      .slice(0, 8)
                      .map((item) => {
                        const word = item.split("·")[0].trim();
                        return (
                          <MandarinSpeechButton
                            key={item}
                            text={word}
                            label={word}
                          />
                        );
                      })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <PlayCircle size={48} />
                <p>{copy.select}</p>
              </div>
            )}
          </div>
          <article className="course-current-lesson">
            <div>
              <span>
                {selectedLesson?.free_preview ? copy.preview : copy.intro}
              </span>
              <h2>
                {selectedLesson
                  ? localize(selectedLesson, "title")
                  : localize(product, "title")}
              </h2>
            </div>
            {selectedContent ? (
              <p>{localize(selectedContent, "body")}</p>
            ) : selectedLesson ? (
              <div className="lesson-lock">
                <LockKeyhole size={18} />
                {copy.locked}
              </div>
            ) : (
              <p>{localize(product, "description")}</p>
            )}
            {selectedContent &&
            normalizeCaptions(selectedContent.captions).length ? (
              <section className="lesson-resource-block">
                <h3>
                  <Languages size={17} />
                  {copy.captions}
                </h3>
                {normalizeCaptions(selectedContent.captions).map(
                  (item, index) => (
                    <p key={`${index}-${item}`}>{item}</p>
                  ),
                )}
              </section>
            ) : null}
            {selectedContent &&
            normalizeList(selectedContent.vocabulary).length ? (
              <section className="lesson-resource-block">
                <h3>
                  <FileText size={17} />
                  {copy.vocabulary}
                </h3>
                <ul>
                  {normalizeList(selectedContent.vocabulary).map(
                    (item, index) => (
                      <li
                        className="lesson-vocabulary-item"
                        key={`${index}-${item}`}
                      >
                        <span>{item}</span>
                        <MandarinSpeechButton
                          text={item.split("·")[0].trim()}
                          label={
                            locale === "zh"
                              ? "播放普通话发音"
                              : locale === "my"
                                ? "Mandarin အသံထွက် ဖွင့်ရန်"
                                : "Play Mandarin pronunciation"
                          }
                        />
                      </li>
                    ),
                  )}
                </ul>
              </section>
            ) : null}
            {handout ? (
              <section className="lesson-resource-block">
                <h3>
                  <FileText size={17} />
                  {copy.handout}
                </h3>
                <p>{handout}</p>
              </section>
            ) : null}
            {selectedLesson &&
            attachments.some((file) => file.lesson_id === selectedLesson.id) ? (
              <div className="lesson-attachments">
                {attachments
                  .filter((file) => file.lesson_id === selectedLesson.id)
                  .map((file) => (
                    <button
                      type="button"
                      onClick={() => void openAttachment(file.object_path)}
                      key={file.id}
                    >
                      <Download size={16} />
                      {file.title}
                    </button>
                  ))}
              </div>
            ) : null}
            {selectedLesson && selectedContent && userId ? (
              <button
                type="button"
                className={`lesson-complete ${completed.includes(selectedLesson.id) ? "active" : ""}`}
                onClick={() => toggleComplete(selectedLesson.id)}
              >
                {completed.includes(selectedLesson.id) ? (
                  <Check size={16} />
                ) : (
                  <Circle size={16} />
                )}{" "}
                {completed.includes(selectedLesson.id)
                  ? copy.completed
                  : copy.complete}
              </button>
            ) : null}
          </article>
          {selectedLesson && selectedContent ? (
            <AssignmentPanel
              locale={locale}
              lessonId={selectedLesson.id}
              userId={userId}
            />
          ) : null}
          {selectedLesson && selectedContent ? (
            <QuizPanel
              locale={locale}
              lessonId={selectedLesson.id}
              userId={userId}
            />
          ) : null}
        </div>
        <aside className="course-syllabus">
          <div className="course-syllabus-head">
            <div>
              <ListVideo size={19} />
              <strong>{copy.syllabus}</strong>
            </div>
            <span>{lessons.length}</span>
          </div>
          <div className="course-progress">
            <div>
              <strong>{copy.progress}</strong>
              <span>{progressValue}%</span>
            </div>
            <div>
              <i style={{ width: `${progressValue}%` }} />
            </div>
            {userId ? (
              <small className="course-streak">
                <Flame size={14} />
                {locale === "zh"
                  ? "连续学习"
                  : locale === "my"
                    ? "ဆက်တိုက်လေ့လာမှု"
                    : "Study streak"}{" "}
                · {streak}
              </small>
            ) : (
              <small>{copy.loginProgress}</small>
            )}
          </div>
          <div className="course-lesson-nav">
            {lessons.length === 0 ? <p>{copy.empty}</p> : null}
            {groupedSections.map((group) => (
              <section
                className="course-nav-section"
                key={group.section?.id || "ungrouped"}
              >
                {group.section ? (
                  <h3>{localize(group.section, "title")}</h3>
                ) : null}
                {group.lessons.map((lesson) => {
                  const available = contents.some(
                    (content) => content.lesson_id === lesson.id,
                  );
                  return (
                    <button
                      type="button"
                      className={selectedId === lesson.id ? "active" : ""}
                      onClick={() => setSelectedId(lesson.id)}
                      key={lesson.id}
                    >
                      <span>
                        {completed.includes(lesson.id) ? (
                          <CheckCircle2 size={17} />
                        ) : available ? (
                          <PlayCircle size={17} />
                        ) : (
                          <LockKeyhole size={16} />
                        )}
                      </span>
                      <span>
                        <small>
                          {lesson.free_preview
                            ? copy.preview
                            : available
                              ? copy.unlocked
                              : copy.locked}
                        </small>
                        <strong>{localize(lesson, "title")}</strong>
                      </span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
          {!accessible ? (
            <CourseCheckout
              locale={locale}
              productId={product.id}
              userId={userId}
              price={Number(product.price)}
              currency={product.currency}
              requestStatus={requestStatus}
              onSubmitted={load}
            />
          ) : null}
        </aside>
      </section>
      <CourseCertificate
        locale={locale}
        productId={product.id}
        userId={userId}
      />
      <ContentInteractions
        type="knowledge"
        contentId={product.id}
        locale={locale}
        title={localize(product, "title")}
      />
    </main>
  );
}
