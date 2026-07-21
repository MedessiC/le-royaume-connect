import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Slide = {
  src?: string;
  alt: string;
  color?: string;
  pretitle?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
};

const defaultSlides: Slide[] = [
  {
    alt: "Vision Millenium",
    color: "from-slate-950 via-slate-900 to-indigo-950",
    pretitle: "Mouvement Mondial · Banikoara",
    title: "Unir les peuples dans la foi et la vérité",
    description: "Une vision souveraine née à Banikoara pour rassembler une communauté dispersée à travers les nations.",
    ctaText: "Rejoindre la communauté",
    ctaLink: "/community",
  },
  {
    alt: "Communauté & Service",
    color: "from-slate-950 via-slate-900 to-blue-950",
    pretitle: "Fraternité & Engagement",
    title: "Bâtir ensemble un avenir de foi et de service",
    description: "Accédez aux enseignements, échangez en toute souveraineté et participez activement à l'œuvre du Règne.",
    ctaText: "Découvrir les enseignements",
    ctaLink: "/feed",
  },
  {
    alt: "Mission & Projets",
    color: "from-slate-950 via-slate-900 to-slate-950",
    pretitle: "Action Spirituelle & Sociale",
    title: "Impacter des vies sur chaque continent",
    description: "Découvrez nos projets locaux et internationaux pour soutenir la jeunesse et étendre l'œuvre du Mouvement.",
    ctaText: "Soutenir notre mission",
    ctaLink: "/donate",
  },
];

type HeroSectionProps = {
  slides?: Slide[];
};

const DURATION_MS = 7000;

const HeroSection = ({ slides }: HeroSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const activeSlides = slides && slides.length ? slides : defaultSlides;
  const currentSlide = activeSlides[activeIndex] || defaultSlides[0];

  // Timer & progress bar handling (Microsoft style)
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= DURATION_MS) {
        setActiveIndex((prev) => (prev + 1) % activeSlides.length);
        setProgress(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeIndex, isPlaying, activeSlides.length]);

  const handleSelectSlide = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
  };

  return (
    <section className="relative min-h-[88vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      
      {/* Background Images / Gradients with Microsoft-style crossfade */}
      <div className="absolute inset-0 w-full h-full">
        {activeSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 -z-10"
              }`}
            >
              {slide.src ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${slide.color || "from-slate-950 to-slate-900"}`} />
              )}
              
              {/* Microsoft-style clean gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            </div>
          );
        })}
      </div>

      {/* Main Container - Left-aligned Microsoft-inspired Hero Layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20 flex flex-col justify-between min-h-[82vh]">
        
        {/* Content Box */}
        <div className="max-w-2xl my-auto py-8">
          {/* Headline */}
          <h1 key={activeIndex} className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
            {currentSlide.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="font-body text-base sm:text-lg text-white/80 leading-relaxed max-w-xl mb-8">
            {currentSlide.description}
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link to={currentSlide.ctaLink || "/community"}>
              <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-slate-950 font-bold px-8 py-3.5 rounded-lg text-sm transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-gold/40">
                {currentSlide.ctaText || "Rejoindre la communauté"}
              </Button>
            </Link>

            <a href="#mission" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/90 hover:text-gold transition-colors py-3 px-4">
              <span>Découvrir notre mission</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Microsoft-style Hero Controls Bar (Bottom Navigation & Progress Indicator) */}
        <div className="w-full pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Slide Progress Tabs (Numbered 01, 02, 03) */}
          <div className="flex items-center gap-6 w-full sm:w-auto">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSlide(idx)}
                  className={`group flex flex-col gap-1 text-left transition-all ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                    <span>0{idx + 1}</span>
                    <span className="hidden md:inline font-medium text-[0.75rem] truncate max-w-[120px]">
                      {slide.alt.replace("Millenium", "").trim()}
                    </span>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-16 sm:w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gold transition-all duration-75 ${
                        isActive ? "" : "w-0"
                      }`}
                      style={{ width: isActive ? `${progress}%` : "0%" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Microsoft Play/Pause & Arrow Navigation Controls */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Play/Pause Toggle Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Mettre en pause le carrousel" : "Démarrer le carrousel"}
              className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              aria-label="Diapositive précédente"
              className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              aria-label="Diapositive suivante"
              className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Subtle bottom gradient fade to page body */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default HeroSection;
