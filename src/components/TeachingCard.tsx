import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, MapPin, Music, ArrowRight, Play, Pause } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import GoldBadge from "@/components/GoldBadge";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import TTSButton from "@/components/TTSButton";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { getTeachingPath } from "@/lib/teachingUrl";
import VideoPlayer from "@/components/VideoPlayer";
import TeachingCoverFallback from "@/components/TeachingCoverFallback";

type Profile = { id: string; full_name: string | null; avatar_url?: string | null; has_gold_badge?: boolean };

type TeachingCardProps = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  video_thumbnail_url?: string | null;
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
  collections?: Array<{ id: string; name: string }>;
  savedCollectionIds?: string[];
  onToggleCollection?: (collectionId: string) => void;
  viewMode?: "grid" | "list";
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

export const TeachingCard = ({
  id,
  slug,
  title,
  excerpt,
  cover_image_url,
  video_url,
  video_thumbnail_url,
  audio_url,
  country,
  created_at,
  category_name,
  likes_count = 0,
  comments_count = 0,
  is_liked = false,
  onToggleLike,
  collections = [],
  savedCollectionIds = [],
  onToggleCollection,
  viewMode = "grid",
}: TeachingCardProps) => {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const navigate = useNavigate();
  const officialName = "@leregnemillenaire";

  const isCurrentAudioPlaying = currentTrack?.id === id && isPlaying;

  const handlePlayAudio = (e: React.MouseEvent) => {
    if (!audio_url) return;
    e.preventDefault();
    e.stopPropagation();
    playTrack({
      id,
      slug,
      title,
      authorName: officialName,
      audioUrl: audio_url,
      coverUrl: cover_image_url,
      country,
    });
  };

  // ── Render media element ──
  const renderMedia = () => {
    if (video_url) {
      return (
        <VideoPlayer
          src={video_url}
          title={title}
          poster={video_thumbnail_url ?? cover_image_url ?? undefined}
          variant="preview"
        />
      );
    }

    if (cover_image_url) {
      return (
        <div className="relative overflow-hidden bg-muted aspect-video w-full h-full">
          <img
            src={cover_image_url}
            alt={title}
            className="w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {audio_url && (
            <button
              onClick={handlePlayAudio}
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-popover/90 backdrop-blur-md border border-gold/40 text-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:bg-gold hover:text-slate-950 transition-all"
            >
              {isCurrentAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              <span>{isCurrentAudioPlaying ? "En lecture" : "Écouter"}</span>
            </button>
          )}
        </div>
      );
    }

    if (audio_url) {
      return (
        <div className="relative bg-gradient-to-br from-slate-900 to-royal/90 px-4 py-6 flex flex-col justify-between h-full text-white min-h-[140px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/25 border border-gold/30 flex items-center justify-center text-gold">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">Audio</p>
              <p className="text-[9px] text-white/50">Écoute continue</p>
            </div>
          </div>

          <button
            onClick={handlePlayAudio}
            className="flex items-center justify-center gap-1.5 bg-gold text-slate-950 w-full py-2 rounded-xl text-xs font-bold shadow-gold hover:scale-102 transition-transform"
          >
            {isCurrentAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            <span>{isCurrentAudioPlaying ? "Pause" : "Écouter"}</span>
          </button>
        </div>
      );
    }

    return <TeachingCoverFallback title={title} className="aspect-video w-full h-full" />;
  };

  // ── Render standard grid card ──
  if (viewMode === "grid") {
    return (
      <Link
        to={getTeachingPath({ id, slug })}
        className="block group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="space-y-0">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <UserAvatar src="/android-chrome-512x512.png" name="Le Règne Millénaire" className="h-10 w-10 border-2 border-gold/40 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                  {officialName}
                  <GoldBadge hasGoldBadge={true} className="w-3.5 h-3.5 flex-shrink-0" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold">Officiel</span>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(created_at)}</p>
            </div>
          </div>

          {/* Kicker + Title + Excerpt */}
          <div className="px-4 pt-4 pb-3">
            {(category_name || country) && (
              <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold">
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
            {excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{excerpt}</p>}
          </div>

          {/* Media component */}
          {renderMedia()}

          {/* Footer stats + quick buttons */}
          <div className="border-t border-border px-4 py-2.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {likes_count > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-destructive text-destructive" />
                    <span className="font-medium text-foreground">{likes_count}</span>
                  </span>
                )}
                {comments_count > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">{comments_count}</span>
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-gold font-semibold group-hover:translate-x-0.5 transition-transform">
                Lire <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                aria-pressed={is_liked}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLike?.();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  is_liked ? "bg-destructive/10 text-destructive hover:bg-destructive/15" : "text-muted-foreground hover:bg-muted"
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
                  navigate(`${getTeachingPath({ id, slug })}#comments`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Commenter</span>
              </button>
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center gap-1">
                <TTSButton text={(excerpt || title || "").concat(". Ouvrez l'enseignement pour écouter la suite.")} size="sm" />
                <SaveButton
                  teachingId={id}
                  teachingTitle={title}
                  size="sm"
                  isSaved={savedCollectionIds.length > 0}
                  savedCollectionIds={savedCollectionIds}
                  collections={collections}
                  onToggleCollection={onToggleCollection}
                />
                <ShareButton title={title} description={excerpt || ""} url={getTeachingPath({ id, slug })} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Render Premium List Row Card ──
  return (
    <Link
      to={getTeachingPath({ id, slug })}
      className="block group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="flex flex-col md:flex-row gap-0">
        {/* Media Side (Left) */}
        {(cover_image_url || video_url || audio_url) && (
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0 relative overflow-hidden bg-muted border-b md:border-b-0 md:border-r border-border/60">
            {renderMedia()}
          </div>
        )}

        {/* Content Side (Right) */}
        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div>
            {/* Header / Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <UserAvatar src="/android-chrome-512x512.png" name="Le Règne Millénaire" className="h-6 w-6 border border-gold/40 flex-shrink-0" />
                <span className="font-semibold text-xs text-foreground flex items-center gap-1">
                  {officialName}
                  <GoldBadge hasGoldBadge={true} className="w-3 h-3 flex-shrink-0" />
                </span>
                <span className="text-[9px] font-bold tracking-wider text-gold uppercase bg-gold/10 px-1.5 py-0.5 rounded">Officiel</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(created_at)}</span>
            </div>

            {/* Title / Excerpt */}
            <div className="space-y-1.5">
              {(category_name || country) && (
                <div className="flex items-center gap-2 text-[9px] font-semibold tracking-wider uppercase text-gold">
                  {category_name && <span>{category_name}</span>}
                  {category_name && country && <span className="text-border">·</span>}
                  {country && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground normal-case font-medium">
                      <MapPin className="w-3 h-3" />
                      {country}
                    </span>
                  )}
                </div>
              )}
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-gold transition-colors">
                {title}
              </h3>
              {excerpt && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">{excerpt}</p>}
            </div>
          </div>

          {/* Footer section (Stats & quick actions) */}
          <div className="pt-4 mt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-pressed={is_liked}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLike?.();
                }}
                className={`flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-full transition-colors ${
                  is_liked ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${is_liked ? "fill-current" : ""}`} />
                <span>{likes_count > 0 ? likes_count : "Aimer"}</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{comments_count}</span>
              </div>
            </div>

            {/* Utility buttons */}
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center gap-1.5">
              <TTSButton text={(excerpt || title || "").concat(". Ouvrez la fiche pour l'écouter.")} size="sm" />
              <SaveButton
                teachingId={id}
                teachingTitle={title}
                size="sm"
                isSaved={savedCollectionIds.length > 0}
                savedCollectionIds={savedCollectionIds}
                collections={collections}
                onToggleCollection={onToggleCollection}
              />
              <ShareButton title={title} description={excerpt || ""} url={getTeachingPath({ id, slug })} size="sm" />
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-gold hover:underline pl-2 border-l border-border/60">
                Ouvrir <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TeachingCard;