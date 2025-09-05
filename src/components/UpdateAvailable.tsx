import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../contexts/PWAContext';
import { 
  ArrowPathIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const UpdateAvailable: React.FC = () => {
  const { updateAvailable, updateApp } = usePWA();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!updateAvailable || isDismissed) {
    return null;
  }

  const handleUpdate = () => {
    updateApp();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-medium">
              New version available! Update to get the latest features.
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-500 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Update</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-blue-200 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateAvailable;
