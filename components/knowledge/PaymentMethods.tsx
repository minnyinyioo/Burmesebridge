import { CreditCard } from "lucide-react";

export type PaymentMethod = {
  id: number;
  name: string;
  account_name: string;
  account_number: string;
  instructions_my: string | null;
  instructions_zh: string | null;
  instructions_en: string | null;
};

export default function PaymentMethods({
  methods,
  locale,
}: {
  methods: PaymentMethod[];
  locale: string;
}) {
  if (methods.length === 0) return null;
  const title =
    locale === "zh"
      ? "付款方式"
      : locale === "my"
        ? "ငွေပေးချေမှု နည်းလမ်း"
        : "Payment methods";
  const note =
    locale === "zh"
      ? "付款后请在课程卡片填写交易参考号。"
      : locale === "my"
        ? "ငွေပေးပြီးနောက် သင်တန်းကတ်တွင် ငွေလွှဲနံပါတ် ထည့်ပါ။"
        : "After paying, enter the transaction reference on the course card.";
  return (
    <section className="payment-methods">
      <div className="payment-methods-head">
        <CreditCard size={20} />
        <div>
          <h2>{title}</h2>
          <p>{note}</p>
        </div>
      </div>
      <div className="payment-method-grid">
        {methods.map((method) => {
          const instructions =
            locale === "zh"
              ? method.instructions_zh ||
                method.instructions_my ||
                method.instructions_en
              : locale === "en"
                ? method.instructions_en ||
                  method.instructions_my ||
                  method.instructions_zh
                : method.instructions_my ||
                  method.instructions_zh ||
                  method.instructions_en;
          return (
            <article key={method.id}>
              <strong>{method.name}</strong>
              <span>{method.account_name}</span>
              <code>{method.account_number}</code>
              {instructions && <p>{instructions}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
