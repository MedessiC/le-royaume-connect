import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CountrySelect from "@/components/CountrySelect";
import { Search, X } from "lucide-react";
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

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-10 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 rounded-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 rounded-full hover:bg-muted"
              aria-label="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 items-end">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="rounded-full w-full">
              <SelectValue placeholder={t("search.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-full w-full">
            <CountrySelect 
              value={country === "all" ? "" : country} 
              onChange={(v) => setCountry(v || "all")} 
              placeholder={t("search.country")}
            />
          </div>

          <Button 
            variant="hero" 
            className="w-full rounded-full h-10 sm:col-span-1 lg:col-span-1"
            onClick={() => { setSearch(search.trim()); }}
          >
            {t("search.searchButton")}
          </Button>
        </div>
      </div>

      {/* Active filters chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {categoryId !== "all" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-foreground">
            {t("search.category")}: {categories.find((c) => c.id === categoryId)?.name ?? "-"}
            <button className="ml-2 text-muted-foreground" onClick={() => setCategoryId("all")} aria-label={t("common.close")}>✕</button>
          </div>
        )}
        {country !== "all" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-foreground">
            {t("search.country")}: {country}
            <button className="ml-2 text-muted-foreground" onClick={() => setCountry("all")} aria-label={t("common.close")}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
