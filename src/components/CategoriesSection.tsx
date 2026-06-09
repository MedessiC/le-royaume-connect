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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-48 rounded-3xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Explorer</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Catégories d'enseignements
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Trouvez les enseignements qui vous intéressent par catégories.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/feed?category=${category.id}`}
              className="group relative bg-background border border-border rounded-2xl p-6 hover:border-gold/50 transition-all hover:shadow-royal"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">{category.name}</h3>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-all group-hover:translate-x-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Parcourir les enseignements</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
