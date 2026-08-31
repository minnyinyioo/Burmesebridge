import { createClient } from "@supabase/supabase-js";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function validSupabaseUrl(value: string | undefined) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

// Keep public/static pages usable in local previews when environment values are
// placeholders. Production uses the configured project and key unchanged.
const supabaseUrl = validSupabaseUrl(configuredUrl) ? configuredUrl! : "https://zoxixufbhagfhltfmeef.supabase.co";
const supabaseAnonKey = configuredAnonKey && configuredAnonKey.length > 20 ? configuredAnonKey : "local-preview-anon-key";
const COOKIE_CHUNK = 3180;

function supabaseProjectRef(): string {
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || "zoxixufbhagfhltfmeef";
  } catch {
    return "zoxixufbhagfhltfmeef";
  }
}

const AUTH_COOKIE = `sb-${supabaseProjectRef()}-auth-token`;

function cookieSuffix(): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax; Max-Age=2592000${secure}`;
}

function clearAuthCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  const expired = `; Path=/; SameSite=Lax; Max-Age=0${secure}`;
  document.cookie = `${name}=${expired}`;
  for (let index = 0; index < 10; index += 1) {
    document.cookie = `${name}.${index}=${expired}`;
  }
}

function readAuthCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ");
  const exact = parts.find((part) => part.startsWith(`${name}=`));
  if (exact) {
    try {
      return decodeURIComponent(exact.slice(name.length + 1));
    } catch {
      return exact.slice(name.length + 1);
    }
  }
  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const prefix = `${name}.${index}=`;
    const chunk = parts.find((part) => part.startsWith(prefix));
    if (!chunk) break;
    chunks.push(chunk.slice(prefix.length));
  }
  if (!chunks.length) return null;
  const joined = chunks.join("");
  try {
    return decodeURIComponent(joined);
  } catch {
    return joined;
  }
}

function writeAuthCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  clearAuthCookie(name);
  const encoded = encodeURIComponent(value);
  const suffix = cookieSuffix();
  if (encoded.length <= COOKIE_CHUNK) {
    document.cookie = `${name}=${encoded}${suffix}`;
    return;
  }
  const total = Math.ceil(encoded.length / COOKIE_CHUNK);
  for (let index = 0; index < total; index += 1) {
    document.cookie = `${name}.${index}=${encoded.slice(index * COOKIE_CHUNK, (index + 1) * COOKIE_CHUNK)}${suffix}`;
  }
}

const cookieStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    let local: string | null = null;
    try {
      local = window.localStorage.getItem(key);
    } catch {
      local = null;
    }
    if (local) {
      if (key === AUTH_COOKIE && !readAuthCookie(key)) writeAuthCookie(key, local);
      return local;
    }
    return key === AUTH_COOKIE ? readAuthCookie(key) : null;
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore quota errors; cookie mirroring can still authenticate middleware.
    }
    if (key === AUTH_COOKIE) writeAuthCookie(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage access errors.
    }
    if (key === AUTH_COOKIE) clearAuthCookie(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: AUTH_COOKIE,
    storage: typeof window === "undefined" ? undefined : cookieStorage,
  },
});
