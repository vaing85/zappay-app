import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { enhancedNotificationService, NotificationAnalytics, NotificationChannel, NotificationTemplate } from '../services/enhancedNotificationService';

const NotificationAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'templates' | 'performance'>('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const analyticsData = enhancedNotificationService.getAnalytics();
      const channelsData = enhancedNotificationService.getChannels();
      const templatesData = enhancedNotificationService.getTemplates();

      setAnalytics(analyticsData);
      setChannels(channelsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading notification analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'push':
        return <ComputerDesktopIcon className="w-6 h-6 text-blue-500" />;
      case 'email':
        return <EnvelopeIcon className="w-6 h-6 text-green-500" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-6 h-6 text-purple-500" />;
      case 'in_app':
        return <BellIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <ChartBarIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case 'push': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'email': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'sms': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'in_app': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No notification analytics available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ChartBarIcon className="w-8 h-8 text-orange-500 mr-3" />
            Notification Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track notification performance and delivery statistics
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'channels', name: 'Channels', icon: ComputerDesktopIcon },
            { id: 'templates', name: 'Templates', icon: EnvelopeIcon },
            { id: 'performance', name: 'Performance', icon: ClockIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.totalSent)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Delivered</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.totalDelivered)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(analytics.deliveryRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Delivery Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.averageDeliveryTime.toFixed(1)}s
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Channel Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Channel Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(analytics.channelBreakdown).map(([channel, data]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(channel)}
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {channel.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatNumber(data.sent)} sent
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatNumber(data.delivered)} delivered
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(channel)}`}>
                          {(data.rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {channels.map((channel) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {channel.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {channel.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      channel.enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {channel.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                      <span className="text-gray-900 dark:text-white">{channel.priority}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{channel.deliveryTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Templates
            </h3>
            <div className="space-y-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.body}
                    </p>
                    {template.subject && (
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Subject: {template.subject}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.channels.map((channel) => (
                      <span
                        key={channel.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(channel.type)}`}
                      >
                        {channel.name}
                      </span>
                    ))}
                  </div>
                  
                  {template.variables.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        Variables: {template.variables.join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
            
            {/* Delivery Rate Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Delivery Rate by Channel
              </h4>
              <div className="space-y-3">
                {Object.entries(analytics.channelBreakdown).map(([channel, data]) => (
                  <div key={channel}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {channel.replace('_', ' ')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {(data.rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.rate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Templates */}
            {analytics.topTemplates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Most Used Templates
                </h4>
                <div className="space-y-3">
                  {analytics.topTemplates.map((template, index) => (
                    <div key={template.templateId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {template.templateId}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatNumber(template.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationAnalyticsDashboard;
