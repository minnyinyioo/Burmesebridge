"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { supabase } from "@/lib/supabase";
type LessonOption = { id: number; title: string };
type Quiz = {
  id: number;
  lesson_id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
};
export default function QuizManager({
  locale,
  lessons,
}: {
  locale: string;
  lessons: LessonOption[];
}) {
  const copy =
    locale === "zh"
      ? {
          heading: "测验编辑器",
          lesson: "选择课时",
          quizTitle: "测验标题",
          passing: "及格百分比",
          create: "创建测验",
          quiz: "选择测验",
          type: "题型",
          prompt: "题目",
          options: "选项，每行一个",
          correct: "正确答案；多选/排序每行一个",
          audio: "听力音频 HTTPS 地址（可选）",
          speech: "需朗读的中文（无需上传音频）",
          points: "分值",
          add: "添加题目",
          created: "已创建",
          types: {
            single: "单选",
            multiple: "多选",
            listening: "听力",
            ordering: "排序",
            fill: "填空",
            writing: "书写",
          },
        }
      : locale === "my"
        ? {
            heading: "စစ်ဆေးမှုတည်းဖြတ်ရန်",
            lesson: "သင်ခန်းစာရွေးရန်",
            quizTitle: "စစ်ဆေးမှုခေါင်းစဉ်",
            passing: "အောင်မှတ် ရာခိုင်နှုန်း",
            create: "စစ်ဆေးမှုဖန်တီးရန်",
            quiz: "စစ်ဆေးမှုရွေးရန်",
            type: "မေးခွန်းအမျိုးအစား",
            prompt: "မေးခွန်း",
            options: "ရွေးချယ်စရာ တစ်ကြောင်းစီ",
            correct: "အဖြေမှန်; အများရွေး/အစဉ် တစ်ကြောင်းစီ",
            audio: "နားထောင် Audio HTTPS URL",
            speech: "အသံထွက်ဖတ်မည့် တရုတ်စာ",
            points: "အမှတ်",
            add: "မေးခွန်းထည့်ရန်",
            created: "ဖန်တီးပြီး",
            types: {
              single: "တစ်ခုရွေး",
              multiple: "အများရွေး",
              listening: "နားထောင်",
              ordering: "အစဉ်စီ",
              fill: "ကွက်လပ်ဖြည့်",
              writing: "ရေးသား",
            },
          }
        : {
            heading: "Quiz editor",
            lesson: "Choose lesson",
            quizTitle: "Quiz title",
            passing: "Passing percentage",
            create: "Create quiz",
            quiz: "Choose quiz",
            type: "Question type",
            prompt: "Question prompt",
            options: "Options, one per line",
            correct: "Correct answer; one per line for multiple/order",
            audio: "Listening audio HTTPS URL (optional)",
            speech: "Mandarin text to speak (no upload needed)",
            points: "Points",
            add: "Add question",
            created: "Created",
            types: {
              single: "Single choice",
              multiple: "Multiple choice",
              listening: "Listening",
              ordering: "Ordering",
              fill: "Fill in",
              writing: "Writing",
            },
          };
  const [lessonId, setLessonId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [passing, setPassing] = useState("60");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizId, setQuizId] = useState("");
  const [type, setType] = useState<keyof typeof copy.types>("single");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [correct, setCorrect] = useState("");
  const [audio, setAudio] = useState("");
  const [speech, setSpeech] = useState("");
  const [points, setPoints] = useState("1");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase
      .from("knowledge_quizzes")
      .select("id,lesson_id,title_my,title_zh,title_en")
      .order("id");
    setQuizzes((data || []) as Quiz[]);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function createQuiz(event: FormEvent) {
    event.preventDefault();
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const { error } = await supabase
      .from("knowledge_quizzes")
      .insert({
        lesson_id: Number(lessonId),
        [`title_${suffix}`]: quizTitle.trim(),
        passing_score: Number(passing),
        status: "published",
      });
    if (error) setMessage(error.message);
    else {
      setQuizTitle("");
      setMessage(copy.created);
      await load();
    }
  }
  async function addQuestion(event: FormEvent) {
    event.preventDefault();
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const optionList = options
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
    const answer =
      type === "multiple" || type === "ordering"
        ? correct
            .split(/\r?\n/)
            .map((v) => v.trim())
            .filter(Boolean)
        : correct.trim();
    const currentCount = await supabase
      .from("knowledge_quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", Number(quizId));
    const { data: question, error } = await supabase
      .from("knowledge_quiz_questions")
      .insert({
        quiz_id: Number(quizId),
        question_type: type,
        [`prompt_${suffix}`]: prompt.trim(),
        options: optionList,
        audio_url: audio.trim() || null,
        speech_text: speech.trim() || null,
        position: currentCount.count || 0,
        points: Number(points) || 1,
      })
      .select("id")
      .single();
    if (error || !question) {
      setMessage(error?.message || "Create failed");
      return;
    }
    const key = await supabase
      .from("knowledge_quiz_answer_keys")
      .insert({ question_id: question.id, correct_answer: answer });
    if (key.error) {
      await supabase
        .from("knowledge_quiz_questions")
        .delete()
        .eq("id", question.id);
      setMessage(key.error.message);
    } else {
      setPrompt("");
      setOptions("");
      setCorrect("");
      setAudio("");
      setSpeech("");
      setMessage(copy.created);
    }
  }
  const title = (q: Quiz) =>
    q.title_zh || q.title_my || q.title_en || `#${q.id}`;
  return (
    <section className="quiz-admin">
      <h2>
        <ListChecks size={20} />
        {copy.heading}
      </h2>
      <form onSubmit={createQuiz}>
        <select
          required
          value={lessonId}
          onChange={(event) => setLessonId(event.target.value)}
        >
          <option value="">{copy.lesson}</option>
          {lessons.map((l) => (
            <option value={l.id} key={l.id}>
              {l.title}
            </option>
          ))}
        </select>
        <input
          required
          value={quizTitle}
          onChange={(event) => setQuizTitle(event.target.value)}
          placeholder={copy.quizTitle}
        />
        <input
          required
          type="number"
          min="0"
          max="100"
          value={passing}
          onChange={(event) => setPassing(event.target.value)}
          placeholder={copy.passing}
        />
        <button>{copy.create}</button>
      </form>
      <form onSubmit={addQuestion}>
        <select
          required
          value={quizId}
          onChange={(event) => setQuizId(event.target.value)}
        >
          <option value="">{copy.quiz}</option>
          {quizzes.map((q) => (
            <option value={q.id} key={q.id}>
              {title(q)}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as keyof typeof copy.types)
          }
        >
          {Object.entries(copy.types).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <textarea
          required
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={copy.prompt}
        />
        <textarea
          value={options}
          onChange={(event) => setOptions(event.target.value)}
          placeholder={copy.options}
        />
        <textarea
          required
          value={correct}
          onChange={(event) => setCorrect(event.target.value)}
          placeholder={copy.correct}
        />
        {type === "listening" ? (
          <input
            value={speech}
            onChange={(event) => setSpeech(event.target.value)}
            placeholder={copy.speech}
          />
        ) : null}
        <input
          value={audio}
          onChange={(event) => setAudio(event.target.value)}
          placeholder={copy.audio}
        />
        <input
          required
          type="number"
          min="0.5"
          step="0.5"
          value={points}
          onChange={(event) => setPoints(event.target.value)}
          placeholder={copy.points}
        />
        <button>{copy.add}</button>
      </form>
      {message ? <p className="verification-message">{message}</p> : null}
    </section>
  );
}
