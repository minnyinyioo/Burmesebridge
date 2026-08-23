"use client";
import { FormEvent, useState } from "react";
import { PencilLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Product = { id: number; title: string };
export default function CourseMetadataEditor({
  locale,
  products,
}: {
  locale: string;
  products: Product[];
}) {
  const c =
    locale === "zh"
      ? {
          title: "编辑课程资料",
          choose: "选择课程",
          level: "等级",
          skill: "技能",
          teacher: "教师",
          bio: "教师简介",
          goals: "学习目标（每行一项）",
          audience: "适用对象（每行一项）",
          minutes: "预计分钟",
          save: "保存课程资料",
          saved: "课程资料已保存",
        }
      : locale === "my"
        ? {
            title: "သင်တန်းအချက်အလက် ပြင်ရန်",
            choose: "သင်တန်းရွေးရန်",
            level: "အဆင့်",
            skill: "ကျွမ်းကျင်မှု",
            teacher: "သင်ကြားသူ",
            bio: "သင်ကြားသူအကြောင်း",
            goals: "ရည်မှန်းချက် (တစ်ကြောင်းတစ်ခု)",
            audience: "သင့်တော်သူများ (တစ်ကြောင်းတစ်ခု)",
            minutes: "ခန့်မှန်းမိနစ်",
            save: "သိမ်းရန်",
            saved: "သိမ်းပြီးပါပြီ",
          }
        : {
            title: "Edit course details",
            choose: "Choose course",
            level: "Level",
            skill: "Skill",
            teacher: "Instructor",
            bio: "Instructor bio",
            goals: "Learning objectives (one per line)",
            audience: "Target audience (one per line)",
            minutes: "Estimated minutes",
            save: "Save course details",
            saved: "Course details saved",
          };
  const [selected, setSelected] = useState("");
  const [level, setLevel] = useState("");
  const [skill, setSkill] = useState("");
  const [teacher, setTeacher] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [minutes, setMinutes] = useState("");
  const [message, setMessage] = useState("");
  async function choose(value: string) {
    setSelected(value);
    setMessage("");
    if (!value) return;
    const { data, error } = await supabase
      .from("knowledge_products")
      .select(
        "level,skill,teacher_name,teacher_bio,learning_objectives,target_audience,estimated_minutes",
      )
      .eq("id", Number(value))
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setLevel(data.level || "");
    setSkill(data.skill || "");
    setTeacher(data.teacher_name || "");
    setBio(data.teacher_bio || "");
    setGoals(
      Array.isArray(data.learning_objectives)
        ? data.learning_objectives.join("\n")
        : "",
    );
    setAudience(
      Array.isArray(data.target_audience)
        ? data.target_audience.join("\n")
        : "",
    );
    setMinutes(data.estimated_minutes ? String(data.estimated_minutes) : "");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("knowledge_products")
      .update({
        level: level.trim() || null,
        skill: skill.trim() || null,
        teacher_name: teacher.trim() || null,
        teacher_bio: bio.trim() || null,
        learning_objectives: goals
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean),
        target_audience: audience
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean),
        estimated_minutes: minutes ? Number(minutes) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", Number(selected));
    setMessage(error ? error.message : c.saved);
  }
  return (
    <section className="course-metadata-editor">
      <h2>
        <PencilLine size={20} />
        {c.title}
      </h2>
      <select value={selected} onChange={(e) => void choose(e.target.value)}>
        <option value="">{c.choose}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
      {selected ? (
        <form onSubmit={save}>
          <div>
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder={c.level}
            />
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder={c.skill}
            />
          </div>
          <div>
            <input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder={c.teacher}
            />
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder={c.minutes}
            />
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={c.bio}
          />
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={c.goals}
          />
          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={c.audience}
          />
          <button>{c.save}</button>
        </form>
      ) : null}
      {message ? <p className="verification-message">{message}</p> : null}
    </section>
  );
}
