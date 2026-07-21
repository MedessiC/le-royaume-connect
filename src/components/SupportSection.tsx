import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const benefits = [
  "Produire et partager plus d'enseignements de qualité",
  "Développer des outils pour notre communauté mondiale",
  "Soutenir des projets communautaires locaux",
  "Étendre notre mission spirituelle dans le monde",
];

const SupportSection = () => {
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
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] rounded-full bg-gradient-to-r from-royal/6 via-transparent to-gold/6 blur-3xl" />
      </div>

      <div ref={ref} className="relative container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
          {/* Left */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="section-eyebrow mb-6">Soutien</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
              Aidez-nous à <span className="text-gradient-gold">grandir</span>
            </h2>
            <p className="text-muted-foreground mb-7 leading-relaxed text-sm">
              Le Règne Millénaire grandit grâce au soutien de nos fidèles membres. Chaque contribution nous aide à :
            </p>
            <ul className="space-y-3 mb-8">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-foreground/80">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/donate">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-foreground inline-flex items-center gap-2 rounded-lg px-7">
                  <Heart className="w-4 h-4" /> Faire un don
                </Button>
              </Link>
              <Link to="/community">
                <Button size="lg" variant="outline" className="rounded-lg px-7">Autres façons d'aider</Button>
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/15 to-royal/10 rounded-3xl blur-2xl" aria-hidden />
              <div className="relative card-elevated rounded-2xl p-8 md:p-10">
                {[{ val: '100%', label: 'Transparence des fonds' }, { val: '50+', label: 'Pays représentés' }, { val: '∞', label: 'Ensemble, sans limite' }].map((item, i) => (
                  <div key={i} className={i > 0 ? 'pt-6 mt-6 border-t border-border' : ''}>
                    <div className="stat-value">{item.val}</div>
                    <p className="stat-label mt-1">{item.label}</p>
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

export default SupportSection;
