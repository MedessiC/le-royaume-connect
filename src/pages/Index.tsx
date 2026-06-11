import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import PillarsSection from "@/components/PillarsSection";
import CommunitySection from "@/components/CommunitySection";
import LatestTeachingsSection from "@/components/LatestTeachingsSection";
import PopularTeachingsSection from "@/components/PopularTeachingsSection";
import CategoriesSection from "@/components/CategoriesSection";
import EngagementSection from "@/components/EngagementSection";
import MovementStatsSection from "@/components/MovementStatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StoriesSection from "@/components/StoriesSection";
import WorldTeachingsSection from "@/components/WorldTeachingsSection";
import GettingStartedSection from "@/components/GettingStartedSection";
import SupportSection from "@/components/SupportSection";
import LiveSection from "@/components/LiveSection";
import Footer from "@/components/Footer";
import FeaturedVideo from "@/components/FeaturedVideo";
import SocialFloating from "@/components/SocialFloating";
import { supabase } from "@/integrations/supabase/client";

type HomeSettings = {
  youtube_url: string | null;
  youtube_duration_days: number | null;
  youtube_expires_at: string | null;
  active: boolean;
  tiktok_url: string | null;
  youtube_channel_url: string | null;
  whatsapp_url: string | null;
  facebook_url: string | null;
  live_enabled: boolean;
  live_url: string | null;
  marquee_text: string | null;
  marquee_speed: number | null;
  carousel_images?: string[];
};

const Index = () => {
  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("home_settings").select("*").maybeSingle();
      if (data) setHomeSettings(data as HomeSettings);
    };

    loadSettings();
  }, []);

  const isLive = homeSettings?.live_enabled ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {homeSettings?.marquee_text ? (
        <section className="overflow-hidden border-b border-gold/20 bg-gold/10">
          <div className="marquee py-3 text-sm md:text-base text-midnight">
            <div
              className="marquee-content inline-flex items-center gap-6"
              style={{ animationDuration: `${Math.max(8, Math.min(homeSettings.marquee_speed ?? 22, 60))}s` }}
            >
              <span className="font-semibold flex-shrink-0">COMMUNIQUÉ :</span>
              <span>{homeSettings.marquee_text}</span>
              <span className="font-semibold flex-shrink-0">·</span>
              <span>{homeSettings.marquee_text}</span>
              <span className="font-semibold flex-shrink-0">·</span>
              <span>{homeSettings.marquee_text}</span>
              <span className="font-semibold flex-shrink-0">COMMUNIQUÉ :</span>
              <span>{homeSettings.marquee_text}</span>
              <span className="font-semibold flex-shrink-0">·</span>
              <span>{homeSettings.marquee_text}</span>
            </div>
          </div>
        </section>
      ) : null}
      <HeroSection
        slides={homeSettings?.carousel_images?.filter(Boolean).map((src, index) => ({
          src,
          alt: `Image ${index + 1}`,
        }))}
      />
      <LiveSection liveEnabled={homeSettings?.live_enabled ?? false} liveUrl={homeSettings?.live_url ?? null} />
      <FeaturedVideo settings={homeSettings} />
      <MissionSection />
      <LatestTeachingsSection />
      <PopularTeachingsSection />
      <TestimonialsSection />
      <StoriesSection />
      <WorldTeachingsSection />
      <PillarsSection />
      <CategoriesSection />
      <MovementStatsSection />
      <GettingStartedSection />
      <CommunitySection />
      <EngagementSection />
      <SupportSection />
      <Footer />
      <SocialFloating
        tiktok_url={homeSettings?.tiktok_url ?? null}
        youtube_channel_url={homeSettings?.youtube_channel_url ?? null}
        whatsapp_url={homeSettings?.whatsapp_url ?? null}
        facebook_url={homeSettings?.facebook_url ?? null}
        live={isLive}
        live_url={homeSettings?.live_url ?? null}
      />
    </div>
  );
};

export default Index;
