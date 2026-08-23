export type HskQuestion = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  skill: "vocabulary" | "grammar" | "reading" | "listening" | "writing";
  prompt: string;
  options?: [string, string, string, string];
  answer: number | string;
  explanation: string;
  audioText?: string;
  responseType?: "choice" | "text";
  acceptedAnswers?: string[];
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
  { id:"l1-1",level:1,skill:"listening",prompt:"播放录音后，选择你听到的内容。",audioText:"你好，很高兴认识你。",options:["他在告别","他在问路","他在打招呼","他在道歉"],answer:2,explanation:"录音中的“你好，很高兴认识你”是见面问候。" },
  { id:"l2-1",level:2,skill:"listening",prompt:"播放录音：说话人几点去学校？",audioText:"我每天早上七点半去学校。",options:["七点","七点半","八点","八点半"],answer:1,explanation:"录音明确说“七点半去学校”。" },
  { id:"l3-1",level:3,skill:"listening",prompt:"播放录音：女的为什么没去上班？",audioText:"她今天有点儿发烧，所以请假在家休息。",options:["天气不好","工作结束了","身体不舒服","交通不方便"],answer:2,explanation:"“发烧、在家休息”说明她身体不舒服。" },
  { id:"l4-1",level:4,skill:"listening",prompt:"播放录音：说话人建议怎么做？",audioText:"这份材料内容没问题，不过格式还需要调整一下，明天再交吧。",options:["立即提交","修改格式后提交","删除材料","只修改内容"],answer:1,explanation:"说话人建议调整格式后第二天再提交。" },
  { id:"l5-1",level:5,skill:"listening",prompt:"播放录音：说话人的主要观点是什么？",audioText:"旅行的意义不只是看风景，更重要的是暂时离开熟悉的环境，重新认识自己。",options:["旅行浪费时间","风景最重要","旅行有助于自我认识","熟悉的环境更安全"],answer:2,explanation:"录音强调旅行可以帮助人重新认识自己。" },
  { id:"l6-1",level:6,skill:"listening",prompt:"播放录音：这段话主要说明什么？",audioText:"信息越丰富，人们越需要具备辨别能力，否则更多的选择反而可能增加决策成本。",options:["信息越多决定越快","选择没有价值","辨别能力能降低决策负担","应该拒绝所有信息"],answer:2,explanation:"核心是信息丰富时更需要辨别能力，以减少决策负担。" },
  { id:"r1-2",level:1,skill:"reading",prompt:"阅读：今天星期天，商店九点开门。现在八点半。商店开门了吗？",options:["开门了","还没开门","已经关门","不知道"],answer:1,explanation:"现在八点半，离九点开门还有半小时。" },
  { id:"r2-2",level:2,skill:"reading",prompt:"阅读：小李买了两张火车票，一张给自己，一张给妈妈。他们怎么去旅行？",options:["坐飞机","坐汽车","坐火车","骑自行车"],answer:2,explanation:"他们买的是火车票，所以坐火车旅行。" },
  { id:"r3-2",level:3,skill:"reading",prompt:"阅读：这家书店虽然不大，但是书的种类很多，而且店员很热情。作者对书店的态度是？",options:["满意","失望","担心","生气"],answer:0,explanation:"“种类很多、店员热情”表达积极、满意的态度。" },
  { id:"r4-2",level:4,skill:"reading",prompt:"阅读：会议原定下午两点开始，因为经理的航班晚点，改到三点半。会议推迟了多久？",options:["半小时","一小时","一个半小时","两小时"],answer:2,explanation:"两点到三点半相差一个半小时。" },
  { id:"r5-2",level:5,skill:"reading",prompt:"阅读：好的公共空间不仅方便通行，还能让陌生人自然交流，从而增强社区成员的归属感。公共空间的重要作用是什么？",options:["提高房价","限制交流","增强社区联系","减少居民数量"],answer:2,explanation:"文章强调公共空间促进交流并增强社区归属感。" },
  { id:"r6-2",level:6,skill:"reading",prompt:"阅读：规则的价值不在于消除所有不确定性，而在于为人们处理不确定性提供共同框架。作者认为规则的价值是什么？",options:["保证结果完全相同","消除一切风险","提供共同处理框架","代替个人判断"],answer:2,explanation:"作者明确指出规则为处理不确定性提供共同框架。" },
  { id:"w1-1",level:1,skill:"writing",prompt:"请写出汉字：nǐ hǎo（问候语）",answer:"你好",acceptedAnswers:["你好"],responseType:"text",explanation:"nǐ hǎo 写作“你好”。" },
  { id:"w2-1",level:2,skill:"writing",prompt:"把词语排列成正确句子：喜欢 / 我 / 学习 / 汉语",answer:"我喜欢学习汉语",acceptedAnswers:["我喜欢学习汉语","我喜欢学习汉语。"],responseType:"text",explanation:"正确语序是“主语 + 谓语 + 宾语”：我喜欢学习汉语。" },
  { id:"w3-1",level:3,skill:"writing",prompt:"根据拼音写词语：jiàn kāng",answer:"健康",acceptedAnswers:["健康"],responseType:"text",explanation:"jiàn kāng 对应汉字“健康”。" },
  { id:"w4-1",level:4,skill:"writing",prompt:"用“虽然……但是……”补全：___下雨，___我们还是出发了。",answer:"虽然下雨但是我们还是出发了",acceptedAnswers:["虽然下雨但是我们还是出发了","虽然下雨，但是我们还是出发了。","虽然下雨，但是我们还是出发了"],responseType:"text",explanation:"转折复句使用“虽然……但是……”。" },
  { id:"w5-1",level:5,skill:"writing",prompt:"根据释义写词语：实际情况与预期或标准一致。",answer:"符合",acceptedAnswers:["符合"],responseType:"text",explanation:"“符合”表示与标准、条件或预期一致。" },
  { id:"w6-1",level:6,skill:"writing",prompt:"把词语组成完整句子：取决于 / 社会影响 / 人们 / 如何使用技术",answer:"社会影响取决于人们如何使用技术",acceptedAnswers:["社会影响取决于人们如何使用技术","社会影响取决于人们如何使用技术。"],responseType:"text",explanation:"正确句子是“社会影响取决于人们如何使用技术”。" },
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
    "h6-4":{prompt:"ဝါကျအတွက် အသုံးအနှုန်းမှန်ကို ရွေးပါ။ 如果只追求短期利益，企业的长期发展可能会受到___。",explanation:"“受到损害” သည် ထိခိုက်နစ်နာမှု ရရှိသည်ဟု ဆိုလိုသည့် ပုံသေအသုံးအနှုန်းဖြစ်သည်။"},
    "l1-1":{prompt:"အသံဖိုင်ကို နားထောင်ပြီး ကြားရသည့် အကြောင်းအရာကို ရွေးပါ။",explanation:"“你好，很高兴认识你” သည် တွေ့ဆုံချိန် နှုတ်ဆက်စကားဖြစ်သည်။",options:["နှုတ်ဆက်ခွဲခွာနေသည်","လမ်းမေးနေသည်","တွေ့ဆုံနှုတ်ဆက်နေသည်","တောင်းပန်နေသည်"]},
    "l2-1":{prompt:"အသံဖိုင်ကို နားထောင်ပါ။ ပြောသူက ဘယ်အချိန် ကျောင်းသွားသနည်း။",explanation:"အသံဖိုင်တွင် မနက် ၇ နာရီခွဲ ကျောင်းသွားသည်ဟု ဆိုထားသည်။",options:["၇ နာရီ","၇ နာရီခွဲ","၈ နာရီ","၈ နာရီခွဲ"]},
    "l3-1":{prompt:"အသံဖိုင်ကို နားထောင်ပါ။ အမျိုးသမီးက ဘာကြောင့် အလုပ်မသွားသနည်း။",explanation:"ဖျားနာပြီး အိမ်တွင် အနားယူသဖြင့် ကိုယ်မအီမသာဖြစ်နေသည်။",options:["ရာသီဥတုမကောင်းသောကြောင့်","အလုပ်ပြီးသွားသောကြောင့်","ကိုယ်မအီမသာဖြစ်သောကြောင့်","သွားလာရေးမလွယ်သောကြောင့်"]},
    "l4-1":{prompt:"အသံဖိုင်ကို နားထောင်ပါ။ ပြောသူက ဘာလုပ်ရန် အကြံပြုသနည်း။",explanation:"ပုံစံကို ပြင်ဆင်ပြီး နောက်နေ့တွင် တင်ပြရန် အကြံပြုထားသည်။",options:["ချက်ချင်းတင်ပြရန်","ပုံစံပြင်ပြီး တင်ပြရန်","စာရွက်စာတမ်းဖျက်ရန်","အကြောင်းအရာသာ ပြင်ရန်"]},
    "l5-1":{prompt:"အသံဖိုင်ကို နားထောင်ပြီး အဓိကအမြင်ကို ရွေးပါ။",explanation:"ခရီးသွားခြင်းက မိမိကိုယ်ကို ပြန်လည်သိမြင်စေကြောင်း အလေးပေးထားသည်။",options:["ခရီးသွားခြင်းက အချိန်ဖြုန်းသည်","ရှုခင်းက အရေးအကြီးဆုံးဖြစ်သည်","ခရီးသွားခြင်းက မိမိကိုယ်ကို သိမြင်စေသည်","ရင်းနှီးသောပတ်ဝန်းကျင်သာ ပိုလုံခြုံသည်"]},
    "l6-1":{prompt:"အသံဖိုင်ကို နားထောင်ပြီး အဓိကဆိုလိုချက်ကို ရွေးပါ။",explanation:"သတင်းအချက်အလက်များချိန်တွင် ခွဲခြားသုံးသပ်နိုင်မှုက ဆုံးဖြတ်ချက်ဝန်ကို လျော့စေသည်။",options:["သတင်းများလေ ဆုံးဖြတ်ချက်မြန်လေ","ရွေးချယ်မှုက တန်ဖိုးမရှိ","ခွဲခြားနိုင်မှုက ဆုံးဖြတ်ချက်ဝန် လျော့စေသည်","သတင်းအားလုံးကို ငြင်းပယ်သင့်သည်"]},
    "r1-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး ဖြေပါ။ 今天星期天，商店九点开门。现在八点半。商店开门了吗？",explanation:"ယခု ၈ နာရီခွဲဖြစ်၍ ၉ နာရီဖွင့်ချိန် မရောက်သေးပါ။",options:["ဖွင့်ပြီးပြီ","မဖွင့်သေးပါ","ပိတ်ပြီးပြီ","မသိပါ"]},
    "r2-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး ဖြေပါ။ 小李买了两张火车票，一张给自己，一张给妈妈。他们怎么去旅行？",explanation:"ရထားလက်မှတ် ဝယ်ထားသောကြောင့် ရထားဖြင့် ခရီးသွားမည်။",options:["လေယာဉ်ဖြင့်","ကားဖြင့်","ရထားဖြင့်","စက်ဘီးဖြင့်"]},
    "r3-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး စာရေးသူ၏ သဘောထားကို ရွေးပါ။ 这家书店虽然不大，但是书的种类很多，而且店员很热情。",explanation:"စာအမျိုးအစားများပြီး ဝန်ထမ်းဖော်ရွေကြောင်း ဖော်ပြသဖြင့် ကျေနပ်သည့်သဘောဖြစ်သည်။",options:["ကျေနပ်သည်","စိတ်ပျက်သည်","စိုးရိမ်သည်","စိတ်ဆိုးသည်"]},
    "r4-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး အချိန်ကိုတွက်ပါ။ 会议原定下午两点开始，因为经理的航班晚点，改到三点半。",explanation:"၂ နာရီမှ ၃ နာရီခွဲအထိ ၁ နာရီခွဲဖြစ်သည်။",options:["နာရီဝက်","၁ နာရီ","၁ နာရီခွဲ","၂ နာရီ"]},
    "r5-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး အများသုံးနေရာ၏ အရေးကြီးသည့်အခန်းကဏ္ဍကို ရွေးပါ။ 好的公共空间不仅方便通行，还能让陌生人自然交流，从而增强社区成员的归属感。",explanation:"လူမှုဆက်ဆံရေးနှင့် အသိုင်းအဝိုင်းအပေါ် ပိုင်ဆိုင်မှုခံစားချက်ကို တိုးစေသည်။",options:["အိမ်ဈေးမြှင့်ခြင်း","ဆက်ဆံရေးကန့်သတ်ခြင်း","အသိုင်းအဝိုင်းဆက်နွယ်မှု တိုးစေခြင်း","နေထိုင်သူ လျော့စေခြင်း"]},
    "r6-2":{prompt:"စာပိုဒ်ကိုဖတ်ပြီး စည်းမျဉ်း၏တန်ဖိုးကို ရွေးပါ။ 规则的价值不在于消除所有不确定性，而在于为人们处理不确定性提供共同框架。",explanation:"မသေချာမှုကို ကိုင်တွယ်ရန် အများသဘောတူ ဘောင်တစ်ခု ပေးခြင်းဖြစ်သည်။",options:["ရလဒ်အားလုံး တူစေခြင်း","အန္တရာယ်အားလုံး ဖယ်ရှားခြင်း","အများသုံးကိုင်တွယ်မှုဘောင် ပေးခြင်း","ကိုယ်ပိုင်ဆုံးဖြတ်ချက်ကို အစားထိုးခြင်း"]},
    "w1-1":{prompt:"တရုတ်စာလုံးဖြင့် ရေးပါ။ nǐ hǎo (နှုတ်ဆက်စကား)",explanation:"nǐ hǎo ကို “你好” ဟု ရေးသည်။"},
    "w2-1":{prompt:"စကားလုံးများကို မှန်ကန်သော ဝါကျဖြစ်အောင် စီပါ။ 喜欢 / 我 / 学习 / 汉语",explanation:"မှန်ကန်သောအစီအစဉ်မှာ “我喜欢学习汉语。” ဖြစ်သည်။"},
    "w3-1":{prompt:"Pinyin အရ တရုတ်စာလုံးရေးပါ။ jiàn kāng",explanation:"jiàn kāng သည် “健康” ဖြစ်သည်။"},
    "w4-1":{prompt:"“虽然……但是……” ကိုသုံး၍ ဝါကျဖြည့်ပါ။ ___下雨，___我们还是出发了。",explanation:"ဆန့်ကျင်ဘက်အခြေအနေကို “虽然……但是……” ဖြင့် ဆက်သည်။"},
    "w5-1":{prompt:"အဓိပ္ပာယ်အရ တရုတ်စကားလုံးရေးပါ။ လက်တွေ့အခြေအနေသည် မျှော်မှန်းချက် သို့မဟုတ် စံနှုန်းနှင့် ကိုက်ညီခြင်း။",explanation:"“符合” သည် စံနှုန်း သို့မဟုတ် မျှော်မှန်းချက်နှင့် ကိုက်ညီသည်ဟု ဆိုလိုသည်။"},
    "w6-1":{prompt:"စကားလုံးများကို ဝါကျပြည့်စုံအောင် စီပါ။ 取决于 / 社会影响 / 人们 / 如何使用技术",explanation:"မှန်ကန်သောဝါကျမှာ “社会影响取决于人们如何使用技术。” ဖြစ်သည်။"}
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
    "h6-4":{prompt:"Choose the correct collocation: 如果只追求短期利益，企业的长期发展可能会受到___。",explanation:"“受到损害” is the standard collocation meaning to suffer harm."},
    "l1-1":{prompt:"Play the audio and choose what you hear.",explanation:"“你好，很高兴认识你” is a greeting on meeting someone.",options:["He is saying goodbye","He is asking directions","He is greeting someone","He is apologizing"]},
    "l2-1":{prompt:"Play the audio. What time does the speaker go to school?",explanation:"The speaker says they go to school at 7:30.",options:["7:00","7:30","8:00","8:30"]},
    "l3-1":{prompt:"Play the audio. Why did the woman not go to work?",explanation:"She has a fever and is resting at home, so she is unwell.",options:["Bad weather","Work had finished","She was unwell","Transport was unavailable"]},
    "l4-1":{prompt:"Play the audio. What does the speaker suggest?",explanation:"The speaker suggests fixing the format and submitting it the next day.",options:["Submit immediately","Fix the format, then submit","Delete the material","Only revise the content"]},
    "l5-1":{prompt:"Play the audio and choose the speaker’s main point.",explanation:"The speaker stresses that travel can help people understand themselves.",options:["Travel wastes time","Scenery matters most","Travel supports self-discovery","Familiar places are always safer"]},
    "l6-1":{prompt:"Play the audio and choose the main idea.",explanation:"With more information, discernment reduces the burden of decision-making.",options:["More information makes every decision faster","Choice has no value","Discernment reduces decision burden","All information should be rejected"]},
    "r1-2":{prompt:"Read and answer: 今天星期天，商店九点开门。现在八点半。商店开门了吗？",explanation:"It is 8:30, half an hour before the shop opens.",options:["It is open","It is not open yet","It has closed","We do not know"]},
    "r2-2":{prompt:"Read and answer: 小李买了两张火车票，一张给自己，一张给妈妈。他们怎么去旅行？",explanation:"They bought train tickets, so they will travel by train.",options:["By plane","By bus","By train","By bicycle"]},
    "r3-2":{prompt:"Read and identify the author’s attitude: 这家书店虽然不大，但是书的种类很多，而且店员很热情。",explanation:"The positive details show that the author is satisfied.",options:["Satisfied","Disappointed","Worried","Angry"]},
    "r4-2":{prompt:"Read and calculate: 会议原定下午两点开始，因为经理的航班晚点，改到三点半。会议推迟了多久？",explanation:"From 2:00 to 3:30 is one and a half hours.",options:["Half an hour","One hour","One and a half hours","Two hours"]},
    "r5-2":{prompt:"Read and choose the important role of public space: 好的公共空间不仅方便通行，还能让陌生人自然交流，从而增强社区成员的归属感。",explanation:"It encourages interaction and strengthens community connection.",options:["Raising property prices","Limiting interaction","Strengthening community ties","Reducing population"]},
    "r6-2":{prompt:"Read and identify the value of rules: 规则的价值不在于消除所有不确定性，而在于为人们处理不确定性提供共同框架。",explanation:"Rules provide a shared framework for handling uncertainty.",options:["Guaranteeing identical outcomes","Removing every risk","Providing a shared framework","Replacing personal judgment"]},
    "w1-1":{prompt:"Write the Chinese characters for nǐ hǎo (a greeting).",explanation:"nǐ hǎo is written as “你好”."},
    "w2-1":{prompt:"Put the words in the correct order: 喜欢 / 我 / 学习 / 汉语",explanation:"The correct order is “我喜欢学习汉语。”"},
    "w3-1":{prompt:"Write the Chinese characters for: jiàn kāng",explanation:"jiàn kāng is written as “健康”."},
    "w4-1":{prompt:"Complete the sentence with “虽然……但是……”: ___下雨，___我们还是出发了。",explanation:"Use “虽然……但是……” to connect contrasting clauses."},
    "w5-1":{prompt:"Write the Chinese word meaning: to agree with an expectation or standard.",explanation:"“符合” means to conform to a standard, condition or expectation."},
    "w6-1":{prompt:"Put the words in the correct order: 取决于 / 社会影响 / 人们 / 如何使用技术",explanation:"The correct sentence is “社会影响取决于人们如何使用技术。”"}
  }
};

export function localizeHskQuestion(question:HskQuestion,locale:string):HskQuestion {
  if(locale!=="my"&&locale!=="en") return question;
  const translated=hskQuestionTranslations[locale][question.id];
  return translated ? {...question,prompt:translated.prompt,explanation:translated.explanation,options:translated.options||question.options} : question;
}

export const cefrByHsk = { 0:"Pre-A1",1:"A1",2:"A2",3:"B1",4:"B2",5:"C1",6:"C2" } as const;

export type HskAnswer = number | string;

export function isHskAnswerCorrect(question:HskQuestion,value:HskAnswer|undefined){
  if(value===undefined) return false;
  if(question.responseType!=="text") return value===question.answer;
  const normalized=String(value).trim().replace(/[，。！？、,.!?\s]/g,"");
  return (question.acceptedAnswers||[String(question.answer)]).some(item=>item.replace(/[，。！？、,.!?\s]/g,"")===normalized);
}

export function scoreHsk(answers: Record<string, HskAnswer>) {
  const byLevel = [1,2,3,4,5,6].map((level) => {
    const questions = hskQuestions.filter((question) => question.level === level);
    const correct = questions.filter((question) => isHskAnswerCorrect(question,answers[question.id])).length;
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
  const bySkill=(["listening","reading","writing","vocabulary","grammar"] as const).map(skill=>{
    const questions=hskQuestions.filter(question=>question.skill===skill);
    const correct=questions.filter(question=>isHskAnswerCorrect(question,answers[question.id])).length;
    return {skill,correct,total:questions.length,rate:questions.length?correct/questions.length:0};
  });
  return { estimatedLevel, cefr: cefrByHsk[estimatedLevel as keyof typeof cefrByHsk], score: Math.round(totalCorrect / hskQuestions.length * 100), correct: totalCorrect, total: hskQuestions.length, byLevel, bySkill };
}
