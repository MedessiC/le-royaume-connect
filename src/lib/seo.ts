export const siteMetadata = {
  titleBase: "MILLENIUM — Mouvement Mondial",
  siteName: "MILLENIUM",
  description:
    "MILLENIUM est le mouvement religieux mondial né à Banikoara, Bénin. Une plateforme spirituelle où se rassemblent, prient et s'engagent des disciples autour de la vision de ZOVIZO et du Plan divin du Règne Millénaire.",
  siteUrl: "https://leregnemillenaire.com",
  author: "MILLENIUM",
  locale: "fr_FR",
  defaultImage: "/android-chrome-512x512.png",
  keywords: [
    "MILLENIUM",
    "Règne Millénaire",
    "Banikoara",
    "ZOVIZO",
    "Bénin",
    "foi chrétienne",
    "enseignement biblique",
    "communauté spirituelle",
    "Église Apostolique",
  ],
};

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
