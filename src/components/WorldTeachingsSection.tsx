import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type CountryStats = {
  country: string | null;
  count: number;
};

const FLAG_MAP: Record<string, string> = {
  "Bénin": "🇧🇯",
  "Cameroun": "🇨🇲",
  "France": "🇫🇷",
  "États-Unis": "🇺🇸",
  "Canada": "🇨🇦",
  "Belgique": "🇧🇪",
  "Côte d'Ivoire": "🇨🇮",
  "Sénégal": "🇸🇳",
  "Togo": "🇹🇬",
  "Gabon": "🇬🇦",
  "Guinée": "🇬🇳",
  "Congo": "🇨🇬",
};

const WorldTeachingsSection = () => {
  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      const { data } = await supabase
        .from("teachings")
        .select("country", { count: "exact" })
        .eq("published", true)
        .not("country", "is", null);

      if (!data) { setLoading(false); return; }

      const countryMap = new Map<string, number>();
      data.forEach((item: any) => {
        if (item.country) countryMap.set(item.country, (countryMap.get(item.country) || 0) + 1);
      });

      const sorted = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setCountries(sorted);
      setLoading(false);
    };

    loadCountries();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-section-alt">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!countries.length) return null;

  return (
    <section className="py-24 md:py-32 bg-section-alt relative overflow-hidden">
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="section-eyebrow mx-auto mb-3" style={{ width: "fit-content" }}>
            Connecté Mondialement
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Enseignements du Monde
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Une communauté mondiale unie dans la foi, de Banikoara jusqu'aux quatre coins de la terre.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {countries.map((item, index) => (
            <Link
              key={index}
              to={`/feed?country=${encodeURIComponent(item.country || '')}`}
              className="group"
            >
              <div className="card-elevated rounded-2xl h-28 flex flex-col items-center justify-center p-4 text-center hover:border-gold/40 hover:shadow-gold transition-all duration-300">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {FLAG_MAP[item.country || ""] || "🌍"}
                </div>
                <h3 className="font-semibold text-xs text-foreground mb-0.5 group-hover:text-primary transition-colors truncate w-full text-center">
                  {item.country}
                </h3>
                <p className="text-[0.65rem] text-muted-foreground">
                  {item.count} enseignement{item.count > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/feed?sort=recent" className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            Voir tous les pays
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorldTeachingsSection;
