export default async function ForumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "အသိုင်းအဝိုင်း",
      subtitle: "မေးခွန်းမေးရန်၊ အတွေ့အကြုံမျှဝေရန်နှင့် အချင်းချင်းကူညီရန်",
      categoryTitle: "ဖိုရမ်အမျိုးအစားများ",
      posts: [
        {
          title: "တရုတ်စာကို ဘယ်လိုစလေ့လာရမလဲ?",
          text: "အစပြုသူများအတွက် နေ့စဉ်လေ့ကျင့်နည်း။",
          meta: "မှတ်ချက် 12 · ကြိုက်နှစ်သက်မှု 36",
        },
        {
          title: "စက်ရုံအလုပ်မှာ အသုံးများသော တရုတ်စကား",
          text: "အလုပ်ခွင်တွင် အများဆုံးသုံးသော စကားများ။",
          meta: "မှတ်ချက် 8 · ကြိုက်နှစ်သက်မှု 24",
        },
        {
          title: "ထိုင်းနိုင်ငံတွင် နေထိုင်ရာတွင် အသုံးဝင်သော စကားများ",
          text: "ဈေးဝယ်၊ သွားလာရေး၊ ဆေးရုံသွားရာတွင် အသုံးဝင်သည်။",
          meta: "မှတ်ချက် 5 · ကြိုက်နှစ်သက်မှု 18",
        },
      ],
      categories: ["တရုတ်စကားပြော", "အလုပ်သုံးတရုတ်စာ", "ဘဝအတွေ့အကြုံ", "အရင်းအမြစ်မျှဝေ"],
    },

    zh: {
      title: "社区论坛",
      subtitle: "提问、分享学习经验、交流中文和工作生活信息",
      categoryTitle: "论坛分类",
      posts: [
        {
          title: "零基础怎么开始学中文？",
          text: "适合初学者的学习路线和每日练习方法。",
          meta: "评论 12 · 点赞 36",
        },
        {
          title: "工厂上班常用中文句子",
          text: "老板、主管、同事之间常用表达。",
          meta: "评论 8 · 点赞 24",
        },
        {
          title: "在泰国生活常用中文",
          text: "购物、交通、租房、医院常用中文。",
          meta: "评论 5 · 点赞 18",
        },
      ],
      categories: ["中文口语", "打工中文", "生活交流", "资源分享"],
    },

    en: {
      title: "Community Forum",
      subtitle: "Ask questions, share experience, and help each other",
      categoryTitle: "Forum Categories",
      posts: [
        {
          title: "How should beginners start learning Chinese?",
          text: "A simple learning path and daily practice method.",
          meta: "12 comments · 36 likes",
        },
        {
          title: "Useful Chinese sentences for factory work",
          text: "Common phrases for supervisors, coworkers, and daily tasks.",
          meta: "8 comments · 24 likes",
        },
        {
          title: "Chinese for daily life in Thailand",
          text: "Shopping, transport, rent, hospital and daily communication.",
          meta: "5 comments · 18 likes",
        },
      ],
      categories: ["Speaking Chinese", "Workplace Chinese", "Daily Life", "Resources"],
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <main
      style={{
        padding: "48px 24px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "14px" }}>
          {t.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "20px",
            lineHeight: 1.8,
            marginBottom: "36px",
          }}
        >
          {t.subtitle}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(240px, 1fr)",
            gap: "24px",
          }}
        >
          <div style={{ display: "grid", gap: "18px" }}>
            {t.posts.map((post, index) => (
              <article
                key={index}
                style={{
                  background: "white",
                  padding: "28px",
                  borderRadius: "22px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                }}
              >
                <h2 style={{ fontSize: "28px", marginBottom: "14px" }}>
                  {post.title}
                </h2>

                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.9,
                    fontSize: "18px",
                  }}
                >
                  {post.text}
                </p>

                <small style={{ color: "#64748b" }}>{post.meta}</small>
              </article>
            ))}
          </div>

          <aside
            style={{
              background: "white",
              padding: "28px",
              borderRadius: "22px",
              border: "1px solid #e2e8f0",
              height: "fit-content",
              boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
            }}
          >
            <h2 style={{ fontSize: "28px", marginBottom: "18px" }}>
              {t.categoryTitle}
            </h2>

            <div style={{ display: "grid", gap: "12px" }}>
              {t.categories.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}