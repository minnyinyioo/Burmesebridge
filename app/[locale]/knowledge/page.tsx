"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Product = { id:number; title_my:string|null; title_zh:string|null; title_en:string|null; description_my:string|null; description_zh:string|null; description_en:string|null; cover_url:string|null; price:number; currency:string };
type LessonCount = { product_id:number };

export default function KnowledgePage() {
  const locale = String(useParams().locale || "my");
  const copy = locale === "zh"
    ? { eyebrow:"课程中心", title:"按自己的节奏系统学习", intro:"先查看课程介绍与目录；进入课程后可试看，确认适合再购买。", free:"免费", lessons:"节课", open:"查看课程", owned:"已解锁", empty:"课程正在准备中" }
    : locale === "my"
      ? { eyebrow:"သင်တန်းစင်တာ", title:"ကိုယ့်အရှိန်နဲ့ စနစ်တကျ လေ့လာပါ", intro:"သင်တန်းအကြောင်းနှင့် သင်ခန်းစာစာရင်းကို အရင်ကြည့်ပြီး အစမ်းကြည့်ပြီးမှ ဝယ်ယူနိုင်ပါသည်။", free:"အခမဲ့", lessons:"သင်ခန်းစာ", open:"သင်တန်းကြည့်ရန်", owned:"ဖွင့်ပြီး", empty:"သင်တန်းများ ပြင်ဆင်နေပါသည်" }
      : { eyebrow:"Course library", title:"Learn at your own pace", intro:"Review the course and syllabus, watch a preview, then purchase only when it fits your needs.", free:"Free", lessons:"lessons", open:"View course", owned:"Unlocked", empty:"Courses are being prepared" };
  const [products,setProducts] = useState<Product[]>([]);
  const [counts,setCounts] = useState<Record<number,number>>({});
  const [access,setAccess] = useState<number[]>([]);
  const [hasMembership,setHasMembership] = useState(false);

  const load = useCallback(async () => {
    const [{data:productData},{data:lessonData},{data:auth}] = await Promise.all([
      supabase.from("knowledge_products").select("id,title_my,title_zh,title_en,description_my,description_zh,description_en,cover_url,price,currency").eq("status","published").order("created_at",{ascending:false}),
      supabase.from("knowledge_lessons").select("product_id").eq("status","published"),
      supabase.auth.getUser(),
    ]);
    setProducts((productData || []) as Product[]);
    const nextCounts:Record<number,number> = {};
    for (const row of (lessonData || []) as LessonCount[]) nextCounts[row.product_id] = (nextCounts[row.product_id] || 0) + 1;
    setCounts(nextCounts);
    if (auth.user) {
      const [{data},{data:membership}] = await Promise.all([
        supabase.from("knowledge_access").select("product_id").eq("user_id",auth.user.id),
        supabase.from("knowledge_memberships").select("expires_at").eq("user_id",auth.user.id).maybeSingle(),
      ]);
      setAccess((data || []).map((item) => item.product_id));
      setHasMembership(Boolean(membership && (!membership.expires_at || new Date(membership.expires_at).getTime() > Date.now())));
    }
  },[]);
  useEffect(() => {
    // Initial Supabase fetch resolves asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  },[load]);
  const localized = (product:Product,field:"title"|"description") => {
    const row = product as unknown as Record<string,string|null>;
    const order = locale === "zh" ? ["zh","my","en"] : locale === "en" ? ["en","my","zh"] : ["my","zh","en"];
    return order.map((suffix) => row[`${field}_${suffix}`]).find(Boolean) || "";
  };

  return <main className="knowledge-shell knowledge-library">
    <header className="knowledge-library-head">
      <span><BookOpen size={17}/>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p>
    </header>
    <div className="knowledge-grid">
      {products.length === 0 ? <div className="feedCard">{copy.empty}</div> : null}
      {products.map((product) => {
        const unlocked = Number(product.price) === 0 || access.includes(product.id) || hasMembership;
        return <article className="knowledge-card" key={product.id}>
          <Link href={`/${locale}/knowledge/${product.id}`} className="knowledge-card-media" aria-label={localized(product,"title")}>
            {product.cover_url ? <span style={{backgroundImage:`url(${product.cover_url})`}}/> : <span className="knowledge-cover-fallback"><PlayCircle size={42}/></span>}
            <i><PlayCircle size={18}/></i>
          </Link>
          <div className="knowledge-card-body">
            <div className="knowledge-card-meta">
              <span>{unlocked && Number(product.price) > 0 ? <><CheckCircle2 size={14}/>{copy.owned}</> : Number(product.price) === 0 ? copy.free : `${Number(product.price).toLocaleString()} ${product.currency}`}</span>
              <span><Clock3 size={14}/>{counts[product.id] || 0} {copy.lessons}</span>
            </div>
            <h2>{localized(product,"title")}</h2><p>{localized(product,"description")}</p>
            <Link href={`/${locale}/knowledge/${product.id}`} className="knowledge-enter-course">{copy.open}<ArrowRight size={16}/></Link>
          </div>
        </article>;
      })}
    </div>
  </main>;
}
