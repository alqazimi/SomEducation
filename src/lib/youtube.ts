const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function parseYoutubeVideoId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
      }

      const embedMatch = parsed.pathname.match(/^\/(embed|shorts|live)\/([\w-]{11})/);
      if (embedMatch) return embedMatch[2];
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(urlOrId: string): string | null {
  const videoId =
    YOUTUBE_ID_PATTERN.test(urlOrId) ? urlOrId : parseYoutubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}
