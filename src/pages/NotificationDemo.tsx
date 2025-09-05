import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  BellIcon, 
  PlayIcon, 
  PauseIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  createPaymentReceivedNotification,
  createPaymentSentNotification,
  createPaymentRequestNotification,
  createSplitBillNotification,
  createQRScanNotification,
  createSystemNotification,
  createReminderNotification,
  simulateRealTimeNotifications
} from '../services/notificationService';

const NotificationDemo: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    settings,
    addNotification,
    markAllAsRead,
    updateSettings,
    requestNotificationPermission
  } = useNotifications();

  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  const handlePlayDemo = () => {
    if (!user) return;
    
    setIsPlaying(true);
    simulateRealTimeNotifications(user.id, addNotification);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 15000); // 15 seconds for all notifications
  };

  const handleAddNotification = (type: string) => {
    if (!user) return;

    const notificationCreators = {
      payment_received: () => createPaymentReceivedNotification(user.id, 25.50, 'Sarah Wilson', 'demo_txn_1'),
      payment_sent: () => createPaymentSentNotification(user.id, 15.00, 'Mike Johnson', 'demo_txn_2'),
      payment_request: () => createPaymentRequestNotification(user.id, 30.00, 'Emma Davis', 'demo_req_1'),
      split_bill: () => createSplitBillNotification(user.id, 'Demo Dinner', 60.00, 'Alex Brown', 'demo_bill_1'),
      qr_scan: () => createQRScanNotification(user.id, 10.00, 'Demo User'),
      system: () => createSystemNotification(user.id, 'Demo System Alert', 'This is a demo system notification'),
      reminder: () => createReminderNotification(user.id, 'Demo Reminder', 'Don\'t forget to check your payments!'),
    };

    const creator = notificationCreators[type as keyof typeof notificationCreators];
    if (creator) {
      addNotification(creator());
    }
  };

  const getNotificationStats = () => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType: {
        payment: notifications.filter(n => n.category === 'payment').length,
        request: notifications.filter(n => n.category === 'request').length,
        system: notifications.filter(n => n.category === 'system').length,
        reminder: notifications.filter(n => n.category === 'reminder').length,
      },
      byPriority: {
        urgent: notifications.filter(n => n.priority === 'urgent').length,
        high: notifications.filter(n => n.priority === 'high').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        low: notifications.filter(n => n.priority === 'low').length,
      }
    };
    return stats;
  };

  const stats = getNotificationStats();

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view notification demo.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test and manage real-time notifications
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Unread</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byPriority.high + stats.byPriority.urgent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Settings</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {settings?.soundEnabled ? 'Sound On' : 'Sound Off'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demo Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Demo Controls
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Play Demo */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Simulation</h4>
            <button
              onClick={handlePlayDemo}
              disabled={isPlaying}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-5 h-5" />
                  <span>Playing Demo...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Play Full Demo</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Simulates 5 different notification types over 15 seconds
            </p>
          </div>

          {/* Individual Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Individual Tests</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'payment_received', label: 'Payment Received', emoji: '💰' },
                { type: 'payment_sent', label: 'Payment Sent', emoji: '⚡' },
                { type: 'payment_request', label: 'Payment Request', emoji: '💳' },
                { type: 'split_bill', label: 'Split Bill', emoji: '🧾' },
                { type: 'qr_scan', label: 'QR Scan', emoji: '📱' },
                { type: 'system', label: 'System', emoji: '🔔' },
                { type: 'reminder', label: 'Reminder', emoji: '⏰' },
              ].map((notification) => (
                <button
                  key={notification.type}
                  onClick={() => handleAddNotification(notification.type)}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <span>{notification.emoji}</span>
                  <span>{notification.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Request */}
        {!permissionGranted && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Browser Notifications</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Enable browser notifications to receive alerts even when the app is not active
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Enable
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Notification Settings
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">General</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings?.pushNotifications || false}
                  onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings?.soundEnabled || false}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sound Effects</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings?.vibrationEnabled || false}
                  onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Vibration</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Categories</h4>
            <div className="space-y-3">
              {Object.entries(settings?.categories || { payment: true, request: true, system: true, reminder: true }).map(([category, enabled]) => (
                <label key={category} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateSettings({
                      categories: {
                        payment: settings?.categories?.payment ?? true,
                        request: settings?.categories?.request ?? true,
                        system: settings?.categories?.system ?? true,
                        reminder: settings?.categories?.reminder ?? true,
                        [category]: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {category} notifications
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={markAllAsRead}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </motion.div>

      {/* Notification List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Recent Notifications ({notifications.length})
        </h3>

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Use the demo controls above to create some notifications
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{notification.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                        notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationDemo;
