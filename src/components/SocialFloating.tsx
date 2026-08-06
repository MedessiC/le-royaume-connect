import { useState } from "react";
import { X, Video, MessageCircle, ArrowUpRight } from "lucide-react";
import { IconType } from "react-icons";
import { FaWhatsapp, FaFacebook, FaYoutube } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import FlagIcon from "@/components/FlagIcon";

type Props = {
  tiktok_url: string | null;
  youtube_channel_url: string | null;
  whatsapp_url: string | null;
  facebook_url: string | null;
  live?: boolean;
  live_url?: string | null;
};

const SocialFloating = ({
  tiktok_url,
  youtube_channel_url,
  whatsapp_url,
  facebook_url,
  live = false,
  live_url = null,
}: Props) => {
  const [socialOpen, setSocialOpen] = useState(false);

  const links: Array<{
    label: string;
    href: string | null;
    icon: IconType;
    color: string;
    bgColor: string;
  }> = [
    {
      label: "YouTube",
      href: youtube_channel_url,
      icon: FaYoutube,
      color: "text-red-500",
      bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
    },
    {
      label: "WhatsApp",
      href: whatsapp_url,
      icon: FaWhatsapp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
    },
    {
      label: "Facebook",
      href: facebook_url,
      icon: FaFacebook,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
    },
    {
      label: "TikTok",
      href: tiktok_url,
      icon: SiTiktok,
      color: "text-foreground",
      bgColor: "bg-foreground/5 border-foreground/15 hover:bg-foreground/10",
    },
  ];

  const visibleLinks = links.filter((item) => !!item.href) as Array<{
    label: string;
    href: string;
    icon: IconType;
    color: string;
    bgColor: string;
  }>;

  const contactNumbers = [
    {
      country: "Côte d'Ivoire",
      label: "+225 27 337 83959",
      href: "https://wa.me/2252733783959",
    },
    {
      country: "Côte d'Ivoire",
      label: "+225 07 592 32944",
      href: "https://wa.me/2250759232944",
    },
  ];

  return (
    <aside
      className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      aria-label="Liens réseaux sociaux"
    >
      {/* Badge Live si actif */}
      {live && (
        <a
          href={live_url || "#"}
          target={live_url ? "_blank" : undefined}
          rel={live_url ? "noreferrer noopener" : undefined}
          className={`inline-flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-red-600/30 transition-all ${
            live_url ? "hover:scale-105 hover:bg-red-700 active:scale-95" : ""
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <Video className="h-3.5 w-3.5" />
          <span>Direct</span>
        </a>
      )}

      {/* Popover Menu Réseaux */}
      {socialOpen && (
        <div className="w-64 rounded-3xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">
              Rejoignez-nous
            </span>
            <button
              type="button"
              onClick={() => setSocialOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-2">
            {visibleLinks.length > 0 ? (
              <>
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`group flex items-center justify-between rounded-2xl border p-2.5 transition-all duration-200 ${link.bgColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm border border-border/40 ${link.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  );
                })}
                {contactNumbers.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between rounded-2xl border border-border/60 bg-white/5 p-2.5 transition-all duration-200 hover:border-gold hover:bg-gold/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/20">
                        <FaWhatsapp className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                        <FlagIcon country={contact.country} className="inline-block h-4 w-6 mr-2 flex-shrink-0" />{contact.label}
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ))}
              </>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                Aucun réseau renseigné.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setSocialOpen((prev) => !prev)}
        className={`group relative flex h-13 w-13 items-center justify-center rounded-full bg-gold text-slate-950 shadow-xl shadow-gold/30 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-background ${
          socialOpen ? "rotate-90 bg-slate-900 text-gold border-gold" : ""
        }`}
        aria-label={socialOpen ? "Fermer les réseaux sociaux" : "Ouvrir les réseaux sociaux"}
      >
        {/* Subtle Pulse Aura */}
        {!socialOpen && (
          <span className="absolute -inset-1 rounded-full bg-gold/25 animate-ping opacity-75 pointer-events-none" />
        )}

        {socialOpen ? (
          <X className="h-5 w-5 transition-transform" />
        ) : (
          <MessageCircle className="h-5.5 w-5.5 transition-transform group-hover:scale-110" />
        )}
      </button>

    </aside>
  );
};

export default SocialFloating;
