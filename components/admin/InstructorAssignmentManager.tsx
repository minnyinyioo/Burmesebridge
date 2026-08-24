"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Course = { id: number; title: string };
type InstructorRow = {
  product_id: number;
  course_title: string;
  user_id: string;
  instructor_name: string;
  instructor_email: string;
  created_at: string;
};

export default function InstructorAssignmentManager({ locale, products }: { locale: string; products: Course[] }) {
  const copy = locale === "zh"
    ? { title: "分配课程教师", course: "选择课程", email: "已认证教师邮箱", save: "分配教师", done: "教师已分配", assigned: "已分配教师", empty: "暂无教师分配", remove: "解除分配" }
    : locale === "my"
      ? { title: "သင်တန်းဆရာ ခန့်အပ်ရန်", course: "သင်တန်းရွေးပါ", email: "အတည်ပြုပြီး ဆရာ၏ Email", save: "ဆရာခန့်အပ်ရန်", done: "ဆရာ ခန့်အပ်ပြီးပါပြီ", assigned: "ခန့်အပ်ထားသော ဆရာများ", empty: "ဆရာခန့်အပ်ထားခြင်း မရှိသေးပါ", remove: "ခန့်အပ်မှု ပယ်ဖျက်ရန်" }
      : { title: "Assign course instructor", course: "Select a course", email: "Verified instructor email", save: "Assign instructor", done: "Instructor assigned", assigned: "Assigned instructors", empty: "No instructors assigned", remove: "Remove assignment" };
  const [productId, setProductId] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<InstructorRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("list_knowledge_course_instructors");
    if (error) setMessage(error.message);
    else setItems((data || []) as InstructorRow[]);
  }, []);

  useEffect(() => {
    // The initial admin-only RPC populates this client-side management list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function assign() {
    if (!productId || !email.trim()) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase.rpc("assign_knowledge_course_instructor", {
      p_product_id: Number(productId),
      p_teacher_email: email.trim(),
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setEmail("");
      setMessage(copy.done);
      await load();
    }
  }

  async function remove(item: InstructorRow) {
    setMessage("");
    const { error } = await supabase.rpc("remove_knowledge_course_instructor", {
      p_product_id: item.product_id,
      p_user_id: item.user_id,
    });
    if (error) setMessage(error.message);
    else await load();
  }

  return (
    <section className="instructor-assignment">
      <h2><GraduationCap size={21} />{copy.title}</h2>
      <div>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} aria-label={copy.course}>
          <option value="">{copy.course}</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
        </select>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} />
        <button type="button" disabled={loading || !productId || !email.trim()} onClick={assign}>{copy.save}</button>
      </div>
      {message ? <p className="verification-message">{message}</p> : null}
      <h3>{copy.assigned}</h3>
      <div className="instructor-assignment-list">
        {!items.length ? <p>{copy.empty}</p> : items.map((item) => (
          <article key={`${item.product_id}-${item.user_id}`}>
            <div>
              <strong>{item.course_title}</strong>
              <span>{item.instructor_name}</span>
              <small>{item.instructor_email}</small>
            </div>
            <button type="button" onClick={() => remove(item)} aria-label={`${copy.remove}: ${item.instructor_name}`}>
              <Trash2 size={15} />{copy.remove}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
