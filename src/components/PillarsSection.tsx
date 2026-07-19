// PillarsSection.tsx
import { useEffect, useRef, useState } from "react";
import { FaLightbulb, FaHandsHelping, FaLandmark } from "react-icons/fa";

const pillars = [
  {
    numeral: "I",
    icon: FaLightbulb,
    title: "Élever",
    description:
      "Élever la conscience des enfants de Dieu choisis par des enseignements et la Parole pour les libérer du joug satanique.",
  },
  {
    numeral: "II",
    icon: FaHandsHelping,
    title: "Rassembler",
    description:
      "Rassembler tous les dignes fils de Dieu éparpillés à travers le monde pour les converger vers Sion, Banikoara.",
  },
  {
    numeral: "III",
    icon: FaLandmark,
    title: "Bâtir",
    description:
      "Bâtir un empire puissant dans un monde nouveau sous une seule Loi à laquelle devront obéir toutes les nations.",
  },
];

const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
};

const PillarsSection = () => {
  const { ref: sectionRef, visible } = useReveal();

  return (
    <section id="pillars" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <p className="text-gold-dark font-body text-sm tracking-[0.25em] uppercase mb-3">
            Nos fondements
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Trois Piliers, Une Vision
          </h2>
          <span className="inline-block w-14 h-px bg-gold mt-6" />
        </div>

        <div ref={sectionRef} className="relative max-w-5xl mx-auto">
          {/* Chemin doré reliant les trois piliers — visible dès md */}
          <div
            aria-hidden
            className="hidden md:block absolute left-[16.5%] right-[16.5%] top-[52px] h-px bg-gradient-to-r from-gold-dark via-gold to-gold-light opacity-40"
          />

          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`group relative bg-card rounded-lg p-8 pt-10 text-center border border-border shadow-royal transition-all duration-700 motion-safe:hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "motion-safe:opacity-0 motion-safe:translate-y-6"
                }`}
                style={{ transitionDelay: visible ? `${index * 150}ms` : "0ms" }}
              >
                {/* Marqueur d'ordre — chiffre romain */}
                <span className="absolute top-4 left-5 font-display text-xs tracking-widest text-gold-dark/70">
                  {pillar.numeral}
                </span>

                {/* Médaillon — nœud sur le chemin doré */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
                  <span className="absolute inset-0 rounded-full border border-gold/30 motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:rotate-45" />
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-dark to-gold shadow-gold">
                    <pillar.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {pillar.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed text-sm">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;