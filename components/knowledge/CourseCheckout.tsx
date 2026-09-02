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
    ? { buy:"购买 / 会员", login:"登录后购买", title:"确认购买", summary:"选择购买方案", course:"单个课程 · 永久学习权限", monthly:"全站月会员", yearly:"全站年会员", lifetime:"全站终身会员", choose:"选择付款方式", holder:"收款人", account:"账号", reference:"交易参考号", proof:"付款截图", submit:"提交付款审核", sending:"正在提交…", pending:"付款审核中，确认后自动开通", rejected:"上次申请未通过，可修改资料后重新提交", close:"关闭", safe:"付款资料只在你主动购买时显示，开通后不再展示。", invalid:"付款凭证文件无效。", unavailable:"暂时没有可用付款方式，请联系管理员。", termsTitle:"购买规则与退款说明", termsHint:"请滚动阅读完整规则至底部；读完后才能勾选同意。不同意请关闭窗口。", termsEnd:"已读完购买规则", termsConsent:"我已阅读、了解并同意购买规则", termsRequired:"请先读完并勾选同意购买规则" }
    : locale === "my"
      ? { buy:"ဝယ်ယူရန် / အဖွဲ့ဝင်အဖြစ် ဝင်ရောက်ရန်", login:"ဝင်ရောက်ပြီးမှ ဝယ်ယူရန်", title:"ဝယ်ယူမှုကို အတည်ပြုရန်", summary:"ဝယ်ယူမည့် အစီအစဉ်ကို ရွေးချယ်ပါ", course:"သင်တန်းတစ်ခုချင်း · အမြဲတမ်း လေ့လာခွင့်", monthly:"ဝက်ဘ်ဆိုက်တစ်ခုလုံးအတွက် လစဉ်အဖွဲ့ဝင်", yearly:"ဝက်ဘ်ဆိုက်တစ်ခုလုံးအတွက် နှစ်စဉ်အဖွဲ့ဝင်", lifetime:"ဝက်ဘ်ဆိုက်တစ်ခုလုံးအတွက် တစ်သက်တာအဖွဲ့ဝင်", choose:"ငွေပေးချေမှု နည်းလမ်းကို ရွေးချယ်ပါ", holder:"ငွေလက်ခံမည့် အကောင့်ပိုင်ရှင်", account:"အကောင့်အမှတ်", reference:"ငွေလွှဲလုပ်ငန်းစဉ် အမှတ်", proof:"ငွေပေးချေမှု အထောက်အထား", submit:"ငွေပေးချေမှု စိစစ်ရန် တင်ပြမည်", sending:"တင်ပြနေပါသည်…", pending:"ငွေပေးချေမှုကို စိစစ်နေပါသည်။ အတည်ပြုပြီးပါက အသုံးပြုခွင့် အလိုအလျောက် ဖွင့်ပေးမည်။", rejected:"ယခင်လျှောက်ထားချက်ကို အတည်မပြုခဲ့ပါ။ အချက်အလက်ပြင်ဆင်ပြီး ပြန်လည်တင်ပြနိုင်ပါသည်။", close:"ပိတ်ရန်", safe:"ဝယ်ယူရန် သင်ကိုယ်တိုင် ရွေးချယ်သည့်အခါမှသာ ငွေပေးချေမှု အချက်အလက်များကို ပြသမည်။ အသုံးပြုခွင့်ရရှိပြီးနောက် မပြသတော့ပါ။", invalid:"ငွေပေးချေမှု အထောက်အထားဖိုင်သည် သတ်မှတ်ချက်နှင့် မကိုက်ညီပါ။", unavailable:"လက်ရှိအသုံးပြုနိုင်သော ငွေပေးချေမှုနည်းလမ်း မရှိသေးပါ။ စီမံခန့်ခွဲသူထံ ဆက်သွယ်ပါ။", termsTitle:"ဝယ်ယူမှု စည်းမျဉ်းနှင့် ငွေပြန်အမ်းခြင်း", termsHint:"စည်းမျဉ်းကို အောက်ဆုံးအထိ လှိမ့်ဖတ်ပြီးမှ သဘောတူနိုင်ပါမည်။ မသဘောတူပါက ဝင်းဒိုးကို ပိတ်ပါ။", termsEnd:"ဝယ်ယူမှု စည်းမျဉ်း ဖတ်ပြီးပါပြီ", termsConsent:"ဝယ်ယူမှု စည်းမျဉ်းကို ဖတ်ရှုနားလည်ပြီး သဘောတူပါသည်", termsRequired:"ဝယ်ယူမှု စည်းမျဉ်းကို အဆုံးအထိ ဖတ်ပြီး သဘောတူပါ" }
      : { buy:"Purchase / Membership", login:"Sign in to purchase", title:"Complete purchase", summary:"Choose a purchase option", course:"Single course · Lifetime course access", monthly:"Site-wide monthly membership", yearly:"Site-wide annual membership", lifetime:"Site-wide lifetime membership", choose:"Choose payment method", holder:"Account holder", account:"Account", reference:"Transaction reference", proof:"Payment proof", submit:"Submit for review", sending:"Submitting…", pending:"Payment is under review and access will open automatically after approval.", rejected:"The previous request was rejected. You can correct and resubmit it.", close:"Close", safe:"Payment details appear only after you choose to buy and disappear after access is granted.", invalid:"The payment proof file is invalid.", unavailable:"No payment method is currently available.", termsTitle:"Purchase rules and refund notice", termsHint:"Scroll through the complete rules to the end before ticking consent. Close the window if you disagree.", termsEnd:"Purchase rules read", termsConsent:"I have read, understood, and agree to the purchase rules", termsRequired:"Read the purchase rules to the end and tick consent" };
  const purchaseTerms = locale === "zh" ? ["购买前请核对课程或会员名称、价格、币种、访问期限、付款方式和收款账户。", "课程、会员和资料仅供购买者本人学习使用，不得转售、转租、共享账号、录屏分发或绕过访问控制。", "课程或会员开通、下载或使用后，原则上不因个人改变主意退款；但适用法律、重复扣款、未授权交易、平台未提供服务或支付渠道规则另有要求的除外。", "付款凭证仅用于审核；不要上传与付款无关的身份证件或敏感信息。发现问题请尽快联系平台并保留凭证。", "提交购买申请表示你已阅读、理解并同意这些规则；不同意不能继续。"] : locale === "my" ? ["မဝယ်ယူမီ သင်တန်း/အဖွဲ့ဝင်အစီအစဉ်၊ စျေးနှုန်း၊ ငွေကြေးအမျိုးအစား၊ အသုံးပြုခွင့်ကာလနှင့် ငွေလက်ခံမည့်အကောင့်ကို စစ်ဆေးပါ။", "သင်တန်း၊ membership နှင့် ပစ္စည်းများကို ဝယ်ယူသူကိုယ်တိုင် သင်ယူရန်သာ သုံးရမည်။ ပြန်ရောင်းခြင်း၊ ငှားခြင်း၊ account မျှဝေခြင်း၊ screen-recording ဖြန့်ဝေခြင်း သို့မဟုတ် ခွင့်ပြုချက်ကျော်လွှားခြင်း မပြုရ။", "သင်တန်း/အဖွဲ့ဝင်အသုံးပြုခွင့် ဖွင့်ပြီး၊ download သို့မဟုတ် အသုံးပြုပြီးနောက် ကိုယ်ပိုင်စိတ်ပြောင်းခြင်းအတွက် ငွေပြန်မအမ်းပါ။ သို့သော် သက်ဆိုင်ရာဥပဒေ၊ ငွေထပ်ကောက်ခံမှု၊ ခွင့်မပြုထားသော ငွေပေးချေမှု၊ ဝန်ဆောင်မှုမပေးနိုင်မှု သို့မဟုတ် payment channel စည်းမျဉ်းကို လိုက်နာမည်။", "ငွေပေးချေမှုအထောက်အထားကို စိစစ်ရန်သာ သုံးမည်။ မလိုအပ်သော မှတ်ပုံတင် သို့မဟုတ် အရေးကြီးကိုယ်ရေးအချက်အလက် မတင်ပါနှင့်။ ပြဿနာရှိပါက platform သို့ အမြန်ဆက်သွယ်ပြီး အထောက်အထား သိမ်းထားပါ။", "ဝယ်ယူမှုတင်ပြခြင်းသည် ဤစည်းမျဉ်းများကို ဖတ်ရှုနားလည်ပြီး သဘောတူခြင်း ဖြစ်သည်။ မသဘောတူပါက ဆက်လက်မလုပ်နိုင်ပါ။"] : ["Before buying, verify the course or membership name, price, currency, access period, payment method, and recipient account.", "Courses, memberships, and materials are for the purchaser’s personal learning only. Do not resell, rent, share accounts, record and distribute, or bypass access controls.", "After activation, download, or use, a change-of-mind refund is generally unavailable, except where applicable law, duplicate charging, an unauthorised transaction, failure to provide the service, or a payment-channel rule requires otherwise.", "Payment proof is used only for review. Do not upload unrelated identity documents or sensitive information. Contact the platform promptly and keep your receipt if there is a problem.", "Submitting a purchase request means you have read, understood, and agreed to these rules. You cannot continue if you disagree."];
  const [open,setOpen] = useState(false);
  const [methods,setMethods] = useState<PaymentMethod[]>([]);
  const [plans,setPlans] = useState<MembershipPlan[]>([]);
  const [purchaseOption,setPurchaseOption] = useState("course");
  const [methodId,setMethodId] = useState("");
  const [reference,setReference] = useState("");
  const [proof,setProof] = useState<File|null>(null);
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  const [termsRead,setTermsRead] = useState(false);
  const [termsConsent,setTermsConsent] = useState(false);
  const selected = methods.find((item) => String(item.id) === methodId);
  const termsVersion = "purchase-2026-09-02";

  async function revealCheckout() {
    if (!userId) { router.push(`/${locale}/login?next=/${locale}/knowledge/${productId}`); return; }
    setTermsRead(false); setTermsConsent(false); setMessage(""); setOpen(true);
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
    setPlans(((planData || []) as MembershipPlan[]).filter((plan) => Number(plan.price) > 0));
  }
  const instructions = selected ? (locale === "zh" ? selected.instructions_zh || selected.instructions_my || selected.instructions_en : locale === "en" ? selected.instructions_en || selected.instructions_my || selected.instructions_zh : selected.instructions_my || selected.instructions_zh || selected.instructions_en) : null;

  async function submit(event:FormEvent) {
    event.preventDefault();
    if (!userId || !selected || !reference.trim() || !termsRead || !termsConsent) { setMessage(copy.termsRequired); return; }
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
    const termsConsentData = { terms_version: termsVersion, terms_consented_at: new Date().toISOString() };
    const query = selectedPlan
      ? supabase.from("knowledge_membership_requests").insert({plan_id:selectedPlan.id,user_id:userId,payment_reference:paymentReference,proof_path:proofPath,status:"pending",...termsConsentData})
      : requestStatus === "rejected"
      ? supabase.from("knowledge_purchase_requests").update({payment_reference:paymentReference,proof_path:proofPath,status:"pending",reviewer_id:null,reviewed_at:null,...termsConsentData}).eq("product_id",productId).eq("user_id",userId)
      : supabase.from("knowledge_purchase_requests").insert({product_id:productId,user_id:userId,payment_reference:paymentReference,proof_path:proofPath,status:"pending",...termsConsentData});
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
          <section className="purchase-terms"><h3>{copy.termsTitle}</h3><p>{copy.termsHint}</p><div className="purchase-terms-scroll" tabIndex={0} onScroll={(event) => { const element = event.currentTarget; if (element.scrollTop + element.clientHeight >= element.scrollHeight - 8) setTermsRead(true); }}>{purchaseTerms.map((term, index) => <p key={index}>{term}</p>)}{termsRead ? <strong>✓ {copy.termsEnd}</strong> : null}</div><label className="purchase-terms-consent"><input type="checkbox" disabled={!termsRead} checked={termsConsent} onChange={(event) => setTermsConsent(event.target.checked)}/><span>{copy.termsConsent}</span></label></section>
          {message ? <p className="knowledge-message">{message}</p> : null}
          <button className="checkout-submit" disabled={loading || !termsRead || !termsConsent}>{loading ? copy.sending : copy.submit}</button>
        </form> : <p>{message || copy.unavailable}</p>}
      </section>
    </div> : null}
  </>;
}
