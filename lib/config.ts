export const appConfig = {
  name: "BurmeseBridge",

  locales: ["my", "zh", "en"],

  defaultLocale: "my",

  domain: "https://burmesebridge.com",

  description: {
    my: "မြန်မာလူမျိုးများအတွက် တရုတ်ဘာသာ သင်ယူရေးနှင့် အချက်အလက် ပလက်ဖောင်း",
    zh: "面向缅甸用户的中文学习、资讯与社区平台",
    en: "Chinese learning, news and community platform for Myanmar users",
  },

  routes: {
    home: "",
    news: "news",
    jobs: "jobs",
    learn: "learn",
    forum: "forum",
    checkin: "checkin",
    admin: "admin",
    profile: "me",
  },

  pagination: {
    defaultLimit: 12,
    adminLimit: 50,
  },

  content: {
    categories: ["news", "jobs", "learn"],
    flags: ["pinned", "featured", "hot"],
  },

  defaultAvatar: "/default-avatar.png",

  ai: {
    translationProvider: "azure",
    fallbackEnabled: true,
  },

  membership: {
    enabled: false,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    currency: "USD",
  },
};
