import React from 'react';
import { usePWA } from '../contexts/PWAContext';
import { 
  DevicePhoneMobileIcon,
  WifiIcon,
  SignalSlashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const PWAStatus: React.FC = () => {
  const { isInstalled, canInstall, isOnline, installApp } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400" title="App Installed">
        <DevicePhoneMobileIcon className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-medium">Installed</span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <button
        onClick={installApp}
        className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
        title="Install App"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-medium">Install</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400" title={isOnline ? "Online" : "Offline"}>
      {isOnline ? (
        <WifiIcon className="w-4 h-4" />
      ) : (
        <SignalSlashIcon className="w-4 h-4" />
      )}
      <span className="hidden sm:inline text-xs font-medium">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
};

export default PWAStatus;
