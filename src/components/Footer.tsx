import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import LanguageSelector from "@/components/LanguageSelector";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background text-foreground">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex flex-col mb-4">
              <span className="font-display text-xl font-bold tracking-wider text-gold">MILLENIUM</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Fondée à Banikoara, Bénin · Un mouvement mondial rassemblant les enfants de Dieu aux quatre coins de la terre.
            </p>
          </div>

          {/* Links */}
          <div className="md:text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground mb-4">Navigation</p>
            <ul className="space-y-2">
              {[{to:'/', label:'Accueil'},{to:'/feed', label:'Enseignements'},{to:'/community', label:'Communauté'},{to:'/about', label:'À propos'},{to:'/donate', label:'Soutien'}].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillars */}
          <div className="md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground mb-4">Nos Piliers</p>
            <ul className="space-y-2">
              {[{anchor:'#pillars', label:'Élever'},{anchor:'#pillars', label:'Rassembler'},{anchor:'#pillars', label:'Bâtir'},{anchor:'#mission', label:'Notre mission'}].map((l, i) => (
                <li key={i}>
                  <a href={l.anchor} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.75rem] text-muted-foreground">
            © {year} Millenium. Tous droits réservés.
          </p>
          <LanguageSelector variant="footer" />
          <p className="text-[0.75rem] text-muted-foreground flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 text-gold fill-gold/30" /> depuis Banikoara
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
