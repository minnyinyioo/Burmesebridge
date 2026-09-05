import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "支付政策", summary: "本政策说明 BurmeseBridge 付费课程、会员和相关服务的付款审核规则。", updated: "2026年9月5日", sections: [
    { title: "1. 支付方式", paragraphs: ["可用支付方式以购买页面实际显示为准。平台可根据地区、风险、成本或运营安排增加、暂停或调整支付方式。"] },
    { title: "2. 付款审核", paragraphs: ["当前部分付款可能需要人工审核。用户提交付款参考号和付款凭证后，平台会核对金额、收款账户、订单信息和风险记录。审核通过后才会开通课程、会员或服务。"] },
    { title: "3. 付款凭证", paragraphs: ["付款凭证应清楚显示付款时间、金额、付款参考号和收款方信息。请勿上传与付款无关的身份证件、银行卡完整号码、验证码、密码或其他敏感资料。"] },
    { title: "4. 汇率、手续费和错付", paragraphs: ["跨境转账、银行、支付渠道、汇率差额、网络手续费或第三方服务费通常由用户或第三方渠道承担，除非页面另有说明或适用法律另有要求。错付、重复付款或金额错误应尽快联系平台处理。"] },
    { title: "5. 拒付、欺诈与风控", paragraphs: ["伪造付款凭证、恶意拒付、盗用账户、洗钱、规避风控或利用支付漏洞属于严重违规。平台可拒绝开通、暂停账号、撤销权限、保存证据并依法配合支付渠道或有关机构。"] },
    { title: "6. 退款关系", paragraphs: ["退款、撤销和争议处理适用退款政策、服务条款及相关支付渠道规则。提交付款即表示你理解付款可能需要审核，且数字内容开通后退款权利会受到限制。"] },
  ] },
  my: { title: "ငွေပေးချေမှု မူဝါဒ", summary: "BurmeseBridge paid course၊ membership နှင့် service များ၏ payment review စည်းမျဉ်းများ။", updated: "၂၀၂၆ စက်တင်ဘာ ၅", sections: [
    { title: "၁။ ငွေပေးချေမှုနည်းလမ်း", paragraphs: ["အသုံးပြုနိုင်သော payment method သည် purchase page တွင် ပြသထားသည့်အတိုင်း ဖြစ်သည်။ Platform သည် region၊ risk၊ cost သို့မဟုတ် operation အပေါ်မူတည်၍ payment method ကို ပြောင်းလဲနိုင်သည်။"] },
    { title: "၂။ Payment review", paragraphs: ["အချို့သော payment များသည် manual review လိုအပ်နိုင်ပါသည်။ Payment reference နှင့် proof တင်ပြီးနောက် amount၊ recipient account၊ order detail နှင့် risk record ကို စစ်ဆေးပြီးမှ access ဖွင့်ပေးပါမည်။"] },
    { title: "၃။ Payment proof", paragraphs: ["Payment proof တွင် payment time၊ amount၊ reference number နှင့် recipient information ကို မြင်သာစွာပါဝင်သင့်သည်။ Payment နှင့်မသက်ဆိုင်သော ID၊ bank card full number၊ verification code၊ password သို့မဟုတ် sensitive data မတင်ပါနှင့်။"] },
    { title: "၄။ Fee နှင့် မှားယွင်းသော payment", paragraphs: ["Cross-border transfer၊ bank၊ payment channel၊ exchange-rate difference၊ network fee သို့မဟုတ် third-party fee များကို ပုံမှန်အားဖြင့် user သို့မဟုတ် third-party channel က တာဝန်ယူပါသည်။ မှားယွင်းသော payment သို့မဟုတ် duplicate payment ဖြစ်ပါက အမြန်ဆက်သွယ်ပါ။"] },
    { title: "၅။ Fraud နှင့် risk control", paragraphs: ["Payment proof အတု၊ malicious chargeback၊ stolen account၊ money laundering၊ risk control bypass သို့မဟုတ် payment loophole အသုံးပြုခြင်းသည် ပြင်းထန်သော violation ဖြစ်သည်။ Platform သည် access ငြင်းပယ်၊ account suspend၊ evidence retain နှင့် သက်ဆိုင်ရာအဖွဲ့နှင့် ပူးပေါင်းနိုင်သည်။"] },
    { title: "၆။ Refund နှင့် ဆက်စပ်မှု", paragraphs: ["Refund၊ cancellation နှင့် dispute handling သည် Refund Policy၊ Terms of Service နှင့် payment channel rules အတိုင်း ဖြစ်သည်။ Payment တင်ခြင်းသည် manual review လိုအပ်နိုင်ကြောင်းနှင့် digital content access ဖွင့်ပြီးနောက် refund right ကန့်သတ်နိုင်ကြောင်း နားလည်သဘောတူခြင်း ဖြစ်သည်။"] },
  ] },
  en: { title: "Payment Policy", summary: "This policy explains payment review rules for BurmeseBridge paid courses, memberships, and related services.", updated: "September 5, 2026", sections: [
    { title: "1. Payment methods", paragraphs: ["Available payment methods are the methods shown on the purchase page. The platform may add, suspend, or adjust payment methods based on region, risk, cost, or operations."] },
    { title: "2. Payment review", paragraphs: ["Some payments may require manual review. After a user submits a payment reference and proof, we check the amount, recipient account, order information, and risk records. Access is granted only after approval."] },
    { title: "3. Payment proof", paragraphs: ["Payment proof should clearly show payment time, amount, reference number, and recipient information. Do not upload unrelated identity documents, full bank-card numbers, verification codes, passwords, or other sensitive data."] },
    { title: "4. Exchange rates, fees, and mistaken payments", paragraphs: ["Cross-border transfers, banks, payment channels, exchange-rate differences, network fees, or third-party charges are usually borne by the user or third-party channel unless otherwise stated or required by law. Mistaken, duplicate, or incorrect payments should be reported promptly."] },
    { title: "5. Chargebacks, fraud, and risk control", paragraphs: ["Forged payment proof, malicious chargebacks, account theft, money laundering, risk-control bypass, or payment loophole abuse are serious violations. We may refuse access, suspend accounts, revoke permissions, preserve evidence, and cooperate with payment providers or authorities."] },
    { title: "6. Relationship with refunds", paragraphs: ["Refunds, cancellations, and disputes are handled under the Refund Policy, Terms of Service, and relevant payment-channel rules. Submitting payment means you understand that review may be required and that refund rights may be limited after digital access is opened."] },
  ] },
};

export default async function PaymentPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} {...(content[locale] || content.en)} />;
}
