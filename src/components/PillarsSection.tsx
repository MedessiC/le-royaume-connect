// PillarsSection.tsx
import { useEffect, useRef, useState } from "react";
import { FaLightbulb, FaHandsHelping, FaLandmark } from "react-icons/fa";

const pillars = [
  {
    numeral: "01",
    icon: FaLightbulb,
    title: "Élever",
    description:
      "Élever la conscience des enfants de Dieu choisis par des enseignements et la Parole pour les libérer du joug satanique.",
    gradient: "from-royal-deep to-royal",
  },
  {
    numeral: "02",
    icon: FaHandsHelping,
    title: "Rassembler",
    description:
      "Rassembler tous les dignes fils de Dieu éparpillés à travers le monde pour les converger vers Sion, Banikoara.",
    gradient: "from-gold-dark to-gold",
  },
  {
    numeral: "03",
    icon: FaLandmark,
    title: "Bâtir",
    description:
      "Bâtir un empire puissant dans un monde nouveau sous une seule Loi à laquelle devront obéir toutes les nations.",
    gradient: "from-primary to-royal-light",
  },
];

const PillarsSection = () => {
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
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pillars" className="relative overflow-hidden py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="section-eyebrow mx-auto mb-3" style={{ width: "fit-content" }}>
            Nos Fondements
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Trois Piliers, Une Vision
          </h2>
          <div className="w-12 h-1 bg-gold mx-auto rounded-full mt-4" />
        </div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="hidden md:block absolute left-[16.5%] right-[16.5%] top-[52px] h-px bg-gradient-to-r from-gold-dark/30 via-gold/50 to-gold-light/30"
          />

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`group relative card-elevated rounded-2xl p-8 pt-10 text-center transition-all duration-700 hover:-translate-y-2 hover:border-gold/40 hover:shadow-gold ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: visible ? `${index * 150}ms` : "0ms" }}
              >
                {/* Number */}
                <span className="absolute top-4 left-5 font-display text-xs font-bold tracking-wider text-muted-foreground/40">
                  {pillar.numeral}
                </span>

                {/* Icon medallion */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <pillar.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {pillar.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
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