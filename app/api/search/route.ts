import { NextRequest, NextResponse } from "next/server";
import { searchSite } from "@/lib/siteSearch";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim();
  const locale = request.nextUrl.searchParams.get("locale") || "my";
  if (!query) return NextResponse.json({ results: [] });
  if (query.length > 80) return NextResponse.json({ error: "Query is too long" }, { status: 400 });
  try {
    const results = await searchSite(query, locale);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Site search failed", error);
    return NextResponse.json({ error: "Search is temporarily unavailable" }, { status: 503 });
  }
}
