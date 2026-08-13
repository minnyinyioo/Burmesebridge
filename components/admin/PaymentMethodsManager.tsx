"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CreditCard, Eye, EyeOff, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PaymentMethod } from "@/components/knowledge/PaymentMethods";

type AdminMethod = PaymentMethod & { enabled: boolean; sort_order: number };
export default function PaymentMethodsManager({ locale }: { locale: string }) {
  const copy =
    locale === "zh"
      ? {
          title: "收款方式",
          name: "方式名称，例如 KBZ Pay",
          account: "收款人姓名",
          number: "账号/手机号",
          instructions: "付款说明",
          add: "添加收款方式",
          empty: "尚未配置，付费用户暂时无法看到付款信息。",
          hide: "停用",
          show: "启用",
          remove: "删除",
        }
      : locale === "my"
        ? {
            title: "ငွေလက်ခံ နည်းလမ်း",
            name: "KBZ Pay စသည့် အမည်",
            account: "လက်ခံသူအမည်",
            number: "အကောင့်/ဖုန်းနံပါတ်",
            instructions: "ငွေပေးချေမှု လမ်းညွှန်",
            add: "နည်းလမ်းထည့်ရန်",
            empty: "ငွေလက်ခံနည်း မသတ်မှတ်ရသေးပါ။",
            hide: "ပိတ်မည်",
            show: "ဖွင့်မည်",
            remove: "ဖျက်မည်",
          }
        : {
            title: "Payment methods",
            name: "Method name, e.g. KBZ Pay",
            account: "Account holder",
            number: "Account or phone number",
            instructions: "Payment instructions",
            add: "Add payment method",
            empty: "No payment method configured yet.",
            hide: "Disable",
            show: "Enable",
            remove: "Delete",
          };
  const [items, setItems] = useState<AdminMethod[]>([]);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [number, setNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("knowledge_payment_methods")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) setMessage(error.message);
    else setItems((data || []) as AdminMethod[]);
  }, []);
  // Initial remote fetch; updates happen after the request resolves.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const suffix = locale === "zh" ? "zh" : locale === "en" ? "en" : "my";
    const { error } = await supabase
      .from("knowledge_payment_methods")
      .insert({
        name: name.trim(),
        account_name: account.trim(),
        account_number: number.trim(),
        [`instructions_${suffix}`]: instructions.trim() || null,
        sort_order: items.length,
      });
    if (error) setMessage(error.message);
    else {
      setName("");
      setAccount("");
      setNumber("");
      setInstructions("");
      setMessage("");
      await load();
    }
  }
  async function toggle(item: AdminMethod) {
    const { error } = await supabase
      .from("knowledge_payment_methods")
      .update({ enabled: !item.enabled, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) setMessage(error.message);
    else await load();
  }
  async function remove(id: number) {
    const { error } = await supabase
      .from("knowledge_payment_methods")
      .delete()
      .eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }
  return (
    <section className="payment-admin">
      <h2>
        <CreditCard size={20} />
        {copy.title}
      </h2>
      <form onSubmit={submit}>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={copy.name}
        />
        <input
          required
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          placeholder={copy.account}
        />
        <input
          required
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder={copy.number}
        />
        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder={copy.instructions}
        />
        <button>{copy.add}</button>
      </form>
      {message && <p className="verification-message">{message}</p>}
      <div>
        {items.length === 0 && <p>{copy.empty}</p>}
        {items.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.account_name} · {item.account_number}
              </span>
            </div>
            <button type="button" onClick={() => toggle(item)}>
              {item.enabled ? <EyeOff size={15} /> : <Eye size={15} />}{" "}
              {item.enabled ? copy.hide : copy.show}
            </button>
            <button
              type="button"
              className="reject"
              onClick={() => remove(item.id)}
            >
              <Trash2 size={15} />
              {copy.remove}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
