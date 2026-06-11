import { useEffect } from 'react';

const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js', { updateViaCache: 'none' })
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration);

            // Check for updates immediately and periodically
            registration.update().catch(err => console.log('Initial update check failed:', err));
            
            const updateInterval = setInterval(() => {
              registration.update().catch(err => console.log('Update check failed:', err));
            }, 30000); // Check every 30 seconds

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available - reload immediately
                    console.log('New version available! Reloading...');
                    
                    // Send message to new worker to clear cache
                    newWorker.postMessage({ type: 'CLEAR_CACHE' });
                    
                    // Force skip waiting and reload
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    
                    // Reload page after a short delay to ensure new worker is active
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                });
              }
            });
            
            // Cleanup interval on unmount
            return () => clearInterval(updateInterval);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);
};

export default useServiceWorker;
