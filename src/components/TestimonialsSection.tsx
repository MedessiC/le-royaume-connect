// TestimonialsSection.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_avatar_url: string | null;
  content: string;
  rating: number;
  country: string | null;
  order_index: number;
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("order_index", { ascending: true })
        .limit(6);

      setTestimonials(data ?? []);
      setLoading(false);
    };

    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-section-alt">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl border border-border bg-card animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) return null;

  return (
    <section className="py-24 md:py-32 bg-section-alt relative overflow-hidden">
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-eyebrow mx-auto mb-3" style={{ width: "fit-content" }}>
            Paroles de Foi
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Témoignages
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Découvrez comment le Règne Millénaire impacte des vies et des communautés.
          </p>
        </div>

        {/* Mobile: horizontal scroll · Desktop: grid */}
        <div className="flex md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="group relative flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center card-elevated rounded-2xl p-7 pt-10 transition-all duration-300 hover:border-gold/40 hover:shadow-gold"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Quote mark */}
              <span
                aria-hidden
                className="absolute top-2 left-5 font-display text-6xl font-extrabold leading-none text-gold/15 select-none"
              >
                “
              </span>

              <blockquote className="font-body text-sm text-foreground/85 leading-relaxed mb-6 min-h-[80px]">
                {t.content}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                {t.author_avatar_url ? (
                  <img
                    src={t.author_avatar_url}
                    alt={t.author_name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-gold/35 ring-offset-2 ring-offset-card flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ring-1 ring-gold/25 ring-offset-2 ring-offset-card">
                    <span className="text-xs font-bold text-primary">
                      {t.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-foreground tracking-wide truncate">{t.author_name}</p>
                  <p className="text-[0.7rem] text-muted-foreground truncate">
                    {t.author_role || t.country || "Disciple du Règne"}
                  </p>
                </div>
                {/* Rating dots */}
                <div className="flex gap-1 flex-shrink-0" aria-label={`${t.rating} sur 5`}>
                  {[...Array(5)].map((_, k) => (
                    <span
                      key={k}
                      className={`w-1.5 h-1.5 rounded-full ${k < t.rating ? "bg-gold" : "bg-border"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;