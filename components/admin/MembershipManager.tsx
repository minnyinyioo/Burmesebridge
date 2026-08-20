"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Crown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Plan = { id:number; code:"monthly"|"yearly"|"lifetime"; price:number; currency:string; enabled:boolean };
type Request = { id:number; user_id:string; payment_reference:string; proof_path:string|null; created_at:string; knowledge_membership_plans:{code:string}|null };

export default function MembershipManager({locale}:{locale:string}) {
  const copy = locale === "zh"
    ? { title:"全站会员方案", monthly:"月会员", yearly:"年会员", lifetime:"终身会员", save:"保存方案", enable:"启用", requests:"会员付款审核", empty:"暂无会员申请", approve:"确认开通", reject:"拒绝", proof:"查看凭证", positive:"启用的会员方案价格必须大于 0。", saved:"会员方案已保存。" }
    : locale === "my"
      ? { title:"ဝက်ဘ်ဆိုက် အဖွဲ့ဝင်ကြေး အစီအစဉ်များ", monthly:"လစဉ် အဖွဲ့ဝင်", yearly:"နှစ်စဉ် အဖွဲ့ဝင်", lifetime:"တစ်သက်တာ အဖွဲ့ဝင်", save:"ပြောင်းလဲမှုများကို သိမ်းဆည်းရန်", enable:"အသုံးပြုရန်", requests:"အဖွဲ့ဝင်ကြေး ပေးချေမှု စိစစ်ခြင်း", empty:"စိစစ်ရန် လျှောက်ထားချက် မရှိသေးပါ။", approve:"အတည်ပြုပြီး ဖွင့်ပေးရန်", reject:"ငြင်းပယ်ရန်", proof:"ငွေပေးချေမှု အထောက်အထားကို ကြည့်ရန်", positive:"အသုံးပြုမည့် အဖွဲ့ဝင်ကြေး အစီအစဉ်၏ ဈေးနှုန်းသည် သုညထက် ကြီးရမည်။", saved:"အဖွဲ့ဝင်ကြေး အစီအစဉ်များကို သိမ်းဆည်းပြီးပါပြီ။" }
      : { title:"Site-wide memberships", monthly:"Monthly", yearly:"Annual", lifetime:"Lifetime", save:"Save plans", enable:"Enabled", requests:"Membership payment review", empty:"No membership requests", approve:"Approve", reject:"Reject", proof:"View proof", positive:"The price of every enabled membership plan must be greater than zero.", saved:"Membership plans saved." };
  const [plans,setPlans] = useState<Plan[]>([]);
  const [requests,setRequests] = useState<Request[]>([]);
  const [message,setMessage] = useState("");
  const load = useCallback(async () => {
    const [{data:p,error:pError},{data:r,error:rError}] = await Promise.all([
      supabase.from("knowledge_membership_plans").select("id,code,price,currency,enabled").order("sort_order"),
      supabase.from("knowledge_membership_requests").select("id,user_id,payment_reference,proof_path,created_at,knowledge_membership_plans(code)").eq("status","pending").order("created_at"),
    ]);
    if (pError || rError) setMessage(pError?.message || rError?.message || "Load failed");
    else { setPlans((p || []) as Plan[]); setRequests((r || []) as unknown as Request[]); }
  },[]);
  useEffect(() => {
    // Initial Supabase fetch resolves asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  },[load]);
  async function save() {
    if (plans.some((plan) => plan.enabled && (!Number.isFinite(plan.price) || plan.price <= 0))) { setMessage(copy.positive); return; }
    const results = await Promise.all(plans.map((plan) => supabase.from("knowledge_membership_plans").update({price:plan.price,currency:plan.currency,enabled:plan.enabled,updated_at:new Date().toISOString()}).eq("id",plan.id)));
    const error = results.find((result) => result.error)?.error;
    setMessage(error?.message || copy.saved);
  }
  async function review(id:number,status:"approved"|"rejected") {
    const {error} = await supabase.from("knowledge_membership_requests").update({status}).eq("id",id);
    if (error) setMessage(error.message); else await load();
  }
  async function openProof(path:string) {
    const {data,error} = await supabase.storage.from("payment-proofs").createSignedUrl(path,60);
    if (error) setMessage(error.message); else window.open(data.signedUrl,"_blank","noopener,noreferrer");
  }
  return <section className="membership-admin">
    <h2><Crown size={20}/>{copy.title}</h2>
    <div className="membership-plan-admin">{plans.map((plan,index) => <article key={plan.id}>
      <strong>{copy[plan.code]}</strong>
      <input type="number" min="0.01" step="0.01" value={plan.price || ""} aria-invalid={plan.enabled && plan.price <= 0} onChange={(event) => setPlans((current) => current.map((item,i) => i === index ? {...item,price:event.target.value === "" ? 0 : Number(event.target.value)} : item))}/>
      <select value={plan.currency} onChange={(event) => setPlans((current) => current.map((item,i) => i === index ? {...item,currency:event.target.value} : item))}><option>MMK</option><option>CNY</option><option>USD</option></select>
      <label><input type="checkbox" checked={plan.enabled} onChange={(event) => setPlans((current) => current.map((item,i) => i === index ? {...item,enabled:event.target.checked} : item))}/>{copy.enable}</label>
    </article>)}</div>
    <button type="button" onClick={save}>{copy.save}</button>
    <h3>{copy.requests}</h3>
    {requests.length === 0 ? <p>{copy.empty}</p> : requests.map((request) => <article className="membership-request" key={request.id}><div><strong>{request.knowledge_membership_plans?.code}</strong><p>{request.payment_reference}</p><small>{request.user_id} · {new Date(request.created_at).toLocaleString()}</small>{request.proof_path ? <button type="button" onClick={() => openProof(request.proof_path!)}>{copy.proof}</button> : null}</div><div><button type="button" onClick={() => review(request.id,"approved")}><Check size={15}/>{copy.approve}</button><button type="button" className="reject" onClick={() => review(request.id,"rejected")}><X size={15}/>{copy.reject}</button></div></article>)}
    {message ? <p className="verification-message">{message}</p> : null}
  </section>;
}
