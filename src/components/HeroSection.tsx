import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

type Slide = {
  src: string;
  alt: string;
};

const defaultSlides: Slide[] = [
  { src: heroBg, alt: "Hero image 1" },
  { src: heroBg, alt: "Hero image 2" },
  { src: heroBg, alt: "Hero image 3" },
];

type HeroSectionProps = {
  slides?: Slide[];
};

const HeroSection = ({ slides }: HeroSectionProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const activeSlides = slides && slides.length ? slides : defaultSlides;

  useEffect(() => {
    if (!carouselApi) return;

    const interval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 4500);

    return () => window.clearInterval(interval);
  }, [carouselApi]);

  return (
    <section className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true, speed: 7, align: "center", draggable: true }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {activeSlides.map((slide, index) => (
              <CarouselItem key={index} className="relative w-full h-full flex-none basis-full">
                <div className="relative w-full h-full">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    loading="lazy"
                    className="block w-full h-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white/90 border-white/70 bg-black/30 hover:bg-black/40" />
          <CarouselNext className="text-white/90 border-white/70 bg-black/30 hover:bg-black/40" />
        </Carousel>
      </div>

      {/* Text Content */}
      <div className="relative z-10 container mx-auto px-4 flex items-center justify-center h-full">
        <div className="w-full max-w-4xl p-8 md:p-12">
          <div className="text-center text-white">
            <p className="text-gold font-body text-sm tracking-[0.35em] uppercase mb-4 animate-fade-in-up">
              Mouvement mondial
            </p>
            <h1
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-[#FFD700] leading-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              MILLENIUM
            </h1>
            <p
              className="text-white/90 font-body text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              Depuis Banikoara, Bénin, jusqu'aux quatre coins du monde — une communauté unie dans la foi, la prière et l'action.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link to="/community" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10">
                Voir la communauté
              </Button>
            </Link>
            <a href="#mission" className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto text-base px-10 bg-royal text-white border border-royal/90 hover:bg-royal/90"
              >
                Découvrir notre mission
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
