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
  { id:"h1-1",level:1,skill:"vocabulary",prompt:"‘谢谢’的意思是：",options:["Hello","Thank you","Sorry","Goodbye"],answer:1,explanation:"“谢谢”用于表达感谢。" },
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
