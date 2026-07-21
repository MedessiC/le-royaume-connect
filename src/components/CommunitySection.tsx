import { FaGlobeEurope, FaComments, FaBookOpen, FaDonate } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const features = [
  { icon: FaGlobeEurope, title: "Communauté Mondiale", desc: "Connectez-vous avec des frères et sœurs du monde entier" },
  { icon: FaComments, title: "Forums & Échanges", desc: "Débattez, partagez et grandissez ensemble dans la foi" },
  { icon: FaBookOpen, title: "Enseignements", desc: "Accédez aux prédications, études bibliques et contenus spirituels" },
  { icon: FaDonate, title: "Soutenir L'œuvre", desc: "Soutenez le mouvement via Mobile Money ou carte bancaire" },
];

const CommunitySection = () => {
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
    <section id="community" className="relative overflow-hidden py-24 md:py-32 bg-slate-950 text-white">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%_/_0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Pourquoi Nous Rejoindre
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Un Espace Souverain pour <span className="text-gradient-gold">Chaque Membre</span>
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
            Notre plateforme réunit foi, enseignement et fraternité dans un espace numérique unique.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center hover:border-gold/40 hover:bg-white/10 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl border border-gold/30 bg-gold/15 flex items-center justify-center mx-auto mb-5 text-gold group-hover:scale-105 transition-transform">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="font-body text-xs text-white/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
