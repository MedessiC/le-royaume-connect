import { Link } from "react-router-dom";
import { Play, Pause, X, ChevronDown, ChevronUp, Volume2, VolumeX, Music } from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const FloatingAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    isMinimized,
    togglePlay,
    seek,
    toggleMute,
    toggleMinimize,
    closePlayer,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? "bottom-20 right-4 md:bottom-6 md:right-6 w-auto"
          : "bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96"
      }`}
    >
      {/* Minimized Floating Badge */}
      {isMinimized ? (
        <div className="flex items-center gap-3 bg-popover/95 backdrop-blur-xl border border-gold/40 shadow-2xl rounded-full px-4 py-2 text-foreground">
          <button
            onClick={toggleMinimize}
            className="flex items-center gap-2 text-xs font-semibold hover:text-gold transition-colors"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gold/20 text-gold">
              {isPlaying ? (
                <span className="flex items-end gap-[2px] h-3">
                  <span className="w-0.5 bg-gold animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: "60%" }} />
                  <span className="w-0.5 bg-gold animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: "100%" }} />
                  <span className="w-0.5 bg-gold animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: "40%" }} />
                </span>
              ) : (
                <Music className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{currentTrack.title}</span>
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-7 h-7 rounded-full bg-gold text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={closePlayer}
            aria-label="Fermer le lecteur"
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Full Floating Player Card */
        <div className="bg-popover/95 backdrop-blur-xl border border-gold/30 shadow-2xl rounded-2xl p-4 text-foreground relative overflow-hidden">
          {/* Top Gold Bar Accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Header Controls */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold">
              Écoute En Cours
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                aria-label="Réduire"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={closePlayer}
                aria-label="Fermer"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Track Info */}
          <div className="flex items-center gap-3 mb-3">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-royal to-primary flex items-center justify-center text-white flex-shrink-0">
                <Music className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link
                to={`/teachings/${currentTrack.id}`}
                className="font-display font-bold text-sm text-foreground hover:text-gold transition-colors line-clamp-1 block"
              >
                {currentTrack.title}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.authorName || "Enseignement Millenium"}
              </p>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1 mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-gold text-slate-950 flex items-center justify-center font-bold hover:scale-105 shadow-gold transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <Link
              to={`/teachings/${currentTrack.id}`}
              className="text-xs font-semibold text-gold hover:underline"
            >
              Voir
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingAudioPlayer;
