import { useMemo } from "react";
import { Youtube, Calendar, ArrowUpRight, Share2, Facebook, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

const extractYouTubeId = (value: string): string | null => {
  if (!value) return null;
  const cleanUrl = value.trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/i,
    /\b([A-Za-z0-9_-]{11})\b/
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

type HomeSettings = {
  youtube_url: string | null;
  youtube_duration_days: number | null;
  youtube_expires_at: string | null;
  active: boolean;
  tiktok_url: string | null;
  youtube_channel_url: string | null;
  whatsapp_url: string | null;
  facebook_url: string | null;
  live_enabled: boolean;
  live_url: string | null;
};

type Props = {
  settings: HomeSettings | null;
};

const FeaturedVideo = ({ settings }: Props) => {
  const isActive = settings?.active && !!settings.youtube_url;

  const expiresAt = useMemo(() => {
    if (!settings?.youtube_expires_at) return null;
    const date = new Date(settings.youtube_expires_at);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [settings?.youtube_expires_at]);

  const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;
  const videoId = settings?.youtube_url ? extractYouTubeId(settings.youtube_url) : null;

  if (!isActive || isExpired || !videoId) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-background">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-red-600/5 blur-[100px]" />
        <div className="absolute bottom-12 right-10 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-stretch">
          
          {/* Left Column: Player & Title */}
          <div className="space-y-6">
            <div className="space-y-3">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                  <Youtube className="w-3.5 h-3.5 fill-current" /> Vidéo à la Une
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
                  <Radio className="w-3 h-3" /> Nouveau
                </span>
              </div>
              
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
                Dernière Prédication & Publication Officielle
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl font-body leading-relaxed">
                Regardez l'enseignement vidéo du Règne Millénaire partagé pour guider les disciples du monde entier.
              </p>
            </div>

            {/* Video Player Frame with Glass overlay shadow */}
            <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-royal group">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
                  title="Enseignement vidéo à la Une"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Right Column: Actions / Channel Info */}
          <div className="flex flex-col justify-between gap-6">
            
            {/* Box 1: Institutional/Expiry details */}
            <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 space-y-4 shadow-sm flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">Disponibilité</h3>
                    <p className="text-xs text-muted-foreground">Publication temporaire</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {expiresAt && (
                    <div className="flex items-center justify-between text-xs font-body">
                      <span className="text-muted-foreground">Date limite d'affichage :</span>
                      <span className="font-semibold text-foreground">
                        {expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-body">
                    <span className="text-muted-foreground">Durée recommandée :</span>
                    <span className="font-semibold text-foreground">
                      {settings.youtube_duration_days ? `${settings.youtube_duration_days} jours` : "Illimité"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-body">
                    <span className="text-muted-foreground">Source :</span>
                    <span className="font-semibold text-red-500 flex items-center gap-1">
                      YouTube Official
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: YouTube channel link (CTA) */}
              {settings.youtube_channel_url && (
                <div className="pt-6 border-t border-border/50 space-y-3">
                  <p className="text-[11px] font-body text-muted-foreground leading-normal">
                    Abonnez-vous à notre chaîne officielle pour ne rater aucun message du Règne Millénaire.
                  </p>
                  <a
                    href={settings.youtube_channel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 py-5">
                      <Youtube className="w-4 h-4 fill-current" />
                      S'abonner à la chaîne
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Box 3: Social & other media shortcuts if available */}
            {(settings.facebook_url || settings.tiktok_url) && (
              <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 space-y-3 shadow-sm">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Suivre également sur</p>
                <div className="flex flex-col gap-2">
                  {settings.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/40 hover:border-gold/30 hover:bg-secondary/40 transition-all text-xs font-semibold text-foreground group"
                    >
                      <span className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600 fill-current" />
                        Facebook Officiel
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                  {settings.live_enabled && settings.live_url && (
                    <a
                      href={settings.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/40 hover:border-gold/30 hover:bg-secondary/40 transition-all text-xs font-semibold text-foreground group"
                    >
                      <span className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                        Diffusions en Direct
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturedVideo;
