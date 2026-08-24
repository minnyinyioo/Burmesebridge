export type VocabularyEnrichment = {
  meaningMy: string;
  image?: string;
  imageAltMy?: string;
  imageStatus?: "generated" | "reviewed";
};

// BurmeseBridge editorial layer. These meanings are intentionally stored separately
// from the MIT vocabulary source so translations and original artwork can be reviewed.
export const hsk1VocabularyMy: Record<string, VocabularyEnrichment> = {
  "爱": { meaningMy: "ချစ်သည်၊ ချစ်ခင်သည်", image: "/images/hsk/vocabulary/hsk1-ai-love.png", imageAltMy: "တစ်ဦးကိုတစ်ဦး ချစ်ခင်အားပေးနေသော မိတ်ဆွေနှစ်ဦး", imageStatus: "generated" }, "八": { meaningMy: "ရှစ်" }, "爸爸": { meaningMy: "အဖေ၊ ဖခင်", image: "/images/hsk/vocabulary/hsk1-baba-father.png", imageAltMy: "ကလေးနှင့်အတူ စာဖတ်နေသော ဖခင်", imageStatus: "generated" },
  "杯子": { meaningMy: "ခွက်", image: "/images/hsk/vocabulary/hsk1-beizi-cup.png", imageAltMy: "စားပွဲပေါ်ရှိ သောက်ရေခွက်တစ်လုံး", imageStatus: "generated" }, "北京": { meaningMy: "ပေကျင်းမြို့" }, "本": { meaningMy: "စာအုပ်များအတွက် အသုံးပြုသော ရေတွက်ပုဒ်" },
  "不客气": { meaningMy: "အားမနာပါနှင့်၊ ရပါတယ်" }, "不": { meaningMy: "မ…ဘူး (အငြင်းပုဒ်)" }, "菜": { meaningMy: "ဟင်း၊ ဟင်းလျာ", image: "/images/hsk/vocabulary/hsk1-cai-dish.png", imageAltMy: "ပန်းကန်ပေါ်တွင် ပြင်ဆင်ထားသော ဟင်းလျာ", imageStatus: "generated" },
  "茶": { meaningMy: "လက်ဖက်ရည်၊ လက်ဖက်ခြောက်", image: "/images/hsk/vocabulary/hsk1-cha-tea.png", imageAltMy: "လက်ဖက်ရွက်များနှင့် လက်ဖက်ရည်ပူတစ်ခွက်", imageStatus: "generated" }, "吃": { meaningMy: "စားသည်", image: "/images/hsk/vocabulary/hsk1-chi-eat.png", imageAltMy: "ထမင်းနှင့် ဟင်းလျာများကို တူဖြင့် စားနေသူ", imageStatus: "generated" },
  "出租车": { meaningMy: "အငှားယာဉ်၊ တက္ကစီ", image: "/images/hsk/vocabulary/hsk1-chuzuche-taxi.png", imageAltMy: "လမ်းဘေးတွင် ခရီးသည်တင်နေသော တက္ကစီကား", imageStatus: "generated" }, "打电话": { meaningMy: "ဖုန်းဆက်သည်", image: "/images/hsk/vocabulary/hsk1-dadianhua-phone.png", imageAltMy: "ဖုန်းဖြင့် စကားပြောနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "大": { meaningMy: "ကြီးသော" },
  "的": { meaningMy: "ပိုင်ဆိုင်မှု သို့မဟုတ် အထူးပြုဆက်နွယ်မှုကို ပြသော ပုဒ်" }, "点": { meaningMy: "နာရီ (အချိန်ပြ)" }, "电脑": { meaningMy: "ကွန်ပျူတာ", image: "/images/hsk/vocabulary/hsk1-diannao-computer.png", imageAltMy: "ကွန်ပျူတာအသုံးပြုနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" },
  "电视": { meaningMy: "ရုပ်မြင်သံကြား", image: "/images/hsk/vocabulary/hsk1-dianshi-television.png", imageAltMy: "ရုပ်မြင်သံကြားကြည့်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "电影": { meaningMy: "ရုပ်ရှင်", image: "/images/hsk/vocabulary/hsk1-dianying-movie.png", imageAltMy: "ရုပ်ရှင်ရုံတွင် ရုပ်ရှင်ကြည့်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "东西": { meaningMy: "ပစ္စည်း၊ အရာဝတ္ထု" }, "都": { meaningMy: "အားလုံး၊ လုံးဝ" },
  "读": { meaningMy: "ဖတ်သည်", image: "/images/hsk/vocabulary/hsk1-du-read.png", imageAltMy: "စာအုပ်ဖတ်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "对不起": { meaningMy: "တောင်းပန်ပါတယ်" }, "多": { meaningMy: "များသော" }, "多少": { meaningMy: "ဘယ်လောက်၊ မည်မျှ" },
  "儿子": { meaningMy: "သား" }, "二": { meaningMy: "နှစ်" }, "饭馆": { meaningMy: "စားသောက်ဆိုင်" }, "飞机": { meaningMy: "လေယာဉ်", image: "/images/hsk/vocabulary/hsk1-feiji-airplane.png", imageAltMy: "လေဆိပ်ပြတင်းပေါက်မှ လေယာဉ်ကို လက်ညှိုးထိုးပြနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" },
  "分钟": { meaningMy: "မိနစ်" }, "高兴": { meaningMy: "ဝမ်းသာသော၊ ပျော်ရွှင်သော" }, "个": { meaningMy: "အထွေထွေသုံး ရေတွက်ပုဒ်" },
  "工作": { meaningMy: "အလုပ်လုပ်သည်၊ အလုပ်", image: "/images/hsk/vocabulary/hsk1-gongzuo-work.png", imageAltMy: "ကွန်ပျူတာဖြင့် အလုပ်လုပ်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "狗": { meaningMy: "ခွေး", image: "/images/hsk/vocabulary/hsk1-gou-dog.png", imageAltMy: "ပန်းခြံတွင် ခွေးနှင့် ရင်းနှီးစွာ ဆက်ဆံနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "汉语": { meaningMy: "တရုတ်ဘာသာစကား" }, "好": { meaningMy: "ကောင်းသော၊ ကောင်းသည်" },
  "喝": { meaningMy: "သောက်သည်", image: "/images/hsk/vocabulary/hsk1-he-drink.png", imageAltMy: "ရေသောက်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "和": { meaningMy: "နှင့်၊ ပြီးတော့" }, "很": { meaningMy: "အလွန်၊ တော်တော်" }, "后面": { meaningMy: "နောက်ဘက်၊ အနောက်ဘက်" },
  "回": { meaningMy: "ပြန်သည်" }, "会": { meaningMy: "တတ်သည်၊ လုပ်နိုင်သည်" }, "火车站": { meaningMy: "မီးရထားဘူတာ" }, "几": { meaningMy: "ဘယ်နှခု၊ အနည်းငယ်" },
  "家": { meaningMy: "အိမ်၊ မိသားစု" }, "叫": { meaningMy: "ခေါ်သည်၊ အမည်ဖြစ်သည်" }, "今天": { meaningMy: "ဒီနေ့၊ ယနေ့" }, "九": { meaningMy: "ကိုး" },
  "开": { meaningMy: "ဖွင့်သည်၊ မောင်းသည်" }, "看": { meaningMy: "ကြည့်သည်၊ ဖတ်သည်" }, "看见": { meaningMy: "မြင်သည်၊ တွေ့မြင်သည်" },
  "块": { meaningMy: "အတုံး/အပိုင်း ရေတွက်ပုဒ်၊ ယွမ်၏ အရပ်သုံးအခေါ်" }, "来": { meaningMy: "လာသည်" }, "老师": { meaningMy: "ဆရာ၊ ဆရာမ", image: "/images/hsk/vocabulary/hsk1-laoshi-teacher.png", imageAltMy: "စာသင်ခန်းတွင် ကျောင်းသားကို သင်ကြားပေးနေသော ဆရာမ", imageStatus: "generated" },
  "了": { meaningMy: "လုပ်ရပ်ပြီးဆုံးခြင်း သို့မဟုတ် အခြေအနေပြောင်းလဲခြင်းကို ပြသော ပုဒ်" }, "冷": { meaningMy: "အေးသော" },
  "里": { meaningMy: "အတွင်း၊ ထဲတွင်" }, "零": { meaningMy: "သုည" }, "六": { meaningMy: "ခြောက်" }, "妈妈": { meaningMy: "အမေ၊ မိခင်" },
  "吗": { meaningMy: "ဟုတ်/မဟုတ် မေးခွန်းဖွဲ့ရာတွင် သုံးသော ပုဒ်" }, "买": { meaningMy: "ဝယ်သည်" }, "猫": { meaningMy: "ကြောင်", image: "/images/hsk/vocabulary/hsk1-mao-cat.png", imageAltMy: "ကြောင်နှင့် အေးဆေးစွာ မိတ်ဆက်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" },
  "没": { meaningMy: "မရှိ၊ မ…ခဲ့ဘူး" }, "没关系": { meaningMy: "ကိစ္စမရှိပါဘူး၊ ရပါတယ်" }, "米饭": { meaningMy: "ချက်ပြီးသော ထမင်း", image: "/images/hsk/vocabulary/hsk1-mifan-rice.png", imageAltMy: "ထမင်းဖြူပူပူတစ်ပန်းကန်ကို ပြသနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" },
  "明天": { meaningMy: "မနက်ဖြန်" }, "名字": { meaningMy: "အမည်၊ နာမည်" }, "哪": { meaningMy: "ဘယ်၊ မည်သည့်" }, "那": { meaningMy: "အဲဒါ၊ ထို" },
  "呢": { meaningMy: "ပြန်လည်မေးမြန်းခြင်း သို့မဟုတ် လုပ်ရပ်ဆက်လက်ဖြစ်နေခြင်းကို ပြသော ပုဒ်" }, "能": { meaningMy: "နိုင်သည်၊ ဖြစ်နိုင်သည်" },
  "你": { meaningMy: "သင်၊ မင်း" }, "年": { meaningMy: "နှစ်" }, "女儿": { meaningMy: "သမီး" }, "朋友": { meaningMy: "သူငယ်ချင်း၊ မိတ်ဆွေ" },
  "漂亮": { meaningMy: "လှပသော" }, "苹果": { meaningMy: "ပန်းသီး", image: "/images/hsk/vocabulary/hsk1-pingguo-apple.png", imageAltMy: "ပန်းသီးနီနှင့် ပန်းသီးတောင်းကို ပြသနေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "七": { meaningMy: "ခုနစ်" }, "钱": { meaningMy: "ငွေ" },
  "前面": { meaningMy: "ရှေ့ဘက်၊ အရှေ့တွင်" }, "请": { meaningMy: "ကျေးဇူးပြု၍၊ ဖိတ်ခေါ်သည်" }, "去": { meaningMy: "သွားသည်" },
  "热": { meaningMy: "ပူသော" }, "人": { meaningMy: "လူ" }, "认识": { meaningMy: "သိကျွမ်းသည်၊ မှတ်မိသည်" }, "日": { meaningMy: "ရက်၊ နေ" },
  "三": { meaningMy: "သုံး" }, "商店": { meaningMy: "ဆိုင်၊ အရောင်းဆိုင်" }, "上": { meaningMy: "အပေါ်၊ တက်သည်" }, "上午": { meaningMy: "နံနက်ပိုင်း" },
  "少": { meaningMy: "နည်းသော" }, "谁": { meaningMy: "ဘယ်သူ" }, "什么": { meaningMy: "ဘာ၊ ဘာအရာ" }, "十": { meaningMy: "တစ်ဆယ်" },
  "时候": { meaningMy: "အချိန်၊ အခါ" }, "是": { meaningMy: "ဖြစ်သည်၊ ဟုတ်သည်" }, "书": { meaningMy: "စာအုပ်" }, "水": { meaningMy: "ရေ" },
  "水果": { meaningMy: "သစ်သီး" }, "睡觉": { meaningMy: "အိပ်သည်" }, "说话": { meaningMy: "စကားပြောသည်" }, "四": { meaningMy: "လေး" },
  "岁": { meaningMy: "အသက်နှစ်ကို ရေတွက်သော ပုဒ်" }, "他": { meaningMy: "သူ (အမျိုးသား)" }, "她": { meaningMy: "သူ (အမျိုးသမီး)" },
  "太": { meaningMy: "လွန်လွန်းသော၊ အရမ်း" }, "天气": { meaningMy: "ရာသီဥတု" }, "听": { meaningMy: "နားထောင်သည်" }, "同学": { meaningMy: "အတန်းဖော်" },
  "喂": { meaningMy: "ဟယ်လို (ဖုန်းပြောရာတွင်)" }, "我": { meaningMy: "ကျွန်တော်၊ ကျွန်မ၊ ငါ" }, "我们": { meaningMy: "ကျွန်တော်တို့၊ ကျွန်မတို့" },
  "五": { meaningMy: "ငါး" }, "喜欢": { meaningMy: "ကြိုက်နှစ်သက်သည်" }, "下": { meaningMy: "အောက်၊ ဆင်းသည်" }, "下午": { meaningMy: "မွန်းလွဲပိုင်း" },
  "下雨": { meaningMy: "မိုးရွာသည်" }, "先生": { meaningMy: "ဦး၊ လူကြီးမင်း" }, "现在": { meaningMy: "ယခု၊ အခု" }, "想": { meaningMy: "စဉ်းစားသည်၊ လိုချင်သည်" },
  "小": { meaningMy: "သေးငယ်သော" }, "小姐": { meaningMy: "မိန်းကလေး၊ မစ္စ" }, "些": { meaningMy: "အချို့၊ အနည်းငယ်" }, "写": { meaningMy: "ရေးသည်" },
  "谢谢": { meaningMy: "ကျေးဇူးတင်သည်၊ ကျေးဇူးတင်ပါတယ်" }, "星期": { meaningMy: "သီတင်းပတ်၊ အပတ်" }, "学生": { meaningMy: "ကျောင်းသား၊ ကျောင်းသူ", image: "/images/hsk/vocabulary/hsk1-xuesheng-student.png", imageAltMy: "စာရေးစားပွဲတွင် စာအုပ်နှင့် မှတ်စုစာအုပ်ကို လေ့လာနေသော ကျောင်းသား", imageStatus: "generated" },
  "学习": { meaningMy: "လေ့လာသင်ယူသည်" }, "学校": { meaningMy: "ကျောင်း", image: "/images/hsk/vocabulary/hsk1-xuexiao-school.png", imageAltMy: "စာအုပ်များကို ကိုင်ဆောင်ပြီး ကျောင်းဝင်းရှေ့တွင် ရပ်နေသော BurmeseBridge လေ့လာရေးလမ်းညွှန်", imageStatus: "generated" }, "一": { meaningMy: "တစ်" }, "衣服": { meaningMy: "အဝတ်အစား" },
  "医生": { meaningMy: "ဆရာဝန်", image: "/images/hsk/vocabulary/hsk1-yisheng-doctor.png", imageAltMy: "ဆေးခန်းတွင် နားကြပ်ဖြင့် ပုံမှန်ကျန်းမာရေးစစ်ဆေးပေးနေသော ဆရာဝန်", imageStatus: "generated" }, "医院": { meaningMy: "ဆေးရုံ" }, "椅子": { meaningMy: "ကုလားထိုင်" }, "有": { meaningMy: "ရှိသည်၊ ပိုင်ဆိုင်သည်" },
  "月": { meaningMy: "လ၊ လပိုင်း" }, "在": { meaningMy: "တွင်ရှိသည်၊ နေရာ၌" }, "再见": { meaningMy: "ပြန်တွေ့မယ်၊ နှုတ်ဆက်ပါတယ်" },
  "怎么": { meaningMy: "ဘယ်လို၊ မည်သို့" }, "怎么样": { meaningMy: "ဘယ်လိုလဲ၊ အခြေအနေဘယ်လိုရှိလဲ" }, "这": { meaningMy: "ဒီ၊ ဤ" },
  "中国": { meaningMy: "တရုတ်နိုင်ငံ" }, "中午": { meaningMy: "မွန်းတည့်ချိန်" }, "住": { meaningMy: "နေထိုင်သည်" }, "桌子": { meaningMy: "စားပွဲ" },
  "字": { meaningMy: "စာလုံး၊ အက္ခရာ" }, "昨天": { meaningMy: "မနေ့က" }, "坐": { meaningMy: "ထိုင်သည်၊ စီးသည်" }, "做": { meaningMy: "လုပ်သည်၊ ပြုလုပ်သည်" }
};

export function getVocabularyEnrichment(level: number, hanzi: string) {
  return level === 1 ? hsk1VocabularyMy[hanzi] : undefined;
}
