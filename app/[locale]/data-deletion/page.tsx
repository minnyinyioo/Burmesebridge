import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "用户数据删除说明", summary: "你可以请求删除 BurmeseBridge 账号以及与账号关联的个人数据。", updated: "2026年8月14日", sections: [
    { title: "如何申请删除", paragraphs: ["使用注册账号的邮箱发送邮件至 minnyinyi006161@gmail.com，主题填写“删除 BurmeseBridge 账号”。邮件中请写明注册邮箱、显示名称以及使用的登录方式（邮箱、Google、GitHub 或 Facebook）。"] },
    { title: "身份验证", paragraphs: ["为防止他人恶意删除账号，我们会通过注册邮箱或其他合理方式确认账号所有权。请不要在邮件中发送密码、第三方平台密码或完整付款资料。"] },
    { title: "删除范围", paragraphs: ["验证通过后，我们将删除或匿名化账号资料、社交登录关联、个人资料和不再需要保留的用户内容。你也可以在申请中明确要求删除自己发布的帖子和评论。"] },
    { title: "可能保留的信息", paragraphs: ["为履行法律、财务、安全、反欺诈和争议处理义务，部分交易记录、审核日志或必要备份可能在有限期限内保留，并限制访问。"] },
    { title: "Facebook 数据删除", paragraphs: ["如果你使用 Facebook 登录，也可以在 Facebook 的“设置与隐私 → 设置 → 应用和网站”中移除 BurmeseBridge，然后按照本页步骤联系我们删除平台端数据。"] },
    { title: "处理时间", paragraphs: ["我们通常会在验证完成后30天内处理请求；复杂请求或法律要求可能需要更长时间，我们会通过邮件说明进度。"] },
  ] },
  my: { title: "အသုံးပြုသူဒေတာ ဖျက်ရန်", summary: "BurmeseBridge အကောင့်နှင့် ဆက်စပ်ကိုယ်ရေးအချက်အလက်များကို ဖျက်ရန် တောင်းဆိုနိုင်ပါသည်။", updated: "၂၀၂၆ ဩဂုတ် ၁၄", sections: [
    { title: "တောင်းဆိုနည်း", paragraphs: ["မှတ်ပုံတင်ထားသော အီးမေးလ်မှ minnyinyi006161@gmail.com သို့ “Delete BurmeseBridge account” ခေါင်းစဉ်ဖြင့် ပို့ပါ။ အကောင့်အီးမေးလ်၊ ပြသအမည်နှင့် login နည်းလမ်းကို ထည့်ရေးပါ။"] },
    { title: "ပိုင်ဆိုင်မှုအတည်ပြုခြင်း", paragraphs: ["အခြားသူက အကောင့်ဖျက်ခြင်းမှ ကာကွယ်ရန် registered email သို့မဟုတ် သင့်လျော်သောနည်းဖြင့် အတည်ပြုပါမည်။ Password သို့မဟုတ် payment အချက်အလက်အပြည့်အစုံ မပို့ပါနှင့်။"] },
    { title: "ဖျက်မည့်အချက်အလက်", paragraphs: ["အတည်ပြုပြီးနောက် အကောင့်၊ social-login ချိတ်ဆက်မှု၊ profile နှင့် မလိုအပ်တော့သည့် user content ကို ဖျက် သို့မဟုတ် အမည်မသိအဖြစ် ပြောင်းမည်။ ပို့စ်နှင့်မှတ်ချက်များ ဖျက်ရန်လည်း တောင်းဆိုနိုင်သည်။"] },
    { title: "ဆက်လက်သိမ်းနိုင်သည့်အချက်အလက်", paragraphs: ["ဥပဒေ၊ ငွေကြေး၊ လုံခြုံရေး၊ လိမ်လည်မှုကာကွယ်ရေးနှင့် အငြင်းပွားမှုအတွက် လိုအပ်သော transaction သို့မဟုတ် audit မှတ်တမ်းအချို့ကို ကန့်သတ်ကာလအတွင်း သိမ်းထားနိုင်သည်။"] },
    { title: "Facebook ဒေတာ", paragraphs: ["Facebook Settings & privacy → Settings → Apps and websites တွင် BurmeseBridge ကို ဖယ်ရှားနိုင်ပြီး ထို့နောက် ဤစာမျက်နှာပါ အဆင့်အတိုင်း platform ဒေတာဖျက်ရန် ဆက်သွယ်ပါ။"] },
    { title: "အချိန်ကာလ", paragraphs: ["ပိုင်ဆိုင်မှုအတည်ပြုပြီးနောက် ပုံမှန်အားဖြင့် ရက် ၃၀ အတွင်း ဆောင်ရွက်ပါမည်။ ပိုကြာပါက အီးမေးလ်ဖြင့် အသိပေးပါမည်။"] },
  ] },
  en: { title: "User Data Deletion", summary: "You may request deletion of your BurmeseBridge account and associated personal data.", updated: "August 14, 2026", sections: [
    { title: "How to request deletion", paragraphs: ["Email minnyinyi006161@gmail.com from the address registered to your account with the subject “Delete BurmeseBridge account.” Include the registered email, display name, and sign-in method (email, Google, GitHub, or Facebook)."] },
    { title: "Identity verification", paragraphs: ["To prevent unauthorized deletion, we will confirm account ownership through the registered email or another reasonable method. Never send your password, third-party password, or complete payment details."] },
    { title: "What will be deleted", paragraphs: ["After verification, we will delete or anonymize the account, social-login association, profile information, and user content no longer needed. You may explicitly request removal of posts and comments you published."] },
    { title: "Information we may retain", paragraphs: ["Some transaction records, moderation logs, or necessary backups may be retained for a limited period to meet legal, financial, security, fraud-prevention, and dispute obligations, with access restricted."] },
    { title: "Facebook data deletion", paragraphs: ["If you used Facebook Login, you can also remove BurmeseBridge under Facebook Settings & privacy → Settings → Apps and websites, then contact us using the steps above to delete platform-side data."] },
    { title: "Processing time", paragraphs: ["We normally process verified requests within 30 days. Complex requests or legal requirements may take longer, and we will provide status by email."] },
  ] },
};

export default async function DataDeletionPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return <LegalPage locale={locale} {...(content[locale] || content.en)} />; }
