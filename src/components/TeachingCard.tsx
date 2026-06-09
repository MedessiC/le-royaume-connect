import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, MapPin, Music, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import GoldBadge from "@/components/GoldBadge";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";

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
  const authorInitials = getInitials(author?.full_name);

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
      className="block group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Card Container */}
      <div className="space-y-0">
        {/* Header - Author Info */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-background/50">
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar src={author?.avatar_url} name={author?.full_name || "Auteur"} className="h-10 w-10 border-2 border-gold/20" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAuthorClick}
                  className="font-semibold text-sm text-foreground truncate hover:text-gold transition-colors flex items-center gap-1 text-left"
                  disabled={!author?.id}
                >
                  {is_admin ? "@leregnemillenaire" : authorName}
                  <GoldBadge hasGoldBadge={author?.has_gold_badge ?? false} className="w-3 h-3 flex-shrink-0" />
                </button>
                {is_admin && (
                  <Badge className="bg-blue-500 text-white text-xs py-0.5 px-2 rounded-full">Admin</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(created_at)}</p>
            </div>
          </div>
          <Zap className="w-4 h-4 text-gold/40 flex-shrink-0" />
        </div>

        {/* Title & Excerpt */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {category_name && (
              <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-full tracking-wider uppercase font-semibold">
                {category_name}
              </Badge>
            )}
            {country && (
              <Badge variant="outline" className="text-[10px] py-0.5 px-2 rounded-full tracking-wider uppercase gap-1 font-semibold">
                <MapPin className="w-3 h-3" />
                {country}
              </Badge>
            )}
          </div>

          <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2 leading-tight line-clamp-2 group-hover:text-gold transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>

        {/* Media Content */}
        {cover_image_url ? (
          <div className="relative overflow-hidden bg-muted aspect-video w-full group-hover:opacity-90 transition-opacity">
            <img
              src={cover_image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : video_url ? (
          <div className="relative bg-black/90 aspect-video w-full flex items-center justify-center">
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
              <div className="w-16 h-16 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <svg className="w-6 h-6 text-background fill-current ml-1" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : audio_url ? (
          <div className="relative bg-gradient-to-r from-purple-900/40 to-purple-700/30 px-4 py-6 sm:py-8 flex items-center justify-center gap-4 group-hover:from-purple-900/50 group-hover:to-purple-700/40 transition-colors">
            <Music className="w-8 h-8 text-purple-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-200 font-medium mb-2">Contenu audio</p>
              <audio controls src={audio_url} className="w-full h-6" />
            </div>
          </div>
        ) : null}

        {/* Engagement Footer */}
        <div className="border-t border-border bg-background/50 px-4 py-2.5 space-y-2.5">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {likes_count > 0 && (
                <span className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                    ♥
                  </span>
                  <span className="font-medium text-foreground">{likes_count}</span>
                </span>
              )}
              {comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{comments_count}</span>
                  <span>commentaire{comments_count === 1 ? "" : "s"}</span>
                </span>
              )}
            </div>
            <span className="text-gold font-semibold">Lire →</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleLike?.();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                is_liked
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className={`w-4 h-4 ${is_liked ? "fill-current" : ""}`} />
              <span>{is_liked ? "J'aime" : "Aimer"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Commenter</span>
            </button>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center gap-1"
            >
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
