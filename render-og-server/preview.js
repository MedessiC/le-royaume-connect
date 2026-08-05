function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getVideoEmbedUrl(url) {
  if (!url) return null;
  const bunnyMatch = url.match(/(?:iframe\.mediadelivery\.net|player\.mediadelivery\.net)\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i);
  if (bunnyMatch) {
    return `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}`;
  }
  return url;
}

function buildSocialPreviewHtml({ title, description, targetUrl, imageUrl, videoUrl }) {
  const safeTitle = escapeHtml(title || "Enseignement – MILLENIUM");
  const safeDescription = escapeHtml(description || "Découvrez cet enseignement sur MILLENIUM.");
  const safeTargetUrl = escapeHtml(targetUrl);
  const safeImageUrl = escapeHtml(imageUrl || "");
  const normalizedVideoUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  if (normalizedVideoUrl) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${safeTargetUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:video" content="${escapeHtml(normalizedVideoUrl)}">
  <meta property="og:video:type" content="text/html">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  <meta name="twitter:card" content="player">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImageUrl}">
  <meta name="twitter:player" content="${escapeHtml(normalizedVideoUrl)}">
  <meta name="twitter:player:width" content="1280">
  <meta name="twitter:player:height" content="720">
  <style>body{margin:0;background:#020617;font-family:Arial,sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{width:min(100%, 900px);background:linear-gradient(135deg,#0f172a,#111827);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}.player{width:100%;aspect-ratio:16/9;background:#000}.player iframe{width:100%;height:100%;border:0}.meta{padding:20px 24px 24px}.title{font-size:1.2rem;font-weight:700;margin:0 0 8px}.desc{margin:0;color:#cbd5e1;font-size:.95rem;line-height:1.45}.link{display:inline-block;margin-top:14px;color:#fbbf24;text-decoration:none;font-weight:600}</style>
</head>
<body>
  <div class="card">
    <div class="player">
      <iframe src="${escapeHtml(normalizedVideoUrl)}" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </div>
    <div class="meta">
      <h1 class="title">${safeTitle}</h1>
      <p class="desc">${safeDescription}</p>
      <a class="link" href="${safeTargetUrl}">Ouvrir l’enseignement</a>
    </div>
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${safeTargetUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImageUrl}">
  <style>body{margin:0;background:#020617;font-family:Arial,sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{width:min(100%, 900px);background:linear-gradient(135deg,#0f172a,#111827);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}.cover{width:100%;aspect-ratio:16/9;object-fit:cover;background:#111827}.meta{padding:20px 24px 24px}.title{font-size:1.2rem;font-weight:700;margin:0 0 8px}.desc{margin:0;color:#cbd5e1;font-size:.95rem;line-height:1.45}.link{display:inline-block;margin-top:14px;color:#fbbf24;text-decoration:none;font-weight:600}</style>
</head>
<body>
  <div class="card">
    ${safeImageUrl ? `<img class="cover" src="${safeImageUrl}" alt="${safeTitle}">` : ""}
    <div class="meta">
      <h1 class="title">${safeTitle}</h1>
      <p class="desc">${safeDescription}</p>
      <a class="link" href="${safeTargetUrl}">Ouvrir l’enseignement</a>
    </div>
  </div>
</body>
</html>`;
}

export { buildSocialPreviewHtml, getVideoEmbedUrl };
