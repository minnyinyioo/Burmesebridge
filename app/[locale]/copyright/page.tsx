import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "版权投诉", summary: "版权所有者或其授权代表可以请求移除涉嫌侵权的内容。", updated: "2026年8月15日", sections: [
    { title: "提交投诉", paragraphs: ["请发送邮件至 admin@burmesebridge.eu.cc，主题写明“版权投诉”。"], items: ["说明受保护作品及权利人。", "提供涉嫌侵权内容的准确网址或编号。", "提供姓名、联系方式和授权证明。", "声明所提供信息真实，并善意相信相关使用未经授权。"] },
    { title: "处理方式", paragraphs: ["资料完整后，我们会审核并可能限制或移除内容、通知发布者、要求补充证据或依法保留记录。重复侵权账号可能被限制或终止。"] },
    { title: "反通知", paragraphs: ["发布者认为内容被错误移除时，可提供身份、被移除内容、移除前位置、权利依据及真实性声明申请复核。虚假投诉或反通知可能产生法律责任。"] },
  ] },
  my: { title: "Copyright တိုင်ကြားရန်", summary: "မူပိုင်ခွင့်ပိုင်ရှင် သို့မဟုတ် ကိုယ်စားလှယ်သည် ချိုးဖောက်သော content ဖယ်ရှားရန် တောင်းဆိုနိုင်သည်။", updated: "၂၀၂၆ ဩဂုတ် ၁၅", sections: [
    { title: "တိုင်ကြားချက် ပေးပို့ရန်", paragraphs: ["“Copyright complaint” ဟူသော အကြောင်းအရာခေါင်းစဉ်ဖြင့် admin@burmesebridge.eu.cc သို့ ပေးပို့ပါ။"], items: ["မူပိုင်ခွင့်ဖြင့် ကာကွယ်ထားသော လက်ရာနှင့် မူပိုင်ခွင့်ပိုင်ရှင်ကို ဖော်ပြပါ။", "မူပိုင်ခွင့်ချိုးဖောက်သည်ဟု ယူဆရသော အကြောင်းအရာ၏ URL သို့မဟုတ် ID အတိအကျကို ပေးပါ။", "သင့်အမည်၊ ဆက်သွယ်ရန်အချက်အလက်နှင့် ကိုယ်စားပြုခွင့် အထောက်အထားကို ပေးပါ။", "ပေးထားသောအချက်အလက်များ မှန်ကန်ကြောင်းနှင့် သက်ဆိုင်ရာအသုံးပြုမှုကို ခွင့်ပြုထားခြင်းမရှိဟု ရိုးသားစွာ ယုံကြည်ကြောင်း အတည်ပြုဖော်ပြပါ။"] },
    { title: "စစ်ဆေးခြင်း", paragraphs: ["အချက်အလက်ပြည့်စုံပါက content ကို ကန့်သတ်/ဖယ်ရှားခြင်း၊ တင်သူကို အသိပေးခြင်း သို့မဟုတ် ထပ်ဆောင်းအထောက်အထားတောင်းခြင်း ပြုလုပ်နိုင်သည်။"] },
    { title: "ပြန်လည်တုံ့ပြန်ခြင်း", paragraphs: ["မှားယွင်းဖယ်ရှားသည်ဟု ယုံကြည်သော တင်သူသည် အထောက်အထားဖြင့် ပြန်လည်စစ်ဆေးရန် တောင်းဆိုနိုင်သည်။ မမှန်တိုင်ကြားမှုသည် ဥပဒေတာဝန် ဖြစ်စေနိုင်သည်။"] },
  ] },
  en: { title: "Copyright Complaints", summary: "Copyright owners or their authorized representatives may request removal of allegedly infringing content.", updated: "August 15, 2026", sections: [
    { title: "Submit a notice", paragraphs: ["Email admin@burmesebridge.eu.cc with the subject “Copyright complaint.”"], items: ["Identify the protected work and rights holder.", "Provide the exact URL or identifier of the allegedly infringing material.", "Provide your name, contact details, and proof of authority.", "State that the information is accurate and that you believe in good faith the use is unauthorized."] },
    { title: "How we respond", paragraphs: ["Once a notice is complete, we may restrict or remove material, notify the publisher, request evidence, or retain legally necessary records. Repeat infringers may be restricted or terminated."] },
    { title: "Counter-notice", paragraphs: ["A publisher who believes material was removed in error may request review with their identity, the removed material and prior location, the basis for lawful use, and an accuracy statement. False notices or counter-notices may create legal liability."] },
  ] },
};

export default async function CopyrightPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return <LegalPage locale={locale} {...(content[locale] || content.en)} />; }

