import { CONTACT_EMAILS } from "@/lib/contactEmails";

export const membershipTermsVersion = "membership-2026-09-07-revision-2";
export function membershipTerms(locale: string): string[] {
  if (locale === "zh") return [
    "订购前请核对方案、价格、币种、有效天数和收款信息。目前采用一次付款、人工审核开通；不会自动扣款或自动续费。待审核并不代表已经开通，请勿重复付款。",
    "限期会员从审核通过时开始计时；有效会员续费会在剩余有效期后追加所购天数。无到期日方案在本服务持续提供期间有效；遇服务终止，将依法处理未履行的服务责任。",
    "有效期内可访问本站已发布的付费课程。实体卡、单独收费的人工服务和未列明的第三方项目不包含在内。会员不代表身份认证、教师资格或管理员权限，也不保证考试成绩或证书。",
    "权益仅限购买账户本人使用。禁止转售、出租、共享登录、盗录传播、冒用身份或绕过权限；经核实违规后可限制相关权益，并提供申诉渠道。赔偿仅限依法可主张且能够证明的损失。",
    "平台可因功能升级、风险控制、法律合规、支付渠道、课程版权、会员/VIP/高级等级体系或运营需要，更新会员合约、等级规则、权益范围和相关条款。重大变更会在网站公布；已提交订单的价格不因后续调价追溯增加，继续使用服务、续费或再次订购即表示接受更新后的条款。",
    `退款、撤销和争议按退款政策及适用法律处理。重复付款、未经授权的交易、未开通或核心服务未提供可申请复核；本条款不排除法定消费者权利。申请请联系 ${CONTACT_EMAILS.support}，提供订单号和付款凭证，勿发送密码。`,
    "保存本次付款记录。方案未来变价不追溯增加已提交订单的价格。付款凭证用于核对付款，按隐私政策保管；请遮盖无关敏感信息。"
  ];
  if (locale === "my") return [
    "အစီအစဉ်၊ စျေးနှုန်း၊ ငွေကြေးနှင့် သက်တမ်းကို စစ်ဆေးပါ။ တစ်ကြိမ်ပေးချေပြီး စိစစ်အတည်ပြုမှ ဖွင့်ပေးမည်။ အလိုအလျောက် ငွေမကောက်ပါ၊ သက်တမ်းမတိုးပါ။ စိစစ်နေစဉ် ထပ်မပေးချေပါနှင့်။",
    "အတည်ပြုချိန်မှ သက်တမ်းစသည်။ သက်တမ်းမကုန်မီ ထပ်ဝယ်လျှင် ကျန်သက်တမ်းအဆုံးမှ ရက်များ ထပ်တိုးမည်။ သက်တမ်းမသတ်မှတ်သော အစီအစဉ်သည် ဝန်ဆောင်မှု ဆက်လက်ပေးနေစဉ် အကျုံးဝင်သည်။",
    "သက်တမ်းအတွင်း ထုတ်ဝေထားသော အခပေးသင်တန်းများကို ကြည့်နိုင်သည်။ ကတ်၊ သီးခြားအခပေးဝန်ဆောင်မှုနှင့် ပြင်ပဝန်ဆောင်မှု မပါဝင်ပါ။ အဖွဲ့ဝင်သည် အထောက်အထားအတည်ပြုမှု၊ ဆရာ သို့မဟုတ် Admin ခွင့်ပြုချက်မဟုတ်ပါ။",
    "ဝယ်ယူသူအကောင့်အတွက်သာ ဖြစ်သည်။ ပြန်ရောင်း၊ ငှား၊ account မျှဝေ၊ ခွင့်မပြုဘဲ မှတ်တမ်းတင်ဖြန့်ဝေခြင်း မပြုရ။ စည်းမျဉ်းချိုးဖောက်မှု အတည်ပြုပါက ခွင့်ပြုချက်ကန့်သတ်နိုင်ပြီး အယူခံတင်နိုင်သည်။",
    "လုပ်ဆောင်ချက် အဆင့်မြှင့်တင်မှု၊ risk control၊ ဥပဒေလိုက်နာမှု၊ payment channel၊ course copyright၊ membership/VIP/high-level system သို့မဟုတ် operation လိုအပ်ချက်များကြောင့် platform သည် membership contract၊ level rules၊ benefits နှင့် related terms ကို update လုပ်နိုင်သည်။ အရေးကြီးသော ပြောင်းလဲမှုများကို website တွင် ကြေညာမည်။ တင်ပြီးသား order စျေးနှုန်းကို နောက်ပိုင်းစျေးပြောင်းလဲမှုဖြင့် နောက်ကြောင်းပြန် မတိုးပါ။ ဆက်လက်အသုံးပြုခြင်း၊ သက်တမ်းတိုးခြင်း သို့မဟုတ် ထပ်မံဝယ်ယူခြင်းသည် update terms ကို လက်ခံခြင်း ဖြစ်သည်။",
    `ငွေပြန်အမ်းခြင်းကို refund policy နှင့် သက်ဆိုင်ရာဥပဒေအတိုင်း ကိုင်တွယ်မည်။ ထပ်မံပေးချေမှု၊ ခွင့်မပြုသော payment သို့မဟုတ် ဝန်ဆောင်မှုမရရှိပါက ${CONTACT_EMAILS.support} သို့ order နှင့် အထောက်အထားပို့ပါ။ ဥပဒေအရ အခွင့်အရေးများကို မဖယ်ရှားပါ။ Password မပို့ပါနှင့်။`,
    "ပေးချေမှုမှတ်တမ်း သိမ်းထားပါ။ နောင်စျေးနှုန်းပြောင်းလဲမှုသည် တင်ပြပြီး order စျေးနှုန်းကို မတိုးပါ။ အထောက်အထားတွင် မသက်ဆိုင်သော အရေးကြီးအချက်အလက်ကို ဖုံးထားပါ။"
  ];
  return [
    "Check the plan, price, currency, duration and recipient before paying. Payments are one-off and activated after manual review. There is no automatic billing or renewal. Pending review is not activation; do not pay again while waiting.",
    "Access begins on approval. Renewal adds the purchased days after any remaining active term. Plans without an expiry remain valid while this service is provided; outstanding obligations on closure are handled under applicable law.",
    "Active membership includes published paid courses. Physical cards, separately charged services and third-party products are excluded. Membership does not confer identity verification, teaching qualifications or administrative powers, and does not guarantee results or certificates.",
    "Access is for the purchasing account holder only. Reselling, renting, sharing credentials, unauthorised recording/distribution, impersonation and access bypass are prohibited. Confirmed violations may lead to restrictions with an appeal route. Any compensation claim is limited to legally recoverable, demonstrable losses.",
    "The platform may update membership contracts, level rules, benefits, and related terms when needed for feature upgrades, risk control, legal compliance, payment-channel changes, course rights, the membership/VIP/premium level system, or operations. Material changes will be posted on the website. Later price changes do not increase the price of an already submitted order; continued use, renewal, or another purchase means acceptance of the updated terms.",
    `Refunds, cancellation and disputes follow the Refund Policy and applicable law. Duplicate or unauthorised payments, missing access and failure to provide core services may be reviewed. Statutory consumer rights are preserved. Contact ${CONTACT_EMAILS.support} with the order and receipt, never your password.`,
    "Keep your payment record. Later price changes do not increase the price of an already submitted order. Payment evidence is used for review and handled under the Privacy Policy; redact unrelated sensitive information."
  ];
}
