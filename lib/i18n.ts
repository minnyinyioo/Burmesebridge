export const dictionary = {
  my: {
    nav: {
      home: "ပင်မစာမျက်နှာ",
      news: "သတင်း",
      jobs: "အလုပ်အကိုင်များ",
      learn: "လေ့လာရေး",
      forum: "ဆွေးနွေးခန်း",
      checkin: "နေ့စဉ်မှတ်တမ်း",
      admin: "စီမံခန့်ခွဲမှု",
    },
    common: {
      publish: "ထုတ်ဝေရန်",
      delete: "ဖျက်ရန်",
      save: "သိမ်းဆည်းရန်",
      cancel: "မလုပ်တော့ပါ",
      edit: "ပြင်ရန်",
      loading: "တင်နေပါသည်...",
      empty: "အချက်အလက် မရှိသေးပါ",
    },
    badge: {
      pinned: "ထိပ်ဆုံးပို့စ်",
      hot: "လူကြိုက်များ",
      featured: "အထူးရွေးချယ်ထားသော",
      verified: "အတည်ပြုပြီး",
      admin: "စီမံခန့်ခွဲသူ",
      teacher: "ဆရာ",
      member: "အဖွဲ့ဝင်",
    },
  },

  zh: {
    nav: {
      home: "首页",
      news: "新闻",
      jobs: "工作",
      learn: "学习",
      forum: "论坛",
      checkin: "签到",
      admin: "后台",
    },
    common: {
      publish: "发布",
      delete: "删除",
      save: "保存",
      cancel: "取消",
      edit: "编辑",
      loading: "加载中...",
      empty: "暂无内容",
    },
    badge: {
      pinned: "置顶",
      hot: "热门",
      featured: "推荐",
      verified: "已认证",
      admin: "管理员",
      teacher: "老师",
      member: "会员",
    },
  },

  en: {
    nav: {
      home: "Home",
      news: "News",
      jobs: "Jobs",
      learn: "Learn",
      forum: "Forum",
      checkin: "Check-in",
      admin: "Admin",
    },
    common: {
      publish: "Publish",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      loading: "Loading...",
      empty: "No content yet",
    },
    badge: {
      pinned: "Pinned",
      hot: "Hot",
      featured: "Featured",
      verified: "Verified",
      admin: "Admin",
      teacher: "Teacher",
      member: "Member",
    },
  },
};

export function getDictionary(locale: string) {
  if (locale === "my" || locale === "zh" || locale === "en") {
    return dictionary[locale];
  }

  return dictionary.my;
}
