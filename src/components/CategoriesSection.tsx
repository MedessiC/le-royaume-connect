import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").order("name").limit(6);
      setCategories(data ?? []);
      setLoading(false);
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="h-36 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="py-12 md:py-24 bg-card border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <div className="section-eyebrow mx-auto mb-2" style={{ width: "fit-content" }}>Explorer</div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">
            Catégories d'enseignements
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Trouvez les enseignements qui vous intéressent par thèmes.
          </p>
        </div>

        {/* 2 columns on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/feed?category=${category.id}`}
              className="group relative bg-background border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 hover:border-gold/50 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs sm:text-base font-bold text-foreground group-hover:text-gold transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </div>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Parcourir</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
