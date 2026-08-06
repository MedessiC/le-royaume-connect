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
import DonationPopup from "@/components/DonationPopup";
import SEO from "@/components/SEO";
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
  carousel_slides?: { image_url?: string; pretitle?: string; title?: string; description?: string }[];
};

const Index = () => {
  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase.from("home_settings").select("*").limit(1).single();
      if (error) {
        console.error("Error loading home settings:", error.message, error.details);
      }
      if (data) {
        const settings = data as HomeSettings & { carousel_images?: string[] };

        // Normalize carousel image URLs: if stored value is a raw storage path or non-http URL,
        // attempt to generate an accessible URL (public or signed) from the Supabase storage.
        if (Array.isArray(settings.carousel_images) && settings.carousel_images.length > 0) {
          const normalized = await Promise.all(
            settings.carousel_images.map(async (img) => {
              if (!img) return img;
              // If already absolute URL, keep it
              if (/^https?:\/\//i.test(img)) return img;

              // If appears to be a storage path (may start with bucket/ or /teaching-media/...), try to create a signed URL
              try {
                const bucket = "teaching-media";
                // Trim leading slashes
                const path = img.replace(/^\/*/, "");
                // Try public URL first
                const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
                if (publicData?.publicUrl) {
                  return publicData.publicUrl;
                }

                // Fallback: create a short-lived signed URL
                const { data: signed, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
                if (signed?.signedUrl) return signed.signedUrl;
                console.warn("Could not create signed URL for", path, error);
                return img;
              } catch (e) {
                console.error("Error normalizing carousel image", img, e);
                return img;
              }
            }),
          );

          settings.carousel_images = normalized;
        }

        setHomeSettings(settings as HomeSettings);
      }
    };

    loadSettings();
    // If Supabase sent tokens in the URL hash to the root, forward to /auth/reset preserving the hash
    try {
      if (typeof window !== "undefined") {
        const hash = window.location.hash || "";
        if (hash.includes("access_token") && !window.location.pathname.startsWith("/auth/reset")) {
          // preserve hash when redirecting
          window.location.replace(`/auth/reset${hash}`);
          return;
        }
      }
    } catch (e) {
      console.warn("Error checking URL hash for auth tokens", e);
    }
  }, []);

  const isLive = homeSettings?.live_enabled ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="MILLENIUM — Mouvement Mondial | ZOVIZO | Banikoara, Bénin"
        description="MILLENIUM est le mouvement spirituel mondial fondé par ZOVIZO à Banikoara, Bénin. Rejoignez des milliers de disciples autour de la vision du Règne Millénaire, de l'enseignement biblique et de la foi."
        path="/"
        keywords={[
          "ZOVIZO", "MILLENIUM", "Le Règne Millénaire", "Banikoara", "Bénin",
          "mouvement spirituel", "enseignement biblique", "foi chrétienne Afrique",
          "leregnemillenaire", "prophète Bénin", "communauté spirituelle mondiale",
          "milenium", "millénium", "règne millénaire", "enseignement spirituel",
          "prédication Bénin", "zoviso", "banikoira", "église Bénin",
        ]}
        withFAQ={true}
      />
      <Navbar />
      {homeSettings?.marquee_text ? (
        <section className="overflow-hidden border-b border-gold/20 bg-gold/10">
          <div className="marquee py-3 text-sm md:text-base text-midnight">
            <div
              className="marquee-content inline-flex items-center gap-6"
              style={{ animationDuration: `${Math.max(8, Math.min(homeSettings.marquee_speed ?? 45, 60))}s` }}
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
          src: index === 0 ? "/hero-1-optimized.webp" : index === 1 ? "/hero-2-optimized.webp" : src,
          alt: `Image ${index + 1}`,
          pretitle: homeSettings?.carousel_slides?.[index]?.pretitle,
          title: homeSettings?.carousel_slides?.[index]?.title,
          description: homeSettings?.carousel_slides?.[index]?.description,
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
      <DonationPopup />
    </div>
  );
};

export default Index;
