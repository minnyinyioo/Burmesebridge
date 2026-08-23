"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, Circle, Download, ListVideo, LockKeyhole, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContentInteractions from "@/components/ContentInteractions";
import CourseCheckout from "@/components/knowledge/CourseCheckout";
import TrackedYouTubePlayer from "@/components/knowledge/TrackedYouTubePlayer";
import AssignmentPanel from "@/components/knowledge/AssignmentPanel";

type Product = { id:number; title_my:string|null; title_zh:string|null; title_en:string|null; description_my:string|null; description_zh:string|null; description_en:string|null; preview_youtube_id:string|null; price:number; currency:string };
type Lesson = { id:number; title_my:string|null; title_zh:string|null; title_en:string|null; position:number; free_preview:boolean; section_id:number|null };
type LessonContent = { lesson_id:number; body_my:string|null; body_zh:string|null; body_en:string|null; youtube_id:string|null };
type LessonAttachment = { id:number; lesson_id:number; title:string; object_path:string };
type CourseSection = { id:number; title_my:string|null; title_zh:string|null; title_en:string|null; position:number };
type LessonProgress = { lesson_id:number; completed:boolean; last_position_seconds:number; updated_at:string };

export default function CoursePage() {
  const params = useParams();
  const locale = String(params.locale || "my");
  const id = Number(params.id);
  const copy = locale === "zh"
    ? { back:"返回课程", syllabus:"课程目录", preview:"免费试看", locked:"购买后解锁", empty:"课程还没有添加课时", missing:"课程不存在或已下架", complete:"标记完成", completed:"已完成", progress:"学习进度", loginProgress:"登录后可保存进度", select:"从右侧课程表选择课时", intro:"课程介绍", unlocked:"课程已解锁" }
    : locale === "my"
      ? { back:"သင်တန်းများသို့", syllabus:"သင်ခန်းစာစာရင်း", preview:"အခမဲ့အစမ်း", locked:"ဝယ်ပြီးမှ ဖွင့်မည်", empty:"သင်ခန်းစာ မရှိသေးပါ", missing:"သင်တန်းမရှိပါ", complete:"ပြီးဆုံးကြောင်း မှတ်မည်", completed:"ပြီးဆုံး", progress:"သင်ယူမှု", loginProgress:"ဝင်ပြီး တိုးတက်မှုသိမ်းပါ", select:"စာရင်းမှ သင်ခန်းစာရွေးပါ", intro:"သင်တန်းအကြောင်း", unlocked:"သင်တန်းဖွင့်ပြီး" }
      : { back:"Back to courses", syllabus:"Course syllabus", preview:"Free preview", locked:"Unlock after purchase", empty:"No lessons have been added", missing:"Course not found", complete:"Mark complete", completed:"Completed", progress:"Progress", loginProgress:"Sign in to save progress", select:"Choose a lesson from the syllabus", intro:"About this course", unlocked:"Course unlocked" };
  const [product,setProduct] = useState<Product|null>(null);
  const [lessons,setLessons] = useState<Lesson[]>([]);
  const [contents,setContents] = useState<LessonContent[]>([]);
  const [attachments,setAttachments] = useState<LessonAttachment[]>([]);
  const [sections,setSections] = useState<CourseSection[]>([]);
  const [progress,setProgress] = useState<LessonProgress[]>([]);
  const [selectedId,setSelectedId] = useState<number|null>(null);
  const [loaded,setLoaded] = useState(false);
  const [userId,setUserId] = useState<string|null>(null);
  const [hasAccess,setHasAccess] = useState(false);
  const [requestStatus,setRequestStatus] = useState<string|null>(null);
  const [completed,setCompleted] = useState<number[]>([]);

  const load = useCallback(async () => {
    if (!Number.isSafeInteger(id) || id < 1) { setLoaded(true); return; }
    const [{data:p},{data:l},{data:c},{data:a},{data:s},{data:auth}] = await Promise.all([
      supabase.from("knowledge_products").select("id,title_my,title_zh,title_en,description_my,description_zh,description_en,preview_youtube_id,price,currency").eq("id",id).eq("status","published").maybeSingle(),
      supabase.from("knowledge_lessons").select("id,title_my,title_zh,title_en,position,free_preview,section_id").eq("product_id",id).eq("status","published").order("position").order("id"),
      supabase.from("knowledge_lesson_content").select("lesson_id,body_my,body_zh,body_en,youtube_id"),
      supabase.from("knowledge_lesson_attachments").select("id,lesson_id,title,object_path"),
      supabase.from("knowledge_course_sections").select("id,title_my,title_zh,title_en,position").eq("product_id",id).eq("status","published").order("position").order("id"),
      supabase.auth.getUser(),
    ]);
    const nextLessons = (l || []) as Lesson[];
    const nextContents = (c || []) as LessonContent[];
    setProduct(p as Product|null); setLessons(nextLessons); setContents(nextContents); setAttachments((a || []) as LessonAttachment[]); setSections((s||[]) as CourseSection[]); setUserId(auth.user?.id || null);
    setSelectedId((current) => current || nextLessons.find((lesson) => nextContents.some((content) => content.lesson_id === lesson.id))?.id || nextLessons[0]?.id || null);
    if (auth.user) {
      const [{data:access},{data:membership},{data:request},{data:progress}] = await Promise.all([
        supabase.from("knowledge_access").select("product_id").eq("product_id",id).eq("user_id",auth.user.id).maybeSingle(),
        supabase.from("knowledge_memberships").select("expires_at").eq("user_id",auth.user.id).maybeSingle(),
        supabase.from("knowledge_purchase_requests").select("status").eq("product_id",id).eq("user_id",auth.user.id).maybeSingle(),
        supabase.from("knowledge_lesson_progress").select("lesson_id,completed,last_position_seconds,updated_at").eq("user_id",auth.user.id).order("updated_at",{ascending:false}),
      ]);
      const membershipActive = Boolean(membership && (!membership.expires_at || new Date(membership.expires_at).getTime() > Date.now()));
      const progressRows=(progress||[]) as LessonProgress[];const courseProgress=progressRows.filter((item)=>nextLessons.some((lesson)=>lesson.id===item.lesson_id));
      setHasAccess(Boolean(access) || membershipActive);setRequestStatus(request?.status||null);setProgress(courseProgress);setCompleted(courseProgress.filter((item)=>item.completed).map((item)=>item.lesson_id));setSelectedId((current)=>courseProgress[0]?.lesson_id||current);
    }
    setLoaded(true);
  },[id]);
  useEffect(() => {
    // Initial Supabase fetch resolves asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  },[load]);
  const localize = (item:Product|Lesson|LessonContent|CourseSection,field:"title"|"description"|"body") => {
    const row = item as unknown as Record<string,string|null>;
    const order = locale === "zh" ? ["zh","my","en"] : locale === "en" ? ["en","my","zh"] : ["my","zh","en"];
    return order.map((suffix) => row[`${field}_${suffix}`]).find(Boolean) || "";
  };
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedId) || null;
  const selectedContent = contents.find((content) => content.lesson_id === selectedId) || null;
  const accessible = Number(product?.price || 0) === 0 || hasAccess;
  const progressValue = lessons.length ? Math.round((completed.filter((item) => lessons.some((lesson) => lesson.id === item)).length / lessons.length) * 100) : 0;
  const previewVideo = useMemo(() => selectedContent?.youtube_id || product?.preview_youtube_id || null,[product?.preview_youtube_id,selectedContent?.youtube_id]);
  const groupedSections=useMemo(()=>[...sections.map((section)=>({section,lessons:lessons.filter((lesson)=>lesson.section_id===section.id)})),{section:null,lessons:lessons.filter((lesson)=>!lesson.section_id)}].filter((group)=>group.lessons.length),[lessons,sections]);

  async function toggleComplete(lessonId:number) {
    if (!userId) return;
    const done = completed.includes(lessonId);
    const {error} = done
      ? await supabase.from("knowledge_lesson_progress").delete().eq("lesson_id",lessonId).eq("user_id",userId)
      : await supabase.from("knowledge_lesson_progress").upsert({lesson_id:lessonId,user_id:userId,completed:true,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    if (!error) setCompleted((current) => done ? current.filter((item) => item !== lessonId) : [...current,lessonId]);
  }
  async function openAttachment(path:string){const {data}=await supabase.storage.from("course-attachments").createSignedUrl(path,120);if(data?.signedUrl)window.open(data.signedUrl,"_blank","noopener,noreferrer");}
  if (!loaded) return <main className="course-detail"><div className="feedCard">…</div></main>;
  if (!product) return <main className="course-detail"><Link href={`/${locale}/knowledge`} className="course-back"><ArrowLeft size={17}/>{copy.back}</Link><div className="feedCard">{copy.missing}</div></main>;

  return <main className="course-detail course-classroom">
    <Link href={`/${locale}/knowledge`} className="course-back"><ArrowLeft size={17}/>{copy.back}</Link>
    <header className="course-titlebar"><div><span>{accessible && Number(product.price) > 0 ? copy.unlocked : Number(product.price) === 0 ? "Free" : `${Number(product.price).toLocaleString()} ${product.currency}`}</span><h1>{localize(product,"title")}</h1><p>{localize(product,"description")}</p></div></header>
    <section className="course-workspace">
      <div className="course-player-column">
        <div className="course-video-stage">
          {previewVideo ? <TrackedYouTubePlayer youtubeId={previewVideo} title={selectedLesson ? localize(selectedLesson,"title") : localize(product,"title")} lessonId={selectedLesson?.id||null} userId={userId} initialPosition={progress.find((item)=>item.lesson_id===selectedLesson?.id)?.last_position_seconds||0}/> : <div><PlayCircle size={48}/><p>{copy.select}</p></div>}
        </div>
        <article className="course-current-lesson">
          <div><span>{selectedLesson?.free_preview ? copy.preview : copy.intro}</span><h2>{selectedLesson ? localize(selectedLesson,"title") : localize(product,"title")}</h2></div>
          {selectedContent ? <p>{localize(selectedContent,"body")}</p> : selectedLesson ? <div className="lesson-lock"><LockKeyhole size={18}/>{copy.locked}</div> : <p>{localize(product,"description")}</p>}
          {selectedLesson && attachments.some((file) => file.lesson_id === selectedLesson.id) ? <div className="lesson-attachments">{attachments.filter((file) => file.lesson_id === selectedLesson.id).map((file) => <button type="button" onClick={()=>void openAttachment(file.object_path)} key={file.id}><Download size={16}/>{file.title}</button>)}</div> : null}
          {selectedLesson && selectedContent && userId ? <button type="button" className={`lesson-complete ${completed.includes(selectedLesson.id) ? "active" : ""}`} onClick={() => toggleComplete(selectedLesson.id)}>{completed.includes(selectedLesson.id) ? <Check size={16}/> : <Circle size={16}/>} {completed.includes(selectedLesson.id) ? copy.completed : copy.complete}</button> : null}
        </article>
        {selectedLesson&&selectedContent?<AssignmentPanel locale={locale} lessonId={selectedLesson.id} userId={userId}/>:null}
      </div>
      <aside className="course-syllabus">
        <div className="course-syllabus-head"><div><ListVideo size={19}/><strong>{copy.syllabus}</strong></div><span>{lessons.length}</span></div>
        <div className="course-progress"><div><strong>{copy.progress}</strong><span>{progressValue}%</span></div><div><i style={{width:`${progressValue}%`}}/></div>{!userId ? <small>{copy.loginProgress}</small> : null}</div>
        <div className="course-lesson-nav">
          {lessons.length === 0 ? <p>{copy.empty}</p> : null}
          {groupedSections.map((group)=><section className="course-nav-section" key={group.section?.id||"ungrouped"}>{group.section?<h3>{localize(group.section,"title")}</h3>:null}{group.lessons.map((lesson) => {
            const available = contents.some((content) => content.lesson_id === lesson.id);
            return <button type="button" className={selectedId === lesson.id ? "active" : ""} onClick={() => setSelectedId(lesson.id)} key={lesson.id}>
              <span>{completed.includes(lesson.id) ? <CheckCircle2 size={17}/> : available ? <PlayCircle size={17}/> : <LockKeyhole size={16}/>}</span>
              <span><small>{lesson.free_preview ? copy.preview : available ? copy.unlocked : copy.locked}</small><strong>{localize(lesson,"title")}</strong></span>
            </button>;
          })}</section>)}
        </div>
        {!accessible ? <CourseCheckout locale={locale} productId={product.id} userId={userId} price={Number(product.price)} currency={product.currency} requestStatus={requestStatus} onSubmitted={load}/> : null}
      </aside>
    </section>
    <ContentInteractions type="knowledge" contentId={product.id} locale={locale} title={localize(product,"title")}/>
  </main>;
}
