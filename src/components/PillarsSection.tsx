import { FaLightbulb, FaHandsHelping, FaLandmark } from "react-icons/fa";

const pillars = [
  {
    icon: FaLightbulb,
    title: "Élever",
    description: "Élever la conscience des enfants de Dieu choisis par des enseignements et la Parole pour les libérer du joug satanique.",
    accent: "from-gold-dark to-gold",
  },
  {
    icon: FaHandsHelping,
    title: "Rassembler",
    description: "Rassembler tous les dignes fils de Dieu éparpillés à travers le monde pour les converger vers Sion, Banikoara.",
    accent: "from-gold to-gold-light",
  },
  {
    icon: FaLandmark,
    title: "Bâtir",
    description: "Bâtir un empire puissant dans un monde nouveau sous une seule Loi à laquelle devront obéir toutes les nations.",
    accent: "from-gold-light to-gold",
  },
];

const PillarsSection = () => {
  return (
    <section id="pillars" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Nos fondements</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Trois Piliers, Une Vision
          </h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="group relative bg-card rounded-lg p-8 text-center shadow-royal hover:shadow-gold transition-shadow duration-500 border border-border hover:border-gold/30"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${pillar.accent} mb-6 shadow-gold`}>
                <pillar.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
              <p className="font-body text-muted-foreground leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
