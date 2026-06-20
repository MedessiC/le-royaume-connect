import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

type Slide = {
  src?: string;
  alt: string;
  color?: string;
  pretitle?: string;
  title?: string;
  description?: string;
};

const defaultSlides: Slide[] = [
  {
    alt: "Hero image 1",
    color: "bg-gradient-to-r from-blue-600 to-purple-600",
    pretitle: "Mouvement mondial",
    title: "MILLENIUM",
    description:
      "Une ère nouvelle à nulle autre pareille\nUne Seule référence: L'Afrique de l'Ouest\nUn seul rassemblement, une seule fois\nUn seul peuple\nUne seule Communauté\nUne seule dynastie\n\nUn Seul Lieu de Convergence:\nLa Poubligea da Beni. La République du Bénin\nBANIKOARA: SION KonG.\n\nBienvenu à BANIKOARA: SION nouvelle",
  },
  {
    alt: "Hero image 2",
    color: "bg-gradient-to-r from-purple-600 to-pink-600",
    pretitle: "Unité et Service",
    title: "COMMUNAUTÉ",
    description: "Rencontrez des frères et soeurs engagés, servons ensemble et grandissons dans la foi.",
  },
  {
    alt: "Hero image 3",
    color: "bg-gradient-to-r from-pink-600 to-blue-600",
    pretitle: "Prière en Action",
    title: "MISSION",
    description: "Participez à nos projets locaux et internationaux pour impacter des vies concrètement.",
  },
];

type HeroSectionProps = {
  slides?: Slide[];
};

const HeroSection = ({ slides }: HeroSectionProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlides = slides && slides.length ? slides : defaultSlides;
  const currentSlide = activeSlides[activeIndex] || {};
  const descriptionLines = (currentSlide.description || "").split('\n').filter(Boolean);

  useEffect(() => {
    if (!carouselApi) return;

    // clear existing
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        carouselApi.scrollNext();
      }, 4200);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [carouselApi, isPaused]);

  // Sync active text with carousel selected slide
  useEffect(() => {
    if (!carouselApi) return;

    const updateIndex = () => {
      try {
        const idx = carouselApi.selectedScrollSnap?.() ?? 0;
        setActiveIndex(idx);
      } catch (e) {
        setActiveIndex(0);
      }
    };

    updateIndex();
    carouselApi.on?.("select", updateIndex);
    carouselApi.on?.("reInit", updateIndex);

    return () => {
      carouselApi.off?.("select", updateIndex);
      carouselApi.off?.("reInit", updateIndex);
    };
  }, [carouselApi]);

  return (
    <section
      className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
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
                <div className={`relative w-full h-full ${slide.color || 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
                  {slide.src && (
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      loading="lazy"
                      className="block w-full h-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                    />
                  )}
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
            {activeSlides[activeIndex] && (
              <div key={activeIndex} className="inline-block">
                <p className="text-gold font-body text-sm tracking-[0.35em] uppercase mb-4 animate-fade-in-up">
                  {activeSlides[activeIndex].pretitle ?? "Mouvement mondial"}
                </p>
                <h1
                  className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-[#FFD700] leading-tight mb-6 animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {activeSlides[activeIndex].title ?? "MILLENIUM"}
                </h1>
                <div className="text-white/90 font-body max-w-3xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  {descriptionLines.length > 0 ? (
                    descriptionLines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          "mx-auto " + (i === 0 ? "text-lg sm:text-xl md:text-2xl font-semibold" : "text-base sm:text-lg md:text-xl")
                        }
                      >
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-base sm:text-lg md:text-xl">
                      Depuis Banikoara, Bénin, jusqu'aux quatre coins du monde — une communauté unie dans la foi, la prière et l'action.
                    </p>
                  )}
                </div>
              </div>
            )}
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

          {/* Dots indicators */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "bg-white/90 scale-100" : "bg-white/40 scale-90"
                }`}
                onClick={() => carouselApi?.scrollTo(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
