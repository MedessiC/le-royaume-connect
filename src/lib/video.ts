export const getVideoEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  const youtubePatterns = [
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
    /([A-Za-z0-9_-]{11})$/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }

  if (url.includes("iframe.mediadelivery.net/embed/")) {
    return url;
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
