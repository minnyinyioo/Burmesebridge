"use client";
import { useState } from "react";
import { LibraryBig } from "lucide-react";
import { supabase } from "@/lib/supabase";
export default function HskCatalogInitializer({
  locale,
  onDone,
}: {
  locale: string;
  onDone: () => void;
}) {
  const c =
    locale === "zh"
      ? {
          title: "HSK 1–6 课程初始化",
          intro:
            "一次建立 6 个等级 × 4 项技能，共 24 套课程骨架。课程默认为草稿，添加并核验资源后再发布。",
          run: "初始化缺少的课程",
          done: "初始化完成，新增课程：",
        }
      : locale === "my"
        ? {
            title: "HSK ၁–၆ သင်တန်း စတင်ဖန်တီးရန်",
            intro:
              "အဆင့် ၆ ခု × ကျွမ်းကျင်မှု ၄ မျိုး စုစုပေါင်း သင်တန်း ၂၄ ခုကို Draft အဖြစ် ဖန်တီးမည်။",
            run: "လိုအပ်သောသင်တန်းများ ဖန်တီးရန်",
            done: "ဖန်တီးပြီး သင်တန်းအသစ်: ",
          }
        : {
            title: "Initialize HSK 1–6 catalog",
            intro:
              "Create 24 draft course shells: six levels × four skills. Add and verify resources before publishing.",
            run: "Initialize missing courses",
            done: "Initialization complete. New courses: ",
          };
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run() {
    setBusy(true);
    const { data, error } = await supabase.rpc("initialize_hsk_course_catalog");
    setBusy(false);
    if (error) setMessage(error.message);
    else {
      setMessage(`${c.done}${data}`);
      onDone();
    }
  }
  return (
    <section className="course-metadata-editor">
      <h2>
        <LibraryBig size={20} />
        {c.title}
      </h2>
      <p>{c.intro}</p>
      <button type="button" disabled={busy} onClick={() => void run()}>
        {busy ? "…" : c.run}
      </button>
      {message ? <p className="verification-message">{message}</p> : null}
    </section>
  );
}
