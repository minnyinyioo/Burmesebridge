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
type MembershipOrder = {
  id: number;
  payment_reference: string;
  status: string;
  created_at: string;
  knowledge_membership_plans: {
    code: "monthly" | "yearly" | "lifetime";
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
          membership: "会员",
          monthly: "月度会员",
          yearly: "年度会员",
          lifetime: "终身会员",
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
            membership: "အဖွဲ့ဝင်",
            monthly: "လစဉ်အဖွဲ့ဝင်",
            yearly: "နှစ်စဉ်အဖွဲ့ဝင်",
            lifetime: "တစ်သက်တာအဖွဲ့ဝင်",
          }
        : {
            title: "Purchase history",
            empty: "No purchase requests",
            pending: "Under review",
            approved: "Unlocked",
            rejected: "Rejected",
            note: "Review note",
            course: "View course",
            membership: "Membership",
            monthly: "Monthly membership",
            yearly: "Annual membership",
            lifetime: "Lifetime membership",
          };
  const [orders, setOrders] = useState<Order[]>([]);
  const [membershipOrders, setMembershipOrders] = useState<MembershipOrder[]>([]);
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
      const [{ data }, { data: memberData }] = await Promise.all([
        supabase
          .from("knowledge_purchase_requests")
          .select(
            "id,product_id,payment_reference,status,review_note,created_at,knowledge_products(title_my,title_zh,title_en)",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("knowledge_membership_requests")
          .select(
            "id,payment_reference,status,created_at,knowledge_membership_plans(code)",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (active) {
        setOrders((data || []) as unknown as Order[]);
        setMembershipOrders(
          (memberData || []) as unknown as MembershipOrder[],
        );
      }
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
  const statusText = (status: string) =>
    status === "pending"
      ? copy.pending
      : status === "approved"
        ? copy.approved
        : copy.rejected;
  const membershipTitle = (order: MembershipOrder) => {
    const code = order.knowledge_membership_plans?.code;
    return code ? copy[code] : copy.membership;
  };
  return (
    <main className="orders-page">
      <header>
        <ClipboardList size={22} />
        <h1>{copy.title}</h1>
      </header>
      <div>
        {orders.length === 0 && membershipOrders.length === 0 && (
          <div className="feedCard">{copy.empty}</div>
        )}
        {membershipOrders.map((order) => (
          <article key={`membership-${order.id}`}>
            <div>
              <span className={`request-${order.status}`}>
                {statusText(order.status)}
              </span>
              <h2>{membershipTitle(order)}</h2>
              <p>{order.payment_reference}</p>
              <time>{new Date(order.created_at).toLocaleString()}</time>
            </div>
            {order.status === "approved" && (
              <Link href={`/${locale}/my-courses`}>{copy.course}</Link>
            )}
          </article>
        ))}
        {orders.map((order) => (
          <article key={order.id}>
            <div>
              <span className={`request-${order.status}`}>
                {statusText(order.status)}
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
