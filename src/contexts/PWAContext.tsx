import React, { createContext, useContext, useState, useEffect } from 'react';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  installPrompt: any;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
  isOfflineMode: boolean;
  pendingTransactions: any[];
  syncPendingTransactions: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Service worker registered successfully
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          // Service worker registration failed
        });
    }

    // Check if app is installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInApp);
    };

    checkIfInstalled();

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineMode(false);
      // Sync pending transactions when coming back online
      syncPendingTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    // Install prompt result received
    
    if (result.outcome === 'accepted') {
      // App installed successfully
    } else {
      // App installation declined
    }
    
    setInstallPrompt(null);
    setCanInstall(false);
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  const syncPendingTransactions = async () => {
    try {
      // This would sync with the backend
      // Syncing pending transactions...
      setPendingTransactions([]);
    } catch (error) {
      console.error('Failed to sync pending transactions:', error);
    }
  };


  return (
    <PWAContext.Provider value={{
      isOnline,
      isInstalled,
      canInstall,
      installPrompt,
      installApp,
      updateAvailable,
      updateApp,
      isOfflineMode,
      pendingTransactions,
      syncPendingTransactions
    }}>
      {children}
    </PWAContext.Provider>
  );
};
