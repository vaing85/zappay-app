import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../contexts/PWAContext';
import { 
  SignalSlashIcon, 
  WifiIcon
} from '@heroicons/react/24/outline';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOfflineMode, pendingTransactions } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <SignalSlashIcon className="w-5 h-5" />
            <span className="font-medium">
              You're offline - Some features may be limited
            </span>
            {pendingTransactions.length > 0 && (
              <span className="text-orange-200">
                ({pendingTransactions.length} pending)
              </span>
            )}
          </div>
        </motion.div>
      )}
      
      {isOnline && isOfflineMode && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiIcon className="w-5 h-5" />
            <span className="font-medium">
              Back online - Syncing data...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
