export type HskQuestion = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  skill: "vocabulary" | "grammar" | "reading";
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
};

export const hskQuestions: HskQuestion[] = [
  { id:"h1-1",level:1,skill:"vocabulary",prompt:"“谢谢”的意思是：",options:["问候","感谢","道歉","告别"],answer:1,explanation:"“谢谢”用于表达感谢。" },
  { id:"h1-2",level:1,skill:"grammar",prompt:"我___学生。",options:["是","有","在","会"],answer:0,explanation:"判断身份使用判断动词“是”。" },
  { id:"h1-3",level:1,skill:"reading",prompt:"小王今天不工作，他去医院。小王今天去哪儿？",options:["学校","商店","医院","公司"],answer:2,explanation:"短文明确说“小王去医院”。" },
  { id:"h1-4",level:1,skill:"vocabulary",prompt:"哪一个是时间？",options:["八点","苹果","老师","北京"],answer:0,explanation:"“八点”表示时间。" },
  { id:"h2-1",level:2,skill:"grammar",prompt:"妹妹___我高。",options:["把","比","被","给"],answer:1,explanation:"比较两个人的身高使用“A 比 B + 形容词”。" },
  { id:"h2-2",level:2,skill:"vocabulary",prompt:"外面下雨了，出门要带什么？",options:["雨伞","筷子","地图","铅笔"],answer:0,explanation:"下雨时出门需要带雨伞。" },
  { id:"h2-3",level:2,skill:"reading",prompt:"电影七点开始，现在六点半。离电影开始还有多长时间？",options:["十五分钟","半个小时","一个小时","两个小时"],answer:1,explanation:"六点半到七点是半个小时。" },
  { id:"h2-4",level:2,skill:"grammar",prompt:"这本书我已经看___了。",options:["完","起","到","开"],answer:0,explanation:"“看完”表示阅读这个动作已经完成。" },
  { id:"h3-1",level:3,skill:"vocabulary",prompt:"他每天都锻炼，所以身体很___。",options:["安静","健康","简单","着急"],answer:1,explanation:"经常锻炼通常会让身体健康。" },
  { id:"h3-2",level:3,skill:"grammar",prompt:"___天气很冷，___他还是出去跑步了。",options:["如果…就…","因为…所以…","虽然…但是…","不但…而且…"],answer:2,explanation:"前后是转折关系，使用“虽然……但是……”。" },
  { id:"h3-3",level:3,skill:"reading",prompt:"李老师让我把作业放在她的桌子上，可是办公室没人。我应该怎么做？",options:["带回家","放在桌上","扔掉作业","交给同学"],answer:1,explanation:"老师的要求是把作业放在她的桌子上。" },
  { id:"h3-4",level:3,skill:"grammar",prompt:"我对中国历史越来越感兴趣___。",options:["的","地","得","了"],answer:3,explanation:"句末“了”表示状态发生了变化。" },
  { id:"h4-1",level:4,skill:"vocabulary",prompt:"公司决定___一种新产品。",options:["发展","发生","发表","发明"],answer:3,explanation:"创造以前没有的产品使用“发明”。" },
  { id:"h4-2",level:4,skill:"grammar",prompt:"只有认真准备，___能顺利通过面试。",options:["才","就","也","又"],answer:0,explanation:"必要条件结构是“只有……才……”。" },
  { id:"h4-3",level:4,skill:"reading",prompt:"这家餐厅价格不低，不过服务周到，菜也很有特色，因此周末常常需要提前订座。为什么要提前订座？",options:["价格便宜","周末客人多","服务不好","菜的种类少"],answer:1,explanation:"“需要提前订座”说明周末客人多、座位紧张。" },
  { id:"h4-4",level:4,skill:"vocabulary",prompt:"这次活动由学生会负责___。",options:["组织","组成","制造","建立"],answer:0,explanation:"筹划并开展活动使用“组织活动”。" },
  { id:"h5-1",level:5,skill:"grammar",prompt:"___遇到多大的困难，他___没有放弃自己的目标。",options:["即使…也…","无论…都…","既然…就…","与其…不如…"],answer:1,explanation:"“无论……都……”表示在任何条件下结果都不变。" },
  { id:"h5-2",level:5,skill:"vocabulary",prompt:"研究结果与最初的假设基本___。",options:["符合","配合","结合","集合"],answer:0,explanation:"“符合假设”表示实际结果与预期一致。" },
  { id:"h5-3",level:5,skill:"reading",prompt:"许多人以为效率就是在更短的时间内做更多的事，其实真正的效率还包括判断哪些事情根本不值得做。作者主要强调什么？",options:["工作时间越短越好","所有事情都应该完成","选择任务也是效率的一部分","做事速度决定一切"],answer:2,explanation:"作者强调效率不仅是速度，还包括判断任务是否值得做。" },
  { id:"h5-4",level:5,skill:"grammar",prompt:"这项规定实施以后，不少问题___得到了解决。",options:["逐渐","陆续","连续","持续"],answer:1,explanation:"多个问题先后得到解决，使用“陆续”。" },
  { id:"h6-1",level:6,skill:"vocabulary",prompt:"面对质疑，他没有急于辩解，而是用数据___自己的观点。",options:["支配","支撑","支付","支援"],answer:1,explanation:"数据可以作为证据“支撑”观点。" },
  { id:"h6-2",level:6,skill:"grammar",prompt:"这篇报告___指出了问题，___提出了切实可行的解决方案。",options:["宁可…也不…","不是…而是…","不仅…还…","尽管…却…"],answer:2,explanation:"两个递进的积极信息使用“不仅……还……”。" },
  { id:"h6-3",level:6,skill:"reading",prompt:"技术本身并不天然带有价值判断，它产生怎样的社会影响，往往取决于人们如何设计制度、分配资源并承担责任。下列哪项最符合作者观点？",options:["技术决定社会的一切","技术进步必然带来公平","社会影响与人的选择密切相关","制度会阻碍技术发展"],answer:2,explanation:"作者认为技术的影响取决于制度设计、资源分配和责任承担，也就是人的选择。" },
  { id:"h6-4",level:6,skill:"vocabulary",prompt:"如果只追求短期利益，企业的长期发展可能会受到___。",options:["约束","损害","妨碍","耽误"],answer:1,explanation:"“受到损害”是固定搭配，表示长期发展遭到不良影响。" },
];

type QuestionTranslation = { prompt:string; explanation:string; options?:[string,string,string,string] };

const hskQuestionTranslations: Record<"my"|"en",Record<string,QuestionTranslation>> = {
  my: {
    "h1-1":{prompt:"“谢谢”၏ အဓိပ္ပာယ်ကို ရွေးပါ။",explanation:"“谢谢” ကို ကျေးဇူးတင်ကြောင်း ဖော်ပြရာတွင် အသုံးပြုသည်။",options:["မင်္ဂလာပါ","ကျေးဇူးတင်ပါတယ်","တောင်းပန်ပါတယ်","နှုတ်ဆက်ပါတယ်"]},
    "h1-2":{prompt:"ဝါကျကို ပြည့်စုံစေရန် မှန်ကန်သော စကားလုံးကို ရွေးပါ။ 我___学生。",explanation:"မည်သူမည်ဝါဖြစ်ကြောင်း ဖော်ပြရာတွင် “是” ကို အသုံးပြုသည်။"},
    "h1-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး အဖြေမှန်ကို ရွေးပါ။ 小王今天不工作，他去医院。小王今天去哪儿？",explanation:"စာပိုဒ်တွင် 小王 သည် ဆေးရုံသို့ သွားသည်ဟု တိုက်ရိုက်ဖော်ပြထားသည်။"},
    "h1-4":{prompt:"အချိန်ကို ဖော်ပြသည့် စကားလုံးကို ရွေးပါ။",explanation:"“八点” သည် ရှစ်နာရီဟူသော အချိန်ကို ဖော်ပြသည်။"},
    "h2-1":{prompt:"ဝါကျကို ပြည့်စုံစေရန် မှန်ကန်သော စကားလုံးကို ရွေးပါ။ 妹妹___我高。",explanation:"အရပ်အမြင့်ကို နှိုင်းယှဉ်ရာတွင် “A 比 B + နာမဝိသေသန” ပုံစံကို အသုံးပြုသည်။"},
    "h2-2":{prompt:"外面下雨了，出门要带什么？ မိုးရွာနေချိန် အပြင်သွားလျှင် ဘာယူသွားသင့်သနည်း။",explanation:"မိုးရွာနေချိန် အပြင်သွားလျှင် ထီးယူသွားသင့်သည်။"},
    "h2-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး အချိန်ကို တွက်ချက်ပါ။ 电影七点开始，现在六点半。离电影开始还有多长时间？",explanation:"ခြောက်နာရီခွဲမှ ခုနစ်နာရီအထိ မိနစ်သုံးဆယ်ရှိသည်။"},
    "h2-4":{prompt:"ဝါကျကို ပြည့်စုံစေရန် မှန်ကန်သော စကားလုံးကို ရွေးပါ။ 这本书我已经看___了。",explanation:"“看完” သည် စာဖတ်ခြင်းပြီးဆုံးပြီဟု ဆိုလိုသည်။"},
    "h3-1":{prompt:"အကြောင်းအရာနှင့် ကိုက်ညီသော စကားလုံးကို ရွေးပါ။ 他每天都锻炼，所以身体很___。",explanation:"နေ့စဉ်လေ့ကျင့်ခန်းလုပ်ခြင်းကြောင့် ကိုယ်ခန္ဓာကျန်းမာသည်။"},
    "h3-2":{prompt:"သင့်လျော်သော ဆက်စပ်ပုဒ်အတွဲကို ရွေးပါ။ ___天气很冷，___他还是出去跑步了。",explanation:"ရှေ့နှင့်နောက် အဓိပ္ပာယ် ဆန့်ကျင်ပြောင်းလဲသဖြင့် “虽然……但是……” ကို အသုံးပြုသည်။"},
    "h3-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး လုပ်ဆောင်သင့်သည့်အရာကို ရွေးပါ။ 李老师让我把作业放在她的桌子上，可是办公室没人。我应该怎么做？",explanation:"ဆရာမက အိမ်စာကို သူမ၏စားပွဲပေါ်တွင် ထားရန် ပြောထားသည်။"},
    "h3-4":{prompt:"ဝါကျအဆုံးတွင် သင့်လျော်သော စကားလုံးကို ရွေးပါ။ 我对中国历史越来越感兴趣___。",explanation:"ဝါကျအဆုံးရှိ “了” သည် အခြေအနေပြောင်းလဲမှုကို ဖော်ပြသည်။"},
    "h4-1":{prompt:"ဝါကျအတွက် အတိကျဆုံး စကားလုံးကို ရွေးပါ။ 公司决定___一种新产品。",explanation:"ယခင်က မရှိသေးသော ထုတ်ကုန်ကို ဖန်တီးခြင်းအတွက် “发明” ကို အသုံးပြုသည်။"},
    "h4-2":{prompt:"သတ်မှတ်ချက်ဆိုင်ရာ ဝါကျပုံစံကို ပြည့်စုံစေပါ။ 只有认真准备，___能顺利通过面试。",explanation:"လိုအပ်သော သတ်မှတ်ချက်ကို ဖော်ပြသည့် ပုံစံမှာ “只有……才……” ဖြစ်သည်။"},
    "h4-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး မေးခွန်းကို ဖြေပါ။ 这家餐厅价格不低，不过服务周到，菜也很有特色，因此周末常常需要提前订座。为什么要提前订座？",explanation:"ကြိုတင်နေရာယူရခြင်းမှာ ပိတ်ရက်တွင် ဧည့်သည်များပြီး နေရာကန့်သတ်ထားသောကြောင့် ဖြစ်သည်။"},
    "h4-4":{prompt:"သင့်လျော်သော ကြိယာကို ရွေးပါ။ 这次活动由学生会负责___。",explanation:"လှုပ်ရှားမှုတစ်ခု စီစဉ်ဆောင်ရွက်ခြင်းကို “组织活动” ဟု သုံးသည်။"},
    "h5-1":{prompt:"မည်သည့်အခြေအနေတွင်မဆို ရလဒ်မပြောင်းကြောင်း ဖော်ပြသည့် စကားလုံးအတွဲကို ရွေးပါ။ ___遇到多大的困难，他___没有放弃自己的目标。",explanation:"“无论……都……” သည် အခြေအနေမည်သို့ပင်ဖြစ်စေ ရလဒ်မပြောင်းကြောင်း ဖော်ပြသည်။"},
    "h5-2":{prompt:"ဝါကျအတွက် အတိကျဆုံး စကားလုံးကို ရွေးပါ။ 研究结果与最初的假设基本___。",explanation:"“符合假设” သည် လက်တွေ့ရလဒ်နှင့် မူလခန့်မှန်းချက် ကိုက်ညီသည်ဟု ဆိုလိုသည်။"},
    "h5-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး စာရေးသူ အဓိကအလေးပေးသည့် အချက်ကို ရွေးပါ။ 许多人以为效率就是在更短的时间内做更多的事，其实真正的效率还包括判断哪些事情根本不值得做。",explanation:"စာရေးသူက ထိရောက်မှုတွင် မြန်နှုန်းသာမက လုပ်ငန်းရွေးချယ်ခြင်းလည်း ပါဝင်ကြောင်း အလေးပေးထားသည်။"},
    "h5-4":{prompt:"ဝါကျအခြေအနေနှင့် ကိုက်ညီသော စကားလုံးကို ရွေးပါ။ 这项规定实施以后，不少问题___得到了解决。",explanation:"ပြဿနာများ တစ်ခုပြီးတစ်ခု ဖြေရှင်းခံရခြင်းအတွက် “陆续” ကို အသုံးပြုသည်။"},
    "h6-1":{prompt:"အသုံးအနှုန်းအရ အတိကျဆုံး စကားလုံးကို ရွေးပါ။ 面对质疑，他没有急于辩解，而是用数据___自己的观点。",explanation:"ဒေတာကို အထောက်အထားအဖြစ် အသုံးပြု၍ အမြင်တစ်ခုကို “支撑” လုပ်နိုင်သည်။"},
    "h6-2":{prompt:"တိုးတက်ဖြည့်စွက်သည့် ဆက်စပ်ပုဒ်အတွဲကို ရွေးပါ။ 这篇报告___指出了问题，___提出了切实可行的解决方案。",explanation:"အပြုသဘောဆောင်သော အချက်နှစ်ခု တိုး၍ဖော်ပြရာတွင် “不仅……还……” ကို အသုံးပြုသည်။"},
    "h6-3":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး စာရေးသူ၏အမြင်နှင့် အကိုက်ညီဆုံးအချက်ကို ရွေးပါ။ 技术本身并不天然带有价值判断，它产生怎样的社会影响，往往取决于人们如何设计制度、分配资源并承担责任。",explanation:"နည်းပညာ၏ လူမှုအကျိုးသက်ရောက်မှုသည် စနစ်ဒီဇိုင်း၊ အရင်းအမြစ်ခွဲဝေမှုနှင့် လူတို့၏တာဝန်ယူမှုအပေါ် မူတည်သည်။"},
    "h6-4":{prompt:"ဝါကျအတွက် အသုံးအနှုန်းမှန်ကို ရွေးပါ။ 如果只追求短期利益，企业的长期发展可能会受到___。",explanation:"“受到损害” သည် ထိခိုက်နစ်နာမှု ရရှိသည်ဟု ဆိုလိုသည့် ပုံသေအသုံးအနှုန်းဖြစ်သည်။"}
  },
  en: {
    "h1-1":{prompt:"Choose the meaning of “谢谢”.",explanation:"“谢谢” is used to express thanks.",options:["Hello","Thank you","Sorry","Goodbye"]},
    "h1-2":{prompt:"Choose the correct word to complete the sentence: 我___学生。",explanation:"Use the linking verb “是” to identify a person or role."},
    "h1-3":{prompt:"Read and answer: 小王今天不工作，他去医院。小王今天去哪儿？",explanation:"The passage directly states that Xiao Wang goes to the hospital."},
    "h1-4":{prompt:"Which option expresses a time?",explanation:"“八点” means eight o’clock."},
    "h2-1":{prompt:"Choose the correct word: 妹妹___我高。",explanation:"Use the pattern “A 比 B + adjective” to compare height."},
    "h2-2":{prompt:"Read and answer: 外面下雨了，出门要带什么？",explanation:"An umbrella is needed when going out in the rain."},
    "h2-3":{prompt:"Calculate the time: 电影七点开始，现在六点半。离电影开始还有多长时间？",explanation:"There are thirty minutes from 6:30 to 7:00."},
    "h2-4":{prompt:"Choose the correct result complement: 这本书我已经看___了。",explanation:"“看完” means that the action of reading has been completed."},
    "h3-1":{prompt:"Choose the word that best fits: 他每天都锻炼，所以身体很___。",explanation:"Regular exercise helps a person stay healthy."},
    "h3-2":{prompt:"Choose the correct conjunction pair: ___天气很冷，___他还是出去跑步了。",explanation:"The two clauses contrast, so use “虽然……但是……”."},
    "h3-3":{prompt:"Read and choose what should be done: 李老师让我把作业放在她的桌子上，可是办公室没人。我应该怎么做？",explanation:"The teacher asked for the homework to be left on her desk."},
    "h3-4":{prompt:"Choose the correct sentence-final particle: 我对中国历史越来越感兴趣___。",explanation:"Sentence-final “了” indicates a change of state."},
    "h4-1":{prompt:"Choose the most precise word: 公司决定___一种新产品。",explanation:"“发明” is used for creating a product that did not previously exist."},
    "h4-2":{prompt:"Complete the necessary-condition pattern: 只有认真准备，___能顺利通过面试。",explanation:"The necessary-condition structure is “只有……才……”."},
    "h4-3":{prompt:"Read and answer: 这家餐厅价格不低，不过服务周到，菜也很有特色，因此周末常常需要提前订座。为什么要提前订座？",explanation:"Advance booking is needed because the restaurant is busy on weekends."},
    "h4-4":{prompt:"Choose the appropriate verb: 这次活动由学生会负责___。",explanation:"The standard expression for planning and running an event is “组织活动”."},
    "h5-1":{prompt:"Choose the pair meaning that the result remains unchanged in any situation: ___遇到多大的困难，他___没有放弃自己的目标。",explanation:"“无论……都……” means that the result remains the same regardless of the condition."},
    "h5-2":{prompt:"Choose the most precise word: 研究结果与最初的假设基本___。",explanation:"“符合假设” means the findings agree with the original hypothesis."},
    "h5-3":{prompt:"Read and identify the author’s main point: 许多人以为效率就是在更短的时间内做更多的事，其实真正的效率还包括判断哪些事情根本不值得做。",explanation:"The author stresses that efficiency includes choosing worthwhile tasks, not only speed."},
    "h5-4":{prompt:"Choose the word that best fits the context: 这项规定实施以后，不少问题___得到了解决。",explanation:"“陆续” describes several problems being solved one after another."},
    "h6-1":{prompt:"Choose the most precise word: 面对质疑，他没有急于辩解，而是用数据___自己的观点。",explanation:"Data can serve as evidence to “支撑” an argument."},
    "h6-2":{prompt:"Choose the additive conjunction pair: 这篇报告___指出了问题，___提出了切实可行的解决方案。",explanation:"Use “不仅……还……” to add a second positive point."},
    "h6-3":{prompt:"Read and choose the statement closest to the author’s view: 技术本身并不天然带有价值判断，它产生怎样的社会影响，往往取决于人们如何设计制度、分配资源并承担责任。",explanation:"The social effects of technology depend on institutional design, resource allocation and human responsibility."},
    "h6-4":{prompt:"Choose the correct collocation: 如果只追求短期利益，企业的长期发展可能会受到___。",explanation:"“受到损害” is the standard collocation meaning to suffer harm."}
  }
};

export function localizeHskQuestion(question:HskQuestion,locale:string):HskQuestion {
  if(locale!=="my"&&locale!=="en") return question;
  const translated=hskQuestionTranslations[locale][question.id];
  return translated ? {...question,prompt:translated.prompt,explanation:translated.explanation,options:translated.options||question.options} : question;
}

export const cefrByHsk = { 0:"Pre-A1",1:"A1",2:"A2",3:"B1",4:"B2",5:"C1",6:"C2" } as const;

export function scoreHsk(answers: Record<string, number>) {
  const byLevel = [1,2,3,4,5,6].map((level) => {
    const questions = hskQuestions.filter((question) => question.level === level);
    const correct = questions.filter((question) => answers[question.id] === question.answer).length;
    return { level, correct, total: questions.length, rate: correct / questions.length };
  });
  const totalCorrect = byLevel.reduce((sum, item) => sum + item.correct, 0);
  let estimatedLevel = 0;
  let cumulativeCorrect = 0;
  let cumulativeTotal = 0;
  for (const item of byLevel) {
    cumulativeCorrect += item.correct;
    cumulativeTotal += item.total;
    if (item.rate >= 0.5 && cumulativeCorrect / cumulativeTotal >= 0.65) estimatedLevel = item.level;
    else break;
  }
  return { estimatedLevel, cefr: cefrByHsk[estimatedLevel as keyof typeof cefrByHsk], score: Math.round(totalCorrect / hskQuestions.length * 100), correct: totalCorrect, total: hskQuestions.length, byLevel };
}
