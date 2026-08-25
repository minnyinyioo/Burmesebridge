import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpenText, Search } from "lucide-react";
import VocabularySpeakButton from "@/components/hsk/VocabularySpeakButton";
import { getVocabularyEnrichment, hsk1VocabularyMy } from "@/lib/hskVocabularyMy";
import { hsk2VocabularyMy } from "@/lib/hskVocabularyMyHsk2";
import { hsk3VocabularyMy } from "@/lib/hskVocabularyMyHsk3";

type Entry = { hanzi: string; pinyin: string; meaning: string };
const PAGE_SIZE = 50;
async function loadWords(level: number): Promise<Entry[]> {
  const response = await fetch(
    `https://raw.githubusercontent.com/tnm/hsk/main/public/data/hsk${level}.csv`,
    { next: { revalidate: 86400 } },
  );
  if (!response.ok) throw new Error("Vocabulary source unavailable");
  return (await response.text())
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const first = line.indexOf(","),
        second = line.indexOf(",", first + 1);
      return {
        hanzi: line.slice(0, first).trim(),
        pinyin: line.slice(first + 1, second).trim(),
        meaning: line.slice(second + 1).trim(),
      };
    })
    .filter((item) => item.hanzi && item.pinyin);
}
export default async function HskVocabularyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ level?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const level = Math.min(6, Math.max(1, Number(query.level) || 1));
  const q = (query.q || "").trim();
  const page = Math.max(1, Number(query.page) || 1);
  const zh = locale === "zh",
    my = locale === "my";
  const levelTotals: Record<number, number> = { 1: 150, 2: 150, 3: 299, 4: 601, 5: 1300, 6: 2500 };
  const activeVocabulary = level === 1 ? hsk1VocabularyMy : level === 2 ? hsk2VocabularyMy : level === 3 ? hsk3VocabularyMy : {};
  const meaningCount = Object.values(activeVocabulary).filter(
    (item) => item.meaningMy.trim().length > 0,
  ).length;
  const visualCount = Object.values(activeVocabulary).filter(
    (item) => Boolean(item.image),
  ).length;
  const levelTotal = levelTotals[level];
  const meaningProgress = `${meaningCount}/${levelTotal}`;
  const visualProgress = `${visualCount}/${levelTotal}`;
  const copy = zh
    ? {
        eyebrow: "缅甸语图解词库",
        title: "HSK 1–6 词汇卡片",
        intro:
          "面向缅甸学习者的词汇课程：中文、拼音、专业缅甸语释义、普通话发音与原创图解。各级内容按翻译与审核进度逐步上线。",
        search: "搜索汉字、拼音、缅甸语或英文",
        submit: "搜索",
        words: "个词条",
        source: "数据来源与许可证",
        back: "返回四技能课程",
        empty: "没有匹配的词条",
        previous: "上一页",
        next: "下一页",
        speak: "播放发音",
        myMeaning: "缅甸语释义",
        generated: "原创图解 · BurmeseBridge",
        translationProgress: `HSK ${level}：缅甸语释义 ${meaningProgress} · 原创图解 ${visualProgress}`,
      }
    : my
      ? {
          eyebrow: "မြန်မာရှင်းလင်းချက်ပါ ရုပ်ပုံဝေါဟာရ",
          title: "HSK ၁–၆ ဝေါဟာရကတ်များ",
          intro:
            "မြန်မာကျောင်းသားများအတွက် တရုတ်စာ၊ Pinyin၊ စနစ်တကျပြုစုထားသော မြန်မာအဓိပ္ပာယ်၊ စံတရုတ်အသံထွက်နှင့် မူပိုင်ရုပ်ပုံများပါဝင်သည့် ဝေါဟာရသင်ခန်းစာဖြစ်သည်။",
          search: "တရုတ်စာလုံး၊ Pinyin၊ မြန်မာ သို့မဟုတ် English ရှာရန်",
          submit: "ရှာရန်",
          words: " ဝေါဟာရ",
          source: "ဒေတာရင်းမြစ်နှင့် လိုင်စင်",
          back: "ဘာသာစွမ်းရည်လေးမျိုးသို့",
          empty: "ကိုက်ညီသော ဝေါဟာရမရှိပါ",
          previous: "ရှေ့စာမျက်နှာ",
          next: "နောက်စာမျက်နှာ",
          speak: "အသံထွက်ဖွင့်ရန်",
          myMeaning: "မြန်မာအဓိပ္ပာယ်",
          generated: "မူပိုင်ရုပ်ပုံ · BurmeseBridge",
          translationProgress: `HSK ${level} — မြန်မာအဓိပ္ပာယ် ${meaningProgress} · မူပိုင်ရုပ်ပုံ ${visualProgress}`,
        }
      : {
          eyebrow: "Burmese-first visual vocabulary",
          title: "HSK 1–6 vocabulary cards",
          intro:
            "Vocabulary lessons for learners in Myanmar: characters, pinyin, professionally edited Burmese definitions, Mandarin audio and original visual explanations. Each level is released according to its translation and review progress.",
          search: "Search Chinese, pinyin, Burmese or English",
          submit: "Search",
          words: " entries",
          source: "Data source and license",
          back: "Back to four-skill courses",
          empty: "No matching entries",
          previous: "Previous",
          next: "Next",
          speak: "Play pronunciation",
          myMeaning: "Burmese definition",
          generated: "Original visual · BurmeseBridge",
          translationProgress: `HSK ${level}: Burmese definitions ${meaningProgress} · original visuals ${visualProgress}`,
        };
  let words: Entry[] = [];
  try {
    words = await loadWords(level);
  } catch {}
  const needle = q.toLocaleLowerCase();
  const filtered = needle
    ? words.filter((item) => {
        const enriched = getVocabularyEnrichment(level, item.hanzi, item.pinyin);
        return `${item.hanzi} ${item.pinyin} ${item.meaning} ${enriched?.meaningMy || ""}`
          .toLocaleLowerCase()
          .includes(needle);
      })
    : words;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );
  const href = (nextPage: number) =>
    `/${locale}/videos/hsk/vocabulary?level=${level}&q=${encodeURIComponent(q)}&page=${nextPage}`;
  return (
    <main className="hsk-vocabulary-page">
      <Link className="hsk-vocabulary-back" href={`/${locale}/videos/hsk`}>
        <ArrowLeft size={16} />
        {copy.back}
      </Link>
      <header>
        <span>
          <BookOpenText size={18} />
          {copy.eyebrow}
        </span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <b className="hsk-vocabulary-progress">{copy.translationProgress}</b>
      </header>
      <nav aria-label="HSK levels">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Link
            className={item === level ? "active" : ""}
            href={`/${locale}/videos/hsk/vocabulary?level=${item}`}
            key={item}
          >
            HSK {item}
          </Link>
        ))}
      </nav>
      <section className="hsk-vocabulary-toolbar">
        <div>
          <b>HSK {level}</b>
          <span>
            {filtered.length}
            {copy.words}
          </span>
        </div>
        <form>
          <input type="hidden" name="level" value={level} />
          <Search size={17} />
          <input name="q" defaultValue={q} placeholder={copy.search} />
          <button>{copy.submit}</button>
        </form>
      </section>
      {visible.length ? (
        <section className="hsk-vocabulary-grid">
          {visible.map((item, index) => {
            const enriched = getVocabularyEnrichment(level, item.hanzi, item.pinyin);
            return (
              <article
                className={enriched?.image ? "has-visual" : ""}
                key={`${item.hanzi}-${index}`}
              >
                {enriched?.image ? (
                  <figure data-watermark={`BurmeseBridge · HSK ${level}`}>
                    <Image
                      src={enriched.image}
                      alt={enriched.imageAltMy || item.hanzi}
                      width={600}
                      height={600}
                      sizes="(max-width: 600px) 100vw, 25vw"
                    />
                  </figure>
                ) : null}
                <div>
                  <strong>{item.hanzi}</strong>
                  <VocabularySpeakButton text={item.hanzi} label={copy.speak} />
                </div>
                <b>{item.pinyin}</b>
                {enriched ? (
                  <p className="hsk-vocabulary-my">
                    <small>{copy.myMeaning}</small>
                    {enriched.meaningMy}
                  </p>
                ) : null}
                <p className="hsk-vocabulary-en">{item.meaning}</p>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="hsk-vocabulary-empty">{copy.empty}</p>
      )}
      <footer className="hsk-vocabulary-pagination">
        <Link
          aria-disabled={current <= 1}
          href={current <= 1 ? "#" : href(current - 1)}
        >
          {copy.previous}
        </Link>
        <span>
          {current} / {pages}
        </span>
        <Link
          aria-disabled={current >= pages}
          href={current >= pages ? "#" : href(current + 1)}
        >
          {copy.next}
        </Link>
      </footer>
      <aside>
        <a
          href={`https://github.com/tnm/hsk/blob/main/public/data/hsk${level}.csv`}
          target="_blank"
          rel="noreferrer"
        >
          {copy.source}: HSK Cards
        </a>
        <span>
          MIT License · © Ted Nyman · Burmese translation and illustrations ©
          BurmeseBridge
        </span>
      </aside>
    </main>
  );
}
