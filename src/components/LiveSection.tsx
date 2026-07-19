import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";

type Props = {
  liveEnabled: boolean;
  liveUrl: string | null;
};

const LiveSection = ({ liveEnabled, liveUrl }: Props) => {
  if (!liveEnabled || !liveUrl) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-royal-deep via-royal to-gold-dark">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-white/15 bg-black/15 backdrop-blur-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-3 h-3 rounded-full bg-destructive">
                  <div className="absolute inset-0 rounded-full bg-destructive/60 motion-safe:animate-ping" />
                </div>
                <p className="text-sm font-semibold text-gold-light uppercase tracking-[0.15em]">
                  En direct maintenant
                </p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Rejoignez la transmission en direct
              </h2>
              <p className="text-white/85 max-w-lg">
                Connectez-vous en direct avec notre communauté. Suivez les enseignements, les prières et les
                moments forts du mouvement.
              </p>
            </div>
            <Link to={liveUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <Button
                size="lg"
                variant="secondary"
                className="!bg-white !text-royal-deep hover:!bg-white/90 font-semibold px-8 focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-royal"
              >
                <Radio className="w-5 h-5 mr-2 motion-safe:animate-pulse" aria-hidden="true" />
                Regarder en direct
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSection;