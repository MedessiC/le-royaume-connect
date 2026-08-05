// ─── Site-wide SEO metadata ─────────────────────────────────────────────────
export const siteMetadata = {
  titleBase: "MILLENIUM — Mouvement Mondial",
  siteName: "MILLENIUM",
  shortName: "MILLENIUM",
  description:
    "MILLENIUM est le mouvement spirituel mondial fondé par ZOVIZO à Banikoara, Bénin. Une plateforme de foi, d'enseignement biblique et d'action qui rassemble des disciples du monde entier autour de la vision divine du Règne Millénaire.",
  siteUrl: "https://leregnemillenaire.com",
  author: "MILLENIUM",
  founder: "ZOVIZO",
  locale: "fr_FR",
  language: "fr",
  defaultImage: "/android-chrome-512x512.png",
  ogImage: "https://leregnemillenaire.com/android-chrome-512x512.png",

  // Geographic data — critical for local SEO
  geo: {
    region: "BJ-AL", // Bénin — Alibori
    placename: "Banikoara, Bénin",
    country: "BJ",
    latitude: "11.3",
    longitude: "2.4333",
  },

  // Social / sameAs — helps Google Knowledge Panel
  sameAs: [
    "https://leregnemillenaire.com",
    // Add your real social URLs below when available:
    // "https://www.facebook.com/leregnemillenaire",
    // "https://www.youtube.com/@leregnemillenaire",
    // "https://www.tiktok.com/@leregnemillenaire",
  ],

  keywords: [
    "ZOVIZO",
    "MILLENIUM",
    "Le Règne Millénaire",
    "leregnemillenaire",
    "Banikoara",
    "Bénin",
    "mouvement spirituel Bénin",
    "enseignement biblique",
    "foi chrétienne Afrique",
    "communauté spirituelle mondiale",
    "Église Apostolique Bénin",
    "prédication Bénin",
    "disciple de ZOVIZO",
    "prophète Bénin",
    "réveil spirituel Afrique",
    // Variantes de recherche courantes, notamment sans accents ou avec fautes simples.
    "milenium",
    "millénium",
    "regne millenaire",
    "règne millénaire",
    "enseignement spirituel",
    "enseignements religieux",
    "predication",
    "prédication",
    "eglise benin",
    "église bénin",
    "zoviso",
    "zovizo benin",
    "banikoira",
  ],
};

// ─── FAQ Schema — for Google Featured Snippets ───────────────────────────────
export const homepageFAQ = [
  {
    question: "Qui est ZOVIZO ?",
    answer:
      "ZOVIZO est le fondateur du mouvement MILLENIUM, né à Banikoara au Bénin. Il est à l'origine de la vision du Règne Millénaire qui rassemble des milliers de disciples à travers le monde.",
  },
  {
    question: "Qu'est-ce que le mouvement MILLENIUM ?",
    answer:
      "MILLENIUM est un mouvement spirituel mondial fondé à Banikoara, Bénin, par ZOVIZO. Il rassemble des disciples autour d'un enseignement biblique axé sur le Plan divin du Règne Millénaire, la foi et la communauté.",
  },
  {
    question: "Comment rejoindre la communauté MILLENIUM ?",
    answer:
      "Vous pouvez rejoindre la communauté MILLENIUM en vous inscrivant sur leregnemillenaire.com, accéder aux enseignements, participer au fil de discussion et vous connecter avec des membres du monde entier.",
  },
  {
    question: "Où se trouve le siège de MILLENIUM ?",
    answer:
      "Le mouvement MILLENIUM est né à Banikoara, dans le département de l'Alibori au Bénin, Afrique de l'Ouest. Il rayonne aujourd'hui dans plusieurs pays du monde.",
  },
  {
    question: "Comment accéder aux enseignements de MILLENIUM ?",
    answer:
      "Les enseignements de MILLENIUM sont disponibles gratuitement sur leregnemillenaire.com sous forme d'articles, d'audios et de vidéos publiés par @leregnemillenaire.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}

export const buildPageSeo = ({ title, description, path, image, keywords }: PageSeoProps) => {
  const canonical = `${siteMetadata.siteUrl}${path}`;
  const url = canonical;
  return {
    title,
    description,
    canonical,
    url,
    image: image || `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`,
    keywords: keywords ?? siteMetadata.keywords,
    fullTitle: `${title} | ${siteMetadata.siteName}`,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.locale,
  };
};

export const buildOrganizationSchema = () => ({
  "@type": "ReligiousOrganization",
  "@id": `${siteMetadata.siteUrl}/#organization`,
  name: siteMetadata.siteName,
  alternateName: ["Le Règne Millénaire", "MILLENIUM Bénin", "Mouvement ZOVIZO"],
  url: siteMetadata.siteUrl,
  description: siteMetadata.description,
  logo: {
    "@type": "ImageObject",
    url: `${siteMetadata.siteUrl}${siteMetadata.defaultImage}`,
    width: 512,
    height: 512,
  },
  founder: {
    "@type": "Person",
    name: "ZOVIZO",
    jobTitle: "Fondateur et Prophète",
    worksFor: { "@type": "Organization", name: siteMetadata.siteName },
  },
  foundingDate: "2000",
  foundingLocation: {
    "@type": "Place",
    name: "Banikoara",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Banikoara",
      addressRegion: "Alibori",
      addressCountry: "BJ",
    },
  },
  areaServed: {
    "@type": "Place",
    name: "Monde entier",
  },
  inLanguage: "fr-FR",
  sameAs: siteMetadata.sameAs,
});
