import { useEffect } from "react";
import { buildPageSeo, siteMetadata } from "@/lib/seo";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
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

export default function SEO({ title, description, path, image, keywords }: SEOProps) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const seo = buildPageSeo({ title, description, path, image, keywords });

    document.title = seo.fullTitle;
    setMetaTag("name", "description", seo.description);
    setMetaTag("name", "keywords", seo.keywords.join(", "));
    setMetaTag("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMetaTag("property", "og:locale", seo.locale);
    setMetaTag("property", "og:title", seo.fullTitle);
    setMetaTag("property", "og:description", seo.description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:url", seo.url);
    setMetaTag("property", "og:site_name", seo.siteName);
    setMetaTag("property", "og:image", seo.image);
    setMetaTag("property", "og:image:width", "512");
    setMetaTag("property", "og:image:height", "512");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", seo.fullTitle);
    setMetaTag("name", "twitter:description", seo.description);
    setMetaTag("name", "twitter:image", seo.image);
    setLinkTag("canonical", seo.canonical);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: seo.siteName,
          url: siteMetadata.siteUrl,
          description: siteMetadata.description,
          publisher: {
            "@type": "Organization",
            name: siteMetadata.siteName,
            url: siteMetadata.siteUrl,
          },
        },
        {
          "@type": "ReligiousOrganization",
          name: siteMetadata.siteName,
          url: siteMetadata.siteUrl,
          description: siteMetadata.description,
          logo: `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`,
          sameAs: [siteMetadata.siteUrl],
        },
        {
          "@type": "WebPage",
          url: seo.url,
          name: seo.fullTitle,
          description: seo.description,
          inLanguage: "fr-FR",
        },
      ],
    };

    const script = setSchemaScript(schema);
    return () => {
      script.remove();
    };
  }, [title, description, path, image, keywords]);

  return null;
}
