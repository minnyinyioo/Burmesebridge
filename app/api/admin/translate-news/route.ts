import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

async function authorize(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) return { error: "Translation service is not configured.", status: 503 };

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return { error: "Authentication required.", status: 401 };

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await publicClient.auth.getUser(accessToken);
  if (error || !data.user) return { error: "Invalid or expired session.", status: 401 };

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", data.user.id).single();
  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    return { error: "Administrator or moderator access required.", status: 403 };
  }

  return { error: null, status: 200 };
}

/**
 * Admin News Translation API
 *
 * 使用 Azure Translator 生成 my / zh / en 三语草稿。
 *
 * 保护规则：
 * - Azure 正常：返回翻译
 * - Azure 失败：返回原文
 * - Key 缺失：返回原文
 * - 网络失败：返回原文
 * - 不影响登录 / 签到 / 语言切换 / Admin / Forum
 */
export async function POST(request: Request) {
  try {
    const authorization = await authorize(request);
    if (authorization.error) {
      return NextResponse.json({ success: false, message: authorization.error }, { status: authorization.status });
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const sourceLanguage = String(body.sourceLanguage || "auto");

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing title or content",
        },
        { status: 400 }
      );
    }

    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    if (!key || !region) {
      return fallbackResponse(
        sourceLanguage,
        title,
        content,
        "Azure config missing"
      );
    }

    async function translate(text: string, to: string) {
      try {
        const endpoint =
          `https://api.cognitive.microsofttranslator.com/translate` +
          `?api-version=3.0&to=${to}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key!,
            "Ocp-Apim-Subscription-Region": region!,
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify([{ text }]),
        });

        if (!response.ok) {
          console.log("Azure translate error:", await response.text());
          return text;
        }

        const data = await response.json();

        return data?.[0]?.translations?.[0]?.text || text;
      } catch (error) {
        console.log("Azure translate failed:", error);
        return text;
      }
    }

    const [titleMy, titleEn, contentMy, contentEn] = await Promise.all([
      translate(title, "my"),
      translate(title, "en"),
      translate(content, "my"),
      translate(content, "en"),
    ]);

    return NextResponse.json({
      success: true,
      provider: "azure",
      data: {
        sourceLanguage,

        title_my: titleMy,
        title_zh: title,
        title_en: titleEn,

        content_my: contentMy,
        content_zh: content,
        content_en: contentEn,
      },
    });
  } catch (error) {
    console.log("Translate route error:", error);

    return NextResponse.json({
      success: true,
      fallback: true,
      reason: "Translate route failed",
      data: {
        sourceLanguage: "auto",
        title_my: "",
        title_zh: "",
        title_en: "",
        content_my: "",
        content_zh: "",
        content_en: "",
      },
    });
  }
}

/**
 * Azure 不可用时返回原文，保证后台页面不坏。
 */
function fallbackResponse(
  sourceLanguage: string,
  title: string,
  content: string,
  reason: string
) {
  return NextResponse.json({
    success: true,
    fallback: true,
    reason,
    data: {
      sourceLanguage,

      title_my: title,
      title_zh: title,
      title_en: title,

      content_my: content,
      content_zh: content,
      content_en: content,
    },
  });
}
