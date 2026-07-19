import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, MapPin, Music, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import GoldBadge from "@/components/GoldBadge";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import TTSButton from "@/components/TTSButton";

type Profile = { id: string; full_name: string | null; avatar_url?: string | null; has_gold_badge?: boolean };

type TeachingCardProps = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  country: string | null;
  author?: Profile | null;
  author_id: string | null;
  created_at: string;
  category_name?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_admin?: boolean;
  onToggleLike?: () => void;
  getYoutubeEmbedUrl?: (url: string) => string | null;
  collections?: Array<{ id: string; name: string }>;
  savedCollectionIds?: string[];
  onToggleCollection?: (collectionId: string) => void;
};

const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  if (diffDays < 365) {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
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

export const TeachingCard = ({
  id,
  title,
  excerpt,
  cover_image_url,
  video_url,
  audio_url,
  country,
  author,
  author_id,
  created_at,
  category_name,
  likes_count = 0,
  comments_count = 0,
  is_liked = false,
  is_admin = false,
  onToggleLike,
  collections = [],
  savedCollectionIds = [],
  onToggleCollection,
}: TeachingCardProps) => {
  const navigate = useNavigate();
  const authorName = author?.full_name ?? "Membre";

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (author?.id) {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/profile/${author.id}`);
    }
  };

  return (
    <Link
      to={`/teachings/${id}`}
      className="block group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-gold/30 hover:shadow-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="space-y-0">
        {/* Header — Author */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <UserAvatar
            src={author?.avatar_url}
            name={author?.full_name || "Auteur"}
            className="h-10 w-10 border-2 border-gold/20 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAuthorClick}
                className="font-semibold text-sm text-foreground truncate hover:text-gold transition-colors flex items-center gap-1 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                disabled={!author?.id}
              >
                {is_admin ? "@leregnemillenaire" : authorName}
                <GoldBadge hasGoldBadge={author?.has_gold_badge ?? false} className="w-3 h-3 flex-shrink-0" />
              </button>
              {is_admin && (
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-dark dark:text-gold-light">
                  Officiel
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(created_at)}</p>
          </div>
        </div>

        {/* Kicker + Title + Excerpt */}
        <div className="px-4 pt-4 pb-3">
          {(category_name || country) && (
            <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-dark dark:text-gold-light">
              {category_name && <span>{category_name}</span>}
              {category_name && country && <span className="text-border" aria-hidden="true">·</span>}
              {country && (
                <span className="inline-flex items-center gap-1 text-muted-foreground normal-case font-medium tracking-normal">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {country}
                </span>
              )}
            </div>
          )}

          <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2 leading-tight line-clamp-2 group-hover:text-gold transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>

        {/* Media */}
        {cover_image_url ? (
          <div className="relative overflow-hidden bg-muted aspect-video w-full">
            <img
              src={cover_image_url}
              alt={title}
              className="w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ) : video_url ? (
          <div className="relative bg-black aspect-video w-full flex items-center justify-center">
            {getYoutubeEmbedUrl(video_url) ? (
              <iframe
                className="w-full h-full pointer-events-none"
                src={getYoutubeEmbedUrl(video_url)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={video_url} className="w-full h-full object-cover" controls={false} />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shadow-gold">
                  <svg className="w-6 h-6 text-accent-foreground fill-current ml-1" viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : audio_url ? (
          <div className="relative bg-gradient-to-r from-royal-deep/90 to-royal/70 px-4 py-6 sm:py-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-gold-light" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary-foreground/90 font-medium mb-2">Contenu audio</p>
              <audio controls src={audio_url} className="w-full h-6" />
            </div>
          </div>
        ) : null}

        {/* Footer — Stats + Actions */}
        <div className="border-t border-border px-4 py-2.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {likes_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-destructive text-destructive" aria-hidden="true" />
                  <span className="font-medium text-foreground">{likes_count}</span>
                </span>
              )}
              {comments_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-medium text-foreground">{comments_count}</span>
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-gold-dark dark:text-gold-light font-semibold motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5">
              Lire <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              aria-pressed={is_liked}
              aria-label={is_liked ? "Retirer le j'aime" : "Aimer cet enseignement"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleLike?.();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                is_liked
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className={`w-4 h-4 ${is_liked ? "fill-current" : ""}`} aria-hidden="true" />
              <span>{is_liked ? "J'aime" : "Aimer"}</span>
            </button>
            <button
              type="button"
              aria-label="Commenter cet enseignement"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Commenter</span>
            </button>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-1"
            >
              <TTSButton text={(excerpt || title || "").concat(". Pour écouter l'intégralité, ouvrez la fiche.")} size="sm" />
              <SaveButton
                teachingId={id}
                teachingTitle={title}
                size="sm"
                isSaved={savedCollectionIds.length > 0}
                savedCollectionIds={savedCollectionIds}
                collections={collections}
                onToggleCollection={onToggleCollection}
              />
              <ShareButton
                title={title}
                description={excerpt || ""}
                url={`/teachings/${id}`}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TeachingCard;