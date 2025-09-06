import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  BellSlashIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePushNotifications } from '../contexts/PushNotificationContext';

interface PushNotificationSettingsProps {
  className?: string;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ className = '' }) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isInitialized,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const success = await subscribe();
      if (success) {
        setMessage({ type: 'success', text: 'Successfully subscribed to push notifications!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to subscribe to push notifications.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while subscribing.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const success = await unsubscribe();
      if (success) {
        setMessage({ type: 'success', text: 'Successfully unsubscribed from push notifications.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to unsubscribe from push notifications.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while unsubscribing.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await showLocalNotification('Test Notification', {
        body: 'This is a test notification from ZapCash!',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      setMessage({ type: 'success', text: 'Test notification sent!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification.' });
    }
  };

  const getStatusIcon = () => {
    if (!isSupported) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
    if (permission === 'denied') {
      return <BellSlashIcon className="w-5 h-5 text-red-500" />;
    }
    if (isSubscribed) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    return <BellIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!isSupported) {
      return 'Not supported in this browser';
    }
    if (permission === 'denied') {
      return 'Permission denied';
    }
    if (isSubscribed) {
      return 'Subscribed';
    }
    if (permission === 'granted') {
      return 'Ready to subscribe';
    }
    return 'Permission required';
  };

  const getStatusColor = () => {
    if (!isSupported || permission === 'denied') {
      return 'text-red-600 dark:text-red-400';
    }
    if (isSubscribed) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  if (!isInitialized) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Initializing push notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Push Notifications
        </h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Permission:</span>
          <span className={`text-sm font-medium ${
            permission === 'granted' ? 'text-green-600 dark:text-green-400' :
            permission === 'denied' ? 'text-red-600 dark:text-red-400' :
            'text-yellow-600 dark:text-yellow-400'
          }`}>
            {permission.charAt(0).toUpperCase() + permission.slice(1)}
          </span>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
              message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
              'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : message.type === 'error' ? (
              <ExclamationTriangleIcon className="w-4 h-4" />
            ) : (
              <InformationCircleIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          {!isSupported ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Push notifications are not supported in this browser.
            </div>
          ) : permission === 'denied' ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Push notifications are blocked. Please enable them in your browser settings.
            </div>
          ) : isSubscribed ? (
            <div className="flex space-x-2">
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
              <button
                onClick={handleTestNotification}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Test Notification
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={isLoading || permission !== 'granted'}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Receive real-time transaction notifications</p>
          <p>• Get security alerts and updates</p>
          <p>• Stay informed about your account activity</p>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
