import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Heart, MessageSquare } from "lucide-react";

type PopularTeaching = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  author_name: string | null;
  likes_count: number;
  comments_count: number;
};

const PopularTeachingsSection = () => {
  const [teachings, setTeachings] = useState<PopularTeaching[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularTeachings = async () => {
      const { data: teachingsData } = await supabase
        .from("teachings")
        .select("id, title, excerpt, cover_image_url, author_id")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!teachingsData?.length) {
        setLoading(false);
        return;
      }

      const withEngagement = await Promise.all(
        teachingsData.map(async (t) => {
          const [
            { count: likesCount },
            { count: commentsCount },
          ] = await Promise.all([
            supabase.from("teaching_likes").select("id", { count: "exact" }).eq("teaching_id", t.id),
            supabase.from("teaching_comments").select("id", { count: "exact" }).eq("teaching_id", t.id),
          ]);

          return {
            ...t,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            author_name: "@leregnemillenaire",
          };
        })
      );

      const sorted = withEngagement
        .sort((a, b) => {
          const aScore = a.likes_count * 2 + a.comments_count;
          const bScore = b.likes_count * 2 + b.comments_count;
          return bScore - aScore;
        })
        .slice(0, 4);

      setTeachings(sorted);
      setLoading(false);
    };

    loadPopularTeachings();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!teachings.length) {
    return null;
  }

  return (
    <section className="py-12 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <div className="section-eyebrow mx-auto mb-2" style={{ width: "fit-content" }}>
            Tendances
          </div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            Enseignements populaires
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Les contenus les plus engageants de notre communauté
          </p>
        </div>

        {/* Mobile: Horizontal snap scroll · Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {teachings.map((teaching, index) => (
            <Link
              key={teaching.id}
              to={`/teachings/${teaching.id}`}
              className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-auto snap-center group"
            >
              <div className="h-full rounded-2xl overflow-hidden card-elevated flex flex-col justify-between">
                {teaching.cover_image_url ? (
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-muted">
                    <img
                      src={teaching.cover_image_url}
                      alt={teaching.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                    <div className="absolute top-2.5 left-2.5 bg-gold text-slate-950 text-[10px] font-extrabold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                  </div>
                ) : (
                  <div className="relative h-28 bg-gradient-to-br from-royal/30 to-royal/80 p-3 flex items-start justify-between">
                    <div className="bg-gold text-slate-950 text-[10px] font-extrabold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                  </div>
                )}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-sm line-clamp-2 text-foreground group-hover:text-gold transition-colors mb-1">
                      {teaching.title}
                    </h3>
                    <p className="text-[0.7rem] text-gold font-semibold line-clamp-1 mb-3">@leregnemillenaire</p>
                  </div>
                  <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-destructive fill-destructive" /> {teaching.likes_count}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {teaching.comments_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Link to="/feed">
            <Button variant="outline" size="sm" className="rounded-xl font-semibold gap-2">
              <TrendingUp className="w-4 h-4" /> Découvrir plus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularTeachingsSection;
