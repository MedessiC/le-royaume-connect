import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FaYoutube, FaWhatsapp, FaFacebook, FaTiktok } from "react-icons/fa";
import { ArrowUpRight, Users } from "lucide-react";

type HomeSettings = {
  youtube_channel_url: string | null;
  whatsapp_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

const SocialFollowCTA = () => {
  const [settings, setSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    supabase
      .from("home_settings")
      .select("youtube_channel_url, whatsapp_url, facebook_url, tiktok_url")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
  }, []);

  const socialPlatforms = [
    {
      name: "YouTube",
      href: settings?.youtube_channel_url || "https://youtube.com",
      icon: FaYoutube,
      color: "text-red-500",
      bgHover: "hover:bg-red-500/10 hover:border-red-500/30",
      description: "Prédications & Directs",
      action: "S'abonner"
    },
    {
      name: "WhatsApp",
      href: settings?.whatsapp_url || "https://whatsapp.com",
      icon: FaWhatsapp,
      color: "text-emerald-500",
      bgHover: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
      description: "Canal Officiel",
      action: "Rejoindre"
    },
    {
      name: "Facebook",
      href: settings?.facebook_url || "https://facebook.com",
      icon: FaFacebook,
      color: "text-blue-500",
      bgHover: "hover:bg-blue-500/10 hover:border-blue-500/30",
      description: "Page officielle",
      action: "Suivre la page"
    },
    {
      name: "TikTok",
      href: settings?.tiktok_url || "https://tiktok.com",
      icon: FaTiktok,
      color: "text-foreground",
      bgHover: "hover:bg-foreground/10 hover:border-foreground/30",
      description: "Extraits vidéo",
      action: "Découvrir"
    },
  ];

  return (
    <section className="my-6 sm:my-10 rounded-2xl sm:rounded-3xl border border-gold/25 bg-gradient-to-br from-card via-card to-gold/5 p-4 sm:p-7 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 pb-3 sm:pb-5 border-b border-border/50">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" />
            <span>Communauté & Réseaux</span>
          </div>
          <h3 className="font-display font-extrabold text-base sm:text-xl text-foreground">
            Suivez <span className="text-gradient-gold">MILLENIUM</span>
          </h3>
        </div>

        <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block max-w-xs text-right">
          Rejoignez nos canaux officiels pour suivre les prédications et méditations.
        </p>
      </div>

      {/* Single Horizontal Row for Social Platforms on Mobile & Desktop */}
      <div className="flex flex-row items-center justify-between gap-2 pt-3 sm:pt-5 w-full overflow-x-auto scrollbar-none">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`group flex-1 flex items-center justify-center sm:justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card/80 transition-all duration-200 ${platform.bgHover} hover:shadow-md min-w-0`}
              title={platform.name}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center text-base sm:text-lg shrink-0 ${platform.color} group-hover:scale-110 transition-transform`}>
                  <Icon />
                </div>
                <div className="hidden md:block min-w-0">
                  <p className="font-display font-extrabold text-xs sm:text-sm text-foreground group-hover:text-gold transition-colors truncate">
                    {platform.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                    {platform.description}
                  </p>
                </div>
                <span className="hidden sm:inline-block md:hidden text-xs font-bold text-foreground group-hover:text-gold transition-colors truncate">
                  {platform.name}
                </span>
              </div>

              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 hidden sm:block" />
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default SocialFollowCTA;
