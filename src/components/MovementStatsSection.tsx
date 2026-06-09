import { useEffect, useState } from "react";
import { Users, BookOpen, Globe, Heart } from "lucide-react";

const stats = [
  { icon: Users, label: "Membres mondiaux", value: "actifs" },
  { icon: BookOpen, label: "Enseignements", value: "partagés" },
  { icon: Globe, label: "Pays représentés", value: "connectés" },
  { icon: Heart, label: "Une communauté", value: "unie" },
];

const MovementStatsSection = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Un mouvement, une vision
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Depuis Banikoara jusqu'aux quatre coins du monde, le Règne Millénaire grandit chaque jour.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-primary-foreground/10 backdrop-blur-sm border border-gold/20 rounded-2xl p-8 text-center hover:border-gold/50 transition-all">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">{stat.value}</h3>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MovementStatsSection;
