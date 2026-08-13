"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ListVideo, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getYouTubeId } from "@/lib/youtube";
type Product = { id: number; title: string };
type Lesson = {
  id: number;
  product_id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  position: number;
  free_preview: boolean;
};
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
          preview: "允许免费试看",
          add: "添加课时",
          empty: "请先创建课程",
          remove: "删除课时",
        }
      : locale === "my"
        ? {
            heading: "သင်ခန်းစာ စီမံရန်",
            product: "သင်တန်းရွေးရန်",
            title: "သင်ခန်းစာခေါင်းစဉ်",
            body: "သင်ခန်းစာအကြောင်းအရာ",
            video: "YouTube ဗီဒီယို (မလိုအပ်)",
            preview: "အခမဲ့အစမ်းကြည့်ရန်",
            add: "သင်ခန်းစာထည့်ရန်",
            empty: "သင်တန်းအရင်ဖန်တီးပါ",
            remove: "ဖျက်ရန်",
          }
        : {
            heading: "Lesson management",
            product: "Choose course",
            title: "Lesson title",
            body: "Lesson body",
            video: "Lesson YouTube video (optional)",
            preview: "Free preview",
            add: "Add lesson",
            empty: "Create a course first",
            remove: "Delete lesson",
          };
  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [preview, setPreview] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    if (!selected) {
      setLessons([]);
      return;
    }
    const { data, error } = await supabase
      .from("knowledge_lessons")
      .select("id,product_id,title_my,title_zh,title_en,position,free_preview")
      .eq("product_id", Number(selected))
      .order("position")
      .order("id");
    if (error) setMessage(error.message);
    else setLessons((data || []) as Lesson[]);
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
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const { data: lesson, error } = await supabase
      .from("knowledge_lessons")
      .insert({
        product_id: Number(selected),
        [`title_${suffix}`]: title.trim(),
        position: lessons.length,
        free_preview: preview,
        status: "published",
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
        youtube_id: getYouTubeId(video) || null,
      });
    if (contentError) setMessage(contentError.message);
    else {
      setTitle("");
      setBody("");
      setVideo("");
      setPreview(false);
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
          <form onSubmit={submit}>
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
                </span>
                <button type="button" onClick={() => remove(lesson.id)}>
                  <Trash2 size={15} />
                  {copy.remove}
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
