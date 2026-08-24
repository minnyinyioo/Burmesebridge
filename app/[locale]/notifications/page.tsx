"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Notice = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};
export default function NotificationsPage() {
  const locale = String(useParams().locale || "my");
  const router = useRouter();
  const copy =
    locale === "zh"
      ? {
          title: "通知中心",
          empty: "暂无通知",
          all: "全部标为已读",
          remove: "删除",
          approved: "课程已开通",
          rejected: "付款审核结果",
          report: "举报处理结果",
          appeal: "申诉处理结果",
          jobReviewed: "招聘已审核",
          jobVerified: "招聘已验证",
          jobReturned: "招聘已退回",
          system: "系统通知",
        }
      : locale === "my"
        ? {
            title: "အသိပေးချက်များ",
            empty: "အသိပေးချက် မရှိသေးပါ",
            all: "အားလုံး ဖတ်ပြီး",
            remove: "ဖျက်ရန်",
            approved: "သင်တန်းဖွင့်ပြီး",
            rejected: "ငွေပေးချေမှုရလဒ်",
            report: "တိုင်ကြားမှုရလဒ်",
            appeal: "အယူခံရလဒ်",
            jobReviewed: "အလုပ်ကြော်ငြာ စိစစ်ပြီး",
            jobVerified: "အလုပ်ကြော်ငြာ အတည်ပြုပြီး",
            jobReturned: "အလုပ်ကြော်ငြာ ပြန်ပို့ထားသည်",
            system: "စနစ်အသိပေးချက်",
          }
        : {
            title: "Notifications",
            empty: "No notifications",
            all: "Mark all read",
            remove: "Delete",
            approved: "Course unlocked",
            rejected: "Payment review result",
            report: "Report review result",
            appeal: "Appeal review result",
            jobReviewed: "Job listing reviewed",
            jobVerified: "Job listing verified",
            jobReturned: "Job listing returned",
            system: "System notification",
          };
  const [items, setItems] = useState<Notice[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    setUserId(user.id);
    const { data } = await supabase
      .from("user_notifications")
      .select("id,type,title,body,href,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data || []) as Notice[]);
  }, [locale, router]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function mark(id: number) {
    if (!userId) return;
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    await load();
  }
  async function markAll() {
    if (!userId) return;
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    await load();
  }
  async function remove(id: number) {
    if (!userId) return;
    await supabase
      .from("user_notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    await load();
  }
  function typeLabel(type: string) {
    if (type === "purchase_approved") return copy.approved;
    if (type === "purchase_rejected") return copy.rejected;
    if (type.startsWith("report_")) return copy.report;
    if (type.startsWith("appeal_")) return copy.appeal;
    if (type === "job_reviewed") return copy.jobReviewed;
    if (type === "job_verified") return copy.jobVerified;
    if (type === "job_returned") return copy.jobReturned;
    return copy.system;
  }
  function localizedHref(href: string | null) {
    if (!href) return `/${locale}/orders`;
    const path = href.replace(/^\/(my|zh|en)(?=\/|$)/, "") || "/";
    return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return (
    <main className="notifications-page">
      <header>
        <div>
          <Bell size={22} />
          <h1>{copy.title}</h1>
        </div>
        {items.some((item) => !item.read_at) && (
          <button onClick={markAll}>
            <CheckCheck size={16} />
            {copy.all}
          </button>
        )}
      </header>
      <div>
        {items.length === 0 && <div className="feedCard">{copy.empty}</div>}
        {items.map((item) => (
          <article key={item.id} className={item.read_at ? "" : "unread"}>
            <Link
              href={localizedHref(item.href)}
              onClick={() => mark(item.id)}
            >
              <span>{typeLabel(item.type)}</span>
              <h2>{item.title}</h2>
              {item.body && <p>{item.body}</p>}
              <time>{new Date(item.created_at).toLocaleString()}</time>
            </Link>
            <button aria-label={copy.remove} onClick={() => remove(item.id)}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
