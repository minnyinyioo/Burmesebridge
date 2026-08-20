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
type Membership = {
  expires_at: string | null;
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
          membership: "会员已生效",
          lifetime: "终身有效",
          expires: "有效期至",
        }
      : locale === "my"
        ? {
            title: "ကျွန်ုပ်၏ သင်တန်းများ",
            intro: "ဖွင့်ထားသော သင်တန်းများ ဆက်လေ့လာပါ။",
            empty: "ဖွင့်ထားသော သင်တန်း မရှိသေးပါ",
            continue: "ဆက်လေ့လာရန်",
            membership: "အဖွဲ့ဝင်အခွင့်အရေး အသက်ဝင်နေသည်",
            lifetime: "တစ်သက်တာ",
            expires: "သက်တမ်းကုန်ဆုံးမည့်ရက်",
          }
        : {
            title: "My courses",
            intro: "Continue your unlocked and free courses.",
            empty: "No unlocked courses yet",
            continue: "Continue learning",
            membership: "Membership active",
            lifetime: "Lifetime access",
            expires: "Expires",
          };
  const [courses, setCourses] = useState<Course[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
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
      const [{ data: free }, { data: access }, { data: membershipData }] =
        await Promise.all([
        supabase
          .from("knowledge_products")
          .select("id,title_my,title_zh,title_en,cover_url,price,currency")
          .eq("status", "published")
          .eq("price", 0),
        supabase
          .from("knowledge_access")
          .select("product_id")
          .eq("user_id", user.id),
        supabase
          .from("knowledge_memberships")
          .select("expires_at")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      const activeMembership =
        membershipData &&
        (!membershipData.expires_at ||
          new Date(membershipData.expires_at).getTime() > Date.now())
          ? membershipData
          : null;
      const ids = (access || []).map((item) => item.product_id);
      const { data: paid } = activeMembership
        ? await supabase
            .from("knowledge_products")
            .select("id,title_my,title_zh,title_en,cover_url,price,currency")
            .eq("status", "published")
        : ids.length
        ? await supabase
            .from("knowledge_products")
            .select("id,title_my,title_zh,title_en,cover_url,price,currency")
            .in("id", ids)
            .eq("status", "published")
        : { data: [] };
      if (active) {
        setMembership(activeMembership as Membership | null);
        setCourses(
          [...(free || []), ...(paid || [])].filter(
            (item, index, all) =>
              all.findIndex((other) => other.id === item.id) === index,
          ) as Course[],
        );
      }
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
      {membership && (
        <aside className="membership-status" aria-live="polite">
          <strong>{copy.membership}</strong>
          <span>
            {membership.expires_at
              ? `${copy.expires} ${new Date(membership.expires_at).toLocaleDateString()}`
              : copy.lifetime}
          </span>
        </aside>
      )}
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
