import React, { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useTranslation, SupportedLocale } from "@/i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Language {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  countryCode: string;
}

const languages: Language[] = [
  { code: "fr", name: "Français", nativeName: "Français", countryCode: "FR" },
  { code: "en", name: "English", nativeName: "English", countryCode: "GB" },
  { code: "es", name: "Español", nativeName: "Español", countryCode: "ES" },
  { code: "zh", name: "Chinois", nativeName: "中文", countryCode: "CN" },
];

interface LanguageSelectorProps {
  variant?: "navbar" | "footer" | "standalone";
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "navbar",
  className = "",
}) => {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const handleSelectLanguage = (code: SupportedLocale) => {
    setLocale(code);
    setOpen(false);

    if (typeof window !== "undefined") {
      if (code === "fr") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
        if (selectElem && selectElem.value && selectElem.value !== "fr") {
          selectElem.value = "fr";
          selectElem.dispatchEvent(new Event("change"));
        }
        return;
      }

      const targetLang = code;
      const cookieValue = `/fr/${targetLang}`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieValue}; path=/`;

      const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (selectElem && selectElem.value !== targetLang) {
        selectElem.value = targetLang;
        selectElem.dispatchEvent(new Event("change"));
      }
    }
  };

  if (variant === "footer") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Globe className="w-4 h-4 text-gold/80" />
        <span className="text-xs text-muted-foreground font-medium mr-1">
          {t("common.changeLanguage") || "Langue :"}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {languages.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gold text-slate-950 shadow-gold"
                    : "bg-secondary text-foreground/80 hover:bg-gold/15 hover:text-gold"
                }`}
              >
                <ReactCountryFlag
                  svg
                  countryCode={lang.countryCode}
                  style={{ width: "13px", height: "13px", borderRadius: "2px" }}
                />
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 text-foreground/85 text-xs font-semibold tracking-wide transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold ${className}`}
          aria-label={t("common.changeLanguage") || "Changer la langue"}
        >
          <ReactCountryFlag
            svg
            countryCode={currentLang.countryCode}
            style={{ width: "15px", height: "15px", borderRadius: "2px" }}
          />
          <span className="uppercase tracking-wider font-bold">{currentLang.code}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-gold" : "text-muted-foreground"}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5 bg-popover/98 backdrop-blur-xl border border-border shadow-2xl rounded-2xl">
        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">
          {t("common.changeLanguage") || "Langues disponibles"}
        </div>
        <div className="space-y-0.5">
          {languages.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-gold/15 text-gold font-bold"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ReactCountryFlag
                    svg
                    countryCode={lang.countryCode}
                    style={{ width: "16px", height: "16px", borderRadius: "2px" }}
                  />
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
