import Link from "next/link";

export type LegalSection = { title: string; paragraphs: string[]; items?: string[] };

export default function LegalPage({ locale, title, summary, updated, sections }: {
  locale: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}) {
  const back = locale === "zh" ? "返回首页" : locale === "my" ? "ပင်မစာမျက်နှာသို့" : "Back to home";
  const label = locale === "zh" ? "最后更新" : locale === "my" ? "နောက်ဆုံးပြင်ဆင်သည့်နေ့" : "Last updated";

  return <article className="legal-page">
    <header className="legal-hero">
      <Link href={`/${locale}`}>← {back}</Link>
      <p className="legal-eyebrow">BurmeseBridge</p>
      <h1>{title}</h1>
      <p>{summary}</p>
      <time dateTime="2026-08-14">{label}: {updated}</time>
    </header>
    <div className="legal-content">
      {sections.map((section) => <section key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </section>)}
    </div>
  </article>;
}
