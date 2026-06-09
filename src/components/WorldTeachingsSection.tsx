import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";

type CountryStats = {
  country: string | null;
  count: number;
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

      if (!data) {
        setLoading(false);
        return;
      }

      // Group by country
      const countryMap = new Map<string, number>();
      data.forEach((item: any) => {
        if (item.country) {
          countryMap.set(item.country, (countryMap.get(item.country) || 0) + 1);
        }
      });

      // Convert to array and sort by count
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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!countries.length) {
    return null;
  }

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Connecté mondialement</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Enseignements du monde
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les enseignements partout dans le monde. Une communauté mondiale unie dans la foi.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {countries.map((item, index) => (
            <Link
              key={index}
              to={`/feed?country=${encodeURIComponent(item.country || '')}`}
              className="group"
            >
              <div className="relative rounded-2xl border border-border bg-background hover:border-gold/50 transition-all hover:shadow-royal h-24 flex flex-col items-center justify-center p-4 text-center">
                <div className="text-2xl mb-2">
                  {item.country === "Bénin" && "🇧🇯"}
                  {item.country === "Cameroun" && "🇨🇲"}
                  {item.country === "France" && "🇫🇷"}
                  {item.country === "États-Unis" && "🇺🇸"}
                  {item.country === "Canada" && "🇨🇦"}
                  {item.country === "Belgique" && "🇧🇪"}
                  {!["Bénin", "Cameroun", "France", "États-Unis", "Canada", "Belgique"].includes(item.country || "") && "🌍"}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-gold transition-colors">
                  {item.country}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.count} enseignement{item.count > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12 flex justify-center">
          <Link to="/feed?sort=recent" className="group flex items-center gap-2 text-foreground hover:text-gold transition-colors">
            <span className="font-semibold">Voir tous les pays</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorldTeachingsSection;
