"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Course = {
  id: number;
  title_my: string | null;
  title_zh: string | null;
  title_en: string | null;
  cover_url: string | null;
  price: number;
  currency: string;
};
export default function MyCoursesPage() {
  const locale = String(useParams().locale || "my");
  const router = useRouter();
  const copy =
    locale === "zh"
      ? {
          title: "我的课程",
          intro: "继续已购买或免费的课程。",
          empty: "暂时没有已解锁课程",
          continue: "继续学习",
        }
      : locale === "my"
        ? {
            title: "ကျွန်ုပ်၏ သင်တန်းများ",
            intro: "ဖွင့်ထားသော သင်တန်းများ ဆက်လေ့လာပါ။",
            empty: "ဖွင့်ထားသော သင်တန်း မရှိသေးပါ",
            continue: "ဆက်လေ့လာရန်",
          }
        : {
            title: "My courses",
            intro: "Continue your unlocked and free courses.",
            empty: "No unlocked courses yet",
            continue: "Continue learning",
          };
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/${locale}/login`);
        return;
      }
      const [{ data: free }, { data: access }] = await Promise.all([
        supabase
          .from("knowledge_products")
          .select("id,title_my,title_zh,title_en,cover_url,price,currency")
          .eq("status", "published")
          .eq("price", 0),
        supabase
          .from("knowledge_access")
          .select("product_id")
          .eq("user_id", user.id),
      ]);
      const ids = (access || []).map((item) => item.product_id);
      const { data: paid } = ids.length
        ? await supabase
            .from("knowledge_products")
            .select("id,title_my,title_zh,title_en,cover_url,price,currency")
            .in("id", ids)
            .eq("status", "published")
        : { data: [] };
      if (active)
        setCourses(
          [...(free || []), ...(paid || [])].filter(
            (item, index, all) =>
              all.findIndex((other) => other.id === item.id) === index,
          ) as Course[],
        );
    }
    void load();
    return () => {
      active = false;
    };
  }, [locale, router]);
  const title = (course: Course) =>
    locale === "zh"
      ? course.title_zh || course.title_my || course.title_en
      : locale === "en"
        ? course.title_en || course.title_my || course.title_zh
        : course.title_my || course.title_zh || course.title_en;
  return (
    <main className="my-courses">
      <header>
        <BookOpen size={22} />
        <div>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </header>
      <div>
        {courses.length === 0 && <div className="feedCard">{copy.empty}</div>}
        {courses.map((course) => (
          <article key={course.id}>
            {course.cover_url && (
              <div style={{ backgroundImage: `url(${course.cover_url})` }} />
            )}
            <section>
              <span>
                {Number(course.price) === 0
                  ? "Free"
                  : `${Number(course.price).toLocaleString()} ${course.currency}`}
              </span>
              <h2>{title(course)}</h2>
              <Link href={`/${locale}/knowledge/${course.id}`}>
                <PlayCircle size={16} />
                {copy.continue}
              </Link>
            </section>
          </article>
        ))}
      </div>
    </main>
  );
}
