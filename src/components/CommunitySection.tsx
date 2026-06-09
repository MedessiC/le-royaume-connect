import { FaGlobeEurope, FaComments, FaBookOpen, FaDonate } from "react-icons/fa";

const features = [
  { icon: FaGlobeEurope, title: "Communauté mondiale", desc: "Connectez-vous avec des frères et sœurs du monde entier" },
  { icon: FaComments, title: "Forums & Échanges", desc: "Débattez, partagez et grandissez ensemble dans la foi" },
  { icon: FaBookOpen, title: "Enseignements", desc: "Accédez aux prédications, études bibliques et contenus spirituels" },
  { icon: FaDonate, title: "Soutenir", desc: "Soutenez l'œuvre via Mobile Money ou carte bancaire" },
];

const CommunitySection = () => {
  return (
    <section id="community" className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-3">Pourquoi nous rejoindre</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Un espace pour <span className="text-gradient-gold">chaque membre</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="bg-primary-foreground/5 backdrop-blur-sm border border-gold/10 rounded-lg p-6 text-center hover:border-gold/30 transition-colors">
              <f.icon className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-primary-foreground mb-2">{f.title}</h3>
              <p className="font-body text-sm text-primary-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
