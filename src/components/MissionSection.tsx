import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MissionSection = () => {
  return (
    <section id="mission" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Notre mission</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
          Bâtir un pont entre <span className="text-gradient-gold">Banikoara</span> et le monde
        </h2>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
          MILLENIUM est né de la vision de rassembler une communauté dispersée aux quatre coins du globe.
          Notre plateforme offre un espace souverain où chaque membre peut recevoir les enseignements, participer aux échanges
          fraternels, et contribuer à la pérennité de l'œuvre par ses dons et son engagement.
        </p>
        <Link to="/community">
          <Button variant="default" size="lg" className="font-body">
            Voir la communauté
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default MissionSection;
