export const hskSkills = ["listening", "speaking", "reading", "writing"] as const;
export type HskSkill = (typeof hskSkills)[number];

export type HskCourse = {
  level: number;
  skill: HskSkill;
  lessons: number;
  focus: { zh: string; my: string; en: string };
  youtubeId: string;
};

const levelVideos: Record<number, string> = {
  1: "Hd9SadB3_zE",
  2: "cYVYMEpATKE",
  3: "M1zSfhQNQeE",
  4: "Kl0CkuYV4ag",
  5: "seeZFmyIMEM",
  6: "_G6jWN0PzDI",
};

const focuses: Record<HskSkill, { zh: string; my: string; en: string }> = {
  listening: { zh: "声调、关键词与真实语速听辨", my: "အသံနေအသံထား၊ အဓိကစကားလုံးနှင့် သဘာဝစကားပြောနှုန်း နားထောင်ခြင်း", en: "Tones, key words and natural-speed comprehension" },
  speaking: { zh: "标准普通话发音、跟读与情景表达", my: "စံ Mandarin အသံထွက်၊ လိုက်ဆိုခြင်းနှင့် အခြေအနေအလိုက် ပြောဆိုခြင်း", en: "Standard Mandarin pronunciation, shadowing and speaking" },
  reading: { zh: "分级词汇、语法与篇章理解", my: "အဆင့်လိုက် ဝေါဟာရ၊ သဒ္ဒါနှင့် ဖတ်ရှုနားလည်မှု", en: "Graded vocabulary, grammar and text comprehension" },
  writing: { zh: "笔顺、句型、短文与书面表达", my: "ရေးချက်အစဉ်၊ ဝါကျပုံစံနှင့် စာရေးသားဖော်ပြမှု", en: "Stroke order, sentence patterns and written production" },
};

export const hskCourses: HskCourse[] = Array.from({ length: 6 }, (_, index) => index + 1)
  .flatMap((level) => hskSkills.map((skill) => ({
    level,
    skill,
    lessons: level < 3 ? 12 : level < 5 ? 16 : 20,
    focus: focuses[skill],
    youtubeId: levelVideos[level],
  })));
