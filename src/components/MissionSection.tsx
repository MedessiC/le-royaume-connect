import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

const MissionSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="mission" className="relative overflow-hidden py-24 md:py-32 bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-royal/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gold/5 blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div ref={ref} className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="section-eyebrow mb-6">Notre mission</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              Bâtir un pont entre{' '}
              <span className="text-gradient-gold">Banikoara</span>{' '}
              et le monde
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-8">
              MILLENIUM est né de la vision de rassembler une communauté dispersée aux quatre coins du globe.
              Notre plateforme offre un espace souverain où chaque membre peut recevoir les enseignements,
              participer aux échanges fraternels, et contribuer à la pérennité de l'œuvre.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/community">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6">
                  Rejoindre la communauté <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="inline-flex items-center gap-2 rounded-lg px-6">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Visual card */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-royal/20 to-gold/10 rounded-3xl blur-2xl" aria-hidden />
              <div className="relative card-elevated rounded-2xl p-8 md:p-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal to-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Fondée à Banikoara</p>
                    <p className="text-xs text-muted-foreground">République du Bénin</p>
                  </div>
                </div>

                {[{ stat: '50+', label: 'pays représentés' }, { stat: '∞', label: 'liens fraternels' }, { stat: '100%', label: 'transparence' }].map((item, i) => (
                  <div key={i} className={i > 0 ? 'pt-5 border-t border-border' : ''}>
                    <div className="stat-value">{item.stat}</div>
                    <p className="stat-label">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
