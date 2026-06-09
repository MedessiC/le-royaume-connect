import { useEffect } from "react";
import { siteMetadata } from "@/lib/seo";

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
}

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
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  return element;
};

const setSchemaScript = (schema: object) => {
  const id = "seo-jsonld";
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
  author,
  publishedDate,
  modifiedDate,
  content,
  categoryName,
  country,
}: TeachingSEOProps) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const canonical = `${siteMetadata.siteUrl}${path}`;
    const fullTitle = `${title} | ${siteMetadata.siteName}`;
    const finalImage = image || `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`;
    const finalKeywords = [
      ...keywords,
      categoryName,
      country,
      "enseignement",
      "spirituel",
      "MILLENIUM",
    ].filter(Boolean);

    document.title = fullTitle;
    
    // Meta tags
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", finalKeywords.join(", "));
    setMetaTag("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMetaTag("name", "author", author?.name || "MILLENIUM");
    
    // Open Graph (Facebook, WhatsApp)
    setMetaTag("property", "og:locale", "fr_FR");
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "article");
    setMetaTag("property", "og:url", canonical);
    setMetaTag("property", "og:site_name", siteMetadata.siteName);
    setMetaTag("property", "og:image", finalImage);
    setMetaTag("property", "og:image:width", "1200");
    setMetaTag("property", "og:image:height", "630");
    setMetaTag("property", "og:image:type", "image/png");
    
    // Twitter/X
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", finalImage);
    setMetaTag("name", "twitter:creator", "@leregnemillenaire");
    
    // Article specific
    if (publishedDate) {
      setMetaTag("property", "article:published_time", publishedDate);
    }
    if (modifiedDate) {
      setMetaTag("property", "article:modified_time", modifiedDate);
    }
    if (author?.name) {
      setMetaTag("property", "article:author", author.name);
    }
    if (categoryName) {
      setMetaTag("property", "article:section", categoryName);
    }
    
    // Canonical
    setLinkTag("canonical", canonical);

    // JSON-LD Schema with Article type
    const authorSchema = author
      ? {
          "@type": "Person",
          name: author.name,
          url: `${siteMetadata.siteUrl}/profile/${author.id}`,
        }
      : {
          "@type": "Organization",
          name: siteMetadata.siteName,
          url: siteMetadata.siteUrl,
        };

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: title,
          description: description,
          image: finalImage,
          datePublished: publishedDate,
          dateModified: modifiedDate || publishedDate,
          author: authorSchema,
          publisher: {
            "@type": "Organization",
            name: siteMetadata.siteName,
            logo: {
              "@type": "ImageObject",
              url: `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`,
            },
          },
          url: canonical,
          inLanguage: "fr-FR",
          isPartOf: {
            "@type": "WebSite",
            url: siteMetadata.siteUrl,
            name: siteMetadata.siteName,
          },
          articleSection: categoryName || "Enseignement",
          keywords: finalKeywords,
          wordCount: content?.length ? Math.ceil(content.length / 4.7) : 0,
        },
        {
          "@type": "BreadcrumbList",
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
              item: `${siteMetadata.siteUrl}/teachings`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: canonical,
            },
          ],
        },
      ],
    };

    const script = setSchemaScript(schema);
    return () => {
      script.remove();
    };
  }, [title, description, path, image, keywords, author, publishedDate, modifiedDate, content, categoryName, country]);

  return null;
}
