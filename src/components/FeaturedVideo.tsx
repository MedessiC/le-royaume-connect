import { useMemo } from "react";

const extractYouTubeId = (value: string) => {
  const patterns = [
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/, 
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/, 
    /([A-Za-z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

type HomeSettings = {
  youtube_url: string | null;
  youtube_duration_days: number | null;
  youtube_expires_at: string | null;
  active: boolean;
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
    <section className="relative overflow-hidden bg-background dark:bg-[#050816] py-10">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-gold/20 bg-card dark:bg-midnight-deep/90 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Vidéo d’accueil</p>
              <h2 className="mt-2 text-3xl font-bold text-foreground dark:text-white">Regarde la dernière publication YouTube</h2>
              {expiresAt && (
                <p className="mt-2 text-sm text-muted-foreground dark:text-primary-foreground/70">
                  Affichée jusqu’au {expiresAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}.
                </p>
              )}
            </div>
            <div className="inline-flex rounded-full border border-gold/20 bg-muted/50 px-4 py-2 text-sm text-foreground dark:bg-white/5 dark:text-primary-foreground">
              {settings.youtube_duration_days ? `${settings.youtube_duration_days} jours` : "Sans limite"}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-background dark:bg-black shadow-inner">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="Vidéo d’accueil"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideo;
