export function getYouTubeId(value: string): string | null {
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be") return validId(url.pathname.slice(1));
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return validId(url.searchParams.get("v"));
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      return validId(match?.[1]);
    }
  } catch { return null; }
  return null;
}

function validId(value: string | null | undefined) {
  return value && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null;
}
