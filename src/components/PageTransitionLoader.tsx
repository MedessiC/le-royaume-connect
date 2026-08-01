import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransitionLoader = () => {
  const location = useLocation();
  const hasMounted = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo(0, 0);
    setIsVisible(true);
    const timer = window.setTimeout(() => setIsVisible(false), 650);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page"
    >
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(0_0%_100%_/_0.08)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%_/_0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-white/5 shadow-[0_0_60px_hsl(43_92%_50%_/_0.18)]">
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold/30 animate-spin" />
          <img
            src="/android-chrome-512x512.png"
            alt="Logo du Règne Millénaire"
            className="h-14 w-14 object-contain animate-pulse"
          />
        </div>
        <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.28em] text-white">MILLENIUM</p>
        <p className="mt-2 text-xs text-white/50">Préparation de votre espace</p>
        <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent animate-[loader-sweep_0.9s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default PageTransitionLoader;