import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Popup = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  frequency_days: number;
  pages: string[];
  bg_color: string;
  text_color: string;
  accent_color: string;
  animation_type: string;
  position: string;
};

type PopupManagerProps = {
  currentPage?: string;
};

const PopupManager = ({ currentPage = 'home' }: PopupManagerProps) => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [visiblePopups, setVisiblePopups] = useState<string[]>([]);

  useEffect(() => {
    const loadPopups = async () => {
      const { data } = await supabase
        .from('popups')
        .select('*')
        .eq('is_active', true);

      if (data) {
        const popupsList = data.map(p => ({
          ...p,
          pages: Array.isArray(p.pages) ? p.pages : (typeof p.pages === 'string' ? JSON.parse(p.pages) : ['all']),
        })) as Popup[];

        const newVisiblePopups: string[] = [];

        for (const popup of popupsList) {
          // Check if popup should appear on this page
          if (popup.pages.includes('all') || popup.pages.includes(currentPage)) {
            // Check frequency using localStorage
            const lastShownKey = `popup_shown_${popup.id}`;
            const lastShown = localStorage.getItem(lastShownKey);
            const now = Date.now();

            if (!lastShown) {
              // Never shown before
              newVisiblePopups.push(popup.id);
              localStorage.setItem(lastShownKey, now.toString());
            } else if (popup.frequency_days > 0) {
              // Check if enough days have passed
              const lastShownTime = parseInt(lastShown);
              const daysSince = (now - lastShownTime) / (1000 * 60 * 60 * 24);
              
              if (daysSince >= popup.frequency_days) {
                newVisiblePopups.push(popup.id);
                localStorage.setItem(lastShownKey, now.toString());
              }
            }
            // If frequency_days is 0, always show
            else if (popup.frequency_days === 0) {
              newVisiblePopups.push(popup.id);
            }
          }
        }

        setPopups(popupsList);
        setVisiblePopups(newVisiblePopups);
      }
    };

    loadPopups();
  }, [currentPage]);

  const closePopup = (popupId: string) => {
    setVisiblePopups(visiblePopups.filter(id => id !== popupId));
  };

  const handleCTA = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'topLeft':
        return 'top-4 left-4 sm:top-8 sm:left-8';
      case 'topRight':
        return 'top-4 right-4 sm:top-8 sm:right-8';
      case 'bottomLeft':
        return 'bottom-4 left-4 sm:bottom-8 sm:left-8';
      case 'bottomRight':
        return 'bottom-4 right-4 sm:bottom-8 sm:right-8';
      default: // center
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getAnimationClasses = (animationType: string) => {
    switch (animationType) {
      case 'slideDown':
        return 'animate-in slide-in-from-top-4 duration-500';
      case 'zoom':
        return 'animate-in zoom-in duration-500';
      case 'bounce':
        return 'animate-in bounce duration-700';
      default: // fade
        return 'animate-in fade-in duration-500';
    }
  };

  return (
    <>
      {visiblePopups.map(popupId => {
        const popup = popups.find(p => p.id === popupId);
        if (!popup) return null;

        return (
          <div
            key={popup.id}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${
              popup.position === 'center' ? 'bg-black/50' : ''
            }`}
            onClick={() => popup.position === 'center' && closePopup(popup.id)}
          >
            <div
              className={`relative w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                popup.position !== 'center' ? 'max-w-sm' : ''
              } ${getAnimationClasses(popup.animation_type)}`}
              style={{
                backgroundColor: popup.bg_color,
                color: popup.text_color,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => closePopup(popup.id)}
                className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close popup"
              >
                <X size={24} />
              </button>

              {/* Image */}
              {popup.image_url && (
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  <img
                    src={popup.image_url}
                    alt={popup.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-display">
                  {popup.title}
                </h2>

                {popup.description && (
                  <p className="text-base sm:text-lg mb-6 leading-relaxed opacity-90">
                    {popup.description}
                  </p>
                )}

                {/* CTA Button */}
                {popup.cta_text && (
                  <Button
                    onClick={() => handleCTA(popup.cta_url)}
                    className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all hover:scale-105"
                    style={{
                      backgroundColor: popup.accent_color,
                      color: popup.text_color,
                    }}
                  >
                    {popup.cta_text}
                  </Button>
                )}

                {/* Close text button if no CTA */}
                {!popup.cta_text && (
                  <button
                    onClick={() => closePopup(popup.id)}
                    className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all border-2 border-current hover:opacity-70"
                  >
                    Fermer
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default PopupManager;
