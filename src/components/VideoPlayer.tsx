import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Video, Volume2, VolumeX } from "lucide-react";
import {
  formatVideoTime,
  getVideoEmbedUrl,
  getVideoPosterCandidates,
  getVideoPosterUrl,
  isEmbedVideoUrl,
} from "@/lib/video";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
  title?: string;
  poster?: string | null;
  variant?: "default" | "preview" | "compact";
  lazy?: boolean;
  framed?: boolean;
  showLabel?: boolean;
  className?: string;
};

const GoldPlayButton = ({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    sm: { outer: "w-9 h-9", inner: "w-7 h-7", icon: "w-3.5 h-3.5 ml-0.5" },
    md: { outer: "w-12 h-12", inner: "w-9 h-9", icon: "w-4 h-4 ml-0.5" },
    lg: { outer: "w-16 h-16", inner: "w-12 h-12", icon: "w-5 h-5 ml-0.5" },
  }[size];

  return (
    <div
      className={cn(
        "rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center",
        sizes.outer,
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full bg-gold flex items-center justify-center shadow-gold text-slate-950",
          sizes.inner,
        )}
      >
        <Play className={cn("fill-current", sizes.icon)} />
      </div>
    </div>
  );
};

// Nombre de tentatives sur la vraie miniature avant d'abandonner sur le fallback.
// Utile juste après un upload : Bunny met parfois quelques secondes à générer thumbnail.jpg.
const THUMBNAIL_MAX_RETRIES = 4;
const THUMBNAIL_RETRY_DELAY_MS = 2500;

const VideoPoster = ({
  poster,
  title,
  overlay = "medium",
  posterCandidates,
}: {
  poster: string | null;
  title?: string;
  overlay?: "light" | "medium" | "dark";
  posterCandidates?: string[];
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [cacheBust, setCacheBust] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const candidates = posterCandidates ?? (poster ? [poster] : []);

  useEffect(() => {
    setCandidateIndex(0);
    setRetryCount(0);
    setCacheBust(0);
    return () => clearTimeout(retryTimeoutRef.current);
  }, [poster, posterCandidates]);

  const overlayClass = {
    light: "bg-black/20",
    medium: "bg-black/35",
    dark: "bg-black/50",
  }[overlay];

  const currentBase = candidates[candidateIndex] ?? null;
  // Les data URIs (fallback SVG) n'ont pas besoin/ne supportent pas de cache-busting.
  const currentSrc =
    currentBase && cacheBust > 0 && !currentBase.startsWith("data:")
      ? `${currentBase}${currentBase.includes("?") ? "&" : "?"}retry=${cacheBust}`
      : currentBase;

  const handleError = () => {
    const isLastCandidate = candidateIndex >= candidates.length - 1;

    if (!isLastCandidate) {
      // On a d'autres candidats (ex: fallback SVG) : on passe au suivant.
      // Mais si c'est le tout premier (la vraie miniature Bunny), on retente d'abord.
      if (candidateIndex === 0 && retryCount < THUMBNAIL_MAX_RETRIES) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((c) => c + 1);
          setCacheBust((c) => c + 1);
        }, THUMBNAIL_RETRY_DELAY_MS);
        return;
      }
      setCandidateIndex((i) => i + 1);
      return;
    }

    // Dernier candidat déjà en échec : plus rien à essayer.
  };

  if (currentSrc) {
    return (
      <>
        <img
          key={currentSrc}
          src={currentSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={handleError}
        />
        <div className={cn("absolute inset-0", overlayClass)} aria-hidden="true" />
      </>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-royal/60 to-slate-950"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <Video className="h-16 w-16 text-gold" />
      </div>
      <span className="sr-only">{title ? `Miniature de ${title}` : "Miniature vidéo"}</span>
    </div>
  );
};

const NativeVideoPlayer = ({
  src,
  poster,
  className,
  compact,
}: {
  src: string;
  poster?: string | null;
  className?: string;
  compact?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void video.requestFullscreen?.();
  }, []);

  return (
    <div className={cn("group absolute inset-0 bg-black", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Lire la vidéo"
        >
          <GoldPlayButton size={compact ? "md" : "lg"} className="motion-safe:group-hover:scale-110 transition-transform duration-300" />
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-8 transition-opacity",
          playing ? "opacity-0 group-hover:opacity-100 focus-within:opacity-100" : "opacity-100",
        )}
      >
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(event) => handleSeek(Number(event.target.value))}
          className="video-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-gold"
          aria-label="Progression de la vidéo"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={playing ? "Pause" : "Lecture"}
            >
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            {!compact && (
              <span className="text-[10px] font-medium tabular-nums text-white/70">
                {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!compact && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Plein écran"
              >
                <Maximize className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmbedVideoPlayer = ({
  embedUrl,
  title,
  poster,
  lazy,
  playButtonSize = "lg",
  posterCandidates,
}: {
  embedUrl: string;
  title?: string;
  poster: string | null;
  lazy: boolean;
  playButtonSize?: "sm" | "md" | "lg";
  posterCandidates?: string[];
}) => {
  const [active, setActive] = useState(!lazy);

  if (!active) {
    return (
      <button
        type="button"
        className="absolute inset-0 overflow-hidden bg-black"
        onClick={() => setActive(true)}
        aria-label={title ? `Lire ${title}` : "Lire la vidéo"}
      >
        <VideoPoster poster={poster} title={title} posterCandidates={posterCandidates} />
        <div className="absolute inset-0 flex items-center justify-center">
          <GoldPlayButton
            size={playButtonSize}
            className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-110"
          />
        </div>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <iframe
        src={embedUrl}
        title={title ?? "Lecteur vidéo"}
        className="h-full w-full flex-1 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

const VideoPlayer = ({
  src,
  title,
  poster,
  variant = "default",
  lazy = true,
  framed = true,
  showLabel = false,
  className,
}: VideoPlayerProps) => {
  const embedUrl = getVideoEmbedUrl(src);
  const isEmbed = isEmbedVideoUrl(src);
  const posterCandidates = getVideoPosterCandidates(src, poster);
  const resolvedPoster = posterCandidates[0] ?? null;

  const player = (() => {
    if (variant === "preview") {
      return (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <VideoPoster poster={resolvedPoster} title={title} overlay="light" posterCandidates={posterCandidates} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <GoldPlayButton size="md" className="motion-safe:group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      );
    }

    if (isEmbed && embedUrl) {
      return (
        <EmbedVideoPlayer
          embedUrl={embedUrl}
          title={title}
          poster={resolvedPoster}
          lazy={lazy}
          playButtonSize={variant === "compact" ? "md" : "lg"}
          posterCandidates={posterCandidates}
        />
      );
    }

    return <NativeVideoPlayer src={src} poster={resolvedPoster} compact={variant === "compact"} />;
  })();

  if (!framed || variant === "preview") {
    const shell = (
      <div className="relative w-full aspect-video min-h-[12rem] bg-black">
        <div className="absolute inset-0">{player}</div>
      </div>
    );
    return className ? <div className={className}>{shell}</div> : shell;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-slate-900 via-royal/80 to-slate-900 shadow-royal",
        variant === "compact" && "rounded-xl border-border/70 bg-card shadow-sm",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      {showLabel && (
        <div className="relative z-10 flex items-center gap-2 px-4 pb-1 pt-3">
          <Video className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
            Enseignement Vidéo
          </span>
        </div>
      )}

      <div className="relative w-full aspect-video min-h-[12rem] bg-black">
        <div className="absolute inset-0">{player}</div>
      </div>
    </div>
  );
};

export default VideoPlayer;