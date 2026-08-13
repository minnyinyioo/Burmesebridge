import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "服务条款", summary: "使用 BurmeseBridge 即表示你同意遵守本条款及适用法律。", updated: "2026年8月14日", sections: [
    { title: "1. 服务范围", paragraphs: ["BurmeseBridge 提供学习、新闻、工作信息、社区讨论、视频和知识内容等网络服务。功能可能随着产品发展调整。"] },
    { title: "2. 账号责任", paragraphs: ["你应提供准确资料、保护账号凭据并对账号活动负责。不得冒充他人、转售账号或绕过平台安全措施。"] },
    { title: "3. 社区规则", paragraphs: ["禁止发布违法、欺诈、骚扰、仇恨、恶意软件、垃圾广告、侵犯隐私或知识产权的内容。平台可以审核、限制或删除违规内容，并在严重情况下暂停账号。"] },
    { title: "4. 用户内容", paragraphs: ["你保留原创内容的权利，同时授予平台为展示、分发、审核和运营服务所必需的非独占许可。你必须确保拥有发布内容所需的权利。"] },
    { title: "5. 付费内容", paragraphs: ["商品价格、访问期限和付款方式以购买页面为准。人工审核的付款应在确认后开通。退款申请将根据内容访问状态、付款渠道能力和适用法律逐案处理。"] },
    { title: "6. 第三方链接", paragraphs: ["平台可能包含第三方网站、职位、视频或社交平台链接。第三方内容和服务由其提供者负责，访问前请自行核实。"] },
    { title: "7. 服务可用性与责任", paragraphs: ["我们会合理维护服务，但不保证永不中断或所有用户内容完全准确。在法律允许范围内，平台不对用户发布内容或不可控制的第三方服务承担责任。"] },
    { title: "8. 条款变更与联系", paragraphs: ["重要变更会通过网站公布。继续使用服务代表接受更新后的条款。如有问题，请联系 minnyinyioo6161@gmail.com。"] },
  ] },
  my: { title: "ဝန်ဆောင်မှု စည်းမျဉ်းများ", summary: "BurmeseBridge ကို အသုံးပြုခြင်းဖြင့် ဤစည်းမျဉ်းများနှင့် သက်ဆိုင်ရာဥပဒေများကို လိုက်နာရန် သဘောတူပါသည်။", updated: "၂၀၂၆ ဩဂုတ် ၁၄", sections: [
    { title: "၁။ ဝန်ဆောင်မှု", paragraphs: ["BurmeseBridge တွင် သင်ယူမှု၊ သတင်း၊ အလုပ်အကိုင်၊ community၊ ဗီဒီယိုနှင့် paid knowledge content များ ပါဝင်သည်။ လုပ်ဆောင်ချက်များကို အချိန်နှင့်အမျှ ပြောင်းလဲနိုင်သည်။"] },
    { title: "၂။ အကောင့်တာဝန်", paragraphs: ["မှန်ကန်သောအချက်အလက်ပေးရန်၊ login အချက်အလက်ကို ကာကွယ်ရန်နှင့် မိမိအကောင့်လှုပ်ရှားမှုအတွက် တာဝန်ယူရန် လိုအပ်သည်။"] },
    { title: "၃။ Community စည်းမျဉ်း", paragraphs: ["တရားမဝင်၊ လိမ်လည်၊ နှောင့်ယှက်၊ အမုန်းစကား၊ spam၊ malware၊ ကိုယ်ရေးလုံခြုံမှု သို့မဟုတ် မူပိုင်ခွင့်ချိုးဖောက်သော အကြောင်းအရာ မတင်ရ။ ချိုးဖောက်သည့်အကြောင်းအရာ သို့မဟုတ် အကောင့်ကို ကန့်သတ်/ဖယ်ရှားနိုင်သည်။"] },
    { title: "၄။ အသုံးပြုသူအကြောင်းအရာ", paragraphs: ["မူရင်းအကြောင်းအရာ၏ အခွင့်အရေးကို သင်ပိုင်ဆိုင်ပြီး ဝန်ဆောင်မှုအတွင်း ပြသ၊ ဖြန့်ဝေ၊ စိစစ်ရန်လိုအပ်သော အကန့်အသတ်မရှိမဟုတ်သည့် ခွင့်ပြုချက်ကို ပလက်ဖောင်းအား ပေးပါသည်။"] },
    { title: "၅။ ငွေပေးချေသည့်အကြောင်းအရာ", paragraphs: ["စျေးနှုန်း၊ ဝင်ရောက်ခွင့်ကာလနှင့် ငွေပေးချေမှုကို purchase page အတိုင်း သတ်မှတ်သည်။ Refund ကို content access၊ payment channel နှင့် သက်ဆိုင်ရာဥပဒေအတိုင်း စိစစ်မည်။"] },
    { title: "၆။ ပြင်ပလင့်ခ်", paragraphs: ["ပြင်ပဝဘ်ဆိုက်၊ အလုပ်၊ ဗီဒီယို သို့မဟုတ် social link များ ပါနိုင်သည်။ ပြင်ပဝန်ဆောင်မှုကို အသုံးမပြုမီ ကိုယ်တိုင်စစ်ဆေးပါ။"] },
    { title: "၇။ ဝန်ဆောင်မှုနှင့် တာဝန်", paragraphs: ["ဝန်ဆောင်မှုကို ထိန်းသိမ်းရန် ကြိုးစားသော်လည်း အမြဲမပြတ်ရရှိမည် သို့မဟုတ် အသုံးပြုသူအကြောင်းအရာအားလုံး မှန်ကန်မည်ဟု အာမမခံပါ။"] },
    { title: "၈။ ပြောင်းလဲမှုနှင့် ဆက်သွယ်ရန်", paragraphs: ["အရေးကြီးသောပြောင်းလဲမှုကို ဝဘ်ဆိုက်တွင် အသိပေးပါမည်။ မေးခွန်းများကို minnyinyioo6161@gmail.com သို့ ပို့ပါ။"] },
  ] },
  en: { title: "Terms of Service", summary: "By using BurmeseBridge, you agree to these terms and applicable laws.", updated: "August 14, 2026", sections: [
    { title: "1. The service", paragraphs: ["BurmeseBridge provides learning, news, job information, community discussions, videos, and knowledge content. Features may change as the product develops."] },
    { title: "2. Account responsibility", paragraphs: ["You must provide accurate information, protect your credentials, and take responsibility for account activity. You may not impersonate others, resell accounts, or bypass security controls."] },
    { title: "3. Community rules", paragraphs: ["Do not publish illegal, fraudulent, harassing, hateful, malicious, spam, privacy-infringing, or intellectual-property-infringing content. We may moderate or remove violations and suspend accounts in serious cases."] },
    { title: "4. User content", paragraphs: ["You retain rights in original content and grant the platform a non-exclusive license necessary to display, distribute, moderate, and operate it within the service. You must have the rights required to publish it."] },
    { title: "5. Paid content", paragraphs: ["Prices, access periods, and payment methods are shown at purchase. Manually reviewed payments are activated after confirmation. Refund requests are assessed according to content access, payment-channel capabilities, and applicable law."] },
    { title: "6. Third-party links", paragraphs: ["The service may link to third-party websites, jobs, videos, or social platforms. Those providers are responsible for their services; verify them before relying on them."] },
    { title: "7. Availability and liability", paragraphs: ["We use reasonable efforts to maintain the service but cannot guarantee uninterrupted availability or accuracy of all user content. Liability is limited to the extent permitted by applicable law."] },
    { title: "8. Changes and contact", paragraphs: ["Material changes will be posted on the website. Continued use means acceptance of updated terms. Contact minnyinyioo6161@gmail.com with questions."] },
  ] },
};

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return <LegalPage locale={locale} {...(content[locale] || content.en)} />; }
