const YOUTUBE_ID_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/i,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^#\s]*v=([A-Za-z0-9_-]{11})/i,
];

export const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;

  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const getVideoEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
  }

  const bunnyMatch = url.match(/(?:iframe\.mediadelivery\.net|player\.mediadelivery\.net)\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i);
  if (bunnyMatch) {
    return `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}`;
  }

  return null;
};

export const getBunnyVideoIds = (url: string | null | undefined): { libraryId: string; videoId: string } | null => {
  if (!url) return null;
  const match = url.match(/(?:iframe\.mediadelivery\.net|player\.mediadelivery\.net)\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i);
  if (!match) return null;
  return { libraryId: match[1], videoId: match[2] };
};

export const getBunnyThumbnailUrl = (libraryId: string, videoId: string): string => {
  const cdnHostname = import.meta.env.VITE_BUNNY_CDN_HOSTNAME as string | undefined;
  if (cdnHostname) {
    return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
  }
  return `https://thumb.mediadelivery.net/${libraryId}/${videoId}`;
};

export const isBunnyVideoUrl = (url: string | null | undefined): boolean =>
  Boolean(getBunnyVideoIds(url));

export const isPlayableVideoUrl = (url: string | null | undefined): boolean => {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  if (isEmbedVideoUrl(trimmed)) return true;
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(trimmed.split("?")[0]);
};

export type VideoSource = "youtube" | "bunny" | "native" | null;

export const getVideoSource = (url: string | null | undefined): VideoSource => {
  if (!url?.trim()) return null;
  if (getYouTubeVideoId(url)) return "youtube";
  if (getBunnyVideoIds(url)) return "bunny";
  if (isPlayableVideoUrl(url)) return "native";
  return null;
};

export const isEmbedVideoUrl = (url: string | null | undefined): boolean =>
  Boolean(url && getVideoEmbedUrl(url));

export const isNativeVideoUrl = (url: string | null | undefined): boolean =>
  Boolean(url && !getVideoEmbedUrl(url));

export const getVideoPosterUrl = (
  url: string | null | undefined,
  poster?: string | null,
): string | null => {
  if (poster) return poster;

  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  const bunny = getBunnyVideoIds(url);
  if (bunny) {
    return getBunnyThumbnailUrl(bunny.libraryId, bunny.videoId);
  }

  return null;
};

const getVideoMimeType = (url: string) => {
  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (extension) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
    case "ogv":
      return "video/ogg";
    case "mov":
      return "video/quicktime";
    default:
      return "video/mp4";
  }
};

export const getOgVideoUrl = (url: string) => getVideoEmbedUrl(url) || url;

export const getOgVideoType = (url: string) =>
  getVideoEmbedUrl(url) ? "text/html" : getVideoMimeType(url);

export const formatVideoTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
