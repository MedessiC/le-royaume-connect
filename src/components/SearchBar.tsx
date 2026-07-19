import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CountrySelect from "@/components/CountrySelect";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "@/i18n";

type Category = { id: string; name: string; slug?: string };

type Props = {
  search: string;
  setSearch: (s: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  categories: Category[];
  countries: string[];
};

const SearchBar: React.FC<Props> = ({
  search,
  setSearch,
  categoryId,
  setCategoryId,
  country,
  setCountry,
  categories,
  countries,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeFilterCount = (categoryId !== "all" ? 1 : 0) + (country !== "all" ? 1 : 0);

  return (
    <div className="mb-10">
      {/* Une seule ligne, y compris en mobile : l'input rétrécit, le bouton filtres reste fixe */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1.5 shadow-sm">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`rounded-full border-0 shadow-none bg-transparent focus-visible:ring-0 pl-10 ${search ? "pr-9" : "pr-3"}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={t("common.close")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="hero"
              size="icon"
              className="relative flex-shrink-0 rounded-full w-9 h-9"
              aria-label={t("search.filters")}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-background text-foreground text-[10px] font-bold ring-2 ring-card">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("search.category")}</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="rounded-full w-full">
                  <SelectValue placeholder={t("search.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("search.allCategories")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("search.country")}</label>
              <CountrySelect
                value={country === "all" ? "" : country}
                onChange={(v) => setCountry(v || "all")}
                placeholder={t("search.country")}
              />
            </div>

            <Button
              variant="hero"
              className="w-full rounded-full h-10"
              onClick={() => {
                setSearch(search.trim());
                setOpen(false);
              }}
            >
              {t("search.searchButton")}
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters chips */}
      {(categoryId !== "all" || country !== "all") && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {categoryId !== "all" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-foreground">
              {t("search.category")}: {categories.find((c) => c.id === categoryId)?.name ?? "-"}
              <button className="ml-2 text-muted-foreground" onClick={() => setCategoryId("all")} aria-label={t("common.close")}>
                ✕
              </button>
            </div>
          )}
          {country !== "all" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-foreground">
              {t("search.country")}: {country}
              <button className="ml-2 text-muted-foreground" onClick={() => setCountry("all")} aria-label={t("common.close")}>
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;