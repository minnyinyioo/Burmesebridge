import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export type LegalSection = { title: string; paragraphs: string[]; items?: string[] };

const EMAIL_PART = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const EXACT_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function contactLinks(text: string) {
  return text.split(EMAIL_PART).map((part, index) => EXACT_EMAIL.test(part)
    ? <a key={`${part}-${index}`} href={`mailto:${part}`}>{part}</a>
    : part);
}

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
      <Link href={`/${locale}`} className="legal-brand" aria-label="BurmeseBridge"><BrandLogo size={30} /></Link>
      <h1>{title}</h1>
      <p>{summary}</p>
      <time dateTime="2026-08-14">{label}: {updated}</time>
    </header>
    <div className="legal-content">
      {sections.map((section) => <section key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{contactLinks(paragraph)}</p>)}
        {section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{contactLinks(item)}</li>)}</ul> : null}
      </section>)}
    </div>
  </article>;
}
