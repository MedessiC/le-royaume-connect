import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Story = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string;
  order_index: number;
};

const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      const { data } = await supabase
        .from("stories")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .limit(10);

      setStories(data ?? []);
      setLoading(false);
    };

    loadStories();
  }, []);

  useEffect(() => {
    if (!carouselApi || !stories.length) return;

    const interval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 6000); // Auto-scroll every 6 seconds

    return () => window.clearInterval(interval);
  }, [carouselApi, stories]);

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!stories.length) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Histoires inspirantes</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Récits et actualités
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {stories.map((story) => (
                <CarouselItem key={story.id} className="basis-full sm:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="rounded-2xl overflow-hidden border border-border bg-card hover:border-gold/50 transition-all hover:shadow-royal h-full flex flex-col group">
                    {/* Image */}
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-muted">
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                        {story.title}
                      </h3>
                      
                      {story.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {story.description}
                        </p>
                      )}

                      {story.link_url && (
                        <a href={story.link_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm" className="w-full">
                            {story.link_text}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {stories.length > 1 && (
              <>
                <CarouselPrevious className="text-foreground border-border hover:border-gold/50" />
                <CarouselNext className="text-foreground border-border hover:border-gold/50" />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
