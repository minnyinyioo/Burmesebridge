"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { getYouTubeId } from "@/lib/youtube";
import CourseCoverUploader from "@/components/admin/CourseCoverUploader";
import PaymentMethodsManager from "@/components/admin/PaymentMethodsManager";

type RequestItem = {
  id: number;
  payment_reference: string;
  created_at: string;
  product_id: number;
  user_id: string;
  knowledge_products: {
    title_zh: string | null;
    title_my: string | null;
    title_en: string | null;
  } | null;
};
type ProductItem = {
  id: number;
  title_zh: string | null;
  title_my: string | null;
  title_en: string | null;
  price: number;
  currency: string;
  status: "draft" | "published";
};
export default function AdminKnowledgePage() {
  return (
    <AdminGuard>
      <KnowledgeAdmin />
    </AdminGuard>
  );
}
function KnowledgeAdmin() {
  const locale = String(useParams().locale || "my");
  const c =
    locale === "zh"
      ? {
          title: "知识付费管理",
          intro: "创建免费或付费课程，并人工核对付款后授权。",
          name: "课程标题（当前语言）",
          desc: "简介",
          content: "完整课程内容",
          price: "价格（0 为免费）",
          currency: "币种",
          cover: "封面图片地址（可选）",
          video: "试看 YouTube 链接（可选）",
          publish: "发布课程",
          requests: "待审核开通申请",
          approve: "确认并开通",
          reject: "拒绝",
          empty: "暂无待审核申请",
        }
      : locale === "my"
        ? {
            title: "အခပေးသင်တန်း စီမံခန့်ခွဲမှု",
            intro:
              "အခမဲ့/အခပေးသင်တန်းများ ဖန်တီးပြီး ငွေပေးချေမှုကို စစ်ဆေးပါ။",
            name: "သင်တန်းခေါင်းစဉ်",
            desc: "အကျဉ်းချုပ်",
            content: "သင်တန်းအကြောင်းအရာ",
            price: "ဈေးနှုန်း (0 = အခမဲ့)",
            currency: "ငွေကြေး",
            cover: "မျက်နှာဖုံးပုံ URL",
            video: "အစမ်း YouTube လင့်ခ်",
            publish: "ထုတ်ဝေမည်",
            requests: "ဖွင့်ရန်တောင်းဆိုမှု",
            approve: "အတည်ပြုမည်",
            reject: "ငြင်းမည်",
            empty: "တောင်းဆိုမှုမရှိပါ",
          }
        : {
            title: "Knowledge management",
            intro:
              "Create free or paid courses and manually verify payment before granting access.",
            name: "Course title",
            desc: "Description",
            content: "Full course content",
            price: "Price (0 is free)",
            currency: "Currency",
            cover: "Cover image URL (optional)",
            video: "Preview YouTube URL (optional)",
            publish: "Publish course",
            requests: "Access requests",
            approve: "Approve and unlock",
            reject: "Reject",
            empty: "No pending requests",
          };
  const manage =
    locale === "zh"
      ? {
          courses: "课程管理",
          online: "已发布",
          offline: "已下架",
          takeDown: "下架",
          putOnline: "重新发布",
          remove: "删除课程",
          confirm: "删除课程及其订单和授权？",
        }
      : locale === "my"
        ? {
            courses: "သင်တန်း စီမံရန်",
            online: "ထုတ်ဝေပြီး",
            offline: "ပိတ်ထားသည်",
            takeDown: "ပိတ်မည်",
            putOnline: "ပြန်တင်မည်",
            remove: "ဖျက်မည်",
            confirm: "သင်တန်းနှင့် ခွင့်ပြုချက်များကို ဖျက်မလား?",
          }
        : {
            courses: "Manage courses",
            online: "Published",
            offline: "Offline",
            takeDown: "Take offline",
            putOnline: "Publish again",
            remove: "Delete course",
            confirm: "Delete this course, its requests and access grants?",
          };
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("MMK");
  const [cover, setCover] = useState("");
  const [video, setVideo] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const [
      { data: requestData, error: requestError },
      { data: productData, error: productError },
    ] = await Promise.all([
      supabase
        .from("knowledge_purchase_requests")
        .select(
          "id,payment_reference,created_at,product_id,user_id,knowledge_products(title_zh,title_my,title_en)",
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("knowledge_products")
        .select("id,title_zh,title_my,title_en,price,currency,status")
        .order("created_at", { ascending: false }),
    ]);
    const error = requestError || productError;
    if (error) setMsg(error.message);
    else {
      setRequests((requestData || []) as unknown as RequestItem[]);
      setProducts((productData || []) as ProductItem[]);
    }
  }, []);
  // Initial remote fetch; state updates happen after Supabase resolves.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function create(e: FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const payload: Record<string, unknown> = {
      [`title_${suffix}`]: title.trim(),
      [`description_${suffix}`]: desc.trim(),
      price: Number(price) || 0,
      currency,
      cover_url: cover.trim() || null,
      preview_youtube_id: getYouTubeId(video) || null,
      status: "published",
      author_id: user?.id || null,
    };
    const { data: product, error } = await supabase
      .from("knowledge_products")
      .insert(payload)
      .select("id")
      .single();
    if (error || !product) {
      setMsg(error?.message || "Create failed");
      return;
    }
    const { error: contentError } = await supabase
      .from("knowledge_product_content")
      .insert({
        product_id: product.id,
        [`content_${suffix}`]: content.trim(),
      });
    if (contentError) setMsg(contentError.message);
    else {
      setTitle("");
      setDesc("");
      setContent("");
      setPrice("0");
      setCover("");
      setVideo("");
      setMsg("");
      await load();
    }
  }
  async function setProductStatus(id: number, status: "draft" | "published") {
    const { error } = await supabase
      .from("knowledge_products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setMsg(error.message);
    else await load();
  }
  async function removeProduct(id: number) {
    if (!confirm(manage.confirm)) return;
    const { error } = await supabase
      .from("knowledge_products")
      .delete()
      .eq("id", id);
    if (error) setMsg(error.message);
    else await load();
  }
  async function review(id: number, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("knowledge_purchase_requests")
      .update({ status })
      .eq("id", id);
    if (error) setMsg(error.message);
    else await load();
  }
  return (
    <div className="adminShell">
      <AdminSidebar />
      <div className="adminContent">
        <div className="admin-page-head">
          <div>
            <h1>{c.title}</h1>
            <p>{c.intro}</p>
          </div>
        </div>
        <form className="feedCard knowledge-admin-form" onSubmit={create}>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={c.name}
          />
          <textarea
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={c.desc}
          />
          <textarea
            required
            className="knowledge-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={c.content}
          />
          <div>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={c.price}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>MMK</option>
              <option>CNY</option>
              <option>USD</option>
            </select>
          </div>
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder={c.cover}
          />
          <CourseCoverUploader locale={locale} onUploaded={setCover} />
          {cover && <div className="course-cover-ready">✓ {cover}</div>}
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder={c.video}
          />
          <button>{c.publish}</button>
        </form>
        <h2 className="knowledge-request-title">{manage.courses}</h2>
        <div className="knowledge-product-list">
          {products.map((product) => (
            <article className="feedCard knowledge-request" key={product.id}>
              <div>
                <strong>
                  {product.title_zh || product.title_my || product.title_en}
                </strong>
                <p>
                  {Number(product.price).toLocaleString()} {product.currency} ·{" "}
                  {product.status === "published"
                    ? manage.online
                    : manage.offline}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setProductStatus(
                      product.id,
                      product.status === "published" ? "draft" : "published",
                    )
                  }
                >
                  {product.status === "published"
                    ? manage.takeDown
                    : manage.putOnline}
                </button>
                <button
                  type="button"
                  className="reject"
                  onClick={() => removeProduct(product.id)}
                >
                  {manage.remove}
                </button>
              </div>
            </article>
          ))}
        </div>
        <PaymentMethodsManager locale={locale} />
        <h2 className="knowledge-request-title">{c.requests}</h2>
        {msg && <p className="verification-message">{msg}</p>}
        <div className="verification-list">
          {requests.length === 0 && <div className="feedCard">{c.empty}</div>}
          {requests.map((r) => (
            <article className="feedCard knowledge-request" key={r.id}>
              <div>
                <strong>
                  {r.knowledge_products?.title_zh ||
                    r.knowledge_products?.title_my ||
                    r.knowledge_products?.title_en}
                </strong>
                <p>{r.payment_reference}</p>
                <small>
                  {r.user_id} · {new Date(r.created_at).toLocaleString()}
                </small>
              </div>
              <div>
                <button type="button" onClick={() => review(r.id, "approved")}>
                  <Check size={16} />
                  {c.approve}
                </button>
                <button
                  type="button"
                  className="reject"
                  onClick={() => review(r.id, "rejected")}
                >
                  <X size={16} />
                  {c.reject}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
