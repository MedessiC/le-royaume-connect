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
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

  if (!testimonials.length) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.25em] uppercase mb-3">
            Paroles de foi
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Témoignages de nos frères et sœurs
          </h2>
          <span className="inline-block w-14 h-px bg-gold mt-6 mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Découvrez comment le Règne Millénaire impacte vies et communautés
          </p>
        </div>

        {/* Grille dès md, scroll horizontal snap sur mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center rounded-2xl border border-border bg-card p-7 pt-10 transition-all duration-500 hover:border-gold/40 hover:shadow-royal"
            >
              <span
                aria-hidden
                className="absolute top-3 left-5 font-display text-5xl leading-none text-gold/25 select-none"
              >
                "
              </span>

              <blockquote className="font-body text-foreground leading-relaxed mb-6 min-h-[88px] text-[0.95rem]">
                {testimonial.content}
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {testimonial.author_avatar_url ? (
                  <img
                    src={testimonial.author_avatar_url}
                    alt={testimonial.author_name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-gold/40 ring-offset-2 ring-offset-card"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/15 ring-1 ring-gold/40 ring-offset-2 ring-offset-card flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gold-dark">
                      {testimonial.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground tracking-wide truncate">
                    {testimonial.author_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {testimonial.author_role || testimonial.country || "Disciple du Règne"}
                  </p>
                </div>
                <div className="flex gap-0.5 flex-shrink-0" aria-label={`${testimonial.rating} sur 5`}>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < testimonial.rating ? "bg-gold" : "bg-border"
                      }`}
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