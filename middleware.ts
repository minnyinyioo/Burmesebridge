import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appConfig } from "@/lib/config";
import { canAccessAdmin } from "@/lib/permissions";

const LOCALES = new Set(appConfig.locales);

function projectRefFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const ref = new URL(url).hostname.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

function authCookieName(): string {
  const ref = projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || "zoxixufbhagfhltfmeef";
  return `sb-${ref}-auth-token`;
}

function readAuthCookieValue(request: NextRequest, name: string): string {
  const direct = request.cookies.get(name)?.value;
  if (direct) return direct;
  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const part = request.cookies.get(`${name}.${index}`)?.value;
    if (!part) break;
    chunks.push(part);
  }
  return chunks.join("");
}

function accessTokenFromCookie(raw: string): string {
  if (!raw) return "";
  let text = raw;
  try {
    text = decodeURIComponent(raw);
  } catch {
    text = raw;
  }
  if (text.startsWith("base64-")) {
    try {
      text = atob(text.slice("base64-".length));
    } catch {
      // Keep the decoded cookie text and try JSON next.
    }
  }
  try {
    const parsed = JSON.parse(text) as {
      access_token?: unknown;
      currentSession?: { access_token?: unknown };
    };
    if (typeof parsed.access_token === "string") return parsed.access_token;
    if (typeof parsed.currentSession?.access_token === "string") {
      return parsed.currentSession.access_token;
    }
  } catch {
    // Not JSON; a raw JWT is also accepted.
  }
  return text.split(".").length === 3 ? text : "";
}

function localeFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && LOCALES.has(first) ? first : appConfig.defaultLocale;
}

function isAdminPath(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  const parts = pathname.split("/").filter(Boolean);
  return parts.length >= 2 && LOCALES.has(parts[0]) && parts[1] === "admin";
}

function loginRedirect(request: NextRequest, locale: string, nextPath: string): NextResponse {
  const login = new URL(`/${locale}/login`, request.url);
  const safeNext = nextPath.startsWith(`/${locale}/`) ? nextPath : `/${locale}/admin`;
  login.searchParams.set("next", safeNext);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminPath(pathname)) return NextResponse.next();

  const locale = localeFromPath(pathname);
  const nextPath = pathname.startsWith("/admin") ? `/${locale}${pathname}` : pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return loginRedirect(request, locale, nextPath);

  const accessToken = accessTokenFromCookie(readAuthCookieValue(request, authCookieName()));
  if (!accessToken) return loginRedirect(request, locale, nextPath);

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return loginRedirect(request, locale, nextPath);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!canAccessAdmin(profile?.role)) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/my/admin", "/my/admin/:path*", "/zh/admin", "/zh/admin/:path*", "/en/admin", "/en/admin/:path*"],
};
