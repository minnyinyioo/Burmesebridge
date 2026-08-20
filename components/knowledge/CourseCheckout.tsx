"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, LockKeyhole, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PaymentProofInput from "@/components/knowledge/PaymentProofInput";
import type { PaymentMethod } from "@/components/knowledge/PaymentMethods";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";

type Props = { locale:string; productId:number; userId:string|null; price:number; currency:string; requestStatus:string|null; onSubmitted:()=>Promise<void> };
type MembershipPlan = { id:number; code:"monthly"|"yearly"|"lifetime"; price:number; currency:string };

export default function CourseCheckout({locale,productId,userId,price,currency,requestStatus,onSubmitted}:Props) {
  const router = useRouter();
  const copy = locale === "zh"
    ? { buy:"购买 / 会员", login:"登录后购买", title:"确认购买", summary:"选择购买方案", course:"单个课程 · 永久学习权限", monthly:"全站月会员", yearly:"全站年会员", lifetime:"全站终身会员", choose:"选择付款方式", holder:"收款人", account:"账号", reference:"交易参考号", proof:"付款截图", submit:"提交付款审核", sending:"正在提交…", pending:"付款审核中，确认后自动开通", rejected:"上次申请未通过，可修改资料后重新提交", close:"关闭", safe:"付款资料只在你主动购买时显示，开通后不再展示。", invalid:"付款凭证文件无效。", unavailable:"暂时没有可用付款方式，请联系管理员。" }
    : locale === "my"
      ? { buy:"ဝယ်ယူရန် / Member", login:"ဝင်ပြီး ဝယ်ယူပါ", title:"ဝယ်ယူမှု အတည်ပြုရန်", summary:"ဝယ်ယူမှုရွေးရန်", course:"သင်တန်းတစ်ခု · အမြဲတမ်းလေ့လာခွင့်", monthly:"တစ်လ Member", yearly:"တစ်နှစ် Member", lifetime:"တစ်သက်တာ Member", choose:"ငွေပေးချေမှုရွေးရန်", holder:"လက်ခံသူ", account:"အကောင့်", reference:"ငွေလွှဲနံပါတ်", proof:"ငွေလွှဲပုံ", submit:"စစ်ဆေးရန် ပို့မည်", sending:"ပို့နေသည်…", pending:"ငွေပေးချေမှု စစ်ဆေးနေပါသည်", rejected:"ယခင်တောင်းဆိုမှု မအောင်မြင်ပါ။ ပြန်ပို့နိုင်ပါသည်။", close:"ပိတ်မည်", safe:"ဝယ်ယူရန်နှိပ်မှသာ ငွေပေးချေမှုအချက်အလက်ကို ပြပါမည်။", invalid:"ငွေလွှဲဖိုင် မမှန်ပါ။", unavailable:"ငွေပေးချေမှုနည်းလမ်း မရှိသေးပါ။" }
      : { buy:"Purchase / Membership", login:"Sign in to purchase", title:"Complete purchase", summary:"Choose a purchase option", course:"Single course · Lifetime course access", monthly:"Site-wide monthly membership", yearly:"Site-wide annual membership", lifetime:"Site-wide lifetime membership", choose:"Choose payment method", holder:"Account holder", account:"Account", reference:"Transaction reference", proof:"Payment proof", submit:"Submit for review", sending:"Submitting…", pending:"Payment is under review and access will open automatically after approval.", rejected:"The previous request was rejected. You can correct and resubmit it.", close:"Close", safe:"Payment details appear only after you choose to buy and disappear after access is granted.", invalid:"The payment proof file is invalid.", unavailable:"No payment method is currently available." };
  const [open,setOpen] = useState(false);
  const [methods,setMethods] = useState<PaymentMethod[]>([]);
  const [plans,setPlans] = useState<MembershipPlan[]>([]);
  const [purchaseOption,setPurchaseOption] = useState("course");
  const [methodId,setMethodId] = useState("");
  const [reference,setReference] = useState("");
  const [proof,setProof] = useState<File|null>(null);
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  const selected = methods.find((item) => String(item.id) === methodId);

  async function revealCheckout() {
    if (!userId) { router.push(`/${locale}/login?next=/${locale}/knowledge/${productId}`); return; }
    setOpen(true);
    if (methods.length) return;
    const [{data,error},{data:planData}] = await Promise.all([
      supabase.from("knowledge_payment_methods").select("id,name,account_name,account_number,instructions_my,instructions_zh,instructions_en").eq("enabled",true).order("sort_order"),
      supabase.from("knowledge_membership_plans").select("id,code,price,currency").eq("enabled",true).order("sort_order"),
    ]);
    if (error) setMessage(error.message);
    else {
      const next = (data || []) as PaymentMethod[];
      setMethods(next);
      if (next[0]) setMethodId(String(next[0].id));
    }
    setPlans((planData || []) as MembershipPlan[]);
  }
  const instructions = selected ? (locale === "zh" ? selected.instructions_zh || selected.instructions_my || selected.instructions_en : locale === "en" ? selected.instructions_en || selected.instructions_my || selected.instructions_zh : selected.instructions_my || selected.instructions_zh || selected.instructions_en) : null;

  async function submit(event:FormEvent) {
    event.preventDefault();
    if (!userId || !selected || !reference.trim()) return;
    setLoading(true); setMessage("");
    let proofPath:string|null = null;
    if (proof) {
      const valid = await validateUpload(proof,["image/jpeg","image/png","image/webp","application/pdf"]);
      if (!valid) { setLoading(false); setMessage(copy.invalid); return; }
      proofPath = `${userId}/${productId}-${crypto.randomUUID()}.${safeFileExtension(proof)}`;
      const {error} = await supabase.storage.from("payment-proofs").upload(proofPath,proof,{contentType:proof.type});
      if (error) { setLoading(false); setMessage(error.message); return; }
    }
    const paymentReference = `${selected.name} | ${reference.trim()}`;
    const selectedPlan = plans.find((plan) => String(plan.id) === purchaseOption);
    const query = selectedPlan
      ? supabase.from("knowledge_membership_requests").insert({plan_id:selectedPlan.id,user_id:userId,payment_reference:paymentReference,proof_path:proofPath,status:"pending"})
      : requestStatus === "rejected"
      ? supabase.from("knowledge_purchase_requests").update({payment_reference:paymentReference,proof_path:proofPath,status:"pending",reviewer_id:null,reviewed_at:null}).eq("product_id",productId).eq("user_id",userId)
      : supabase.from("knowledge_purchase_requests").insert({product_id:productId,user_id:userId,payment_reference:paymentReference,proof_path:proofPath,status:"pending"});
    const {error} = await query;
    setLoading(false);
    if (error) setMessage(error.message);
    else { await onSubmitted(); setOpen(false); }
  }

  if (requestStatus === "pending") return <div className="course-purchase-status"><CheckCircle2 size={18}/>{copy.pending}</div>;
  return <>
    <button type="button" className="course-buy-button" onClick={revealCheckout}><LockKeyhole size={17}/>{userId ? copy.buy : copy.login}</button>
    {open ? <div className="checkout-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <section className="course-checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button type="button" className="checkout-close" aria-label={copy.close} onClick={() => setOpen(false)}><X size={19}/></button>
        <span className="checkout-icon"><CreditCard size={21}/></span><h2 id="checkout-title">{copy.title}</h2>
        <p>{copy.summary}</p>
        {requestStatus === "rejected" ? <p className="checkout-warning">{copy.rejected}</p> : null}
        <p className="checkout-safe"><LockKeyhole size={14}/>{copy.safe}</p>
        {methods.length ? <form onSubmit={submit}>
          <div className="checkout-options">
            <label className={purchaseOption === "course" ? "active" : ""}><input type="radio" name="purchase" value="course" checked={purchaseOption === "course"} onChange={(event) => setPurchaseOption(event.target.value)}/><span>{copy.course}</span><strong>{price.toLocaleString()} {currency}</strong></label>
            {plans.map((plan) => <label className={purchaseOption === String(plan.id) ? "active" : ""} key={plan.id}><input type="radio" name="purchase" value={plan.id} checked={purchaseOption === String(plan.id)} onChange={(event) => setPurchaseOption(event.target.value)}/><span>{copy[plan.code]}</span><strong>{Number(plan.price).toLocaleString()} {plan.currency}</strong></label>)}
          </div>
          <label>{copy.choose}<select value={methodId} onChange={(event) => setMethodId(event.target.value)}>{methods.map((method) => <option value={method.id} key={method.id}>{method.name}</option>)}</select></label>
          {selected ? <div className="checkout-account"><span>{copy.holder}<strong>{selected.account_name}</strong></span><span>{copy.account}<code>{selected.account_number}</code></span>{instructions ? <p>{instructions}</p> : null}</div> : null}
          <label>{copy.reference}<input required value={reference} onChange={(event) => setReference(event.target.value)}/></label>
          <label>{copy.proof}<PaymentProofInput locale={locale} file={proof} onChange={setProof}/></label>
          {message ? <p className="knowledge-message">{message}</p> : null}
          <button className="checkout-submit" disabled={loading}>{loading ? copy.sending : copy.submit}</button>
        </form> : <p>{message || copy.unavailable}</p>}
      </section>
    </div> : null}
  </>;
}
