"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
type LessonOption = { id: number; title: string };
type Submission = {
  id: number;
  assignment_id: number;
  user_id: string;
  answer_text: string | null;
  object_path: string | null;
  object_mime: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  assignment: { max_score: number } | null;
};
export default function AssignmentManager({
  locale,
  lessons,
}: {
  locale: string;
  lessons: LessonOption[];
}) {
  const copy =
    locale === "zh"
      ? {
          heading: "作业与批改",
          lesson: "选择课时",
          title: "作业标题",
          instructions: "作业要求",
          score: "满分",
          publish: "发布作业",
          queue: "待批改提交",
          empty: "没有待批改作业",
          student: "学生",
          answer: "文字答案",
          file: "查看附件",
          preview: "附件预览",
          invalidScore: "分数不能超过作业满分。",
          grade: "分数",
          feedback: "评语",
          save: "完成批改",
          saved: "批改已保存",
        }
      : locale === "my"
        ? {
            heading: "အိမ်စာနှင့် စစ်ဆေးခြင်း",
            lesson: "သင်ခန်းစာရွေးရန်",
            title: "အိမ်စာခေါင်းစဉ်",
            instructions: "အိမ်စာညွှန်ကြားချက်",
            score: "အမှတ်ပြည့်",
            publish: "အိမ်စာထုတ်ဝေရန်",
            queue: "စစ်ဆေးရန်",
            empty: "စစ်ဆေးရန်မရှိပါ",
            student: "ကျောင်းသား",
            answer: "စာသားအဖြေ",
            file: "ဖိုင်ကြည့်ရန်",
            preview: "ဖိုင်ကြိုကြည့်ရန်",
            invalidScore: "ရမှတ်သည် အမှတ်ပြည့်ထက် မကျော်ရပါ။",
            grade: "ရမှတ်",
            feedback: "မှတ်ချက်",
            save: "စစ်ဆေးပြီး",
            saved: "သိမ်းပြီးပါပြီ",
          }
        : {
            heading: "Assignments & grading",
            lesson: "Choose lesson",
            title: "Assignment title",
            instructions: "Instructions",
            score: "Maximum score",
            publish: "Publish assignment",
            queue: "Submissions to grade",
            empty: "No submissions awaiting grading",
            student: "Student",
            answer: "Written answer",
            file: "View attachment",
            preview: "Attachment preview",
            invalidScore: "The score cannot exceed the assignment maximum.",
            grade: "Score",
            feedback: "Feedback",
            save: "Save grade",
            saved: "Grade saved",
          };
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [items, setItems] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [fileUrls, setFileUrls] = useState<Record<number, string>>({});
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("knowledge_assignment_submissions")
      .select(
        "id,assignment_id,user_id,answer_text,object_path,object_mime,status,score,feedback,submitted_at,assignment:knowledge_assignments!assignment_id(max_score)",
      )
      .in("status", ["submitted", "returned"])
      .order("submitted_at", { ascending: true });
    if (error) setMessage(error.message);
    else {
      const nextItems = (data || []) as unknown as Submission[];
      setItems(nextItems);
      const signedEntries = await Promise.all(
        nextItems
          .filter((item) => item.object_path)
          .map(async (item) => {
            const result = await supabase.storage
              .from("assignment-submissions")
              .createSignedUrl(item.object_path!, 600);
            return [item.id, result.data?.signedUrl || ""] as const;
          }),
      );
      setFileUrls(Object.fromEntries(signedEntries));
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!lessonId) return;
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const { error } = await supabase.from("knowledge_assignments").insert({
      lesson_id: Number(lessonId),
      [`title_${suffix}`]: title.trim(),
      [`instructions_${suffix}`]: instructions.trim() || null,
      max_score: Number(maxScore) || 100,
      status: "published",
    });
    if (error) setMessage(error.message);
    else {
      setTitle("");
      setInstructions("");
      setMessage("");
    }
  }
  async function openFile(path: string) {
    const { data, error } = await supabase.storage
      .from("assignment-submissions")
      .createSignedUrl(path, 300);
    if (error) setMessage(error.message);
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  async function grade(item: Submission) {
    const score = Number(grades[item.id]);
    if (!Number.isFinite(score) || score < 0) return;
    if (item.assignment && score > Number(item.assignment.max_score)) {
      setMessage(copy.invalidScore);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("knowledge_assignment_submissions")
      .update({
        score,
        feedback: feedback[item.id]?.trim() || null,
        status: "graded",
        graded_by: user?.id || null,
        graded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (error) setMessage(error.message);
    else {
      setMessage(copy.saved);
      await load();
    }
  }
  return (
    <section className="assignment-admin">
      <h2>
        <ClipboardCheck size={20} />
        {copy.heading}
      </h2>
      <form onSubmit={create}>
        <select
          required
          value={lessonId}
          onChange={(event) => setLessonId(event.target.value)}
        >
          <option value="">{copy.lesson}</option>
          {lessons.map((lesson) => (
            <option value={lesson.id} key={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={copy.title}
        />
        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder={copy.instructions}
        />
        <input
          required
          type="number"
          min="1"
          step="0.5"
          value={maxScore}
          onChange={(event) => setMaxScore(event.target.value)}
          placeholder={copy.score}
        />
        <button>{copy.publish}</button>
      </form>
      <h3>{copy.queue}</h3>
      {!items.length ? (
        <p>{copy.empty}</p>
      ) : (
        <div>
          {items.map((item) => (
            <article key={item.id}>
              <header>
                <strong>
                  {copy.student}: {item.user_id}
                </strong>
                <small>
                  {item.submitted_at
                    ? new Date(item.submitted_at).toLocaleString()
                    : ""}
                </small>
              </header>
              {item.answer_text ? (
                <p>
                  <b>{copy.answer}:</b> {item.answer_text}
                </p>
              ) : null}
              {item.object_path ? (
                <div className="assignment-admin-preview">
                  <strong>{copy.preview}</strong>
                  {item.object_mime?.startsWith("audio/") &&
                  fileUrls[item.id] ? (
                    <audio
                      controls
                      preload="metadata"
                      src={fileUrls[item.id]}
                    />
                  ) : item.object_mime?.startsWith("image/") &&
                    fileUrls[item.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileUrls[item.id]}
                      alt={copy.preview}
                      loading="lazy"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openFile(item.object_path!)}
                  >
                    {copy.file}
                  </button>
                </div>
              ) : null}
              <div>
                <input
                  type="number"
                  min="0"
                  max={item.assignment?.max_score}
                  value={grades[item.id] || ""}
                  onChange={(event) =>
                    setGrades((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                  placeholder={copy.grade}
                />
                <input
                  value={feedback[item.id] || ""}
                  onChange={(event) =>
                    setFeedback((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                  placeholder={copy.feedback}
                />
                <button type="button" onClick={() => grade(item)}>
                  <CheckCircle2 size={15} />
                  {copy.save}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {message ? <p className="verification-message">{message}</p> : null}
    </section>
  );
}
