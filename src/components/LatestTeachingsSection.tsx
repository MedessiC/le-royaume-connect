import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import TeachingCard from "@/components/TeachingCard";
import { BookOpen } from "lucide-react";

type Profile = { id: string; full_name: string | null; has_gold_badge?: boolean };

type Teaching = {
  id: string;
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

const LatestTeachingsSection = () => {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeachings = async () => {
      const { data: teachingsData } = await supabase
        .from("teachings")
        .select("id, title, excerpt, cover_image_url, video_url, audio_url, country, author_id, created_at")
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

      const enriched = teachingsData.map((t) => ({
        ...t,
        author: t.author_id ? profileMap[t.author_id] : null,
      }));

      setTeachings(enriched);
      setLoading(false);
    };

    loadTeachings();
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

  if (!teachings.length) {
    return null;
  }

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Derniers contenus</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Enseignements récents
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Découvrez les derniers enseignements publiés par nos frères et sœurs du monde entier.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teachings.map((teaching) => (
            <TeachingCard
              key={teaching.id}
              {...teaching}
              getYoutubeEmbedUrl={(url: string) => {
                const patterns = [/(?:youtu\.be\/)([A-Za-z0-9_-]{11})/, /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/, /([A-Za-z0-9_-]{11})$/];
                for (const pattern of patterns) {
                  const match = url.match(pattern);
                  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
                }
                return null;
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <Link to="/feed">
            <Button variant="hero" size="lg">
              <BookOpen className="w-4 h-4" /> Voir tous les enseignements
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestTeachingsSection;
