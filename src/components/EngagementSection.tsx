import { Link } from "react-router-dom";
import { MessageCircle, Users, Bookmark, Heart, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const actions = [
  { icon: MessageCircle, title: "Rejoindre les échanges", desc: "Participez aux discussions fraternelles", link: "/community", accent: "from-royal to-primary" },
  { icon: Users, title: "Découvrir la communauté", desc: "Connectez-vous avec d'autres membres", link: "/feed", accent: "from-primary to-royal-light" },
  { icon: Bookmark, title: "Vos collections", desc: "Organisez vos enseignements favoris", link: "/account", accent: "from-gold-dark to-gold" },
  { icon: Heart, title: "Soutenir l'œuvre", desc: "Contribuez au développement", link: "/donate", accent: "from-gold to-gold-light" },
];

const EngagementSection = () => {
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
          <div className="section-eyebrow mx-auto mb-2" style={{ width: "fit-content" }}>Agissez</div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">Engagez-vous</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
            Participez et soutenez notre mouvement mondial.
          </p>
        </div>

        {/* 2x2 grid on mobile, 4 columns on desktop */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} to={action.link} className="group">
                <div
                  className={`h-full card-elevated rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-500 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div>
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${action.accent} flex items-center justify-center mb-3 sm:mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-[0.7rem] sm:text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                      {action.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[0.75rem] font-bold text-primary pt-2 border-t border-border/50">
                    Accéder <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EngagementSection;
