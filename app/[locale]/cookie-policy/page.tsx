import LegalPage, { LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAILS } from "@/lib/contactEmails";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "Cookie 使用政策", summary: "本政策说明 BurmeseBridge 如何使用 Cookie 和类似技术。", updated: "2026年9月5日", sections: [
    { title: "1. Cookie 的作用", paragraphs: ["Cookie 是网站存放在浏览器中的小型数据，用于保持登录、安全验证、语言偏好、基础功能、统计分析和用户体验改进。"] },
    { title: "2. 必要 Cookie", paragraphs: ["必要 Cookie 用于登录会话、安全防护、表单提交、语言设置和防止滥用。没有这些 Cookie，网站核心功能可能无法正常运行。必要 Cookie 不需要单独同意。"] },
    { title: "3. 非必要 Cookie", paragraphs: ["非必要 Cookie 可能用于分析访问量、改进页面体验、记住偏好或支持第三方服务。除适用法律允许外，这类 Cookie 会根据你的 Cookie 选择启用或关闭。"] },
    { title: "4. 第三方服务", paragraphs: ["BurmeseBridge 可能使用 Supabase、Vercel、CookieYes、Didit、Mux、社交登录或安全服务。这些服务可能按其政策设置 Cookie 或处理类似识别符。"] },
    { title: "5. 管理同意", paragraphs: ["你可以通过网站 Cookie 横幅或浏览器设置管理、撤回或删除 Cookie。同意状态可能会保存在浏览器中；清除浏览器数据后可能需要重新选择。"] },
    { title: "6. 联系", paragraphs: [`如对 Cookie 或跟踪技术有疑问，请联系 ${CONTACT_EMAILS.privacy}。`] },
  ] },
  my: { title: "Cookie အသုံးပြုမှု မူဝါဒ", summary: "BurmeseBridge သည် Cookie နှင့် ဆင်တူသောနည်းပညာများကို မည်သို့အသုံးပြုသည်ကို ဖော်ပြသည်။", updated: "၂၀၂၆ စက်တင်ဘာ ၅", sections: [
    { title: "၁။ Cookie ၏ ရည်ရွယ်ချက်", paragraphs: ["Cookie သည် browser ထဲတွင် သိမ်းထားသော data အသေးစားဖြစ်ပြီး login၊ security၊ language preference၊ site function၊ analytics နှင့် user experience တိုးတက်စေရန် အသုံးပြုပါသည်။"] },
    { title: "၂။ မဖြစ်မနေလိုအပ်သော Cookie", paragraphs: ["Login session၊ security protection၊ form submission၊ language setting နှင့် abuse prevention အတွက် လိုအပ်သော Cookie များဖြစ်သည်။ ဤ Cookie များမရှိလျှင် site ၏ အဓိက function များ မလုပ်နိုင်ပါ။"] },
    { title: "၃။ ရွေးချယ်နိုင်သော Cookie", paragraphs: ["Analytics၊ preference၊ page improvement သို့မဟုတ် third-party service အတွက် Cookie များကို သင့် consent အပေါ်မူတည်၍ ဖွင့်/ပိတ်နိုင်ပါသည်။"] },
    { title: "၄။ Third-party service", paragraphs: ["Supabase၊ Vercel၊ CookieYes၊ Didit၊ Mux၊ social login သို့မဟုတ် security service များသည် ၎င်းတို့၏ policy အတိုင်း Cookie သို့မဟုတ် identifier များကို အသုံးပြုနိုင်ပါသည်။"] },
    { title: "၅။ Consent ကို စီမံခြင်း", paragraphs: ["Website Cookie banner သို့မဟုတ် browser setting မှ Cookie ကို စီမံ၊ ရုပ်သိမ်း သို့မဟုတ် ဖျက်နိုင်ပါသည်။ Browser data ဖျက်ပါက သဘောတူညီချက်ကို ပြန်ရွေးရန်လိုနိုင်ပါသည်။"] },
    { title: "၆။ ဆက်သွယ်ရန်", paragraphs: [`Cookie နှင့် tracking technology မေးမြန်းလိုပါက ${CONTACT_EMAILS.privacy} သို့ ဆက်သွယ်ပါ။`] },
  ] },
  en: { title: "Cookie Policy", summary: "This policy explains how BurmeseBridge uses cookies and similar technologies.", updated: "September 5, 2026", sections: [
    { title: "1. What cookies do", paragraphs: ["Cookies are small pieces of data stored in your browser. We use them for sign-in, security, language preferences, essential functions, analytics, and improving the user experience."] },
    { title: "2. Essential cookies", paragraphs: ["Essential cookies support login sessions, security protection, form submission, language settings, and abuse prevention. Core site features may not work without them. Essential cookies do not require separate consent."] },
    { title: "3. Optional cookies", paragraphs: ["Optional cookies may support analytics, preferences, page improvement, or third-party services. Unless permitted by applicable law, these cookies are enabled or disabled according to your cookie choices."] },
    { title: "4. Third-party services", paragraphs: ["BurmeseBridge may use Supabase, Vercel, CookieYes, Didit, Mux, social login, or security services. These providers may set cookies or process similar identifiers under their own policies."] },
    { title: "5. Managing consent", paragraphs: ["You can manage, withdraw, or delete cookies through the website cookie banner or your browser settings. Your consent choice may be stored in your browser; clearing browser data may require you to choose again."] },
    { title: "6. Contact", paragraphs: [`Questions about cookies or tracking technologies may be sent to ${CONTACT_EMAILS.privacy}.`] },
  ] },
};

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} {...(content[locale] || content.en)} />;
}
