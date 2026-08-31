import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { hskCourses } from "@/lib/hskCourses";
import { hsk1VocabularyMy } from "@/lib/hskVocabularyMy";
import { hsk2VocabularyMy } from "@/lib/hskVocabularyMyHsk2";
import { hsk3VocabularyMy } from "@/lib/hskVocabularyMyHsk3";
import { hsk4VocabularyMy } from "@/lib/hskVocabularyMyHsk4";
import { hsk5VocabularyMy } from "@/lib/hskVocabularyMyHsk5";
import { hsk6VocabularyMy } from "@/lib/hskVocabularyMyHsk6";

export type SiteSearchType = "news" | "learn" | "forum" | "video" | "knowledge";
export type SiteSearchResult = { id: string; title: string; excerpt: string; type: SiteSearchType; href: string; score: number };
type Locale = "my" | "zh" | "en";
type Candidate = SiteSearchResult & { searchText: string };

const vocabularies = [hsk1VocabularyMy, hsk2VocabularyMy, hsk3VocabularyMy, hsk4VocabularyMy, hsk5VocabularyMy, hsk6VocabularyMy];

function normalize(value: unknown) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function plain(value: unknown) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isHttpUrl(value: string | undefined) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function localized(row: Record<string, unknown>, field: string, locale: Locale) {
  const order = locale === "zh" ? ["zh", "my", "en"] : locale === "en" ? ["en", "my", "zh"] : ["my", "zh", "en"];
  for (const language of order) {
    const value = plain(row[`${field}_${language}`]);
    if (value) return value;
  }
  return plain(row[field]);
}

function rank(candidate: Candidate, query: string, tokens: string[]) {
  const title = normalize(candidate.title);
  const haystack = normalize(candidate.searchText);
  if (!tokens.every((token) => haystack.includes(token))) return 0;
  let score = 20 + tokens.reduce((total, token) => total + (title.includes(token) ? 18 : 5), 0);
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 55;
  else if (title.includes(query)) score += 30;
  return score;
}

async function loadHskWords() {
  const levels = await Promise.all(Array.from({ length: 6 }, async (_, index) => {
    const level = index + 1;
    try {
      const csv = await readFile(path.join(process.cwd(), "public", "data", "hsk", `hsk${level}.csv`), "utf8");
      return csv.split(/\r?\n/).map((line) => {
        const first = line.indexOf(",");
        const second = line.indexOf(",", first + 1);
        return first > 0 && second > first ? { level, hanzi: line.slice(0, first).trim(), pinyin: line.slice(first + 1, second).trim(), meaning: line.slice(second + 1).trim() } : null;
      }).filter((item): item is { level: number; hanzi: string; pinyin: string; meaning: string } => Boolean(item?.hanzi));
    } catch { return []; }
  }));
  return levels.flat();
}

const pageEntries: Array<{ path: string; title: Record<Locale, string>; text: string }> = [
  { path: "", title: { my: "ပင်မစာမျက်နှာ", zh: "首页", en: "Home" }, text: "BurmeseBridge 汉语学习 中文学习 news community learning" },
  { path: "/news", title: { my: "သတင်း", zh: "新闻", en: "News" }, text: "news 新闻 သတင်း 资讯" },
  { path: "/forum", title: { my: "Community", zh: "社区", en: "Community" }, text: "community forum 社区 论坛 ဆွေးနွေးမှု" },
  { path: "/videos", title: { my: "လေ့လာရေးဗီဒီယို", zh: "学习视频", en: "Learning videos" }, text: "videos learning 学习视频 视频课程 ဗီဒီယို" },
  { path: "/videos/hsk", title: { my: "HSK ဘာသာစွမ်းရည်လေးမျိုး", zh: "HSK 1–6 四技能课程", en: "HSK 1–6 four-skill courses" }, text: "HSK listening speaking reading writing 听力 口语 阅读 书写 နားထောင် စကားပြော ဖတ် ရေး" },
  { path: "/videos/hsk/vocabulary", title: { my: "HSK ၁–၆ ဝေါဟာရကတ်များ", zh: "HSK 1–6 词汇卡片", en: "HSK 1–6 vocabulary cards" }, text: "HSK vocabulary words 词汇 生词 拼音 缅甸语 ဝေါဟာရ pinyin" },
  { path: "/hsk-test", title: { my: "HSK အဆင့်စစ်ဆေးမှု", zh: "HSK 中文水平测试", en: "HSK level test" }, text: "HSK test assessment 中文水平测试 测验 စစ်ဆေးမှု" },
  { path: "/knowledge", title: { my: "သင်တန်းများ", zh: "课程中心", en: "Course center" }, text: "courses knowledge learning 课程 知识付费 သင်တန်း" },
  { path: "/privacy", title: { my: "ကိုယ်ရေးအချက်အလက် မူဝါဒ", zh: "隐私政策", en: "Privacy policy" }, text: "privacy policy 隐私政策 ကိုယ်ရေးအချက်အလက်" },
  { path: "/terms", title: { my: "အသုံးပြုမှုစည်းမျဉ်း", zh: "服务条款", en: "Terms of service" }, text: "terms service 服务条款 使用条款 စည်းမျဉ်း" },
];

export async function searchSite(rawQuery: string, rawLocale: string): Promise<SiteSearchResult[]> {
  const locale: Locale = rawLocale === "zh" || rawLocale === "en" ? rawLocale : "my";
  const query = normalize(rawQuery).slice(0, 80);
  const tokens = query.split(" ").filter(Boolean);
  if (!query || !tokens.length) return [];

  const candidates: Candidate[] = pageEntries.map((page) => ({ id: `page-${page.path || "home"}`, title: page.title[locale], excerpt: page.text, type: "learn", href: `/${locale}${page.path}`, score: 0, searchText: `${Object.values(page.title).join(" ")} ${page.text}` }));

  for (const course of hskCourses) {
    const skillNames = { listening: "听力 listening နားထောင်ခြင်း", speaking: "口语 speaking စကားပြောခြင်း", reading: "阅读 reading ဖတ်ရှုခြင်း", writing: "书写 writing ရေးသားခြင်း" }[course.skill];
    const title = locale === "zh" ? `HSK ${course.level} ${course.skill === "listening" ? "听力" : course.skill === "speaking" ? "口语" : course.skill === "reading" ? "阅读" : "书写"}` : locale === "en" ? `HSK ${course.level} ${course.skill}` : `HSK ${course.level} ${course.focus.my}`;
    candidates.push({ id: `hsk-${course.level}-${course.skill}`, title, excerpt: course.focus[locale], type: "learn", href: `/${locale}/videos/hsk/${course.level}/${course.skill}`, score: 0, searchText: `${title} ${skillNames} ${course.focus.zh} ${course.focus.my} ${course.focus.en}` });
  }

  const words = await loadHskWords();
  for (const word of words) {
    const enrichment = vocabularies[word.level - 1][`${word.hanzi}|${word.pinyin}`] || vocabularies[word.level - 1][word.hanzi];
    const title = `${word.hanzi} · ${word.pinyin}`;
    const excerpt = locale === "my" && enrichment?.meaningMy ? enrichment.meaningMy : word.meaning;
    candidates.push({ id: `word-${word.level}-${word.hanzi}-${word.pinyin}`, title, excerpt, type: "learn", href: `/${locale}/videos/hsk/vocabulary?level=${word.level}&q=${encodeURIComponent(word.hanzi)}`, score: 0, searchText: `${word.hanzi} ${word.pinyin} ${word.meaning} ${enrichment?.meaningMy || ""} HSK ${word.level}` });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && isHttpUrl(url) && key && key.length > 20) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const databaseResults = await Promise.race([
      Promise.all([
        db.from("news").select("id,category,title_my,title_zh,title_en,content_my,content_zh,content_en").eq("status", "published").neq("category", "jobs").range(0, 999),
        db.from("posts").select("id,content").range(0, 999),
        db.from("videos").select("id,title,description").eq("status", "published").range(0, 999),
        db.from("knowledge_products").select("id,title_my,title_zh,title_en,description_my,description_zh,description_en,content_my,content_zh,content_en,level,skill,teacher_name").eq("status", "published").range(0, 999),
        db.from("knowledge_course_sections").select("id,product_id,title_my,title_zh,title_en,description_my,description_zh,description_en").eq("status", "published").range(0, 999),
        db.from("knowledge_lessons").select("id,product_id,title_my,title_zh,title_en").eq("status", "published").range(0, 999),
      ]),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
    ]);
    if (databaseResults) {
    const [news, posts, videos, products, sections, lessons] = databaseResults;
    for (const row of news.data || []) { const record = row as Record<string, unknown>; const title = localized(record, "title", locale); const excerpt = localized(record, "content", locale); candidates.push({ id: `content-${row.id}`, title, excerpt, type: row.category === "learn" ? "learn" : "news", href: `/${locale}/content/${row.id}`, score: 0, searchText: Object.values(record).join(" ") }); }
    for (const row of posts.data || []) { const content = plain(row.content); candidates.push({ id: `post-${row.id}`, title: content.slice(0, 72), excerpt: content, type: "forum", href: `/${locale}/forum#post-${row.id}`, score: 0, searchText: content }); }
    for (const row of videos.data || []) candidates.push({ id: `video-${row.id}`, title: plain(row.title), excerpt: plain(row.description), type: "video", href: `/${locale}/videos#video-${row.id}`, score: 0, searchText: `${row.title} ${row.description || ""}` });
    for (const row of products.data || []) { const record = row as Record<string, unknown>; candidates.push({ id: `course-${row.id}`, title: localized(record, "title", locale), excerpt: localized(record, "description", locale), type: "knowledge", href: `/${locale}/knowledge/${row.id}`, score: 0, searchText: Object.values(record).join(" ") }); }
    for (const row of sections.data || []) { const record = row as Record<string, unknown>; candidates.push({ id: `section-${row.id}`, title: localized(record, "title", locale), excerpt: localized(record, "description", locale), type: "knowledge", href: `/${locale}/knowledge/${row.product_id}`, score: 0, searchText: Object.values(record).join(" ") }); }
    for (const row of lessons.data || []) { const record = row as Record<string, unknown>; candidates.push({ id: `lesson-${row.id}`, title: localized(record, "title", locale), excerpt: locale === "zh" ? "课程课时" : locale === "en" ? "Course lesson" : "သင်ခန်းစာ", type: "knowledge", href: `/${locale}/knowledge/${row.product_id}?lesson=${row.id}`, score: 0, searchText: Object.values(record).join(" ") }); }
    }
  }

  return candidates.map((candidate) => ({ ...candidate, score: rank(candidate, query, tokens) })).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 100).map(({ searchText: _searchText, ...result }) => result);
}
