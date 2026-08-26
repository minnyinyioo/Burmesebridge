const MAX_REPORT_BYTES = 16 * 1024;

type CspReport = {
  "blocked-uri"?: unknown;
  "document-uri"?: unknown;
  "effective-directive"?: unknown;
  "violated-directive"?: unknown;
  disposition?: unknown;
  status?: unknown;
};

function safeText(value: unknown, maxLength = 180): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/[\r\n\t]/g, " ").slice(0, maxLength);
}

function safeUrl(value: unknown): string | undefined {
  const text = safeText(value, 1000);
  if (!text || text === "inline" || text === "eval") return text;
  try {
    const url = new URL(text);
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return text.slice(0, 180);
  }
}

function normalizeReport(payload: unknown): CspReport | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const candidate =
    record["csp-report"] && typeof record["csp-report"] === "object"
      ? (record["csp-report"] as CspReport)
      : record.body && typeof record.body === "object"
        ? (record.body as CspReport)
        : (record as CspReport);

  return {
    "blocked-uri": safeUrl(candidate["blocked-uri"]),
    "document-uri": safeUrl(candidate["document-uri"]),
    "effective-directive": safeText(candidate["effective-directive"]),
    "violated-directive": safeText(candidate["violated-directive"]),
    disposition: safeText(candidate.disposition),
    status: typeof candidate.status === "number" ? candidate.status : undefined,
  };
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }

  try {
    const parsed = JSON.parse(body) as unknown;
    const reports = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of reports.slice(0, 10)) {
      const report = normalizeReport(item);
      if (report) console.warn("csp-report", JSON.stringify(report));
    }
  } catch {
    return new Response(null, { status: 400 });
  }

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "no-store" },
  });
}
