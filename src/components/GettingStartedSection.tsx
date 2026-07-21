import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, BookOpen, MessageCircle, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  { icon: UserPlus, number: "01", title: "Créer votre compte", description: "Rejoignez notre communauté mondiale", color: "from-royal to-primary" },
  { icon: BookOpen, number: "02", title: "Explorez les contenus", description: "Découvrez des enseignements riches", color: "from-primary to-royal-light" },
  { icon: MessageCircle, number: "03", title: "Connectez-vous", description: "Participez aux échanges fraternels", color: "from-gold-dark to-gold" },
  { icon: Heart, number: "04", title: "Partagez & soutenez", description: "Contribuez à la mission commune", color: "from-gold to-gold-light" },
];

const GettingStartedSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-24 bg-section-alt relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <div className="section-eyebrow mx-auto mb-2" style={{ width: "fit-content" }}>Commencer</div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">
            Quatre étapes pour débuter
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
            Rejoindre le Règne Millénaire est simple et rapide.
          </p>
        </div>

        {/* 2x2 grid on mobile, 4 columns on desktop */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto mb-8 md:mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`relative card-elevated rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="absolute top-3 right-3 font-display text-[10px] font-bold text-muted-foreground/40">{step.number}</div>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-xs sm:text-sm font-bold text-foreground mb-1 leading-tight">{step.title}</h3>
                <p className="text-[0.7rem] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?mode=signup">
            <Button size="sm" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-6 font-bold">
              Créer un compte <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/feed">
            <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-xl px-6 font-semibold">
              Explorer sans compte
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedSection;
