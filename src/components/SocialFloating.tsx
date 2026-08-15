import { useState } from "react";
import { X, Video, ArrowUpRight, PhoneCall } from "lucide-react";
import { IconType } from "react-icons";
import { FaWhatsapp, FaFacebook, FaYoutube } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { normalizeExternalUrl } from "@/lib/url";

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
      href: normalizeExternalUrl(youtube_channel_url),
      icon: FaYoutube,
      color: "text-red-500",
      bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
    },
    {
      label: "Facebook",
      href: facebook_url,
      icon: FaFacebook,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40",
    },
    {
      label: "TikTok",
      href: tiktok_url,
      icon: SiTiktok,
      color: "text-white",
      bgColor: "bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/30",
    },
  ];

  const visibleLinks = links.filter((item) => !!item.href) as Array<{
    label: string;
    href: string;
    icon: IconType;
    color: string;
    bgColor: string;
  }>;

  const contactActions = [
    {
      label: "WhatsApp: +225 07 59 23 29 44",
      href: whatsapp_url || "https://wa.me/2250759232944",
      icon: FaWhatsapp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40",
    },
    {
      label: "Fixe: +225 27 24 46 68 06",
      href: "tel:+2252724466806",
      icon: PhoneCall,
      color: "text-gold",
      bgColor: "bg-gold/10 border-gold/20 hover:bg-gold/20 hover:border-gold/40",
    },
  ];

  return (
    <aside
      className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      aria-label="Liens réseaux sociaux et contacts"
    >
      {/* Badge Live si actif */}
      {live && (
        <a
          href={live_url || "#"}
          target={live_url ? "_blank" : undefined}
          rel={live_url ? "noreferrer noopener" : undefined}
          className={`inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white shadow-xl shadow-red-600/40 transition-all ${
            live_url ? "hover:scale-105 hover:bg-red-700 active:scale-95" : ""
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <Video className="h-4 w-4" />
          <span>Direct</span>
        </a>
      )}

      {/* Popover Menu Réseaux */}
      {socialOpen && (
        <div className="w-72 rounded-3xl border border-gold/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-2 flex items-center justify-end px-1">
            <button
              type="button"
              onClick={() => setSocialOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-2">
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
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-inner border border-white/10 ${link.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-gold transition-colors">
                      {link.label}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              );
            })}

            {contactActions.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith("tel:") ? undefined : "_blank"}
                  rel={contact.href.startsWith("tel:") ? undefined : "noreferrer noopener"}
                  className={`group flex items-center justify-between rounded-2xl border p-2.5 transition-all duration-200 ${contact.bgColor}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-inner border border-white/10 ${contact.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-gold transition-colors">
                      {contact.label}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setSocialOpen((prev) => !prev)}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full bg-gold text-slate-950 shadow-2xl shadow-gold/40 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-slate-950 ${
          socialOpen ? "rotate-90 bg-slate-900 text-gold border-gold" : ""
        }`}
        aria-label={socialOpen ? "Fermer les réseaux sociaux" : "Ouvrir les réseaux sociaux"}
      >
        {!socialOpen && (
          <span className="absolute -inset-1 rounded-full bg-gold/30 animate-ping opacity-75 pointer-events-none" />
        )}

        {socialOpen ? (
          <X className="h-6 w-6 transition-transform" />
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1 transition-transform group-hover:scale-110">
            <FaYoutube className="h-3.5 w-3.5 text-red-600" />
            <FaWhatsapp className="h-3.5 w-3.5 text-emerald-600" />
            <FaFacebook className="h-3.5 w-3.5 text-blue-600" />
            <SiTiktok className="h-3.5 w-3.5 text-slate-900" />
          </div>
        )}
      </button>
    </aside>
  );
};

export default SocialFloating;
