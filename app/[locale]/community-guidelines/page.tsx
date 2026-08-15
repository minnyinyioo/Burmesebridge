import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "社区规则", summary: "这些规则适用于 BurmeseBridge 的论坛、评论、资料、招聘信息和其他用户内容。", updated: "2026年8月15日", sections: [
    { title: "尊重与安全", paragraphs: ["禁止骚扰、威胁、仇恨言论、跟踪、公开他人隐私以及鼓励暴力或自残的内容。"] },
    { title: "真实与合法", paragraphs: ["禁止诈骗、虚假招聘、人口贩卖、强迫劳动、违法交易、冒充他人、恶意软件、垃圾广告和绕过平台安全措施。"] },
    { title: "内容与版权", paragraphs: ["只发布你有权分享的内容。引用信息应说明来源，不得侵犯版权、商标、隐私或肖像权。"] },
    { title: "执行与申诉", paragraphs: ["平台可降低展示、删除内容、限制功能、暂停或终止账号，并在必要时保存证据或联系主管机关。用户可通过举报和申诉页面要求复核。"] },
  ] },
  my: { title: "Community စည်းမျဉ်းများ", summary: "ဤစည်းမျဉ်းများသည် forum၊ comment၊ profile၊ အလုပ်ကြော်ငြာနှင့် user content အားလုံးတွင် သက်ရောက်ပါသည်။", updated: "၂၀၂၆ ဩဂုတ် ၁၅", sections: [
    { title: "လေးစားမှုနှင့် လုံခြုံရေး", paragraphs: ["နှောင့်ယှက်ခြင်း၊ ခြိမ်းခြောက်ခြင်း၊ အမုန်းစကား၊ ကိုယ်ရေးအချက်အလက်ဖော်ထုတ်ခြင်းနှင့် အကြမ်းဖက်မှုအားပေးခြင်းကို တားမြစ်သည်။"] },
    { title: "မှန်ကန်ပြီး ဥပဒေနှင့်ညီရန်", paragraphs: ["လိမ်လည်မှု၊ အလုပ်အကိုင်အတု၊ လူကုန်ကူးမှု၊ အတင်းအဓမ္မအလုပ်၊ တရားမဝင်ရောင်းဝယ်မှု၊ malware နှင့် spam ကို တားမြစ်သည်။"] },
    { title: "Content နှင့် copyright", paragraphs: ["မျှဝေခွင့်ရှိသော content ကိုသာ တင်ပါ။ Copyright၊ trademark၊ privacy နှင့် image rights ကို မချိုးဖောက်ရ။"] },
    { title: "အရေးယူမှုနှင့် အယူခံ", paragraphs: ["Platform သည် content ဖျက်ခြင်း၊ feature ကန့်သတ်ခြင်း သို့မဟုတ် account ပိတ်ခြင်း ပြုလုပ်နိုင်သည်။ Report နှင့် appeal စနစ်မှ ပြန်လည်စစ်ဆေးရန် တောင်းဆိုနိုင်သည်။"] },
  ] },
  en: { title: "Community Guidelines", summary: "These rules apply to forums, comments, profiles, job listings, and other user content on BurmeseBridge.", updated: "August 15, 2026", sections: [
    { title: "Respect and safety", paragraphs: ["Harassment, threats, hateful conduct, stalking, doxxing, and content encouraging violence or self-harm are prohibited."] },
    { title: "Authentic and lawful use", paragraphs: ["Fraud, deceptive recruitment, trafficking, forced labour, illegal trade, impersonation, malware, spam, and attempts to bypass platform safeguards are prohibited."] },
    { title: "Content and intellectual property", paragraphs: ["Share only content you have the right to publish. Attribute sources where appropriate and respect copyright, trademark, privacy, and image rights."] },
    { title: "Enforcement and appeals", paragraphs: ["We may reduce distribution, remove content, restrict features, suspend or terminate accounts, preserve evidence, or contact competent authorities. Users may request review through reporting and appeal tools."] },
  ] },
};

export default async function CommunityGuidelinesPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return <LegalPage locale={locale} {...(content[locale] || content.en)} />; }

