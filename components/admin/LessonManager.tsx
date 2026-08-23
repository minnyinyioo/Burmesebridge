"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ListVideo,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getYouTubeId } from "@/lib/youtube";
import LessonAttachmentUploader from "@/components/admin/LessonAttachmentUploader";
import CourseSectionManager, { type CourseSection } from "@/components/admin/CourseSectionManager";
type Product = { id: number; title: string };
type Lesson = {
  id: number;
  product_id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
  free_preview: boolean;
  status: "draft" | "published";
  section_id: number | null;
};
type Attachment = { id:number; lesson_id:number; title:string };
export default function LessonManager({
  locale,
  products,
}: {
  locale: string;
  products: Product[];
}) {
  const copy =
    locale === "zh"
      ? {
          heading: "课时管理",
          product: "选择课程",
          title: "课时标题",
          body: "课时正文",
          video: "课时 YouTube 视频（可选）",
          invalidVideo: "请输入有效的 YouTube 链接或视频 ID。",
          preview: "允许免费试看",
          add: "添加课时",
          empty: "请先创建课程",
          remove: "删除课时",
          online: "下架",
          offline: "发布",
          previewOn: "关闭试看",
          previewOff: "设为试看",
          section: "所属章节",
        }
      : locale === "my"
        ? {
            heading: "သင်ခန်းစာ စီမံရန်",
            product: "သင်တန်းရွေးရန်",
            title: "သင်ခန်းစာခေါင်းစဉ်",
            body: "သင်ခန်းစာအကြောင်းအရာ",
            video: "YouTube ဗီဒီယို (မလိုအပ်)",
            invalidVideo: "မှန်ကန်သော YouTube လင့်ခ် သို့မဟုတ် ဗီဒီယို ID ထည့်ပါ။",
            preview: "အခမဲ့အစမ်းကြည့်ရန်",
            add: "သင်ခန်းစာထည့်ရန်",
            empty: "သင်တန်းအရင်ဖန်တီးပါ",
            remove: "ဖျက်ရန်",
            online: "ပိတ်မည်",
            offline: "ထုတ်ဝေမည်",
            previewOn: "အစမ်းပိတ်မည်",
            previewOff: "အစမ်းဖွင့်မည်",
            section: "သက်ဆိုင်ရာအခန်း",
          }
        : {
            heading: "Lesson management",
            product: "Choose course",
            title: "Lesson title",
            body: "Lesson body",
            video: "Lesson YouTube video (optional)",
            invalidVideo: "Enter a valid YouTube URL or video ID.",
            preview: "Free preview",
            add: "Add lesson",
            empty: "Create a course first",
            remove: "Delete lesson",
            online: "Take offline",
            offline: "Publish",
            previewOn: "Disable preview",
            previewOff: "Make preview",
            section: "Section",
          };
  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [preview, setPreview] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    if (!selected) {
      setLessons([]);
      return;
    }
    const [{ data, error }, { data: attachmentData }] = await Promise.all([supabase
      .from("knowledge_lessons")
      .select(
        "id,product_id,title_my,title_zh,title_en,position,free_preview,status,section_id",
      )
      .eq("product_id", Number(selected))
      .order("position")
      .order("id"), supabase.from("knowledge_lesson_attachments").select("id,lesson_id,title")]);
    if (error) setMessage(error.message);
    else { setLessons((data || []) as Lesson[]); setAttachments((attachmentData || []) as Attachment[]); }
  }, [selected]);
  useEffect(() => {
    let active = true;
    // Supabase-backed selection refresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) void load();
    return () => {
      active = false;
    };
  }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const youtubeId = getYouTubeId(video);
    if (video.trim() && !youtubeId) {
      setMessage(copy.invalidVideo);
      return;
    }
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const { data: lesson, error } = await supabase
      .from("knowledge_lessons")
      .insert({
        product_id: Number(selected),
        [`title_${suffix}`]: title.trim(),
        position: lessons.length,
        free_preview: preview,
        status: "published",
        section_id: sectionId ? Number(sectionId) : null,
      })
      .select("id")
      .single();
    if (error || !lesson) {
      setMessage(error?.message || "Create failed");
      return;
    }
    const { error: contentError } = await supabase
      .from("knowledge_lesson_content")
      .insert({
        lesson_id: lesson.id,
        [`body_${suffix}`]: body.trim(),
        youtube_id: youtubeId || null,
      });
    if (contentError) setMessage(contentError.message);
    else {
      setTitle("");
      setBody("");
      setVideo("");
      setPreview(false);
      setSectionId("");
      setMessage("");
      await load();
    }
  }
  async function remove(id: number) {
    const { error } = await supabase
      .from("knowledge_lessons")
      .delete()
      .eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }
  async function updateLesson(
    id: number,
    values: Partial<Pick<Lesson, "position" | "free_preview" | "status">>,
  ) {
    const { error } = await supabase
      .from("knowledge_lessons")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }
  async function move(lesson: Lesson, direction: -1 | 1) {
    const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
    const target = lessons[currentIndex + direction];
    if (!target) return;
    const [resultA, resultB] = await Promise.all([
      supabase
        .from("knowledge_lessons")
        .update({ position: target.position })
        .eq("id", lesson.id),
      supabase
        .from("knowledge_lessons")
        .update({ position: lesson.position })
        .eq("id", target.id),
    ]);
    const error = resultA.error || resultB.error;
    if (error) setMessage(error.message);
    else await load();
  }
  return (
    <section className="lesson-admin">
      <h2>
        <ListVideo size={20} />
        {copy.heading}
      </h2>
      {products.length === 0 ? (
        <p>{copy.empty}</p>
      ) : (
        <>
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">{copy.product}</option>
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.title}
              </option>
            ))}
          </select>
          {selected ? <CourseSectionManager locale={locale} productId={Number(selected)} onChange={setSections}/> : null}
          <form onSubmit={submit}>
            <select value={sectionId} onChange={(event)=>setSectionId(event.target.value)}>
              <option value="">{copy.section}</option>
              {sections.map((section)=><option value={section.id} key={section.id}>{section.title_zh||section.title_my||section.title_en}</option>)}
            </select>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.title}
            />
            <textarea
              required
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={copy.body}
            />
            <input
              value={video}
              onChange={(event) => setVideo(event.target.value)}
              placeholder={copy.video}
            />
            <label>
              <input
                type="checkbox"
                checked={preview}
                onChange={(event) => setPreview(event.target.checked)}
              />
              {copy.preview}
            </label>
            <button>{copy.add}</button>
          </form>
          {message && <p className="verification-message">{message}</p>}
          <div>
            {lessons.map((lesson, index) => (
              <article key={lesson.id}>
                <span>
                  {index + 1}.{" "}
                  {lesson.title_zh || lesson.title_my || lesson.title_en}
                  {lesson.free_preview ? " · Preview" : ""}
                  {lesson.section_id ? ` · ${sections.find((section)=>section.id===lesson.section_id)?.title_zh||sections.find((section)=>section.id===lesson.section_id)?.title_my||sections.find((section)=>section.id===lesson.section_id)?.title_en||copy.section}` : ""}
                </span>
                <div className="lesson-admin-actions">
                  <LessonAttachmentUploader locale={locale} lessonId={lesson.id} onUploaded={load}/>
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(lesson, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(lesson, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateLesson(lesson.id, {
                        free_preview: !lesson.free_preview,
                      })
                    }
                  >
                    {lesson.free_preview ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}{" "}
                    {lesson.free_preview ? copy.previewOn : copy.previewOff}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateLesson(lesson.id, {
                        status:
                          lesson.status === "published" ? "draft" : "published",
                      })
                    }
                  >
                    {lesson.status === "published" ? copy.online : copy.offline}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => remove(lesson.id)}
                  >
                    <Trash2 size={15} />
                    {copy.remove}
                  </button>
                </div>
                {attachments.filter((file) => file.lesson_id === lesson.id).map((file) => <small className="lesson-admin-file" key={file.id}>PDF · {file.title}</small>)}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
