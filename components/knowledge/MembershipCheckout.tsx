"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/Badges";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PaymentProofInput from "./PaymentProofInput";
import type { PaymentMethod } from "./PaymentMethods";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";
import { membershipTerms, membershipTermsVersion } from "@/lib/membershipTerms";
type Plan={id:number;code:"monthly"|"yearly"|"lifetime";price:number;currency:string;duration_days:number|null;badge_type:string};
const copy={
 zh:{title:"会员中心",intro:"选择学习期限，付款审核通过后开通。一次付款，手动续费，无自动扣款。",monthly:"月会员",yearly:"年会员",lifetime:"长期会员",days:"天",unlimited:"无固定到期日",buy:"订购 / 续费",login:"登录查看会员方案",loading:"正在加载…",empty:"暂无开放的会员方案",error:"加载失败，请重试",retry:"重试",orders:"订单与购买记录",terms:"会员服务条款",refund:"退款政策",pending:"已有会员订单等待审核，请勿重复付款。",active:"会员有效至",expired:"会员已到期",none:"尚未开通会员",pay:"付款方式",ref:"交易参考号",submit:"提交付款审核",busy:"正在提交…",agree:"我已阅读并同意会员条款和退款政策",noMethod:"暂无可用付款方式，请联系管理员。",done:"订单已提交，审核通过后自动开通。",failed:"提交失败，请先检查订单记录再重试。",invalid:"请选择有效图片或 PDF，最大 5MB。",benefit:"有效期内访问已发布的付费课程",manage:"管理会员方案"},
 en:{title:"Membership",intro:"Choose your access period. Access starts after payment approval. One-off payment, manual renewal, no automatic billing.",monthly:"Monthly",yearly:"Annual",lifetime:"Long-term",days:"days",unlimited:"No fixed expiry",buy:"Purchase / Renew",login:"Sign in to view plans",loading:"Loading…",empty:"No plans are available yet",error:"Unable to load",retry:"Retry",orders:"Orders and purchase history",terms:"Membership terms",refund:"Refund Policy",pending:"An order is under review. Do not pay again.",active:"Membership valid until",expired:"Membership expired",none:"No active membership",pay:"Payment method",ref:"Transaction reference",submit:"Submit payment for review",busy:"Submitting…",agree:"I have read and agree to the membership terms and Refund Policy",noMethod:"No payment method available. Contact the administrator.",done:"Order submitted. Access opens after approval.",failed:"Submission failed. Check your orders before retrying.",invalid:"Choose a valid image or PDF up to 5MB.",benefit:"Access published paid courses during your term",manage:"Manage membership plans"},
 my:{title:"အဖွဲ့ဝင်စင်တာ",intro:"သက်တမ်းရွေးပြီး ငွေပေးချေမှု အတည်ပြုမှ ဖွင့်ပေးမည်။ တစ်ကြိမ်ပေးချေပြီး ကိုယ်တိုင်သက်တမ်းတိုးရမည်။ အလိုအလျောက်ငွေမကောက်ပါ။",monthly:"လစဉ်အဖွဲ့ဝင်",yearly:"နှစ်စဉ်အဖွဲ့ဝင်",lifetime:"ရေရှည်အဖွဲ့ဝင်",days:"ရက်",unlimited:"သက်တမ်းမသတ်မှတ်",buy:"ဝယ်ယူ / သက်တမ်းတိုး",login:"အစီအစဉ်ကြည့်ရန် အကောင့်ဝင်ပါ",loading:"ရယူနေသည်…",empty:"အစီအစဉ် မဖွင့်ရသေးပါ",error:"ရယူ၍မရပါ",retry:"ပြန်ကြိုးစားမည်",orders:"အော်ဒါမှတ်တမ်း",terms:"အဖွဲ့ဝင်စည်းမျဉ်း",refund:"ငွေပြန်အမ်းမူဝါဒ",pending:"အော်ဒါစိစစ်နေသည်။ ထပ်မပေးချေပါနှင့်။",active:"သက်တမ်းကုန်မည့်ရက်",expired:"သက်တမ်းကုန်ပြီ",none:"အဖွဲ့ဝင်မဖြစ်သေးပါ",pay:"ငွေပေးချေမှုနည်းလမ်း",ref:"ငွေလွှဲအမှတ်",submit:"စိစစ်ရန် တင်မည်",busy:"တင်နေသည်…",agree:"စည်းမျဉ်းနှင့် ငွေပြန်အမ်းမူဝါဒကို ဖတ်ပြီး သဘောတူသည်",noMethod:"ငွေပေးချေမှုနည်းလမ်းမရှိသေးပါ။ Admin ထံဆက်သွယ်ပါ။",done:"အော်ဒါတင်ပြီးပါပြီ။ အတည်ပြုပြီးမှ ဖွင့်ပေးမည်။",failed:"တင်၍မရပါ။ အော်ဒါမှတ်တမ်းကို အရင်စစ်ပါ။",invalid:"ပုံ သို့မဟုတ် PDF (5MB အထိ) ရွေးပါ။",benefit:"သက်တမ်းအတွင်း ထုတ်ဝေထားသော အခပေးသင်တန်းများ",manage:"အဖွဲ့ဝင်အစီအစဉ် စီမံရန်"}
};
export default function MembershipCheckout({locale}:{locale:string}){
 const t=copy[locale as keyof typeof copy]||copy.en, router=useRouter();
 const [plans,setPlans]=useState<Plan[]>([]),[methods,setMethods]=useState<PaymentMethod[]>([]);
 const [userId,setUserId]=useState<string|null>(null),[admin,setAdmin]=useState(false);
 const [member,setMember]=useState<{expires_at:string|null}|null>(null),[pending,setPending]=useState(false);
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState(false);
 const [active,setActive]=useState<Plan|null>(null),[methodId,setMethodId]=useState("");
 const [reference,setReference]=useState(""),[proof,setProof]=useState<File|null>(null),[consent,setConsent]=useState(false);
 const [message,setMessage]=useState(""),[formError,setFormError]=useState(""),[busy,setBusy]=useState(false);
 const lock=useRef(false), selected=methods.find(m=>String(m.id)===methodId);
 const load=useCallback(async()=>{
  setLoading(true);setLoadError(false);
  try{
   const {data:auth}=await supabase.auth.getUser();setUserId(auth.user?.id||null);if(!auth.user)return;
   const [p,m,s,o,r]=await Promise.all([
    supabase.from("knowledge_membership_plans").select("id,code,price,currency,duration_days,badge_type").eq("enabled",true).order("sort_order"),
    supabase.from("knowledge_payment_methods").select("id,name,account_name,account_number,instructions_my,instructions_zh,instructions_en").eq("enabled",true).order("sort_order"),
    supabase.from("knowledge_memberships").select("expires_at").eq("user_id",auth.user.id).maybeSingle(),
    supabase.from("knowledge_membership_requests").select("id").eq("user_id",auth.user.id).eq("status","pending").limit(1),
    supabase.from("profiles").select("role").eq("id",auth.user.id).maybeSingle()
   ]);
   if([p,m,s,o,r].some(v=>v.error))throw Error("load");
   setPlans((p.data||[]) as Plan[]);setMethods((m.data||[]) as PaymentMethod[]);setMethodId(String(m.data?.[0]?.id||""));
   setMember(s.data);setPending(Boolean(o.data?.length));setAdmin(r.data?.role==="admin");
  }catch{setLoadError(true)}finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 const duration=(p:Plan)=>p.duration_days===null?t.unlimited:p.duration_days+" "+t.days;
 async function submit(e:FormEvent){
  e.preventDefault();if(lock.current||!active||!userId||!selected||!consent||reference.trim().length<2)return;
  lock.current=true;setBusy(true);setFormError("");let path:string|null=null;
  try{
   if(proof){
    if(proof.size>5242880||!(await validateUpload(proof,["image/jpeg","image/png","image/webp","application/pdf"])))throw Error(t.invalid);
    path=userId+"/membership-"+crypto.randomUUID()+"."+safeFileExtension(proof);
    const {error}=await supabase.storage.from("payment-proofs").upload(path,proof,{contentType:proof.type});if(error)throw Error(t.failed);
   }
   const {error}=await supabase.from("knowledge_membership_requests").insert({user_id:userId,plan_id:active.id,payment_reference:selected.name+" | "+reference.trim(),proof_path:path,status:"pending",terms_version:membershipTermsVersion,terms_consented_at:new Date().toISOString()});
   if(error){if(path)await supabase.storage.from("payment-proofs").remove([path]);if(error.code==="23505"){setPending(true);throw Error(t.pending)}throw Error(t.failed)}
   setActive(null);setPending(true);setMessage(t.done);
  }catch(err){setFormError(err instanceof Error?err.message:t.failed)}finally{lock.current=false;setBusy(false)}
 }
 return <main className="membership-page"><header><h1>{t.title}</h1><p>{t.intro}</p></header>
  <nav className="membership-links"><Link href={"/"+locale+"/orders"}>{t.orders}</Link><Link href={"/"+locale+"/membership-terms"}>{t.terms}</Link>{admin?<Link href={"/"+locale+"/admin/knowledge"}>{t.manage}</Link>:null}</nav>
  {loading?<p role="status">{t.loading}</p>:loadError?<div role="alert">{t.error} <button onClick={()=>void load()}>{t.retry}</button></div>:!userId?<button className="course-buy-button" onClick={()=>router.push("/"+locale+"/login?next=/"+locale+"/membership")}>{t.login}</button>:<>
   <p className="membership-status">{member?(member.expires_at&&Date.parse(member.expires_at)<=Date.now()?t.expired:t.active+": "+(member.expires_at?new Date(member.expires_at).toLocaleDateString(locale):t.unlimited)):t.none}</p>
   {pending?<p role="status">{t.pending}</p>:null}
   <div className="membership-plan-grid">{plans.map(p=><article className="membership-plan-card" key={p.id}><Badge type={p.code === "lifetime" ? "premium" : p.badge_type}/><h2>{t[p.code]}</h2><strong>{Number(p.price).toLocaleString()} {p.currency}</strong><p>{duration(p)}</p><p>{t.benefit}</p><button className="course-buy-button" disabled={pending||!methods.length||member?.expires_at===null} onClick={()=>{setActive(p);setConsent(false);setReference("");setProof(null);setFormError("")}}>{t.buy}</button></article>)}</div>
   {!plans.length?<p>{t.empty}</p>:!methods.length?<p>{t.noMethod}</p>:null}
  </>}
  {message?<p role="status">{message}</p>:null}
  <Dialog open={Boolean(active)} onOpenChange={v=>{if(!v&&!busy)setActive(null)}}><DialogContent className="membership-dialog"><DialogTitle>{active?t[active.code]:t.title}</DialogTitle><DialogDescription>{active?Number(active.price).toLocaleString()+" "+active.currency+" · "+duration(active):""}</DialogDescription>
   <form onSubmit={submit}><label>{t.pay}<select value={methodId} disabled={busy} onChange={e=>setMethodId(e.target.value)}>{methods.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></label>
    {selected?<div className="checkout-account"><strong>{selected.account_name}</strong><code>{selected.account_number}</code><p>{(locale==="zh"?selected.instructions_zh:locale==="my"?selected.instructions_my:selected.instructions_en)||selected.instructions_en||selected.instructions_my}</p></div>:null}
    <label>{t.ref}<input required minLength={2} maxLength={300} value={reference} disabled={busy} onChange={e=>setReference(e.target.value)}/></label><PaymentProofInput locale={locale} file={proof} onChange={setProof}/>
    <section className="purchase-terms"><h3>{t.terms}</h3>{membershipTerms(locale).map(term=><p key={term}>{term}</p>)}<Link target="_blank" href={"/"+locale+"/refund-policy"}>{t.refund}</Link><label className="purchase-terms-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/><span>{t.agree}</span></label></section>
    {formError?<p role="alert">{formError}</p>:null}<button className="course-buy-button" disabled={busy||!consent||!selected||reference.trim().length<2}>{busy?t.busy:t.submit}</button>
   </form></DialogContent></Dialog>
 </main>;
}
