import LegalPage, { LegalSection } from "@/components/LegalPage";

const content: Record<string, { title: string; summary: string; updated: string; sections: LegalSection[] }> = {
  zh: { title: "身份认证与证件政策", summary: "本政策说明 BurmeseBridge 的 KYC、教师认证、作者认证、学生证和教师证规则。", updated: "2026年9月5日", sections: [
    { title: "1. 平台性质", paragraphs: ["BurmeseBridge 是私立在线学习平台，不是政府机构、政府学校、大学、考试主管机关或政府认可认证机构。平台认证和证件只表示本站内部审核状态。"] },
    { title: "2. 认证目的", paragraphs: ["KYC、教师认证、作者认证、学生证和教师证用于降低冒名、欺诈、滥用、版权风险和未授权教学风险，并帮助平台保护学生、教师、作者和社区。"] },
    { title: "3. 第三方验证", paragraphs: ["平台可使用 Didit 等第三方身份验证服务进行证件、人脸或活体核验。第三方验证结果只是 Admin 审核依据之一，不会自动授予职位、权限、证书或实体卡。"] },
    { title: "4. Admin 最终审核", paragraphs: ["所有认证、学生证、教师证、作者权限、课程上线和证书签发均以 Admin 最终审核为准。教师或作者可提交申请和资料，但不能自行批准自己的身份、课程或证件。"] },
    { title: "5. 资料真实性", paragraphs: ["申请人必须提交真实、完整、本人或本机构有权使用的资料。冒用身份、伪造文件、篡改截图、提交不实经历或隐藏重大风险信息，可能导致拒绝、撤销认证、封禁账号或依法处理。"] },
    { title: "6. 保留与删除", paragraphs: ["平台按最小必要原则保存认证记录。证件文件保存在私有存储中，仅授权 Admin 可通过短期签名链接查看。审核记录可能因安全、反欺诈、争议或法律需要保留；不再需要的证件文件可按保留期限清理。"] },
    { title: "7. 撤销与申诉", paragraphs: ["若发现资料不实、账号滥用、版权问题、危害学生安全、违反条款或平台声誉风险，平台可暂停或撤销认证和证件。用户可按页面指引提交申诉和补充证据。"] },
  ] },
  my: { title: "Identity Verification နှင့် Card မူဝါဒ", summary: "BurmeseBridge KYC၊ teacher/author verification၊ student card နှင့် teacher card စည်းမျဉ်းများ။", updated: "၂၀၂၆ စက်တင်ဘာ ၅", sections: [
    { title: "၁။ Platform ၏ သဘောသဘာဝ", paragraphs: ["BurmeseBridge သည် private online learning platform ဖြစ်ပြီး government institution၊ government school၊ university၊ exam authority သို့မဟုတ် government-recognized accrediting body မဟုတ်ပါ။ Verification နှင့် card များသည် platform internal review status ကိုသာ ပြသသည်။"] },
    { title: "၂။ Verification ၏ ရည်ရွယ်ချက်", paragraphs: ["KYC၊ teacher verification၊ author verification၊ student card နှင့် teacher card များသည် impersonation၊ fraud၊ abuse၊ copyright risk နှင့် unauthorized teaching risk ကို လျှော့ချရန် အသုံးပြုပါသည်။"] },
    { title: "၃။ Third-party verification", paragraphs: ["Didit ကဲ့သို့ third-party identity verification service ဖြင့် document၊ face သို့မဟုတ် liveness check လုပ်နိုင်သည်။ Third-party result သည် Admin review အတွက် evidence တစ်ခုသာဖြစ်ပြီး role၊ permission၊ certificate သို့မဟုတ် physical card ကို auto approve မလုပ်ပါ။"] },
    { title: "၄။ Admin final review", paragraphs: ["Verification၊ student card၊ teacher card၊ author permission၊ course publication နှင့် certificate issuance အားလုံးသည် Admin final approval အပေါ်မူတည်သည်။ Teacher/author သည် မိမိကိုယ်တိုင် approval မလုပ်နိုင်ပါ။"] },
    { title: "၅။ Data truthfulness", paragraphs: ["Applicant သည် မှန်ကန်ပြီး ပြည့်စုံသော မိမိပိုင် သို့မဟုတ် institution မှ ခွင့်ပြုထားသော data ကိုသာ တင်ရမည်။ Impersonation၊ fake document၊ edited screenshot၊ false experience သို့မဟုတ် risk hiding သည် rejection၊ revocation၊ ban သို့မဟုတ် legal action ဖြစ်နိုင်သည်။"] },
    { title: "၆။ Retention နှင့် deletion", paragraphs: ["Platform သည် minimum necessary principle အတိုင်း verification record သိမ်းထားသည်။ Document files များကို private storage တွင်ထားပြီး authorized Admin သာ short-lived signed link ဖြင့် ကြည့်နိုင်သည်။ Security၊ anti-fraud၊ dispute သို့မဟုတ် legal need အတွက် record အချို့ကို သိမ်းထားနိုင်သည်။"] },
    { title: "၇။ Revocation နှင့် appeal", paragraphs: ["False data၊ account abuse၊ copyright issue၊ student safety risk၊ terms violation သို့မဟုတ် platform reputation risk ရှိပါက verification/card ကို suspend သို့မဟုတ် revoke လုပ်နိုင်သည်။ User သည် appeal နှင့် evidence တင်နိုင်သည်။"] },
  ] },
  en: { title: "Identity Verification and Credential Policy", summary: "This policy explains BurmeseBridge KYC, teacher verification, author verification, student IDs, and teacher IDs.", updated: "September 5, 2026", sections: [
    { title: "1. Platform status", paragraphs: ["BurmeseBridge is a private online learning platform. It is not a government agency, government school, university, examination authority, or government-recognized accrediting body. Platform verification and credentials show internal review status only."] },
    { title: "2. Purpose of verification", paragraphs: ["KYC, teacher verification, author verification, student IDs, and teacher IDs are used to reduce impersonation, fraud, abuse, copyright risk, and unauthorised teaching risk, and to protect students, teachers, authors, and the community."] },
    { title: "3. Third-party verification", paragraphs: ["We may use identity verification providers such as Didit for document, face, or liveness checks. Third-party verification is one review signal for Admin. It does not automatically grant roles, permissions, certificates, or physical cards."] },
    { title: "4. Admin final review", paragraphs: ["All verification, student IDs, teacher IDs, author permissions, course publication, and certificate issuance require final Admin review. Teachers and authors may submit materials but cannot approve their own identity, courses, or credentials."] },
    { title: "5. Truthful materials", paragraphs: ["Applicants must submit truthful, complete materials that belong to them or that their organisation is authorised to use. Impersonation, forged documents, altered screenshots, false experience, or hiding material risk may result in rejection, revocation, account bans, or lawful action."] },
    { title: "6. Retention and deletion", paragraphs: ["We keep verification records under a minimum-necessary principle. Document files are stored privately and viewable only by authorised Admin reviewers through short-lived signed links. Some records may be retained for security, anti-fraud, disputes, or legal needs; document files may be cleared when no longer required."] },
    { title: "7. Revocation and appeals", paragraphs: ["If information is false, accounts are abused, copyright issues arise, student safety is affected, Terms are violated, or platform reputation is at risk, we may suspend or revoke verification and credentials. Users may submit an appeal and supporting evidence through the relevant page."] },
  ] },
};

export default async function VerificationPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} {...(content[locale] || content.en)} />;
}
