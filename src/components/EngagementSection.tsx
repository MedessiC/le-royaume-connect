import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Users, Heart, Bookmark } from "lucide-react";

const actions = [
  {
    icon: MessageCircle,
    title: "Rejoindre la discussion",
    desc: "Participez aux échanges fraternels avec la communauté",
    link: "/community",
    variant: "default",
  },
  {
    icon: Users,
    title: "Découvrir les profils",
    desc: "Connectez-vous avec d'autres membres du monde",
    link: "/feed",
    variant: "secondary",
  },
  {
    icon: Bookmark,
    title: "Créer vos collections",
    desc: "Organisez vos enseignements favoris",
    link: "/account",
    variant: "secondary",
  },
  {
    icon: Heart,
    title: "Soutenir l'œuvre",
    desc: "Contribuer au développement du mouvement",
    link: "/donate",
    variant: "default",
  },
];

const EngagementSection = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Agissez</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Engagez-vous
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Il existe plusieurs façons de participer et de soutenir notre communauté mondiale.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link} className="group">
                <div className="h-full rounded-2xl border border-border bg-card p-6 hover:border-gold/50 transition-all hover:shadow-royal flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">{action.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{action.desc}</p>
                  <Button variant={action.variant as any} size="sm" className="w-full">
                    Accéder
                  </Button>
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
