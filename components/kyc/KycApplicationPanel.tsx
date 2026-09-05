"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronDown, ExternalLink, FileCheck2, ImagePlus, LockKeyhole, ShieldCheck } from "lucide-react";
import LocationCombobox, { type LocationOption } from "@/components/LocationCombobox";
import { supabase } from "@/lib/supabase";
import { safeFileExtension, validateUpload } from "@/lib/fileValidation";

type ApplicationKind = "student" | "teacher" | "author" | "company";
type LocationType = "countries" | "states" | "cities" | "postal";
type KycRow = {
  id: number;
  application_kind: ApplicationKind;
  legal_name: string;
  country: string;
  document_type: string;
  document_front_path: string | null;
  document_back_path: string | null;
  status: "pending" | "in_review" | "approved" | "rejected" | "expired";
  review_note: string | null;
  didit_session_id: string | null;
  didit_session_url: string | null;
  didit_session_status: string | null;
  didit_verified_at: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const TERMS_VERSION = "kyc-2026-09-05";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, index) => String(CURRENT_YEAR - index));
const BIRTH_MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

function daysInMonth(year: string, month: string) {
  const numericYear = Number(year || CURRENT_YEAR);
  const numericMonth = Number(month || 1);
  return new Date(numericYear, numericMonth, 0).getDate();
}

async function getLocations(type: LocationType, country = "", state = "", city = "") {
  const query = new URLSearchParams({ type });
  if (country) query.set("country", country);
  if (state) query.set("state", state);
  if (city) query.set("city", city);
  const response = await fetch(`/api/locations?${query}`);
  if (!response.ok) throw new Error("Unable to load locations");
  return response.json() as Promise<LocationOption[]>;
}

export default function KycApplicationPanel({ locale, userId, defaultExpanded = false }: { locale: string; userId: string; defaultExpanded?: boolean }) {
  const copy = locale === "zh" ? {
    title: "KYC 身份核验",
    intro: "使用自托管、人工审核的身份核验流程。证件只供 BurmeseBridge 内部审核，不代表政府身份或政府资格。",
    kind: "申请用途",
    student: "学生身份", teacher: "教师身份", author: "作者身份", company: "企业/机构身份",
    legalName: "证件上的法定姓名", dob: "出生日期", nationality: "国籍", country: "常住国家/地区", region: "州 / 省 / 地区", city: "城市 / 区县", postal: "邮政编码", address: "街道、门牌号和详细地址",
    documentType: "证件类型", passport: "护照", national_id: "国民身份证", driving_licence: "驾驶证", other: "其他政府证件",
    last4: "证件号码后 4–8 位", number: "完整证件号码（可选，仅用于生成哈希，不保存原文）",
    front: "证件正面（必需）", back: "证件背面（可选）", uploadHint: "JPG、PNG、WEBP 或 PDF，单个文件最大 10MB。",
    selected: "已选择", required: "请填写必需字段并上传证件正面。", invalid: "文件格式不支持或超过 10MB。",
    termsTitle: "KYC 规则与隐私说明", termsHint: "请阅读到最后后才能勾选同意。",
    terms: ["KYC 只用于确认你在 BurmeseBridge 私立学习平台内的身份、教师或作者申请，不是政府认证、学历认证、签证、银行或金融 KYC。", "申请资料必须真实、完整并属于本人。不得冒用身份、提交伪造或篡改文件。管理员可以要求补充资料或拒绝申请。", "平台只保存审核所需的最少信息。完整证件号码不会保存，只保存不可逆哈希和后 4–8 位；证件文件保存在私有存储中，仅申请人和授权 Admin 可查看。", "如平台启用 Didit 等第三方身份验证服务，你同意按页面提示跳转完成证件、人脸或活体核验；第三方服务会按其隐私政策处理核验资料，并将结果回传给 BurmeseBridge 供 Admin 审核。", "审核完成后，管理员可以按保留期限清理证件文件。你可以通过账户删除或隐私请求要求删除资料，但法律允许保留的审核记录除外。", "KYC 通过只表示 BurmeseBridge 内部审核通过，不代表任何政府教育机构、政府部门、学校、大学或职业资格机构。"],
    didit: "Didit 自动身份验证", diditReady: "本站资料已提交。请继续完成 Didit 证件/人脸验证，然后等待 Admin 最终审核。", diditStart: "开始 Didit 验证", diditOpen: "继续 Didit 验证", diditPassed: "Didit 已验证通过", diditStatus: "Didit 状态", diditUnavailable: "Didit 暂未配置，当前使用本站人工 KYC 审核。", requiredNotice: "你的账号还没有完成 KYC。申请教师、作者、实体卡或后续需要更高权限的功能时，需要先完成身份核验。", start: "开始 KYC", edit: "填写 KYC 信息", hide: "收起表单",
    read: "我已阅读并理解 KYC 规则与隐私说明", submit: "提交 KYC 审核", submitting: "提交中…", pending: "KYC 已提交，等待 Admin 审核。", in_review: "KYC 正在人工审核。", approved: "KYC 已通过内部审核。", rejected: "KYC 未通过", expired: "KYC 已过期，请重新提交", history: "KYC 申请记录", reviewed: "审核时间", note: "审核说明", retry: "重新申请", privacy: "证件仅限授权 Admin 查看，系统使用短期签名链接。", noUser: "请先登录后申请。", chooseCountry: "选择国家或地区", chooseRegion: "选择州、省或地区", chooseCity: "选择城市或区县", search: "输入名称搜索…", empty: "没有匹配的地点", manualRegion: "填写州、省或地区", manualCity: "填写城市或区县", locationError: "地址地区数据加载失败，请刷新后重试。"
  } : locale === "my" ? {
    title: "KYC ကိုယ်ရေးအထောက်အထား စစ်ဆေးခြင်း",
    intro: "ကိုယ်ပိုင် host လုပ်ထားပြီး Admin က ကိုယ်တိုင်စစ်ဆေးသည့် လုပ်ငန်းစဉ်ဖြစ်သည်။ ဤ KYC သည် အစိုးရ ID သို့မဟုတ် အစိုးရအရည်အချင်း မဟုတ်ပါ။",
    kind: "လျှောက်ထားသည့်ရည်ရွယ်ချက်", student: "ကျောင်းသား", teacher: "ဆရာ", author: "စာရေးသူ", company: "ကုမ္ပဏီ/အဖွဲ့အစည်း",
    legalName: "စာရွက်စာတမ်းပါ အမည်အပြည့်အစုံ", dob: "မွေးသက္ကရာဇ်", nationality: "နိုင်ငံသား", country: "လက်ရှိနေထိုင်သည့် နိုင်ငံ/ဒေသ", region: "ပြည်နယ် / တိုင်း / ဒေသ", city: "မြို့ / ခရိုင်", postal: "စာတိုက်ကုဒ်", address: "လမ်း၊ အိမ်အမှတ်နှင့် လိပ်စာအပြည့်အစုံ",
    documentType: "အထောက်အထားအမျိုးအစား", passport: "နိုင်ငံကူးလက်မှတ်", national_id: "နိုင်ငံသားမှတ်ပုံတင်", driving_licence: "ယာဉ်မောင်းလိုင်စင်", other: "အခြားအစိုးရထုတ်စာရွက်စာတမ်း",
    last4: "အထောက်အထားနံပါတ် နောက်ဆုံး ၄–၈ လုံး", number: "အထောက်အထားနံပါတ်အပြည့် (ရွေးချယ်နိုင်သည်၊ hash ပြုလုပ်ရန်သာ အသုံးပြုပြီး မသိမ်းပါ)",
    front: "အရှေ့ဘက် (မဖြစ်မနေ)", back: "အနောက်ဘက် (ရွေးချယ်နိုင်သည်)", uploadHint: "JPG၊ PNG၊ WEBP သို့မဟုတ် PDF၊ ဖိုင်တစ်ခုလျှင် 10MB အထိ။",
    selected: "ရွေးထားသည်", required: "လိုအပ်သောအချက်များ ဖြည့်ပြီး အရှေ့ဘက်ဖိုင် တင်ပါ။", invalid: "ဖိုင်အမျိုးအစား မထောက်ပံ့ပါ သို့မဟုတ် 10MB ကျော်နေသည်။",
    termsTitle: "KYC စည်းမျဉ်းနှင့် ကိုယ်ရေးအချက်အလက်ရှင်းလင်းချက်", termsHint: "အောက်ဆုံးအထိ ဖတ်ပြီးမှ သဘောတူနိုင်ပါမည်။",
    terms: ["KYC ကို BurmeseBridge ပုဂ္ဂလိကသင်ယူရေးပလက်ဖောင်းအတွင်း အကောင့်၊ ဆရာ သို့မဟုတ် စာရေးသူအဖြစ် အတည်ပြုရန်သာ သုံးသည်။ အစိုးရအသိအမှတ်ပြုမှု၊ ဘွဲ့၊ ဗီဇာ၊ ဘဏ် သို့မဟုတ် ငွေကြေး KYC မဟုတ်ပါ။", "အချက်အလက်များသည် မှန်ကန်ပြီး ကိုယ်တိုင်ပိုင်ဆိုင်ရမည်။ အခြားသူအမည်သုံးခြင်း၊ စာရွက်စာတမ်းအတု သို့မဟုတ် ပြင်ဆင်ထားသော ဖိုင်တင်ခြင်း မပြုရ။ Admin သည် ထပ်ဆင့်အချက်အလက်တောင်းနိုင်သည် သို့မဟုတ် ငြင်းပယ်နိုင်သည်။", "လိုအပ်သလောက် အနည်းဆုံးအချက်အလက်ကိုသာ သိမ်းမည်။ အထောက်အထားနံပါတ်အပြည့်ကို မသိမ်းဘဲ ပြောင်းပြန်မရနိုင်သော hash နှင့် နောက်ဆုံး ၄–၈ လုံးသာ သိမ်းမည်။ ဖိုင်များကို private storage တွင်ထားပြီး လျှောက်ထားသူနှင့် ခွင့်ပြုထားသော Admin သာ ကြည့်နိုင်သည်။", "Didit ကဲ့သို့ third-party identity verification service ကို ဖွင့်ထားပါက စာရွက်စာတမ်း၊ မျက်နှာ သို့မဟုတ် liveness စစ်ဆေးမှု ပြီးစီးရန် သဘောတူသည်။ ထို service သည် ၎င်း၏ privacy policy အတိုင်း ဒေတာကို ကိုင်တွယ်ပြီး ရလဒ်ကို BurmeseBridge Admin review အတွက် ပြန်ပို့နိုင်သည်။", "စစ်ဆေးပြီးနောက် ထိန်းသိမ်းကာလပြည့်လျှင် Admin သည် ဖိုင်များကို ဖျက်နိုင်သည်။ အကောင့်ဖျက်ခြင်း သို့မဟုတ် privacy request ဖြင့် ဖျက်ရန် တောင်းဆိုနိုင်သော်လည်း ဥပဒေအရ ထိန်းသိမ်းရမည့် မှတ်တမ်းများ မပါဝင်ပါ။", "KYC အတည်ပြုခြင်းသည် BurmeseBridge အတွင်း စစ်ဆေးပြီးကြောင်းသာ ဖြစ်ပြီး အစိုးရ၊ အစိုးရကျောင်း၊ တက္ကသိုလ် သို့မဟုတ် အစိုးရအသိအမှတ်ပြု အရည်အချင်း မဟုတ်ပါ။"],
    didit: "Didit identity verification", diditReady: "BurmeseBridge KYC တင်ပြီးပါပြီ။ Didit တွင် စာရွက်စာတမ်း/မျက်နှာစစ်ဆေးမှု ဆက်လက်လုပ်ပြီး Admin final review ကို စောင့်ပါ။", diditStart: "Didit စစ်ဆေးမှု စတင်ရန်", diditOpen: "Didit ဆက်လုပ်ရန်", diditPassed: "Didit အတည်ပြုပြီး", diditStatus: "Didit အခြေအနေ", diditUnavailable: "Didit မ配置ရသေးပါ။ လက်ရှိ BurmeseBridge manual KYC review ကို အသုံးပြုနေသည်။", requiredNotice: "သင့်အကောင့်တွင် KYC မပြီးသေးပါ။ ဆရာ၊ စာရေးသူ၊ physical card သို့မဟုတ် ပိုမြင့်သော permission လိုအပ်သည့် feature များအတွက် identity verification လိုအပ်ပါသည်။", start: "KYC စတင်ရန်", edit: "KYC အချက်အလက်ဖြည့်ရန်", hide: "Form ပိတ်ရန်",
    read: "KYC စည်းမျဉ်းနှင့် ကိုယ်ရေးအချက်အလက်ရှင်းလင်းချက်ကို ဖတ်ပြီး နားလည်သဘောတူပါသည်", submit: "KYC တင်မည်", submitting: "တင်နေသည်…", pending: "KYC တင်ပြီးပါပြီ။ Admin စစ်ဆေးရန် စောင့်နေသည်။", in_review: "KYC ကို Admin က စစ်ဆေးနေသည်။", approved: "KYC ကို BurmeseBridge အတွင်း အတည်ပြုပြီးပါပြီ။", rejected: "KYC အတည်မပြုပါ", expired: "KYC သက်တမ်းကုန်ပါပြီ။ ပြန်လည်တင်ပါ", history: "KYC မှတ်တမ်း", reviewed: "စစ်ဆေးချိန်", note: "စစ်ဆေးချက်", retry: "ပြန်လည်လျှောက်ထားရန်", privacy: "ဖိုင်များကို ခွင့်ပြုထားသော Admin သာ ကာလတို signed link ဖြင့် ကြည့်နိုင်သည်။", noUser: "အရင် အကောင့်ဝင်ပါ။", chooseCountry: "နိုင်ငံ သို့မဟုတ် ဒေသ ရွေးပါ", chooseRegion: "ပြည်နယ်၊ တိုင်း သို့မဟုတ် ဒေသ ရွေးပါ", chooseCity: "မြို့ သို့မဟုတ် ခရိုင် ရွေးပါ", search: "အမည်ဖြင့် ရှာရန်…", empty: "ကိုက်ညီသောနေရာ မရှိပါ", manualRegion: "ပြည်နယ်၊ တိုင်း သို့မဟုတ် ဒေသ ဖြည့်ပါ", manualCity: "မြို့ သို့မဟုတ် ခရိုင် ဖြည့်ပါ", locationError: "နေရာဒေတာ မတင်နိုင်ပါ။ ပြန်လည် refresh လုပ်ပါ။"
  } : {
    title: "KYC identity verification", intro: "A self-hosted, human-reviewed identity workflow. It verifies status inside BurmeseBridge only and is not a government identity or qualification.", kind: "Application purpose", student: "Student status", teacher: "Teacher status", author: "Author status", company: "Company / organisation status", legalName: "Legal name on document", dob: "Date of birth", nationality: "Nationality", country: "Country of residence", region: "State / province / region", city: "City / district", postal: "Postal code", address: "Street, building and full address", documentType: "Document type", passport: "Passport", national_id: "National ID", driving_licence: "Driving licence", other: "Other government document", last4: "Last 4–8 characters of document number", number: "Full document number (optional; hashed and never stored in plain text)", front: "Front of document (required)", back: "Back of document (optional)", uploadHint: "JPG, PNG, WEBP or PDF; up to 10MB per file.", selected: "Selected", required: "Complete the required fields and upload the front of your document.", invalid: "Unsupported file type or file exceeds 10MB.", termsTitle: "KYC rules and privacy notice", termsHint: "Read to the end before ticking consent.", terms: ["KYC is used only to confirm your account, teacher, author, or company status inside the private BurmeseBridge learning platform. It is not government accreditation, an academic qualification, visa, banking, or financial KYC service.", "Your information must be truthful, complete, and yours. Impersonation, forged documents, and altered files are prohibited. Admin may request more evidence or reject an application.", "We collect the minimum information needed for review. The full document number is never stored; only a one-way hash and the last 4–8 characters are retained. Files stay in private storage and are visible only to you and authorised Admin reviewers.", "When third-party identity verification such as Didit is enabled, you agree to complete document, face, or liveness checks through that provider. The provider processes verification data under its privacy terms and sends the result back to BurmeseBridge for Admin review.", "After review, an Admin may delete document files when the retention period ends. You may request deletion through account deletion or a privacy request, except for records the law allows us to retain.", "Approval only records an internal BurmeseBridge review. It is not approval by a government, school, university, or professional-qualification authority."], read: "I have read, understood, and agree to the KYC rules and privacy notice", submit: "Submit KYC review", submitting: "Submitting…", pending: "KYC submitted. Waiting for Admin review.", in_review: "KYC is being reviewed by Admin.", approved: "KYC passed BurmeseBridge's internal review.", rejected: "KYC was not approved", expired: "KYC expired. Please submit again", history: "KYC history", reviewed: "Reviewed", note: "Review note", retry: "Submit again", privacy: "Documents are visible only to authorised Admin reviewers through short-lived signed links.", noUser: "Please sign in before applying.", didit: "Didit identity verification", diditReady: "Your BurmeseBridge KYC form is submitted. Continue with Didit document/face verification, then wait for Admin final review.", diditStart: "Start Didit verification", diditOpen: "Continue Didit verification", diditPassed: "Didit verified", diditStatus: "Didit status", diditUnavailable: "Didit is not configured yet. BurmeseBridge manual KYC review is still available.", requiredNotice: "Your account has not completed KYC yet. Teacher, author, physical card, and higher-permission features require identity verification first.", start: "Start KYC", edit: "Enter KYC details", hide: "Collapse form", chooseCountry: "Choose country or region", chooseRegion: "Choose state, province or region", chooseCity: "Choose city or district", search: "Search by name…", empty: "No matching location", manualRegion: "Enter state, province or region", manualCity: "Enter city or district", locationError: "Unable to load location data. Please refresh the page.",
  };

  const [application, setApplication] = useState<KycRow | null>(null);
  const [kind, setKind] = useState<ApplicationKind>("student");
  const [legalName, setLegalName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [nationality, setNationality] = useState("");
  const [country, setCountry] = useState("MM");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const [documentLast4, setDocumentLast4] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [termsRead, setTermsRead] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [regions, setRegions] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [postalOptions, setPostalOptions] = useState<LocationOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPostal, setLoadingPostal] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void supabase.from("kyc_verifications").select("id,application_kind,legal_name,country,document_type,document_front_path,document_back_path,status,review_note,didit_session_id,didit_session_url,didit_session_status,didit_verified_at,created_at,reviewed_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => { if (active) setApplication((data || null) as KycRow | null); });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    let active = true;
    Promise.all([getLocations("countries"), getLocations("states", "MM")]).then(([countryItems, regionItems]) => {
      if (active) { setCountries(countryItems); setRegions(regionItems); }
    }).catch(() => setMessage(copy.locationError)).finally(() => {
      if (active) { setLoadingCountries(false); setLoadingRegions(false); }
    });
    return () => { active = false; };
  }, [copy.locationError]);

  useEffect(() => {
    if (!expanded) return;
    setTermsRead(false);
    setConsent(false);
    const frame = window.requestAnimationFrame(() => {
      const element = termsRef.current;
      if (!element) return;
      if (element.scrollHeight <= element.clientHeight + 1) setTermsRead(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded, kind, locale]);

  useEffect(() => {
    if (!birthYear || !birthMonth || !birthDay) {
      setDateOfBirth("");
      return;
    }
    setDateOfBirth(`${birthYear}-${birthMonth}-${birthDay}`);
  }, [birthYear, birthMonth, birthDay]);

  const birthDays = Array.from({ length: daysInMonth(birthYear, birthMonth) }, (_, index) => String(index + 1).padStart(2, "0"));

  function changeBirthYear(value: string) {
    setBirthYear(value);
    if (birthDay && Number(birthDay) > daysInMonth(value, birthMonth)) setBirthDay("");
  }

  function changeBirthMonth(value: string) {
    setBirthMonth(value);
    if (birthDay && Number(birthDay) > daysInMonth(birthYear, value)) setBirthDay("");
  }

  async function changeCountry(value: string) {
    setCountry(value); setRegion(""); setCity(""); setPostalCode(""); setPostalOptions([]); setRegions([]); setCities([]); setLoadingRegions(true);
    try { setRegions(await getLocations("states", value)); } catch { setMessage(copy.locationError); } finally { setLoadingRegions(false); }
  }

  async function changeRegion(value: string) {
    setRegion(value); setCity(""); setPostalCode(""); setPostalOptions([]); setCities([]); setLoadingCities(true);
    try { setCities(await getLocations("cities", country, value)); } catch { setMessage(copy.locationError); } finally { setLoadingCities(false); }
  }

  async function changeCity(value: string) {
    setCity(value); setPostalCode(""); setPostalOptions([]);
    if (!country || !region || !value) return;
    setLoadingPostal(true);
    try {
      const next = await getLocations("postal", country, region, value);
      setPostalOptions(next);
      if (next.length === 1) setPostalCode(next[0].value);
    } catch { setPostalOptions([]); } finally { setLoadingPostal(false); }
  }

  function pickFile(event: ChangeEvent<HTMLInputElement>, side: "front" | "back") {
    const file = event.target.files?.[0] || null;
    const valid = !file || (ACCEPTED_TYPES.includes(file.type) && file.size <= 10 * 1024 * 1024);
    if (!valid) { setMessage(copy.invalid); return; }
    if (side === "front") setFrontFile(file); else setBackFile(file);
    setMessage("");
  }

  async function submit() {
    if (!userId) { setMessage(copy.noUser); return; }
    if (!legalName.trim() || !dateOfBirth || !nationality.trim() || !country.trim() || !region.trim() || !city.trim() || !address.trim() || !documentLast4.trim() || !frontFile || !termsRead || !consent) { setMessage(copy.required); return; }
    setBusy(true); setMessage("");
    const countryName = countries.find(item => item.value === country)?.label || country;
    const regionName = regions.find(item => item.value === region)?.label || region;
    const cityName = cities.find(item => item.value === city)?.label || city;
    const fullAddress = [`Country/Region: ${countryName} (${country})`, `Region: ${regionName}`, `City/District: ${cityName}`, postalCode ? `Postal code: ${postalCode}` : "", `Address: ${address.trim()}`].filter(Boolean).join("\n");
    const folder = `${userId}/${crypto.randomUUID()}`;
    const frontPath = `${folder}/front.${safeFileExtension(frontFile)}`;
    const backPath = backFile ? `${folder}/back.${safeFileExtension(backFile)}` : null;
    const uploaded: string[] = [];
    const frontUpload = await supabase.storage.from("kyc-documents").upload(frontPath, frontFile, { contentType: frontFile.type, upsert: false });
    if (frontUpload.error) { setBusy(false); setMessage(frontUpload.error.message); return; }
    uploaded.push(frontPath);
    if (backFile && backPath) {
      const backUpload = await supabase.storage.from("kyc-documents").upload(backPath, backFile, { contentType: backFile.type, upsert: false });
      if (backUpload.error) { await supabase.storage.from("kyc-documents").remove(uploaded); setBusy(false); setMessage(backUpload.error.message); return; }
      uploaded.push(backPath);
    }
    const { data, error } = await supabase.rpc("submit_kyc_application", {
      p_application_kind: kind, p_legal_name: legalName.trim(), p_date_of_birth: dateOfBirth, p_nationality: nationality.trim(), p_country: countryName, p_address: fullAddress, p_document_type: documentType, p_document_last4: documentLast4.trim(), p_document_number: documentNumber.trim() || null, p_document_front_path: frontPath, p_document_back_path: backPath, p_consent_version: TERMS_VERSION, p_consented_at: new Date().toISOString()
    });
    if (error) { await supabase.storage.from("kyc-documents").remove(uploaded); setBusy(false); setMessage(error.message); return; }
    setApplication(data as KycRow); setDocumentNumber(""); setFrontFile(null); setBackFile(null); setConsent(false); setTermsRead(false); setExpanded(false); setBusy(false); setMessage(copy.pending);
  }

  async function startDidit() {
    if (!application) return;
    setBusy(true); setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setBusy(false); setMessage(copy.noUser); return; }
    const response = await fetch("/api/kyc/didit-session", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ kycId: application.id, locale }),
    });
    const result = await response.json().catch(() => null) as { message?: string; sessionUrl?: string; sessionId?: string } | null;
    setBusy(false);
    if (!response.ok || !result?.sessionUrl) {
      setMessage(response.status === 503 ? copy.diditUnavailable : result?.message || copy.diditUnavailable);
      return;
    }
    setApplication({ ...application, status: "in_review", didit_session_id: result.sessionId || application.didit_session_id, didit_session_url: result.sessionUrl, didit_session_status: "created" });
    window.location.href = result.sessionUrl;
  }

  const open = application?.status === "pending" || application?.status === "in_review";
  const statusText = application ? copy[application.status] : "";
  if (!userId) return <section className="kyc-panel"><p>{copy.noUser}</p></section>;

  return <section className="kyc-panel" id="kyc-verification">
    <header className="kyc-panel-header"><div><span className="account-panel-eyebrow"><ShieldCheck size={16}/>{copy.title}</span><h2>{copy.title}</h2><p>{copy.intro}</p></div><LockKeyhole size={24}/></header>
    {application ? <div className={`kyc-status kyc-status-${application.status}`}><BadgeCheck size={18}/><div><strong>{statusText}</strong><small>{new Date(application.created_at).toLocaleString(locale)} · {application.legal_name} · {application.country}</small>{application.review_note ? <p>{copy.note}: {application.review_note}</p> : null}</div></div> : null}
    {application && open ? <div className="kyc-didit-card"><div><strong>{copy.didit}</strong><p>{application.didit_verified_at ? copy.diditPassed : copy.diditReady}</p>{application.didit_session_status ? <small>{copy.diditStatus}: {application.didit_session_status}</small> : null}</div>{application.didit_session_url ? <a href={application.didit_session_url} target="_blank" rel="noreferrer">{copy.diditOpen}<ExternalLink size={14}/></a> : <button type="button" onClick={() => void startDidit()} disabled={busy}>{copy.diditStart}</button>}</div> : null}
    {!open && application?.status === "approved" ? <p className="kyc-privacy-note">{copy.privacy}</p> : null}
    {!application ? <div className="kyc-required-notice"><ShieldCheck size={18}/><p>{copy.requiredNotice}</p><button type="button" onClick={() => setExpanded(current => !current)}>{expanded ? copy.hide : copy.start}<ChevronDown size={16}/></button></div> : null}
    {!open && application?.status === "rejected" ? <button type="button" className="kyc-retry" onClick={() => { setApplication(null); setExpanded(true); }}>{copy.retry}</button> : null}
    {application?.status === "expired" ? <button type="button" className="kyc-retry" onClick={() => setExpanded(current => !current)}>{expanded ? copy.hide : copy.edit}</button> : null}
    {expanded && (!application || (!open && application.status === "rejected") || application.status === "expired") ? <>
      <div className="kyc-form-grid">
        <label>{copy.kind}<select value={kind} onChange={event => setKind(event.target.value as ApplicationKind)}><option value="student">{copy.student}</option><option value="teacher">{copy.teacher}</option><option value="author">{copy.author}</option><option value="company">{copy.company}</option></select></label>
        <label>{copy.legalName}<input value={legalName} onChange={event => setLegalName(event.target.value)} autoComplete="name" /></label>
        <label>{copy.dob}<div className="kyc-date-selects"><select value={birthYear} onChange={event => changeBirthYear(event.target.value)} aria-label={`${copy.dob} year`}><option value="">YYYY</option>{BIRTH_YEARS.map(year => <option key={year} value={year}>{year}</option>)}</select><select value={birthMonth} onChange={event => changeBirthMonth(event.target.value)} aria-label={`${copy.dob} month`}><option value="">MM</option>{BIRTH_MONTHS.map(month => <option key={month} value={month}>{month}</option>)}</select><select value={birthDay} onChange={event => setBirthDay(event.target.value)} aria-label={`${copy.dob} day`}><option value="">DD</option>{birthDays.map(day => <option key={day} value={day}>{day}</option>)}</select></div></label>
        <label>{copy.nationality}<input value={nationality} onChange={event => setNationality(event.target.value)} /></label>
        <label>{copy.country}<LocationCombobox value={country} options={countries} placeholder={copy.chooseCountry} searchPlaceholder={copy.search} emptyText={copy.empty} loading={loadingCountries} onChange={value => void changeCountry(value)} /></label>
        <label>{copy.region}{!loadingRegions && regions.length === 0 ? <input required maxLength={120} autoComplete="address-level1" placeholder={copy.manualRegion} value={region} onChange={event => { setRegion(event.target.value); setCity(""); }} /> : <LocationCombobox value={region} options={regions} placeholder={copy.chooseRegion} searchPlaceholder={copy.search} emptyText={copy.empty} disabled={!country} loading={loadingRegions} onChange={value => void changeRegion(value)} />}</label>
        <label>{copy.city}{region && !loadingCities && cities.length === 0 ? <input required maxLength={120} autoComplete="address-level2" placeholder={copy.manualCity} value={city} onChange={event => void changeCity(event.target.value)} /> : <LocationCombobox value={city} options={cities} placeholder={copy.chooseCity} searchPlaceholder={copy.search} emptyText={copy.empty} disabled={!region} loading={loadingCities} onChange={value => void changeCity(value)} />}</label>
        <label>{copy.postal}{postalOptions.length > 1 ? <LocationCombobox value={postalCode} options={postalOptions} placeholder={copy.postal} searchPlaceholder={copy.search} emptyText={copy.empty} loading={loadingPostal} onChange={setPostalCode} /> : <input maxLength={24} autoComplete="postal-code" value={postalCode} onChange={event => setPostalCode(event.target.value)} placeholder={loadingPostal ? "…" : ""} />}</label>
        <label>{copy.documentType}<select value={documentType} onChange={event => setDocumentType(event.target.value)}><option value="passport">{copy.passport}</option><option value="national_id">{copy.national_id}</option><option value="driving_licence">{copy.driving_licence}</option><option value="other">{copy.other}</option></select></label>
        <label>{copy.last4}<input value={documentLast4} onChange={event => setDocumentLast4(event.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8))} inputMode="text" /></label>
        <label>{copy.number}<input value={documentNumber} onChange={event => setDocumentNumber(event.target.value)} autoComplete="off" /></label>
        <label className="kyc-full-field">{copy.address}<textarea rows={3} value={address} onChange={event => setAddress(event.target.value)} /></label>
      </div>
      <div className="kyc-upload-grid">
        <label className="kyc-upload-box"><span>{frontFile ? <FileCheck2 size={17}/> : <ImagePlus size={17}/>} {copy.front}</span><small>{frontFile ? `${copy.selected}: ${frontFile.name}` : copy.uploadHint}</small><input type="file" accept={ACCEPTED_TYPES.join(",")} onChange={event => pickFile(event, "front")} /></label>
        <label className="kyc-upload-box"><span>{backFile ? <FileCheck2 size={17}/> : <ImagePlus size={17}/>} {copy.back}</span><small>{backFile ? `${copy.selected}: ${backFile.name}` : copy.uploadHint}</small><input type="file" accept={ACCEPTED_TYPES.join(",")} onChange={event => pickFile(event, "back")} /></label>
      </div>
      <div className="kyc-terms"><h3>{copy.termsTitle}</h3><p>{copy.termsHint}</p><div ref={termsRef} className="kyc-terms-scroll" tabIndex={0} onScroll={event => { const element = event.currentTarget; if (element.scrollTop + element.clientHeight >= element.scrollHeight - 8) setTermsRead(true); }}>{copy.terms.map((term, index) => <p key={index}>{term}</p>)}{termsRead ? <strong>✓ {copy.read}</strong> : null}</div><label className="kyc-consent"><input type="checkbox" checked={consent} disabled={!termsRead} onChange={event => setConsent(event.target.checked)} /><span>{copy.read}</span></label></div>
      <button type="button" className="kyc-submit" onClick={() => void submit()} disabled={busy}>{busy ? copy.submitting : copy.submit}</button>
    </> : null}
    {message ? <p className="verification-message" role="status">{message}</p> : null}
    <p className="kyc-privacy-note"><LockKeyhole size={15}/>{copy.privacy}</p>
  </section>;
}
