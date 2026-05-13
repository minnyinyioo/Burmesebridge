export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content = {
    my: {
      title: "အလုပ်အကိုင်",
      subtitle: "မြန်မာလူမျိုးများအတွက် ဘာသာပြန်၊ စက်ရုံ၊ ဝန်ဆောင်မှုလုပ်ငန်း အလုပ်အကိုင်များ",
      jobs: [
        {
          title: "တရုတ်-မြန်မာ ဘာသာပြန်",
          text: "တရုတ်စာနှင့် မြန်မာစာ တတ်သူများအတွက် ဘာသာပြန်နှင့် ပရောဂျက်ညှိနှိုင်းအလုပ်။",
          meta: "ဘန်ကောက် · အချိန်ပြည့် · အတွေ့အကြုံလိုအပ်",
        },
        {
          title: "စက်ရုံ ညှိနှိုင်းရေးဝန်ထမ်း",
          text: "အလုပ်သမားများနှင့် မန်နေဂျာများအကြား ဆက်သွယ်ညှိနှိုင်းရန်။",
          meta: "ထိုင်းနိုင်ငံ · တရုတ်စာတတ်သူ ဦးစားပေး",
        },
        {
          title: "ဝန်ဆောင်မှုလုပ်ငန်း တရုတ်စာအကူ",
          text: "ဆိုင်၊ ရုံး၊ ဖောက်သည်ဝန်ဆောင်မှုတွင် တရုတ်စကားသုံးနိုင်သူ။",
          meta: "အချိန်ပိုင်း / အချိန်ပြည့်",
        },
      ],
    },

    zh: {
      title: "工作信息",
      subtitle: "面向缅甸人的翻译、工厂、服务业和相关工作信息",
      jobs: [
        {
          title: "中缅翻译",
          text: "适合会中文和缅语的人，可做现场翻译、项目协调。",
          meta: "曼谷 · 全职 · 需要经验",
        },
        {
          title: "工厂协调员",
          text: "负责中缅沟通、员工协调、资料翻译。",
          meta: "泰国 · 全职 · 会中文优先",
        },
        {
          title: "服务业中文助手",
          text: "适合会基础中文的缅甸人，负责客户沟通。",
          meta: "曼谷 · 兼职/全职",
        },
      ],
    },

    en: {
      title: "Jobs",
      subtitle: "Translation, factory, service and related job information for Burmese users",
      jobs: [
        {
          title: "Chinese-Burmese Translator",
          text: "For people who speak Chinese and Burmese. On-site translation and project coordination.",
          meta: "Bangkok · Full-time · Experience required",
        },
        {
          title: "Factory Coordinator",
          text: "Coordinate communication between Chinese managers and Burmese workers.",
          meta: "Thailand · Full-time · Chinese preferred",
        },
        {
          title: "Service Chinese Assistant",
          text: "Suitable for Burmese users with basic Chinese communication skills.",
          meta: "Bangkok · Part-time / Full-time",
        },
      ],
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

        <div style={{ display: "grid", gap: "20px" }}>
          {t.jobs.map((job, index) => (
            <article
              key={index}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "22px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <h2 style={{ fontSize: "30px", marginBottom: "14px" }}>
                {job.title}
              </h2>

              <p
                style={{
                  color: "#475569",
                  lineHeight: 1.9,
                  fontSize: "18px",
                }}
              >
                {job.text}
              </p>

              <small style={{ color: "#64748b" }}>{job.meta}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}