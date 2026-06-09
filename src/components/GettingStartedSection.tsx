import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Créer votre compte",
    description: "Rejoignez notre communauté mondiale en créant un profil personnel",
    icon: "👤",
  },
  {
    number: "2",
    title: "Explorez les enseignements",
    description: "Découvrez des contenus spirituels de qualité d'auteurs du monde entier",
    icon: "📚",
  },
  {
    number: "3",
    title: "Connectez-vous",
    description: "Participez aux discussions, posez vos questions, partagez vos expériences",
    icon: "🤝",
  },
  {
    number: "4",
    title: "Partagez et soutenez",
    description: "Contribuez en partageant vos propres enseignements ou en soutenant l'œuvre",
    icon: "✨",
  },
];

const GettingStartedSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gold-dark font-body text-sm tracking-[0.2em] uppercase mb-3">Commencer</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Quatre étapes pour débuter
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rejoindre le Règne Millénaire est simple. Voici comment commencer votre voyage spirituel avec nous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && index % 2 === 0 && (
                <div className="hidden md:block absolute -right-4 top-1/2 w-8 h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
              )}

              <div className="rounded-2xl border border-gold/20 bg-card p-6 hover:border-gold/50 transition-all hover:shadow-royal">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="inline-flex w-6 h-6 rounded-full bg-gold text-foreground text-xs font-bold items-center justify-center">
                        {step.number}
                      </span>
                      <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-foreground">
                Créer un compte <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button size="lg" variant="secondary">
                Commencer à explorer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedSection;
