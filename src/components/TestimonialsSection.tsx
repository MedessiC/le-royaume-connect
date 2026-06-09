import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!testimonials.length) {
    return null;
  }

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Paroles de foi</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Témoignages de nos frères et sœurs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment le Règne Millénaire impacte vies et communautés
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-gold/50 transition-all hover:shadow-royal"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-gold text-gold"
                  />
                ))}
              </div>

              <blockquote className="text-foreground italic mb-6 min-h-[80px]">
                "{testimonial.content}"
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {testimonial.author_avatar_url ? (
                  <img
                    src={testimonial.author_avatar_url}
                    alt={testimonial.author_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gold">
                      {testimonial.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {testimonial.author_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.author_role || testimonial.country || "Disciple du Règne"}
                  </p>
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
