import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon, 
  CogIcon, 
  InformationCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { AppNotification, AppNotificationSettings } from '../types/Notification';
import { enhancedNotificationService, NotificationChannel, NotificationTemplate, NotificationAnalytics } from '../services/enhancedNotificationService';
import { realtimeNotificationManager } from '../services/realtimeNotificationManager';

const EnhancedNotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    settings, 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    updateSettings 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [, setTemplates] = useState<NotificationTemplate[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [filteredNotifications, setFilteredNotifications] = useState<AppNotification[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const channelsData = enhancedNotificationService.getChannels();
      const templatesData = enhancedNotificationService.getTemplates();
      const analyticsData = enhancedNotificationService.getAnalytics();

      setChannels(channelsData);
      setTemplates(templatesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Filter notifications based on active tab
    let filtered = notifications;
    
    switch (activeTab) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'archived':
        filtered = notifications.filter(n => n.isArchived);
        break;
      default:
        filtered = notifications.filter(n => !n.isArchived);
    }

    setFilteredNotifications(filtered);
  }, [notifications, activeTab]);

  // Set up real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscriptionId = realtimeNotificationManager.subscribe(
      user.id,
      ['notification'],
      (event) => {
        if (event.type === 'notification') {
          addNotification(event.data);
        }
      }
    );

    return () => {
      realtimeNotificationManager.unsubscribe(subscriptionId);
    };
  }, [user, addNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <CurrencyDollarIcon className="w-5 h-5 text-green-500" />;
      case 'payment_sent':
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />;
      case 'security_alert':
        return <ShieldCheckIcon className="w-5 h-5 text-red-500" />;
      case 'budget_alert':
        return <ChartBarIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    enhancedNotificationService.updateChannel(channelId, { enabled });
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, enabled } : channel
    ));
  };

  const handleSettingsUpdate = (newSettings: Partial<AppNotificationSettings>) => {
    if (settings) {
      updateSettings(newSettings);
    }
  };

  const testNotification = () => {
    if (!user) return;

    const testNotification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> = {
      type: 'system',
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify your settings are working correctly.',
      userId: user.id,
      priority: 'medium',
      category: 'system',
      actionUrl: '/notifications',
      actionText: 'View Settings',
      icon: '🧪',
      metadata: {
        test: true
      }
    };

    addNotification(testNotification);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <CogIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-3">
                {[
                  { id: 'all', label: 'All', count: notifications.length },
                  { id: 'unread', label: 'Unread', count: unreadCount },
                  { id: 'archived', label: 'Archived', count: notifications.filter(n => n.isArchived).length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Notification Settings
                </h4>
                
                {/* Channel Settings */}
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {channel.type === 'push' && <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />}
                        {channel.type === 'email' && <EnvelopeIcon className="w-4 h-4 text-gray-500" />}
                        {channel.type === 'sms' && <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500" />}
                        {channel.type === 'in_app' && <BellIcon className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {channel.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleChannelToggle(channel.id, !channel.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          channel.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            channel.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sound Settings */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {settings?.soundEnabled ? (
                        <SpeakerWaveIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <SpeakerXMarkIcon className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Sound
                      </span>
                    </div>
                    <button
                      onClick={() => handleSettingsUpdate({ soundEnabled: !settings?.soundEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings?.soundEnabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings?.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Test Button */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={testNotification}
                    className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Send Test Notification
                  </button>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'unread' ? 'No unread notifications' : 
                     activeTab === 'archived' ? 'No archived notifications' : 
                     'No notifications yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.actionText && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    if (notification.actionUrl) {
                                      window.location.href = notification.actionUrl;
                                    }
                                  }}
                                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                                >
                                  {notification.actionText}
                                </button>
                              )}
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Mark all as read
                  </button>
                  {analytics && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Delivery rate: {(analytics.deliveryRate * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNotificationCenter;
