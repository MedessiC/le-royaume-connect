import React from "react";

type Props = {
  country: string;
  className?: string;
};

const FlagIcon = ({ country, className = "" }: Props) => {
  if (country === "Bénin") {
    return (
      <svg
        className={className}
        width="20"
        height="14"
        viewBox="0 0 20 14"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Drapeau du Bénin"
      >
        <rect width="6.666" height="14" x="0" y="0" fill="#006A4E" />
        <rect width="13.333" height="7" x="6.666" y="0" fill="#FCD116" />
        <rect width="13.333" height="7" x="6.666" y="7" fill="#CE1126" />
      </svg>
    );
  }

  if (country === "Côte d'Ivoire") {
    return (
      <svg
        className={className}
        width="20"
        height="14"
        viewBox="0 0 20 14"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Drapeau de la Côte d'Ivoire"
      >
        <rect width="6.666" height="14" x="0" y="0" fill="#FF7F00" />
        <rect width="6.666" height="14" x="6.666" y="0" fill="#FFFFFF" />
        <rect width="6.666" height="14" x="13.333" y="0" fill="#009E60" />
      </svg>
    );
  }

  return null;
};

export default FlagIcon;
