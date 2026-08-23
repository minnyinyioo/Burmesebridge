"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Download, RotateCcw, Target, Volume2 } from "lucide-react";
import { HskAnswer, hskQuestions, isHskAnswerCorrect, localizeHskQuestion, scoreHsk } from "@/lib/hskAssessment";
import { supabase } from "@/lib/supabase";

type Phase = "intro" | "test" | "result";

function formatReportDate(date:Date,locale:string){
  if(locale==="my"){
    const months=["ဇန်နဝါရီ","ဖေဖော်ဝါရီ","မတ်","ဧပြီ","မေ","ဇွန်","ဇူလိုင်","ဩဂုတ်","စက်တင်ဘာ","အောက်တိုဘာ","နိုဝင်ဘာ","ဒီဇင်ဘာ"];
    const myDigits=(value:number)=>String(value).replace(/[0-9]/g,digit=>"၀၁၂၃၄၅၆၇၈၉"[Number(digit)]);
    return `${myDigits(date.getFullYear())} ခုနှစ် ${months[date.getMonth()]}လ ${myDigits(date.getDate())} ရက်`;
  }
  return new Intl.DateTimeFormat(locale==="zh"?"zh-CN":"en-US",{year:"numeric",month:"long",day:"numeric"}).format(date);
}

export default function HskAssessment({ locale }: { locale: string }) {
  const [phase,setPhase] = useState<Phase>("intro");
  const [index,setIndex] = useState(0);
  const [answers,setAnswers] = useState<Record<string,HskAnswer>>({});
  const [saved,setSaved] = useState<"idle"|"saved"|"guest"|"error">("idle");
  const [pdfState,setPdfState] = useState<"idle"|"working"|"error">("idle");
  const [reportMeta,setReportMeta] = useState({id:"",date:""});
  const resultRef=useRef<HTMLDivElement>(null);
  const question = localizeHskQuestion(hskQuestions[index],locale);
  const result = useMemo(() => scoreHsk(answers),[answers]);
  const copy = locale === "zh" ? {
    eyebrow:"中文水平诊断",title:"HSK 1–6 综合能力测试",intro:"用 42 道听力、阅读、书写、词汇和语法题，全面了解你目前的中文水平。约需 25–35 分钟。",start:"开始测试",notice:"本报告仅用于学习诊断，不是官方 HSK 考试成绩、证书或语言能力证明。",progress:"测试进度",previous:"上一题",next:"下一题",submit:"查看结果",unanswered:"请先填写或选择答案",result:"中文能力诊断报告",level:"建议学习级别",score:"总正确率",correct:"答对",analysis:"分级表现",skillAnalysis:"专项能力",review:"错题解析",restart:"重新测试",learn:"去学习视频",saved:"成绩已保存到你的账号",guest:"登录后可保存每次测试记录",saveError:"成绩暂时无法保存，但不影响查看结果",pre:"HSK 1 入门准备",advice:"建议先从拼音、基础汉字和日常表达开始。",levelAdvice:"建议重点学习 HSK {level} 内容，并定期复测。",play:"播放中文录音",writePlaceholder:"请输入中文答案",download:"下载 PDF 成绩单",downloading:"正在生成 PDF…",pdfError:"PDF 生成失败，请重试",reportNo:"报告编号",generated:"生成日期",contact:"联系邮箱"
  } : locale === "my" ? {
    eyebrow:"တရုတ်ဘာသာအဆင့် စစ်ဆေးမှု",title:"HSK အဆင့် ၁–၆ ဘက်စုံစွမ်းရည် စစ်ဆေးမှု",intro:"နားထောင်မှု၊ ဖတ်ရှုမှု၊ ရေးသားမှု၊ ဝေါဟာရနှင့် သဒ္ဒါ မေးခွန်း ၄၂ ခုဖြင့် တရုတ်ဘာသာစွမ်းရည်ကို စစ်ဆေးပါ။ ၂၅–၃၅ မိနစ်ခန့် ကြာပါမည်။",start:"စစ်ဆေးမှု စတင်ရန်",notice:"ဤအစီရင်ခံစာသည် လေ့လာရေးဆိုင်ရာ အဆင့်သတ်မှတ်မှုအတွက်သာဖြစ်ပြီး တရားဝင် HSK ရလဒ်၊ လက်မှတ် သို့မဟုတ် ဘာသာစကားကျွမ်းကျင်မှု အထောက်အထားမဟုတ်ပါ။",progress:"ပြီးစီးမှု",previous:"ရှေ့မေးခွန်း",next:"နောက်မေးခွန်း",submit:"ရလဒ်ကြည့်ရန်",unanswered:"အဖြေကို ဦးစွာရေးပါ သို့မဟုတ် ရွေးပါ",result:"တရုတ်ဘာသာစွမ်းရည် စစ်ဆေးမှုအစီရင်ခံစာ",level:"အကြံပြုလေ့လာမှုအဆင့်",score:"အဖြေမှန် ရာခိုင်နှုန်း",correct:"မှန်ကန်သည့်အဖြေ",analysis:"အဆင့်အလိုက် စွမ်းဆောင်ရည်",skillAnalysis:"စွမ်းရည်အလိုက် ရလဒ်",review:"အမှားများ ရှင်းလင်းချက်",restart:"ပြန်လည်စစ်ဆေးရန်",learn:"ဗီဒီယိုသင်ခန်းစာများ",saved:"ရလဒ်ကို သင့်အကောင့်တွင် သိမ်းဆည်းပြီးပါပြီ",guest:"ဝင်ရောက်ပြီးနောက် စစ်ဆေးမှုမှတ်တမ်းကို သိမ်းဆည်းနိုင်ပါသည်",saveError:"ရလဒ်ကို မသိမ်းဆည်းနိုင်သေးသော်လည်း ရလဒ်ကြည့်ရှုမှုကို မထိခိုက်ပါ",pre:"HSK 1 မတိုင်မီ အခြေခံအဆင့်",advice:"Pinyin၊ အခြေခံတရုတ်စာလုံးများနှင့် နေ့စဉ်သုံးစကားများမှ စတင်လေ့လာရန် အကြံပြုပါသည်။",levelAdvice:"HSK အဆင့် {level} အကြောင်းအရာကို အဓိကလေ့လာပြီး ပုံမှန်ပြန်လည်စစ်ဆေးပါ။",play:"တရုတ်အသံဖိုင် ဖွင့်ရန်",writePlaceholder:"တရုတ်စာဖြင့် အဖြေရေးပါ",download:"PDF ရလဒ်စာတမ်း ဒေါင်းလုဒ်ရန်",downloading:"PDF ဖန်တီးနေသည်…",pdfError:"PDF ဖန်တီးမရပါ။ ပြန်လည်ကြိုးစားပါ",reportNo:"အစီရင်ခံစာအမှတ်",generated:"ထုတ်ပေးသည့်ရက်",contact:"ဆက်သွယ်ရန် Email"
  } : {
    eyebrow:"Chinese level diagnostic",title:"HSK 1–6 comprehensive assessment",intro:"Assess listening, reading, writing, vocabulary and grammar with 42 questions. Takes about 25–35 minutes.",start:"Start test",notice:"This report is for learning diagnostics only. It is not an official HSK result, certificate or proof of language proficiency.",progress:"Progress",previous:"Previous",next:"Next",submit:"View result",unanswered:"Enter or choose an answer before continuing",result:"Chinese proficiency diagnostic report",level:"Recommended level",score:"Overall accuracy",correct:"Correct answers",analysis:"Level performance",skillAnalysis:"Skill performance",review:"Answer review",restart:"Try again",learn:"Learning videos",saved:"Result saved to your account",guest:"Sign in to save your assessment history",saveError:"The result could not be saved, but you can still view it",pre:"Pre-HSK 1 foundation",advice:"Start with Pinyin, basic characters and everyday expressions.",levelAdvice:"Focus on HSK {level} material and retake this diagnostic regularly.",play:"Play Chinese audio",writePlaceholder:"Type your answer in Chinese",download:"Download PDF report",downloading:"Generating PDF…",pdfError:"PDF generation failed. Please try again",reportNo:"Report ID",generated:"Generated",contact:"Contact"
  };

  function start(){setAnswers({});setIndex(0);setSaved("idle");setPhase("test");}
  function playAudio(){
    if(!question.audioText||typeof window==="undefined"||!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(question.audioText);
    utterance.lang="zh-CN";utterance.rate=.82;
    const voice=window.speechSynthesis.getVoices().find(item=>item.lang.toLowerCase().startsWith("zh"));
    if(voice) utterance.voice=voice;
    window.speechSynthesis.speak(utterance);
  }
  async function downloadPdf(){
    if(!resultRef.current)return;
    setPdfState("working");
    try{
      const [{default:html2canvas},{jsPDF}]=await Promise.all([import("html2canvas-pro"),import("jspdf")]);
      const canvas=await html2canvas(resultRef.current,{scale:1.1,backgroundColor:"#f5faf8",useCORS:true,logging:false,imageTimeout:5000});
      const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
      const pageWidth=210,pageHeight=297,margin=8,drawWidth=pageWidth-margin*2;
      const drawHeight=canvas.height*drawWidth/canvas.width;
      const pageContentHeight=pageHeight-margin*2;
      let offset=0,page=0;
      while(offset<drawHeight){
        if(page>0)pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg",.84),"JPEG",margin,margin-offset,drawWidth,drawHeight,undefined,"FAST");
        offset+=pageContentHeight;page++;
      }
      pdf.save(`BurmeseBridge-HSK-result-${new Date().toISOString().slice(0,10)}.pdf`);
      setPdfState("idle");
    }catch{setPdfState("error");}
  }
  async function finish(){
    if (answers[question.id] === undefined) return;
    const now=new Date();
    setReportMeta({id:`BB-HSK-${now.getTime().toString(36).toUpperCase()}`,date:formatReportDate(now,locale)});
    setPhase("result");
    const scored = scoreHsk(answers);
    const {data:{user}} = await supabase.auth.getUser();
    if (!user){setSaved("guest");return;}
    const {error} = await supabase.from("hsk_assessment_attempts").insert({user_id:user.id,estimated_level:scored.estimatedLevel,cefr_level:scored.cefr,score:scored.score,correct_answers:scored.correct,total_questions:scored.total,answers,level_breakdown:scored.byLevel});
    setSaved(error ? "error" : "saved");
  }
  function advance(){if(answers[question.id] === undefined)return;if(index === hskQuestions.length-1){void finish();return;}setIndex(index+1);}

  if(phase === "intro") return <main className="hsk-page"><section className="hsk-hero"><span className="hsk-eyebrow"><ClipboardCheck size={18}/>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p><div className="hsk-feature-row"><span>{hskQuestions.length} Questions</span><span>HSK 1–6</span><span>Listening · Reading · Writing</span><span>Vocabulary · Grammar</span></div><button className="hsk-primary" onClick={start}><Target size={19}/>{copy.start}</button><small>{copy.notice}</small></section></main>;

  if(phase === "test") {
    const selected = answers[question.id];
    return <main className="hsk-page"><section className="hsk-test-card"><header><div><span>{copy.progress}</span><strong>{index+1} / {hskQuestions.length}</strong></div><div className="hsk-progress"><i style={{width:`${(index+1)/hskQuestions.length*100}%`}}/></div></header><div className="hsk-question-meta"><span>HSK {question.level}</span><span>{question.skill}</span></div>{question.audioText?<button type="button" className="hsk-audio" onClick={playAudio}><Volume2 size={20}/>{copy.play}</button>:null}<h1>{question.prompt}</h1>{question.responseType==="text"?<input className="hsk-writing-input" lang="zh-CN" value={typeof selected==="string"?selected:""} placeholder={copy.writePlaceholder} onChange={event=>setAnswers({...answers,[question.id]:event.target.value})}/>:<div className="hsk-options">{question.options?.map((option,optionIndex)=><button className={selected===optionIndex?"selected":""} key={option} onClick={()=>setAnswers({...answers,[question.id]:optionIndex})}><b>{String.fromCharCode(65+optionIndex)}</b><span>{option}</span></button>)}</div>}{(selected===undefined||selected==="")&&index>0?<p className="hsk-hint">{copy.unanswered}</p>:null}<footer><button className="hsk-secondary" disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={18}/>{copy.previous}</button><button className="hsk-primary" disabled={selected===undefined||selected===""} onClick={advance}>{index===hskQuestions.length-1?copy.submit:copy.next}<ArrowRight size={18}/></button></footer></section></main>;
  }

  const wrong = hskQuestions.filter((item)=>!isHskAnswerCorrect(item,answers[item.id])).map((item)=>localizeHskQuestion(item,locale));
  return <main className="hsk-page">
    <div ref={resultRef} className="hsk-report">
      <header className="hsk-report-brand"><span className="hsk-report-lockup"><Image src="/brand-icon-1024.png" width={42} height={42} alt=""/><strong>Burmese<span>Bridge</span></strong></span><div><strong>{copy.result}</strong><span>burmesebridge.eu.cc</span></div></header>
      <section className="hsk-report-meta"><span><b>{copy.reportNo}</b>{reportMeta.id}</span><span><b>{copy.generated}</b>{reportMeta.date}</span><span><b>{copy.contact}</b>admin@burmesebridge.eu.cc</span></section>
      <section className="hsk-result-head"><CheckCircle2 size={34}/><span>{copy.result}</span><h1>{result.estimatedLevel ? `HSK ${result.estimatedLevel}` : copy.pre}</h1><p>{result.estimatedLevel ? copy.levelAdvice.replace("{level}",String(result.estimatedLevel)) : copy.advice}</p><small>{copy.notice}</small></section>
      <div className="hsk-result-grid"><article><span>{copy.level}</span><strong>{result.estimatedLevel ? `HSK ${result.estimatedLevel}` : "Pre-HSK"}</strong><small>CEFR-style: {result.cefr}</small></article><article><span>{copy.score}</span><strong>{result.score}%</strong><small>{copy.correct}: {result.correct}/{result.total}</small></article></div>
      <section className="hsk-breakdown"><h2>{copy.analysis}</h2>{result.byLevel.map(item=><div key={item.level}><span>HSK {item.level}</span><div><i style={{width:`${item.rate*100}%`}}/></div><strong>{item.correct}/{item.total}</strong></div>)}</section>
      <section className="hsk-breakdown"><h2>{copy.skillAnalysis}</h2>{result.bySkill.map(item=><div key={item.skill}><span>{item.skill}</span><div><i style={{width:`${item.rate*100}%`}}/></div><strong>{item.correct}/{item.total}</strong></div>)}</section>
      {wrong.length?<section className="hsk-review" data-html2canvas-ignore="true"><h2>{copy.review}</h2>{wrong.map(item=><details open key={item.id}><summary><span>HSK {item.level}</span>{item.prompt}</summary><p><b>✓ {typeof item.answer==="number"?item.options?.[item.answer]:item.answer}</b></p><p>{item.explanation}</p></details>)}</section>:null}
    </div>
    <p className={`hsk-save-state ${saved}`}>{saved==="saved"?copy.saved:saved==="guest"?copy.guest:saved==="error"?copy.saveError:""}</p>{pdfState==="error"?<p className="hsk-hint hsk-pdf-error">{copy.pdfError}</p>:null}<div className="hsk-result-actions"><button className="hsk-secondary" onClick={start}><RotateCcw size={18}/>{copy.restart}</button><button className="hsk-secondary" disabled={pdfState==="working"} onClick={()=>void downloadPdf()}><Download size={18}/>{pdfState==="working"?copy.downloading:copy.download}</button><Link className="hsk-primary" href={`/${locale}/videos`}>{copy.learn}<ArrowRight size={18}/></Link></div>
  </main>;
}
