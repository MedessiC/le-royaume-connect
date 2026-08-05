import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import TeachingCard from "@/components/TeachingCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { BookOpen, ArrowRight } from "lucide-react";
import { getTeachingPath } from "@/lib/teachingUrl";

type Profile = { id: string; full_name: string | null; has_gold_badge?: boolean };

type Teaching = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  country: string | null;
  author_id: string | null;
  author?: Profile | null;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
};

const getYoutubeEmbedUrl = (url: string) => {
  const patterns = [
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
    /([A-Za-z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
  return null;
};

const LatestTeachingsSection = () => {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    const loadTeachings = async () => {
      const { data: teachingsData } = await supabase
        .from("teachings")
        .select("id, slug, title, excerpt, cover_image_url, video_url, audio_url, country, author_id, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!teachingsData?.length) {
        setLoading(false);
        return;
      }

      const authorIds = Array.from(new Set(teachingsData.map((t) => t.author_id).filter(Boolean)));
      let profileMap: Record<string, Profile> = {};
      if (authorIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, has_gold_badge")
          .in("id", authorIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      setTeachings(teachingsData.map((t) => ({ ...t, author: t.author_id ? profileMap[t.author_id] : null })));
      setLoading(false);
    };

    loadTeachings();
  }, []);

  useEffect(() => {
    if (!carouselApi || teachings.length < 2) return;

    const interval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [carouselApi, teachings.length]);

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!teachings.length) return null;

  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <div className="section-eyebrow mx-auto mb-2" style={{ width: "fit-content" }}>Derniers contenus</div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            Enseignements récents
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
            Découvrez les derniers enseignements publiés par nos frères et sœurs du monde entier.
          </p>
        </div>

        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: teachings.length > 2, align: "start" }}
          className="mx-auto mb-8 w-full max-w-6xl px-10 sm:px-12"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {teachings.map((teaching) => (
              <CarouselItem key={teaching.id} className="pl-3 sm:pl-4 sm:basis-1/2 lg:basis-1/3">
                <TeachingCard
                  {...teaching}
                  getYoutubeEmbedUrl={getYoutubeEmbedUrl}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label="Enseignement précédent"
            className="border-gold/30 bg-background text-gold hover:bg-gold hover:text-slate-950"
          />
          <CarouselNext
            aria-label="Enseignement suivant"
            className="border-gold/30 bg-background text-gold hover:bg-gold hover:text-slate-950"
          />
        </Carousel>

        <div className="text-center">
          <Link to="/feed">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold">
              <BookOpen className="w-4 h-4" /> Voir tous les enseignements <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestTeachingsSection;
