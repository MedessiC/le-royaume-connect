import { useEffect } from "react";
import { buildPageSeo, buildOrganizationSchema, siteMetadata, homepageFAQ } from "@/lib/seo";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  /** Set to true only on the homepage to inject FAQ schema */
  withFAQ?: boolean;
  /** Article-specific type */
  type?: "website" | "article";
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

const setLinkTag = (rel: string, href: string, extra?: Record<string, string>): HTMLLinkElement => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (extra) Object.entries(extra).forEach(([k, v]) => element!.setAttribute(k, v));
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

export default function SEO({ title, description, path, image, keywords, withFAQ = false, type = "website" }: SEOProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const seo = buildPageSeo({ title, description, path, image, keywords });

    // ── Core meta ──────────────────────────────────────────────────
    document.title = seo.fullTitle;
    setMetaTag("name", "description", seo.description);
    setMetaTag("name", "keywords", seo.keywords.join(", "));
    setMetaTag("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMetaTag("name", "author", siteMetadata.siteName);
    setMetaTag("name", "creator", siteMetadata.founder);
    setMetaTag("name", "publisher", siteMetadata.siteName);

    // ── Geo ────────────────────────────────────────────────────────
    setMetaTag("name", "geo.region", siteMetadata.geo.region);
    setMetaTag("name", "geo.placename", siteMetadata.geo.placename);
    setMetaTag("name", "geo.position", `${siteMetadata.geo.latitude};${siteMetadata.geo.longitude}`);
    setMetaTag("name", "ICBM", `${siteMetadata.geo.latitude}, ${siteMetadata.geo.longitude}`);

    // ── Open Graph ─────────────────────────────────────────────────
    setMetaTag("property", "og:locale", seo.locale);
    setMetaTag("property", "og:title", seo.fullTitle);
    setMetaTag("property", "og:description", seo.description);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:url", seo.url);
    setMetaTag("property", "og:site_name", seo.siteName);
    setMetaTag("property", "og:image", seo.image);
    setMetaTag("property", "og:image:width", "512");
    setMetaTag("property", "og:image:height", "512");
    setMetaTag("property", "og:image:alt", `Logo ${siteMetadata.siteName}`);

    // ── Twitter / X ────────────────────────────────────────────────
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", seo.fullTitle);
    setMetaTag("name", "twitter:description", seo.description);
    setMetaTag("name", "twitter:image", seo.image);
    setMetaTag("name", "twitter:creator", "@leregnemillenaire");
    setMetaTag("name", "twitter:site", "@leregnemillenaire");

    // ── Canonical ──────────────────────────────────────────────────
    setLinkTag("canonical", seo.canonical);

    // ── JSON-LD — Organisation + WebSite ──────────────────────────
    const orgSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteMetadata.siteUrl}/#website`,
          name: siteMetadata.siteName,
          alternateName: "Le Règne Millénaire",
          url: siteMetadata.siteUrl,
          description: siteMetadata.description,
          inLanguage: "fr-FR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteMetadata.siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@id": `${siteMetadata.siteUrl}/#organization`,
          },
        },
        buildOrganizationSchema(),
        {
          "@type": "Person",
          "@id": `${siteMetadata.siteUrl}/#zovizo`,
          name: "ZOVIZO",
          jobTitle: "Fondateur & Prophète",
          description: "ZOVIZO est le fondateur du mouvement spirituel MILLENIUM né à Banikoara, Bénin.",
          worksFor: {
            "@id": `${siteMetadata.siteUrl}/#organization`,
          },
          nationality: { "@type": "Country", name: "Bénin" },
          knowsAbout: ["Théologie", "Enseignement biblique", "Prophétie", "Mouvement spirituel", "Leadership religieux"],
        },
        {
          "@type": "WebPage",
          "@id": `${seo.url}#webpage`,
          url: seo.url,
          name: seo.fullTitle,
          description: seo.description,
          inLanguage: "fr-FR",
          isPartOf: { "@id": `${siteMetadata.siteUrl}/#website` },
          about: { "@id": `${siteMetadata.siteUrl}/#organization` },
        },
      ],
    };

    const orgScript = setSchemaScript("seo-jsonld", orgSchema);

    // ── FAQ Schema (homepage only) ─────────────────────────────────
    let faqScript: HTMLScriptElement | null = null;
    if (withFAQ) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: homepageFAQ.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };
      faqScript = setSchemaScript("seo-faq-jsonld", faqSchema);
    }

    return () => {
      orgScript.remove();
      faqScript?.remove();
    };
  }, [title, description, path, image, keywords, withFAQ, type]);

  return null;
}
