export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "BurmeseBridge",
      subtitle:
        "မြန်မာလူမျိုးများအတွက် တရုတ်ဘာသာ သင်ယူရေးနှင့် လေ့လာရေး ပလက်ဖောင်း",
      desc:
        "တရုတ်စာလေ့လာရန် · မေးခွန်းမေးရန် · အတွေ့အကြုံမျှဝေရန်",

      cards: [
        {
          title: "သင်ယူရန်",
          text:
            "တရုတ်စကားပြော၊ အလုပ်သုံးတရုတ်စာ၊ နေ့စဉ်အသုံးအနှုန်းများကို လေ့လာနိုင်သည်။",
        },
        {
          title: "အသိုင်းအဝိုင်း",
          text:
            "မေးခွန်းမေးနိုင်သည်၊ အတွေ့အကြုံမျှဝေနိုင်သည်၊ အချင်းချင်းကူညီနိုင်သည်။",
        },
        {
          title: "အလုပ်အကိုင်",
          text:
            "ဘာသာပြန်၊ စက်ရုံ၊ ဝန်ဆောင်မှုလုပ်ငန်း အလုပ်အကိုင်များကို ရှာဖွေနိုင်သည်။",
        },
        {
          title: "သတင်း",
          text:
            "ထိုင်း၊ မြန်မာ၊ အလုပ်သမား၊ ဗီဇာနှင့် စာရွက်စာတမ်းဆိုင်ရာ သတင်းများ။",
        },
      ],
    },

    zh: {
      title: "BurmeseBridge",
      subtitle: "缅甸人中文学习平台",
      desc: "学中文 · 问问题 · 分享经验",

      cards: [
        {
          title: "学习区",
          text: "中文口语、打工中文、生活中文、视频学习。",
        },
        {
          title: "社区论坛",
          text: "提问、交流、分享经验、互相帮助。",
        },
        {
          title: "工作信息",
          text: "翻译、工厂、服务业等相关信息。",
        },
        {
          title: "新闻资讯",
          text: "泰国、缅甸、劳工、证件相关资讯。",
        },
      ],
    },

    en: {
      title: "BurmeseBridge",
      subtitle: "Chinese Learning Platform for Burmese Users",
      desc: "Learn Chinese · Ask Questions · Share Experience",

      cards: [
        {
          title: "Learning",
          text:
            "Speaking Chinese, workplace Chinese, daily Chinese and videos.",
        },
        {
          title: "Forum",
          text:
            "Ask questions, communicate, share experience and help others.",
        },
        {
          title: "Jobs",
          text:
            "Translation, factory jobs and service industry opportunities.",
        },
        {
          title: "News",
          text:
            "Thailand, Myanmar, labor and visa related information.",
        },
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <main
      style={{
        padding: "32px 24px 72px",
        background: "#f8fafc",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2563eb,#10b981)",
            borderRadius: "28px",
            padding: "48px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              marginBottom: "20px",
            }}
          >
            {t.title}
          </h1>

          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.8,
              marginBottom: "16px",
            }}
          >
            {t.subtitle}
          </p>

          <p
            style={{
              opacity: 0.95,
              fontSize: "18px",
            }}
          >
            {t.desc}
          </p>
        </div>

        <div className="home-card-grid">
          {t.cards.map((card, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "32px",
                borderRadius: "22px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  marginBottom: "20px",
                }}
              >
                {card.title}
              </h2>

              <p
                style={{
                  color: "#475569",
                  lineHeight: 1.9,
                  fontSize: "18px",
                }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}