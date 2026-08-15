export function proxiedImageUrl(url?: string | null) {
  if (!url) return null;
  const proxy = import.meta.env.VITE_OG_PROXY_URL;
  if (!proxy) return url;
  const base = proxy.replace(/\/$/, "");
  try {
    return `${base}/proxy?url=${encodeURIComponent(url)}`;
  } catch (e) {
    return url;
  }
}

export default proxiedImageUrl;
