import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-midnight-deep py-12 border-t border-gold/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-gold">MILLENIUM</span>
          </div>
          <p className="text-primary-foreground/50 text-sm font-body text-center">
            Fondée à Banikoara, Bénin · Mouvement mondial
          </p>
          <div className="flex gap-6 text-sm font-body">
            <a href="#pillars" className="text-primary-foreground/60 hover:text-gold transition-colors">Nos Piliers</a>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-primary-foreground/30 text-xs font-body">
            © {new Date().getFullYear()} MILLENIUM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
