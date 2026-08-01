import { useEffect, useRef, useState } from "react";
import { Users, BookOpen, Globe, Heart } from "lucide-react";

const stats = [
  { icon: Users, label: "Membres mondiaux", value: "Actifs", numeral: "∞" },
  { icon: BookOpen, label: "Enseignements", value: "Partagés", numeral: "100+" },
  { icon: Globe, label: "Pays représentés", value: "Connectés", numeral: "50+" },
  { icon: Heart, label: "Une communauté", value: "Unie", numeral: "100%" },
];

const MovementStatsSection = () => {
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
    <section className="relative overflow-hidden py-12 md:py-32 bg-slate-950 text-white">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%_/_0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-gold text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
            Notre Mouvement
          </div>
          <h2 className="mx-auto max-w-[250px] font-display text-2xl leading-tight md:max-w-none md:text-5xl font-extrabold text-white tracking-tight mb-3 md:mb-4">
            Un Mouvement, Une Vision
          </h2>
          <p className="text-white/70 max-w-[280px] md:max-w-xl mx-auto text-xs md:text-sm leading-relaxed">
            Depuis Banikoara jusqu'aux quatre coins du monde, le Règne Millénaire grandit chaque jour.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`rounded-xl md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 md:p-8 text-center transition-all duration-500 hover:border-gold/40 hover:bg-white/10 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto mb-2 md:mb-4 text-gold">
                  <Icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="font-display text-2xl md:text-3xl font-extrabold text-gold mb-0.5 md:mb-1">
                  {stat.numeral}
                </div>
                <p className="text-[10px] md:text-xs font-semibold text-white tracking-wide md:tracking-wider uppercase mb-0.5">{stat.label}</p>
                <p className="text-[10px] md:text-[0.7rem] text-white/50">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MovementStatsSection;
