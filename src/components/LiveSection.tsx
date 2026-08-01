import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Radio, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  liveEnabled: boolean;
  liveUrl: string | null;
};

const LiveSection = ({ liveEnabled, liveUrl }: Props) => {
  if (!liveEnabled || !liveUrl) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-950 text-white relative overflow-hidden border-y border-gold/30">
      {/* Glow backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 w-96 h-96 bg-gold/15 rounded-full blur-[140px]" />
        <div className="absolute right-10 bottom-0 w-80 h-80 bg-royal/25 rounded-full blur-[130px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 backdrop-blur-2xl p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  En direct maintenant
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Session officielle Millenium
                </span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Transmission en Direct de <span className="text-gold">Sion</span>
              </h2>

              <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                Rejoignez la communauté en direct. Suivez les enseignements, les moments forts et la prière en temps réel.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-gold text-slate-950 hover:bg-gold-light font-bold px-8 py-6 rounded-2xl shadow-gold hover:scale-105 transition-transform flex items-center gap-3 text-base"
                >
                  <Radio className="w-5 h-5 animate-pulse" aria-hidden="true" />
                  <span>Rejoindre le direct</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSection;