import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Lightbulb } from "lucide-react";

const SupportSection = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-gold/10 via-royal/10 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Message */}
          <div>
            <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-4">Soutien</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Aidez-nous à grandir
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Le Règne Millénaire grandit grâce au soutien de nos fidèles membres. Chaque contribution nous aide à:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-1">✓</span>
                <span className="text-foreground">Produire et partager plus d'enseignements de qualité</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-1">✓</span>
                <span className="text-foreground">Développer des outils pour notre communauté mondiale</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-1">✓</span>
                <span className="text-foreground">Soutenir des projets communautaires locaux</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-1">✓</span>
                <span className="text-foreground">Étendre notre mission spirituelle dans le monde</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donate">
                <Button size="lg" className="bg-gold hover:bg-gold-dark text-foreground">
                  <Heart className="w-5 h-5 mr-2" /> Faire un don
                </Button>
              </Link>
              <Link to="/community">
                <Button size="lg" variant="secondary">
                  <Lightbulb className="w-5 h-5 mr-2" /> Autres façons d'aider
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Highlight box */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-royal/20 rounded-3xl blur-xl" />
            <div className="relative bg-card border border-gold/30 rounded-3xl p-8 md:p-10">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-display font-bold text-gold mb-2">100%</div>
                  <p className="text-muted-foreground">Transparence dans l'utilisation des fonds</p>
                </div>
                <div className="w-full h-px bg-border" />
                <div>
                  <div className="text-4xl font-display font-bold text-gold mb-2">50+</div>
                  <p className="text-muted-foreground">Pays représentés dans notre mouvement</p>
                </div>
                <div className="w-full h-px bg-border" />
                <div>
                  <div className="text-4xl font-display font-bold text-gold mb-2">∞</div>
                  <p className="text-muted-foreground">Pas de limite à ce que nous pouvons accomplir ensemble</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
