"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Row = {
  product_id: number;
  catalog_key: string;
  published_lessons: number;
  content_lessons: number;
  verified_resources: number;
  ready: boolean;
};
export default function HskReadinessPanel({ locale }: { locale: string }) {
  const c =
    locale === "zh"
      ? {
          title: "HSK 发布检查",
          intro:
            "只有课时已发布、每个课时有正文且至少一个资源许可证已核验时，课程才允许上线。",
          refresh: "刷新",
          lesson: "已发布课时",
          content: "有内容",
          license: "已核验资源",
          ready: "可以发布",
          blocked: "尚未达到发布条件",
        }
      : locale === "my"
        ? {
            title: "HSK ထုတ်ဝေမှု စစ်ဆေးချက်",
            intro:
              "Published သင်ခန်းစာ၊ သင်ခန်းစာအကြောင်းအရာနှင့် စစ်ဆေးပြီး License ရှိမှသာ သင်တန်းထုတ်ဝေနိုင်သည်။",
            refresh: "ပြန်စစ်ရန်",
            lesson: "ထုတ်ဝေသင်ခန်းစာ",
            content: "အကြောင်းအရာရှိ",
            license: "စစ်ပြီးရင်းမြစ်",
            ready: "ထုတ်ဝေနိုင်",
            blocked: "လိုအပ်ချက်မပြည့်သေး",
          }
        : {
            title: "HSK publication checks",
            intro:
              "A course can go live only when it has published lessons, content for every lesson, and at least one verified resource license.",
            refresh: "Refresh",
            lesson: "Published lessons",
            content: "With content",
            license: "Verified resources",
            ready: "Ready to publish",
            blocked: "Publication requirements not met",
          };
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_hsk_course_readiness");
    if (error) setMessage(error.message);
    else {
      setRows((data || []) as Row[]);
      setMessage("");
    }
  }, []);
  useEffect(() => {
    // Remote data resolves asynchronously before updating state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  return (
    <section className="hsk-readiness-panel course-metadata-editor">
      <header>
        <div>
          <h2>
            <ShieldAlert size={20} />
            {c.title}
          </h2>
          <p>{c.intro}</p>
        </div>
        <button type="button" onClick={() => void load()}>
          <RefreshCw size={15} />
          {c.refresh}
        </button>
      </header>
      {message ? <p className="verification-message">{message}</p> : null}
      <div className="hsk-readiness-grid">
        {rows.map((row) => (
          <article key={row.product_id}>
            <strong>{row.catalog_key.toUpperCase()}</strong>
            <small>
              {c.lesson}: {row.published_lessons}
            </small>
            <small>
              {c.content}: {row.content_lessons}
            </small>
            <small>
              {c.license}: {row.verified_resources}
            </small>
            <span className={row.ready ? "ready" : "blocked"}>
              {row.ready ? (
                <CheckCircle2 size={14} />
              ) : (
                <ShieldAlert size={14} />
              )}{" "}
              {row.ready ? c.ready : c.blocked}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
