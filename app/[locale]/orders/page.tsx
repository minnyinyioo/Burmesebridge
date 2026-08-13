"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Order = {
  id: number;
  product_id: number;
  payment_reference: string;
  status: string;
  review_note: string | null;
  created_at: string;
  knowledge_products: {
    title_my: string | null;
    title_zh: string | null;
    title_en: string | null;
  } | null;
};
export default function OrdersPage() {
  const locale = String(useParams().locale || "my");
  const router = useRouter();
  const copy =
    locale === "zh"
      ? {
          title: "购买记录",
          empty: "暂无购买申请",
          pending: "审核中",
          approved: "已开通",
          rejected: "未通过",
          note: "审核备注",
          course: "查看课程",
        }
      : locale === "my"
        ? {
            title: "ဝယ်ယူမှု မှတ်တမ်း",
            empty: "ဝယ်ယူမှု မရှိသေးပါ",
            pending: "စစ်ဆေးနေသည်",
            approved: "ဖွင့်ပြီး",
            rejected: "မအောင်မြင်",
            note: "စစ်ဆေးမှတ်ချက်",
            course: "သင်တန်းကြည့်ရန်",
          }
        : {
            title: "Purchase history",
            empty: "No purchase requests",
            pending: "Under review",
            approved: "Unlocked",
            rejected: "Rejected",
            note: "Review note",
            course: "View course",
          };
  const [orders, setOrders] = useState<Order[]>([]);
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
      const { data } = await supabase
        .from("knowledge_purchase_requests")
        .select(
          "id,product_id,payment_reference,status,review_note,created_at,knowledge_products(title_my,title_zh,title_en)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (active) setOrders((data || []) as unknown as Order[]);
    }
    void load();
    return () => {
      active = false;
    };
  }, [locale, router]);
  const title = (order: Order) =>
    locale === "zh"
      ? order.knowledge_products?.title_zh ||
        order.knowledge_products?.title_my ||
        order.knowledge_products?.title_en
      : locale === "en"
        ? order.knowledge_products?.title_en ||
          order.knowledge_products?.title_my ||
          order.knowledge_products?.title_zh
        : order.knowledge_products?.title_my ||
          order.knowledge_products?.title_zh ||
          order.knowledge_products?.title_en;
  return (
    <main className="orders-page">
      <header>
        <ClipboardList size={22} />
        <h1>{copy.title}</h1>
      </header>
      <div>
        {orders.length === 0 && <div className="feedCard">{copy.empty}</div>}
        {orders.map((order) => (
          <article key={order.id}>
            <div>
              <span className={`request-${order.status}`}>
                {order.status === "pending"
                  ? copy.pending
                  : order.status === "approved"
                    ? copy.approved
                    : copy.rejected}
              </span>
              <h2>{title(order)}</h2>
              <p>{order.payment_reference}</p>
              <time>{new Date(order.created_at).toLocaleString()}</time>
              {order.review_note && (
                <blockquote>
                  <strong>{copy.note}</strong>
                  <p>{order.review_note}</p>
                </blockquote>
              )}
            </div>
            <Link href={`/${locale}/knowledge/${order.product_id}`}>
              {copy.course}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
