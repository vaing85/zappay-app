import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useTransactionSecurity } from '../contexts/TransactionSecurityContext';
import TransactionRiskIndicator from '../components/security/TransactionRiskIndicator';
import SecurityAlertsPanel from '../components/security/SecurityAlertsPanel';
import TransactionSecuritySettings from '../components/security/TransactionSecuritySettings';

const TransactionSecurity: React.FC = () => {
  const {
    alerts,
    securityEvents,
    trustedDevices,
    loading,
    refreshAlerts,
    refreshSecurityEvents,
    resolveAlert
  } = useTransactionSecurity();

  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'settings' | 'devices'>('overview');
  const [testTransaction, setTestTransaction] = useState({
    amount: 1000,
    recipient: 'test@example.com',
    type: 'transfer'
  });

  useEffect(() => {
    refreshAlerts();
    refreshSecurityEvents();
  }, [refreshAlerts, refreshSecurityEvents]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'devices', name: 'Devices', icon: DevicePhoneMobileIcon }
  ];

  const getStats = () => {
    const totalAlerts = alerts.length;
    const unresolvedAlerts = alerts.filter(alert => !alert.resolved).length;
    const criticalEvents = securityEvents.filter(event => event.severity === 'critical').length;
    const trustedDeviceCount = trustedDevices.length;

    return {
      totalAlerts,
      unresolvedAlerts,
      criticalEvents,
      trustedDeviceCount
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transaction Security
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage transaction security, fraud detection, and risk assessment
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.id === 'alerts' && stats.unresolvedAlerts > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {stats.unresolvedAlerts}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Alerts
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.totalAlerts}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unresolved
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.unresolvedAlerts}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <ShieldCheckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Critical Events
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.criticalEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <DevicePhoneMobileIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Trusted Devices
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.trustedDeviceCount}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Risk Assessment Test */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Risk Assessment Test
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Test Transaction
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Amount ($)
                        </label>
                        <input
                          type="number"
                          value={testTransaction.amount}
                          onChange={(e) => setTestTransaction(prev => ({
                            ...prev,
                            amount: Number(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Recipient
                        </label>
                        <input
                          type="text"
                          value={testTransaction.recipient}
                          onChange={(e) => setTestTransaction(prev => ({
                            ...prev,
                            recipient: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Risk Assessment
                    </h4>
                    <TransactionRiskIndicator
                      riskScore={null} // This would be calculated based on test transaction
                      size="lg"
                      showDetails={true}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Security Events
                </h3>
                <div className="space-y-3">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          event.severity === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                          event.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                          event.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          <ShieldCheckIcon className={`w-4 h-4 ${
                            event.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                            event.severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                            event.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <SecurityAlertsPanel
              alerts={alerts}
              onResolveAlert={resolveAlert}
            />
          )}

          {activeTab === 'settings' && (
            <TransactionSecuritySettings />
          )}

          {activeTab === 'devices' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trusted Devices
              </h3>
              <div className="space-y-4">
                {trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <DevicePhoneMobileIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.browser} on {device.os}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {device.location.city}, {device.location.country}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Trusted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionSecurity;
