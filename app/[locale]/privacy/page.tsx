import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "隐私政策", summary: "本政策说明 BurmeseBridge 如何收集、使用、保存和保护你的个人信息。", updated: "2026年8月14日", sections: [
    { title: "1. 我们收集的信息", paragraphs: ["当你注册、登录、完善资料、发布内容、购买知识内容或联系平台时，我们会处理提供服务所必需的信息。"], items: ["账号信息：邮箱、第三方登录标识、显示名称和头像。", "用户内容：帖子、评论、新闻互动、课程进度、反馈与举报。", "交易资料：订单状态和付款凭证；平台不会保存完整银行卡密码。", "技术信息：安全日志、设备与浏览器信息、IP 地址及必要 Cookie。"] },
    { title: "2. 信息用途", paragraphs: ["我们使用信息提供账号认证、社区互动、内容访问、审核、安全防护、客户支持和产品改进。不会出售你的个人信息。"] },
    { title: "3. 第三方服务", paragraphs: ["平台使用 Supabase 提供认证与数据库服务、Vercel 提供网站托管，并可使用 Google、GitHub 或 Facebook 完成第三方登录。选择第三方登录时，相应平台会按其政策处理数据。"] },
    { title: "4. 公开内容", paragraphs: ["你主动发布的个人资料、帖子、评论及其他公共内容可能被其他用户看到。邮箱、付款凭证和后台审核资料不会作为公共资料展示。"] },
    { title: "5. 保存与安全", paragraphs: ["信息仅在提供服务、履行法律义务和处理争议所需期间保存。我们使用访问控制、行级权限、HTTPS 和审计记录等措施，但互联网服务无法保证绝对安全。"] },
    { title: "6. 你的权利", paragraphs: ["你可以访问或修改个人资料，也可以请求删除账号及相关个人数据。部分记录可能因安全、交易、反欺诈或法律义务而依法保留。"] },
    { title: "7. 联系我们", paragraphs: ["隐私问题或数据请求请发送至 minnyinyi006161@gmail.com。为保护账号，我们可能要求验证账号所有权。"] },
  ] },
  my: { title: "ကိုယ်ရေးအချက်အလက် မူဝါဒ", summary: "BurmeseBridge သည် သင့်အချက်အလက်များကို မည်သို့ စုဆောင်း၊ အသုံးပြု၊ သိမ်းဆည်းနှင့် ကာကွယ်သည်ကို ဤမူဝါဒတွင် ဖော်ပြထားသည်။", updated: "၂၀၂၆ ဩဂုတ် ၁၄", sections: [
    { title: "၁။ စုဆောင်းသည့်အချက်အလက်", paragraphs: ["အကောင့်ဖွင့်ခြင်း၊ ဝင်ရောက်ခြင်း၊ ပရိုဖိုင်ပြင်ခြင်း၊ အကြောင်းအရာတင်ခြင်း၊ သင်ခန်းစာဝယ်ယူခြင်း သို့မဟုတ် ဆက်သွယ်ခြင်းတွင် ဝန်ဆောင်မှုပေးရန်လိုအပ်သည့် အချက်အလက်များကို ကိုင်တွယ်ပါသည်။"], items: ["အီးမေးလ်၊ social login ID၊ ပြသအမည်နှင့် ပုံ။", "ပို့စ်၊ မှတ်ချက်၊ တုံ့ပြန်မှု၊ သင်ယူမှုအခြေအနေနှင့် တိုင်ကြားချက်။", "အော်ဒါအခြေအနေနှင့် ငွေပေးချေမှုအထောက်အထား။", "လုံခြုံရေးမှတ်တမ်း၊ စက်/ဘရောက်ဇာအချက်အလက်၊ IP နှင့် လိုအပ်သော Cookie များ။"] },
    { title: "၂။ အသုံးပြုပုံ", paragraphs: ["အကောင့်အတည်ပြုခြင်း၊ community လုပ်ဆောင်ချက်၊ အကြောင်းအရာရယူခြင်း၊ စိစစ်ခြင်း၊ လုံခြုံရေးနှင့် အကူအညီပေးရန် အသုံးပြုပါသည်။ ကိုယ်ရေးအချက်အလက်ကို ရောင်းချမည်မဟုတ်ပါ။"] },
    { title: "၃။ ပြင်ပဝန်ဆောင်မှု", paragraphs: ["Supabase ကို authentication/database အတွက်၊ Vercel ကို hosting အတွက် အသုံးပြုကာ Google၊ GitHub သို့မဟုတ် Facebook login ကို ရွေးချယ်နိုင်ပါသည်။ ထိုဝန်ဆောင်မှုများသည် ၎င်းတို့၏ မူဝါဒအတိုင်း အချက်အလက်ကို ကိုင်တွယ်ပါသည်။"] },
    { title: "၄။ အများမြင်အကြောင်းအရာ", paragraphs: ["သင်တင်သော public profile၊ ပို့စ်နှင့် မှတ်ချက်များကို အခြားသူများမြင်နိုင်သည်။ အီးမေးလ်၊ ငွေပေးချေမှုအထောက်အထားနှင့် admin review အချက်အလက်များကို အများသို့ မပြပါ။"] },
    { title: "၅။ သိမ်းဆည်းမှုနှင့် လုံခြုံရေး", paragraphs: ["ဝန်ဆောင်မှု၊ ဥပဒေတာဝန်နှင့် အငြင်းပွားမှုဖြေရှင်းရန် လိုအပ်သလောက်သာ သိမ်းဆည်းပါသည်။ HTTPS၊ access control၊ row-level security နှင့် audit logs များကို အသုံးပြုပါသည်။"] },
    { title: "၆။ သင့်အခွင့်အရေး", paragraphs: ["ပရိုဖိုင်ကို ကြည့်ရှု/ပြင်ဆင်နိုင်ပြီး အကောင့်နှင့်ဆိုင်သော အချက်အလက်ဖျက်ရန် တောင်းဆိုနိုင်သည်။ ဥပဒေ သို့မဟုတ် လုံခြုံရေးအတွက် လိုအပ်သော မှတ်တမ်းအချို့ကို ဆက်လက်သိမ်းထားနိုင်သည်။"] },
    { title: "၇။ ဆက်သွယ်ရန်", paragraphs: ["ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ တောင်းဆိုမှုကို minnyinyi006161@gmail.com သို့ ပို့ပါ။ အကောင့်ပိုင်ရှင်ဖြစ်ကြောင်း အတည်ပြုရန် တောင်းဆိုနိုင်ပါသည်။"] },
  ] },
  en: { title: "Privacy Policy", summary: "This policy explains how BurmeseBridge collects, uses, stores, and protects personal information.", updated: "August 14, 2026", sections: [
    { title: "1. Information we collect", paragraphs: ["We process information needed to provide the service when you register, sign in, update a profile, publish content, purchase learning content, or contact us."], items: ["Account data such as email, social-login identifier, display name, and avatar.", "User content including posts, comments, interactions, learning progress, feedback, and reports.", "Transaction records such as order status and payment proof; we do not store complete card passwords.", "Security logs, device/browser information, IP address, and essential cookies."] },
    { title: "2. How we use information", paragraphs: ["We use information for authentication, community features, content access, moderation, security, support, and product improvement. We do not sell personal information."] },
    { title: "3. Service providers", paragraphs: ["We use Supabase for authentication and database services and Vercel for hosting. Google, GitHub, or Facebook may process information under their own policies when you choose social login."] },
    { title: "4. Public content", paragraphs: ["Public profiles, posts, comments, and other content you publish may be visible to others. Email addresses, payment proof, and private moderation information are not displayed as public profile data."] },
    { title: "5. Retention and security", paragraphs: ["We retain information only as needed to provide the service, meet legal obligations, and resolve disputes. We use HTTPS, access controls, row-level security, and audit records, although no online service can guarantee absolute security."] },
    { title: "6. Your choices", paragraphs: ["You may access or update profile information and request deletion of your account and related personal data. Certain records may be retained for legal, security, transaction, or fraud-prevention obligations."] },
    { title: "7. Contact", paragraphs: ["Send privacy and data requests to minnyinyi006161@gmail.com. We may verify account ownership before processing a request."] },
  ] },
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; return <LegalPage locale={locale} {...(content[locale] || content.en)} />; }
