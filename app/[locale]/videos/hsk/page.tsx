import Link from "next/link";
import { Headphones, Mic2, PenLine, BookOpenText, ArrowRight, ShieldCheck } from "lucide-react";
import { hskCourses, hskSkills, type HskSkill } from "@/lib/hskCourses";

const icons = { listening: Headphones, speaking: Mic2, reading: BookOpenText, writing: PenLine };
export default async function HskCourseLibrary({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const zh = locale === "zh"; const my = locale === "my";
  const labels: Record<HskSkill,string> = zh ? { listening:"听力", speaking:"口语", reading:"阅读", writing:"书写" } : my ? { listening:"နားထောင်ခြင်း", speaking:"ပြောဆိုခြင်း", reading:"ဖတ်ရှုခြင်း", writing:"ရေးသားခြင်း" } : { listening:"Listening", speaking:"Speaking", reading:"Reading", writing:"Writing" };
  const title = zh ? "HSK 1–6 四技能课程" : my ? "HSK ၁–၆ ဘာသာစကားစွမ်းရည် လေးမျိုး" : "HSK 1–6 four-skill courses";
  const intro = zh ? "按等级系统学习听、说、读、写。每门课包含视频课、分级练习、作业附件和进度记录。" : my ? "အဆင့်အလိုက် နားထောင်၊ ပြော၊ ဖတ်၊ ရေး စနစ်တကျ လေ့လာပါ။ သင်တန်းတိုင်းတွင် ဗီဒီယို၊ လေ့ကျင့်ခန်း၊ အိမ်စာဖိုင်နှင့် တိုးတက်မှုမှတ်တမ်း ပါဝင်သည်။" : "Structured listening, speaking, reading and writing with video lessons, graded practice, homework files and progress tracking.";
  return <main className="hsk-library"><header><span><BookOpenText size={23}/></span><div><h1>{title}</h1><p>{intro}</p></div></header><aside><ShieldCheck size={18}/>{zh ? "仅采用许可清晰、可追溯来源的开放学习资源。" : my ? "လိုင်စင်ရှင်းလင်းပြီး ရင်းမြစ်စစ်ဆေးနိုင်သော Open Educational Resources များကိုသာ အသုံးပြုသည်။" : "Only traceable learning resources with clear reuse terms are used."}</aside>
    {[1,2,3,4,5,6].map(level=><section key={level}><div className="hsk-level-title"><b>HSK {level}</b><span>{zh?`${level < 3 ? 12 : level < 5 ? 16 : 20} 课时/技能`:my?`စွမ်းရည်တစ်မျိုးလျှင် ${level < 3 ? 12 : level < 5 ? 16 : 20} သင်ခန်းစာ`:`${level < 3 ? 12 : level < 5 ? 16 : 20} lessons per skill`}</span></div><div>{hskSkills.map(skill=>{const course=hskCourses.find(item=>item.level===level&&item.skill===skill)!;const Icon=icons[skill];return <Link href={`/${locale}/videos/hsk/${level}/${skill}`} key={skill}><Icon size={22}/><strong>{labels[skill]}</strong><p>{course.focus[locale === "zh" ? "zh" : locale === "my" ? "my" : "en"]}</p><span>{zh?"进入课程":my?"သင်တန်းဝင်ရန်":"Open course"}<ArrowRight size={15}/></span></Link>})}</div></section>)}
  </main>;
}
