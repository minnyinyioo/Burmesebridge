import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const appDir = join(root, "app");
const origin = (process.env.SITE_URL || "https://burmesebridge.eu.cc").replace(/\/$/, "");
const locales = ["zh", "my", "en"];

async function findPages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findPages(path);
    return entry.name === "page.tsx" ? [path] : [];
  }));
  return nested.flat();
}

const pages = await findPages(appDir);
const routes = new Set();
for (const page of pages) {
  let route = `/${relative(appDir, page).split(sep).slice(0, -1).join("/")}`;
  if (/\[[^\]]+\]/.test(route.replace("[locale]", ""))) continue;
  if (route.includes("[locale]")) locales.forEach((locale) => routes.add(route.replace("[locale]", locale)));
  else routes.add(route === "/" ? "/" : route);
}

const results = await Promise.all([...routes].sort().map(async (route) => {
  const response = await fetch(`${origin}${route}`, { redirect: "manual" });
  const cloudflareChallenge = response.headers.get("cf-mitigated") === "challenge";
  return { route, status: response.status, cloudflareChallenge };
}));

const missing = results.filter(({ status, cloudflareChallenge }) => status === 404 && !cloudflareChallenge);
const blocked = results.filter(({ cloudflareChallenge }) => cloudflareChallenge);
const failed = results.filter(({ status, cloudflareChallenge }) => status >= 400 && status !== 404 && !cloudflareChallenge);

console.log(`Checked ${results.length} routes on ${origin}`);
console.log(`Application 404s: ${missing.length}; other failures: ${failed.length}; Cloudflare challenges: ${blocked.length}`);
for (const item of [...missing, ...failed, ...blocked]) console.log(`${item.status}\t${item.cloudflareChallenge ? "CLOUDFLARE_CHALLENGE" : "APPLICATION"}\t${item.route}`);
if (missing.length || failed.length) process.exitCode = 1;
