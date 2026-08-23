"use client";
import { FormEvent, useState } from "react";
import { FilePenLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getYouTubeId } from "@/lib/youtube";
type Lesson = { id: number; title: string };
export default function LessonContentEditor({
  locale,
  lessons,
}: {
  locale: string;
  lessons: Lesson[];
}) {
  const c =
    locale === "zh"
      ? {
          title: "编辑现有课时内容",
          choose: "选择课时",
          body: "课时正文",
          video: "YouTube 链接或视频 ID",
          captions: "字幕（每行一条）",
          words: "重点词汇（每行一项）",
          handout: "课程讲义",
          save: "保存课时内容",
          saved: "课时内容已保存",
          invalid: "YouTube 链接无效",
        }
      : locale === "my"
        ? {
            title: "ရှိပြီးသော သင်ခန်းစာ ပြင်ရန်",
            choose: "သင်ခန်းစာရွေးရန်",
            body: "သင်ခန်းစာအကြောင်းအရာ",
            video: "YouTube လင့်ခ် သို့မဟုတ် ID",
            captions: "စာတန်းထိုး (တစ်ကြောင်းတစ်ခု)",
            words: "အဓိကဝေါဟာရ (တစ်ကြောင်းတစ်ခု)",
            handout: "သင်ခန်းစာမှတ်စု",
            save: "သိမ်းရန်",
            saved: "သိမ်းပြီးပါပြီ",
            invalid: "YouTube လင့်ခ်မမှန်ပါ",
          }
        : {
            title: "Edit existing lesson content",
            choose: "Choose lesson",
            body: "Lesson body",
            video: "YouTube URL or video ID",
            captions: "Captions (one per line)",
            words: "Key vocabulary (one per line)",
            handout: "Lesson handout",
            save: "Save lesson content",
            saved: "Lesson content saved",
            invalid: "Invalid YouTube URL",
          };
  const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
  const [selected, setSelected] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [captions, setCaptions] = useState("");
  const [words, setWords] = useState("");
  const [handout, setHandout] = useState("");
  const [message, setMessage] = useState("");
  async function choose(value: string) {
    setSelected(value);
    setMessage("");
    if (!value) return;
    const { data, error } = await supabase
      .from("knowledge_lesson_content")
      .select(`body_${suffix},youtube_id,captions,vocabulary,handout_${suffix}`)
      .eq("lesson_id", Number(value))
      .maybeSingle();
    if (error) {
      setMessage(error.message);
      return;
    }
    const row = (data || {}) as Record<string, unknown>;
    setBody(String(row[`body_${suffix}`] || ""));
    setVideo(String(row.youtube_id || ""));
    setCaptions(Array.isArray(row.captions) ? row.captions.join("\n") : "");
    setWords(Array.isArray(row.vocabulary) ? row.vocabulary.join("\n") : "");
    setHandout(String(row[`handout_${suffix}`] || ""));
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const youtubeId = getYouTubeId(video);
    if (video.trim() && !youtubeId) {
      setMessage(c.invalid);
      return;
    }
    const payload = {
      lesson_id: Number(selected),
      [`body_${suffix}`]: body.trim() || null,
      youtube_id: youtubeId || null,
      captions: captions
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      vocabulary: words
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      [`handout_${suffix}`]: handout.trim() || null,
    };
    const { error } = await supabase
      .from("knowledge_lesson_content")
      .upsert(payload, { onConflict: "lesson_id" });
    setMessage(error ? error.message : c.saved);
  }
  return (
    <section className="course-metadata-editor lesson-content-editor">
      <h3>
        <FilePenLine size={18} />
        {c.title}
      </h3>
      <select value={selected} onChange={(e) => void choose(e.target.value)}>
        <option value="">{c.choose}</option>
        {lessons.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      {selected ? (
        <form onSubmit={save}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={c.body}
          />
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder={c.video}
          />
          <textarea
            value={captions}
            onChange={(e) => setCaptions(e.target.value)}
            placeholder={c.captions}
          />
          <textarea
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder={c.words}
          />
          <textarea
            value={handout}
            onChange={(e) => setHandout(e.target.value)}
            placeholder={c.handout}
          />
          <button>{c.save}</button>
        </form>
      ) : null}
      {message ? <p className="verification-message">{message}</p> : null}
    </section>
  );
}
