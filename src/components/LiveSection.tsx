import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Radio, Zap } from "lucide-react";

type Props = {
  liveEnabled: boolean;
  liveUrl: string | null;
};

const LiveSection = ({ liveEnabled, liveUrl }: Props) => {
  if (!liveEnabled || !liveUrl) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-royal/80 via-royal/70 to-gold/40">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-gold/30 bg-royal/20 backdrop-blur-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-3 h-3 rounded-full bg-red-500 animate-pulse">
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                </div>
                <p className="text-sm font-semibold text-gold uppercase tracking-[0.15em]">En direct maintenant</p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Rejoignez la transmission en direct
              </h2>
              <p className="text-primary-foreground/90 max-w-lg">
                Connectez-vous en direct avec notre communauté. Suivez les enseignements, les prières et les moments forts du mouvement.
              </p>
            </div>
            <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-royal hover:bg-white/90 font-semibold px-8">
                <Radio className="w-5 h-5 mr-2 animate-pulse" /> Regarder en direct
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSection;
