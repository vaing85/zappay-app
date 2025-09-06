import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldExclamationIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { fraudDetectionService, FraudAlert, FraudPattern } from '../services/fraudDetectionService';

interface FraudDetectionDashboardProps {
  className?: string;
}

const FraudDetectionDashboard: React.FC<FraudDetectionDashboardProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'patterns' | 'analytics'>('alerts');

  useEffect(() => {
    loadFraudData();
  }, []);

  const loadFraudData = () => {
    try {
      setIsLoading(true);
      const fraudAlerts = fraudDetectionService.getAlerts();
      const fraudPatterns = fraudDetectionService.getPatterns();
      
      setAlerts(fraudAlerts);
      setPatterns(fraudPatterns);
    } catch (error) {
      console.error('Failed to load fraud data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium':
        return <ShieldExclamationIcon className="w-5 h-5" />;
      case 'low':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const updateAlertStatus = (alertId: string, status: FraudAlert['status']) => {
    const success = fraudDetectionService.updateAlertStatus(alertId, status);
    if (success) {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status } : alert
      ));
    }
  };

  const clearResolvedAlerts = () => {
    fraudDetectionService.clearResolvedAlerts();
    setAlerts(fraudDetectionService.getAlerts());
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading fraud detection data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldExclamationIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fraud Detection Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadFraudData}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Refresh Data"
            >
              <ClockIcon className="w-4 h-4" />
            </button>
            <button
              onClick={clearResolvedAlerts}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Clear Resolved Alerts"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {alerts.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {alerts.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Investigating</p>
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {alerts.filter(a => a.status === 'investigating').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {alerts.filter(a => a.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'alerts', label: 'Alerts', count: alerts.length },
          { id: 'patterns', label: 'Patterns', count: patterns.length },
          { id: 'analytics', label: 'Analytics', count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Fraud Alerts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No suspicious activity detected. Your account is secure.
                </p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Risk Score: {alert.riskScore}</span>
                          <span>•</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                          {alert.transactionId && (
                            <>
                              <span>•</span>
                              <span>Transaction: {alert.transactionId}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Recommended Action:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.recommendedAction}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'investigating')}
                          className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      {alert.status === 'investigating' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'resolved')}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {alert.status === 'active' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'false_positive')}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition-colors"
                        >
                          False Positive
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'patterns' && (
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pattern.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(pattern.riskLevel)}`}>
                        {pattern.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {pattern.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Pattern: {pattern.pattern}</span>
                      <span>•</span>
                      <span>Frequency: {pattern.frequency}</span>
                      <span>•</span>
                      <span>False Positive Rate: {(pattern.falsePositiveRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced fraud detection analytics will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionDashboard;
