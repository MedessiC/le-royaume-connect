/**
 * Version checking and update detection
 * Monitors for new versions of the app and prompts user to refresh
 */

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_FILE = '/version.txt';

interface VersionInfo {
  version: string;
  timestamp: number;
}

let currentVersion: string | null = null;

/**
 * Initialize version checking
 * Periodically checks for new versions and notifies the user
 */
export const initVersionCheck = (onUpdateAvailable?: () => void) => {
  // Get initial version
  fetchVersion().then((version) => {
    currentVersion = version;
    console.log('App version:', version);
  });

  // Check for updates periodically
  setInterval(async () => {
    const newVersion = await fetchVersion();
    
    if (currentVersion && newVersion && newVersion !== currentVersion) {
      console.log('New version available:', newVersion);
      
      if (onUpdateAvailable) {
        onUpdateAvailable();
      } else {
        // Default behavior: notify user
        notifyUpdate();
      }
    }
  }, VERSION_CHECK_INTERVAL);
};

/**
 * Fetch the current version from server
 */
async function fetchVersion(): Promise<string | null> {
  try {
    // Add timestamp to bypass cache
    const response = await fetch(`${VERSION_FILE}?t=${Date.now()}`);
    
    if (!response.ok) {
      console.warn('Failed to fetch version:', response.status);
      return null;
    }
    
    const version = await response.text();
    return version.trim();
  } catch (error) {
    console.error('Error fetching version:', error);
    return null;
  }
}

/**
 * Show update notification to user
 */
function notifyUpdate() {
  // Try to use native notification first
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Mise à jour disponible', {
      body: 'Une nouvelle version de l\'application est disponible. Rechargez la page pour mettre à jour.',
      icon: '/favicon.ico',
    });
  }

  // Also show in-app banner if available
  showUpdateBanner();
}

/**
 * Show in-app update banner
 */
function showUpdateBanner() {
  // Check if banner already exists
  if (document.getElementById('version-update-banner')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'version-update-banner';
  banner.className = 'fixed top-0 left-0 right-0 bg-yellow-400 text-black px-4 py-3 text-center z-50 shadow-lg';
  banner.innerHTML = `
    <div class="flex items-center justify-center gap-4">
      <span class="font-semibold">🔄 Une nouvelle version est disponible</span>
      <button onclick="location.reload()" class="bg-black text-white px-4 py-1 rounded font-semibold hover:bg-gray-800">
        Recharger
      </button>
      <button onclick="document.getElementById('version-update-banner')?.remove()" class="text-gray-600 hover:text-black">
        ✕
      </button>
    </div>
  `;
  
  document.body.insertBefore(banner, document.body.firstChild);
}

/**
 * Request notification permission (optional)
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
};

/**
 * Manual version check
 */
export const checkForUpdates = async (): Promise<boolean> => {
  const newVersion = await fetchVersion();
  
  if (currentVersion && newVersion && newVersion !== currentVersion) {
    console.log('Update available:', currentVersion, '->', newVersion);
    return true;
  }
  
  return false;
};

/**
 * Force reload with cache clearing
 */
export const forceReload = () => {
  // Clear service worker cache if available
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }

  setTimeout(() => {
    window.location.reload();
  }, 100);
};
