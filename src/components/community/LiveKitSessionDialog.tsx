import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Video, Mic, Volume2, ShieldCheck, X, Radio } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

type LiveKitSessionDialogProps = {
  open: boolean;
  title: string;
  token: string | null;
  serverUrl: string | null;
  mode?: "call" | "live-host" | "viewer";
  onOpenChange: (open: boolean) => void;
};

const LiveKitSessionDialog = ({
  open,
  title,
  token,
  serverUrl,
  mode = "call",
  onOpenChange,
}: LiveKitSessionDialogProps) => {
  const canPublish = mode !== "viewer";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] w-screen max-w-none border-0 p-0 sm:h-[90dvh] sm:w-[94vw] sm:max-w-6xl sm:rounded-3xl sm:border border-gold/30 shadow-2xl overflow-hidden bg-slate-950 text-white">
        
        {/* ── Luminous Header ── */}
        <DialogHeader className="border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/90 backdrop-blur-xl flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/40 shadow-gold">
              {mode === "viewer" ? <Radio className="w-5 h-5 animate-pulse" /> : <Video className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate text-base sm:text-lg font-bold text-white">
                  {title}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {mode === "viewer" ? "En direct" : "Appel actif"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <span>Règne Millénaire · Connexion Chiffrée</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-destructive/20 text-white hover:text-destructive flex items-center justify-center transition-all shrink-0 ml-2"
            aria-label="Quitter le salon"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {/* ── Main Call Window ── */}
        <div className="relative h-[calc(100dvh-4.25rem)] sm:h-[calc(90dvh-4.75rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-midnight overflow-hidden">
          
          {/* Custom LiveKit Controls Overrides styling */}
          <style>{`
            .lk-video-conference {
              background: transparent !important;
            }
            .lk-control-bar {
              background: rgba(15, 23, 42, 0.85) !important;
              backdrop-filter: blur(16px) !important;
              border: 1px solid rgba(212, 175, 55, 0.3) !important;
              border-radius: 9999px !important;
              margin-bottom: 1rem !important;
              padding: 0.5rem 1rem !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
            }
            .lk-button {
              border-radius: 9999px !important;
              background: rgba(255, 255, 255, 0.08) !important;
              color: white !important;
              transition: all 0.2s ease !important;
            }
            .lk-button:hover {
              background: rgba(212, 175, 55, 0.25) !important;
              color: #ffd700 !important;
            }
            .lk-button[aria-pressed="true"] {
              background: #d4af37 !important;
              color: #0f172a !important;
            }
            .lk-disconnect-button {
              background: rgba(239, 68, 68, 0.2) !important;
              color: #ef4444 !important;
              border: 1px solid rgba(239, 68, 68, 0.4) !important;
            }
            .lk-disconnect-button:hover {
              background: #ef4444 !important;
              color: white !important;
            }
            .lk-participant-tile {
              border-radius: 1.5rem !important;
              overflow: hidden !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
            }
          `}</style>

          {token && serverUrl ? (
            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              connect
              audio={canPublish}
              video={canPublish}
              onDisconnected={() => onOpenChange(false)}
              className="h-full w-full"
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-gold via-amber-300 to-royal shadow-2xl animate-pulse">
                  <UserAvatar
                    name="Le Règne Millénaire"
                    src="/android-chrome-512x512.png"
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gold text-slate-950 p-2 rounded-full shadow-lg">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="font-display text-lg font-bold text-white">Connexion au Salon...</h4>
                <p className="text-xs text-slate-400">
                  Initialisation du canal audio/vidéo sécurisé. Veuillez patienter un instant.
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gold">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Prêt pour l'échange en direct</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveKitSessionDialog;
