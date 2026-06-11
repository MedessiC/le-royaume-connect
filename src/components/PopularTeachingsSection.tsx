import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

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
      // Query teachings with engagement metrics
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

      // Get engagement metrics for each teaching
      const withEngagement = await Promise.all(
        teachingsData.map(async (t) => {
          const [
            { count: likesCount },
            { count: commentsCount },
            { data: authorData },
          ] = await Promise.all([
            supabase.from("teaching_likes").select("id", { count: "exact" }).eq("teaching_id", t.id),
            supabase.from("teaching_comments").select("id", { count: "exact" }).eq("teaching_id", t.id),
            supabase.from("profiles").select("full_name").eq("id", t.author_id).maybeSingle(),
          ]);

          return {
            ...t,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            author_name: authorData?.full_name || "Auteur",
          };
        })
      );

      // Sort by engagement (likes + comments weighted)
      const sorted = withEngagement
        .sort((a, b) => {
          const aScore = a.likes_count * 2 + a.comments_count; // Likes weighted 2x
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 px-3 sm:px-0">
          <p className="text-gold-dark font-body text-xs sm:text-sm tracking-[0.2em] uppercase mb-2 sm:mb-3">Tendances</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Enseignements populaires
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2 sm:px-0">
            Les contenus les plus engageants de notre communauté
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-0">
          {teachings.map((teaching, index) => (
            <Link key={teaching.id} to={`/teaching/${teaching.id}`}>
              <div className="group h-full rounded-2xl overflow-hidden border border-border hover:border-gold/50 transition-all hover:shadow-royal bg-card">
                {teaching.cover_image_url && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={teaching.cover_image_url}
                      alt={teaching.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    <div className="absolute top-3 left-3 bg-gold text-foreground text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-gold transition-colors mb-2">
                    {teaching.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{teaching.author_name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>❤️ {teaching.likes_count}</span>
                    <span>💬 {teaching.comments_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/feed">
            <Button variant="secondary">
              <TrendingUp className="w-4 h-4" /> Découvrir plus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularTeachingsSection;
