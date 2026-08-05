import { useEffect } from "react";
import { siteMetadata, buildOrganizationSchema } from "@/lib/seo";

interface TeachingSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  author?: { name: string; id: string };
  publishedDate?: string;
  modifiedDate?: string;
  content?: string;
  categoryName?: string;
  country?: string;
  videoUrl?: string;
}

const getYoutubeEmbedUrl = (url: string) => {
  const patterns = [
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
    /([A-Za-z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
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

const getOgVideoUrl = (url: string) => {
  const embedUrl = getYoutubeEmbedUrl(url);
  return embedUrl || url;
};

const getOgVideoType = (url: string) => {
  return getYoutubeEmbedUrl(url) ? "text/html" : getVideoMimeType(url);
};

const setMetaTag = (attrName: string, attrValue: string, content: string): HTMLMetaElement => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
};

const setLinkTag = (rel: string, href: string): HTMLLinkElement => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute(rel, "rel");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  return element;
};

const setSchemaScript = (id: string, schema: object): HTMLScriptElement => {
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema, null, 2);
  return script;
};

export default function TeachingSEO({
  title,
  description,
  path,
  image,
  keywords = [],
  publishedDate,
  modifiedDate,
  content,
  categoryName,
  country,
  videoUrl,
}: TeachingSEOProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const canonical = `${siteMetadata.siteUrl}${path}`;
    const fullTitle = `${title} | ${siteMetadata.siteName}`;
    const finalImage = image || `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`;
    const wordCount = content
      ? Math.ceil(content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length)
      : 0;

    const finalKeywords = [
      ...keywords,
      categoryName,
      country,
      "ZOVIZO",
      "MILLENIUM",
      "Le Règne Millénaire",
      "enseignement biblique",
      "Banikoara",
      "Bénin",
    ].filter(Boolean) as string[];

    // ── Core ─────────────────────────────────────────────────────
    document.title = fullTitle;
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", finalKeywords.join(", "));
    setMetaTag("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMetaTag("name", "author", "Le Règne Millénaire — MILLENIUM");
    setMetaTag("name", "creator", "ZOVIZO");
    setMetaTag("name", "publisher", siteMetadata.siteName);

    // ── Open Graph ────────────────────────────────────────────────
    setMetaTag("property", "og:locale", "fr_FR");
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "article");
    setMetaTag("property", "og:url", canonical);
    setMetaTag("property", "og:site_name", siteMetadata.siteName);
    setMetaTag("property", "og:image", finalImage);
    setMetaTag("property", "og:image:width", "1200");
    setMetaTag("property", "og:image:height", "630");
    setMetaTag("property", "og:image:alt", title);

    if (videoUrl) {
      const ogVideoUrl = getOgVideoUrl(videoUrl);
      setMetaTag("property", "og:video", ogVideoUrl);
      setMetaTag("property", "og:video:secure_url", ogVideoUrl);
      setMetaTag("property", "og:video:type", getOgVideoType(videoUrl));
      setMetaTag("property", "og:video:width", "1280");
      setMetaTag("property", "og:video:height", "720");
    }

    // ── Twitter / X ───────────────────────────────────────────────
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", finalImage);
    setMetaTag("name", "twitter:creator", "@leregnemillenaire");
    setMetaTag("name", "twitter:site", "@leregnemillenaire");

    // ── Article specific ──────────────────────────────────────────
    if (publishedDate) setMetaTag("property", "article:published_time", publishedDate);
    if (modifiedDate) setMetaTag("property", "article:modified_time", modifiedDate);
    setMetaTag("property", "article:author", `${siteMetadata.siteUrl}/#organization`);
    if (categoryName) setMetaTag("property", "article:section", categoryName);

    // ── Canonical ─────────────────────────────────────────────────
    setLinkTag("canonical", canonical);

    // ── JSON-LD — Article + BreadcrumbList + Organization ─────────
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${canonical}#article`,
          headline: title,
          description: description,
          image: {
            "@type": "ImageObject",
            url: finalImage,
            width: 1200,
            height: 630,
          },
          datePublished: publishedDate,
          dateModified: modifiedDate || publishedDate,
          // Always authored by the official organization
          author: {
            "@type": "Organization",
            "@id": `${siteMetadata.siteUrl}/#organization`,
            name: "Le Règne Millénaire — MILLENIUM",
            url: siteMetadata.siteUrl,
          },
          publisher: {
            "@id": `${siteMetadata.siteUrl}/#organization`,
          },
          url: canonical,
          mainEntityOfPage: canonical,
          inLanguage: "fr-FR",
          isPartOf: {
            "@id": `${siteMetadata.siteUrl}/#website`,
          },
          articleSection: categoryName || "Enseignement",
          keywords: finalKeywords,
          wordCount,
          // Speakable — helps Google Assistant read the article
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: [".prose", "h1", "h2"],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: siteMetadata.siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Enseignements",
              item: `${siteMetadata.siteUrl}/feed`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: canonical,
            },
          ],
        },
        buildOrganizationSchema(),
      ],
    };

    const articleScript = setSchemaScript("seo-jsonld", schema);
    return () => {
      articleScript.remove();
    };
  }, [title, description, path, image, keywords, publishedDate, modifiedDate, content, categoryName, country, videoUrl]);

  return null;
}
