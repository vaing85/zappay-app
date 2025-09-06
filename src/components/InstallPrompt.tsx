import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../contexts/PWAContext';
import { 
  DevicePhoneMobileIcon, 
  XMarkIcon,
  ArrowDownTrayIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

const InstallPrompt: React.FC = () => {
  const { canInstall, installApp, isInstalled, isOnline } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('zappay-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('zappay-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Install ZapPay
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Get the full app experience with offline access and push notifications.
              </p>
              
              {/* Online/Offline Status */}
              <div className="flex items-center space-x-2 mt-2">
                {isOnline ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <WifiIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                    <SignalSlashIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Offline Mode</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Install App</span>
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
