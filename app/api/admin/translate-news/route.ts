import { NextResponse } from "next/server";

/**
 * Admin News Translation API
 *
 * 作用：
 * - 后台发布信息时，把一种语言的标题和内容生成 my / zh / en 三语草稿
 *
 * 安全：
 * - OPENROUTER_API_KEY 只在服务端读取
 * - 前端不会接触 API Key
 *
 * 失败策略：
 * - 如果没有配置 API Key，返回原文 fallback，不影响现有发布功能
 */
export async function POST(request: Request) {
  try {
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model =
      process.env.OPENROUTER_MODEL || "google/gemini-2.5-pro";

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        fallback: true,
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

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://burmesebridge.eu.cc",
          "X-OpenRouter-Title": "BurmeseBridge",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a professional Chinese-Burmese-English localization editor for BurmeseBridge. Generate natural, platform-ready Burmese, Chinese, and English. Burmese must sound like real Myanmar users in Facebook/Telegram/community/job-learning context. Avoid textbook Burmese, awkward direct translation, Chinese-style Burmese, and unnecessary English mixing. Return JSON only.",
            },
            {
              role: "user",
              content: JSON.stringify({
                sourceLanguage,
                title,
                content,
                task:
                  "Translate and localize this content into Burmese(my), Chinese(zh), and English(en). Keep meaning accurate. Make Burmese natural and suitable for BurmeseBridge users.",
              }),
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "news_translation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title_my: { type: "string" },
                  title_zh: { type: "string" },
                  title_en: { type: "string" },
                  content_my: { type: "string" },
                  content_zh: { type: "string" },
                  content_en: { type: "string" }
                },
                required: [
                  "title_my",
                  "title_zh",
                  "title_en",
                  "content_my",
                  "content_zh",
                  "content_en"
                ],
                additionalProperties: false
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        fallback: true,
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

    const result = await response.json();
    const raw = result?.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json({
        success: true,
        fallback: true,
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

    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      data: {
        sourceLanguage,
        title_my: parsed.title_my || title,
        title_zh: parsed.title_zh || title,
        title_en: parsed.title_en || title,
        content_my: parsed.content_my || content,
        content_zh: parsed.content_zh || content,
        content_en: parsed.content_en || content,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Translate API error",
      },
      { status: 500 }
    );
  }
}
