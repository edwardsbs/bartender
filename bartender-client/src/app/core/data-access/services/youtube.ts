export function getYouTubeEmbedUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;

  const url = raw.trim();
  if (!url) return null;

  try {
    const u = new URL(url);

    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    // Accept: youtube.com, m.youtube.com, youtu.be
    const isYoutube =
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'youtube-nocookie.com';

    if (!isYoutube) return null;

    let videoId: string | null = null;

    // youtu.be/<id>
    if (host === 'youtu.be') {
      videoId = u.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    // youtube.com/watch?v=<id>
    if (!videoId && u.pathname === '/watch') {
      videoId = u.searchParams.get('v');
    }

    // youtube.com/shorts/<id>
    if (!videoId && u.pathname.startsWith('/shorts/')) {
      videoId = u.pathname.split('/')[2] ?? null;
    }

    // youtube.com/embed/<id>
    if (!videoId && u.pathname.startsWith('/embed/')) {
      videoId = u.pathname.split('/')[2] ?? null;
    }

    if (!videoId) return null;

    // Clean common junk
    videoId = videoId.trim();
    if (!/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) return null;

    // Use nocookie to be slightly less creepy
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}
