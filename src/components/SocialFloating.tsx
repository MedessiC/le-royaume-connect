import { useState } from "react";
import { Users, X, Video } from "lucide-react";
import { IconType } from "react-icons";
import { FaWhatsapp, FaFacebook, FaYoutube } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

type Props = {
  tiktok_url: string | null;
  youtube_channel_url: string | null;
  whatsapp_url: string | null;
  facebook_url: string | null;
  live?: boolean;
  live_url?: string | null;
};

const SocialFloating = ({ tiktok_url, youtube_channel_url, whatsapp_url, facebook_url, live = false, live_url = null }: Props) => {
  const [open, setOpen] = useState(false);
  const links: Array<{ label: string; href: string | null; icon: IconType }> = [
    { label: "Chaîne YouTube", href: youtube_channel_url, icon: FaYoutube },
    { label: "WhatsApp", href: whatsapp_url, icon: FaWhatsapp },
    { label: "Facebook", href: facebook_url, icon: FaFacebook },
    { label: "TikTok", href: tiktok_url, icon: SiTiktok },
  ];
  const visibleLinks = links.filter((item) => !!item.href) as Array<{ label: string; href: string; icon: IconType }>;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {live && (
        <a
          href={live_url || "#"}
          target={live_url ? "_blank" : undefined}
          rel={live_url ? "noreferrer noopener" : undefined}
          className={`inline-flex items-center gap-2 rounded-full bg-red-600/95 px-3 py-2 text-xs uppercase tracking-[0.24em] font-semibold text-white shadow-lg shadow-red-500/30 ${live_url ? "cursor-pointer hover:bg-red-700/95 transition" : ""}`}
        >
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <Video className="h-4 w-4" />
          En direct
        </a>
      )}
      {open && (
        <div className="w-60 rounded-[32px] border border-gold/20 bg-midnight-deep/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold text-gold">
            <span>Réseaux</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-primary-foreground/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3">
            {visibleLinks.length > 0 ? (
              visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-primary-foreground transition hover:bg-gold/10"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{link.label}</span>
                  </a>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-primary-foreground">
                Aucun lien configuré pour le moment.
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-full bg-gold p-4 text-midnight-deep shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 motion-safe:animate-pulse"
        aria-label={open ? "Fermer les réseaux" : "Ouvrir les réseaux sociaux"}
      >
        {open ? <X className="h-5 w-5" /> : <Users className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default SocialFloating;
