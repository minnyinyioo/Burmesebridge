"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw, Target } from "lucide-react";
import { hskQuestions, localizeHskQuestion, scoreHsk } from "@/lib/hskAssessment";
import { supabase } from "@/lib/supabase";

type Phase = "intro" | "test" | "result";

export default function HskAssessment({ locale }: { locale: string }) {
  const [phase,setPhase] = useState<Phase>("intro");
  const [index,setIndex] = useState(0);
  const [answers,setAnswers] = useState<Record<string,number>>({});
  const [saved,setSaved] = useState<"idle"|"saved"|"guest"|"error">("idle");
  const question = localizeHskQuestion(hskQuestions[index],locale);
  const result = useMemo(() => scoreHsk(answers),[answers]);
  const copy = locale === "zh" ? {
    eyebrow:"中文水平诊断",title:"HSK 1–6 分级测试",intro:"用 24 道词汇、语法和阅读题，快速了解你目前的中文水平。约需 12–18 分钟。",start:"开始测试",notice:"本测试用于学习诊断，不是官方 HSK 考试或证书。",progress:"测试进度",previous:"上一题",next:"下一题",submit:"查看结果",unanswered:"请先选择一个答案",result:"你的诊断结果",level:"建议学习级别",score:"总正确率",correct:"答对",analysis:"分级表现",review:"错题解析",restart:"重新测试",learn:"去学习视频",saved:"成绩已保存到你的账号",guest:"登录后可保存每次测试记录",saveError:"成绩暂时无法保存，但不影响查看结果",pre:"HSK 1 入门准备",advice:"建议先从拼音、基础汉字和日常表达开始。",levelAdvice:"建议重点学习 HSK {level} 内容，并定期复测。"
  } : locale === "my" ? {
    eyebrow:"တရုတ်ဘာသာအဆင့် စစ်ဆေးမှု",title:"HSK အဆင့် ၁–၆ စစ်ဆေးမှု",intro:"ဝေါဟာရ၊ သဒ္ဒါနှင့် ဖတ်ရှုနားလည်မှု မေးခွန်း ၂၄ ခုဖြင့် လက်ရှိတရုတ်ဘာသာအဆင့်ကို စစ်ဆေးပါ။ ၁၂–၁၈ မိနစ်ခန့် ကြာပါမည်။",start:"စစ်ဆေးမှု စတင်ရန်",notice:"ဤစစ်ဆေးမှုသည် လေ့လာရေးဆိုင်ရာ အဆင့်သတ်မှတ်မှုသာဖြစ်ပြီး တရားဝင် HSK စာမေးပွဲ သို့မဟုတ် လက်မှတ်မဟုတ်ပါ။",progress:"ပြီးစီးမှု",previous:"ရှေ့မေးခွန်း",next:"နောက်မေးခွန်း",submit:"ရလဒ်ကြည့်ရန်",unanswered:"အဖြေတစ်ခုကို ဦးစွာရွေးပါ",result:"သင်၏ စစ်ဆေးမှုရလဒ်",level:"အကြံပြုလေ့လာမှုအဆင့်",score:"အဖြေမှန် ရာခိုင်နှုန်း",correct:"မှန်ကန်သည့်အဖြေ",analysis:"အဆင့်အလိုက် စွမ်းဆောင်ရည်",review:"အမှားများ ရှင်းလင်းချက်",restart:"ပြန်လည်စစ်ဆေးရန်",learn:"ဗီဒီယိုသင်ခန်းစာများ",saved:"ရလဒ်ကို သင့်အကောင့်တွင် သိမ်းဆည်းပြီးပါပြီ",guest:"ဝင်ရောက်ပြီးနောက် စစ်ဆေးမှုမှတ်တမ်းကို သိမ်းဆည်းနိုင်ပါသည်",saveError:"ရလဒ်ကို မသိမ်းဆည်းနိုင်သေးသော်လည်း ရလဒ်ကြည့်ရှုမှုကို မထိခိုက်ပါ",pre:"HSK 1 မတိုင်မီ အခြေခံအဆင့်",advice:"Pinyin၊ အခြေခံတရုတ်စာလုံးများနှင့် နေ့စဉ်သုံးစကားများမှ စတင်လေ့လာရန် အကြံပြုပါသည်။",levelAdvice:"HSK အဆင့် {level} အကြောင်းအရာကို အဓိကလေ့လာပြီး ပုံမှန်ပြန်လည်စစ်ဆေးပါ။"
  } : {
    eyebrow:"Chinese level diagnostic",title:"HSK 1–6 placement test",intro:"Estimate your current Chinese level with 24 vocabulary, grammar and reading questions. Takes about 12–18 minutes.",start:"Start test",notice:"This is a learning diagnostic, not an official HSK examination or certificate.",progress:"Progress",previous:"Previous",next:"Next",submit:"View result",unanswered:"Choose an answer before continuing",result:"Your diagnostic result",level:"Recommended level",score:"Overall accuracy",correct:"Correct answers",analysis:"Level performance",review:"Answer review",restart:"Try again",learn:"Learning videos",saved:"Result saved to your account",guest:"Sign in to save your assessment history",saveError:"The result could not be saved, but you can still view it",pre:"Pre-HSK 1 foundation",advice:"Start with Pinyin, basic characters and everyday expressions.",levelAdvice:"Focus on HSK {level} material and retake this diagnostic regularly."
  };

  function start(){setAnswers({});setIndex(0);setSaved("idle");setPhase("test");}
  async function finish(){
    if (answers[question.id] === undefined) return;
    setPhase("result");
    const scored = scoreHsk(answers);
    const {data:{user}} = await supabase.auth.getUser();
    if (!user){setSaved("guest");return;}
    const {error} = await supabase.from("hsk_assessment_attempts").insert({user_id:user.id,estimated_level:scored.estimatedLevel,cefr_level:scored.cefr,score:scored.score,correct_answers:scored.correct,total_questions:scored.total,answers,level_breakdown:scored.byLevel});
    setSaved(error ? "error" : "saved");
  }
  function advance(){if(answers[question.id] === undefined)return;if(index === hskQuestions.length-1){void finish();return;}setIndex(index+1);}

  if(phase === "intro") return <main className="hsk-page"><section className="hsk-hero"><span className="hsk-eyebrow"><ClipboardCheck size={18}/>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p><div className="hsk-feature-row"><span>24 Questions</span><span>HSK 1–6</span><span>Vocabulary · Grammar · Reading</span></div><button className="hsk-primary" onClick={start}><Target size={19}/>{copy.start}</button><small>{copy.notice}</small></section></main>;

  if(phase === "test") {
    const selected = answers[question.id];
    return <main className="hsk-page"><section className="hsk-test-card"><header><div><span>{copy.progress}</span><strong>{index+1} / {hskQuestions.length}</strong></div><div className="hsk-progress"><i style={{width:`${(index+1)/hskQuestions.length*100}%`}}/></div></header><div className="hsk-question-meta"><span>HSK {question.level}</span><span>{question.skill}</span></div><h1>{question.prompt}</h1><div className="hsk-options">{question.options.map((option,optionIndex)=><button className={selected===optionIndex?"selected":""} key={option} onClick={()=>setAnswers({...answers,[question.id]:optionIndex})}><b>{String.fromCharCode(65+optionIndex)}</b><span>{option}</span></button>)}</div>{selected===undefined&&index>0?<p className="hsk-hint">{copy.unanswered}</p>:null}<footer><button className="hsk-secondary" disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={18}/>{copy.previous}</button><button className="hsk-primary" disabled={selected===undefined} onClick={advance}>{index===hskQuestions.length-1?copy.submit:copy.next}<ArrowRight size={18}/></button></footer></section></main>;
  }

  const wrong = hskQuestions.filter((item)=>answers[item.id]!==item.answer).map((item)=>localizeHskQuestion(item,locale));
  return <main className="hsk-page"><section className="hsk-result-head"><CheckCircle2 size={34}/><span>{copy.result}</span><h1>{result.estimatedLevel ? `HSK ${result.estimatedLevel}` : copy.pre}</h1><p>{result.estimatedLevel ? copy.levelAdvice.replace("{level}",String(result.estimatedLevel)) : copy.advice}</p><small>{copy.notice}</small></section><div className="hsk-result-grid"><article><span>{copy.level}</span><strong>{result.estimatedLevel ? `HSK ${result.estimatedLevel}` : "Pre-HSK"}</strong><small>CEFR-style: {result.cefr}</small></article><article><span>{copy.score}</span><strong>{result.score}%</strong><small>{copy.correct}: {result.correct}/{result.total}</small></article></div><section className="hsk-breakdown"><h2>{copy.analysis}</h2>{result.byLevel.map(item=><div key={item.level}><span>HSK {item.level}</span><div><i style={{width:`${item.rate*100}%`}}/></div><strong>{item.correct}/{item.total}</strong></div>)}</section>{wrong.length?<section className="hsk-review"><h2>{copy.review}</h2>{wrong.map(item=><details key={item.id}><summary><span>HSK {item.level}</span>{item.prompt}</summary><p><b>✓ {item.options[item.answer]}</b></p><p>{item.explanation}</p></details>)}</section>:null}<p className={`hsk-save-state ${saved}`}>{saved==="saved"?copy.saved:saved==="guest"?copy.guest:saved==="error"?copy.saveError:""}</p><div className="hsk-result-actions"><button className="hsk-secondary" onClick={start}><RotateCcw size={18}/>{copy.restart}</button><Link className="hsk-primary" href={`/${locale}/videos`}>{copy.learn}<ArrowRight size={18}/></Link></div></main>;
}
