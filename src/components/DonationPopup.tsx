import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, X } from "lucide-react";

const DONATION_POPUP_SESSION_KEY = "millenium-donation-popup-seen";

const DonationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DONATION_POPUP_SESSION_KEY)) return;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(DONATION_POPUP_SESSION_KEY, "true");
    }, 4500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-300 sm:p-6"
      role="presentation"
      onClick={() => setIsOpen(false)}
    >
      <section
        aria-labelledby="donation-popup-title"
        aria-modal="true"
        className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-950/40 animate-in zoom-in-95 duration-300 md:grid-cols-[0.9fr_1.1fr]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[220px] overflow-hidden md:min-h-[460px]">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85"
            alt="Des mains réunies pour soutenir une action solidaire"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-semibold text-white md:bottom-7 md:left-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-slate-950">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <span>Une générosité qui rassemble</span>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer la fenêtre de don"
            className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold">Soutenir la mission</p>
          <h2 id="donation-popup-title" className="max-w-md font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Votre don fait grandir la vision.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
            Chaque contribution aide à transmettre les enseignements, accompagner la communauté et faire vivre nos actions sur le terrain.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/donate"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-gold/20 transition-all hover:bg-gold-light hover:shadow-gold/40"
            >
              Faire un don
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              Peut-être plus tard
            </button>
          </div>
          <p className="mt-5 text-xs text-white/40">Votre soutien, quel que soit son montant, compte.</p>
        </div>
      </section>
    </div>
  );
};

export default DonationPopup;