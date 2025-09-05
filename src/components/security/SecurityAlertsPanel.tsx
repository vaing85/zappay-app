import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { TransactionAlert } from '../../types/TransactionSecurity';
import { useTransactionSecurity } from '../../contexts/TransactionSecurityContext';

interface SecurityAlertsPanelProps {
  alerts: TransactionAlert[];
  onResolveAlert: (alertId: string, resolution: string) => void;
  className?: string;
}

const SecurityAlertsPanel: React.FC<SecurityAlertsPanelProps> = ({
  alerts,
  onResolveAlert,
  className = ''
}) => {
  const [selectedAlert, setSelectedAlert] = useState<TransactionAlert | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'high':
        return <XCircleIcon className="w-5 h-5" />;
      case 'critical':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'suspicious_amount':
        return 'Suspicious Amount';
      case 'unusual_location':
        return 'Unusual Location';
      case 'high_frequency':
        return 'High Frequency';
      case 'pattern_anomaly':
        return 'Pattern Anomaly';
      case 'device_mismatch':
        return 'Device Mismatch';
      case 'time_anomaly':
        return 'Time Anomaly';
      default:
        return 'Security Alert';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const handleResolveAlert = () => {
    if (selectedAlert && resolutionText.trim()) {
      onResolveAlert(selectedAlert.id, resolutionText);
      setSelectedAlert(null);
      setResolutionText('');
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security Alerts
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {unresolvedAlerts.length} unresolved
            </span>
            {resolvedAlerts.length > 0 && (
              <span className="text-sm text-gray-400">
                • {resolvedAlerts.length} resolved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {unresolvedAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center"
            >
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No unresolved security alerts
              </p>
            </motion.div>
          ) : (
            unresolvedAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {getAlertTypeText(alert.type)}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <span>Transaction: {alert.transactionId}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resolve Alert
                </h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Alert:</strong> {getAlertTypeText(selectedAlert.type)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Message:</strong> {selectedAlert.message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Severity:</strong> {selectedAlert.severity.toUpperCase()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Describe how this alert was resolved..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveAlert}
                  disabled={!resolutionText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resolve Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityAlertsPanel;
