import React from 'react';
import { motion } from 'framer-motion';
import { BudgetAlert } from '../../types/Budget';
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface BudgetAlertCardProps {
  alert: BudgetAlert;
  onMarkAsRead?: (alertId: string) => void;
  onDelete?: (alertId: string) => void;
}

const BudgetAlertCard: React.FC<BudgetAlertCardProps> = ({ 
  alert, 
  onMarkAsRead, 
  onDelete 
}) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'exceeded':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'critical':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'exceeded':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getTextColor = () => {
    switch (alert.type) {
      case 'exceeded':
        return 'text-red-800 dark:text-red-200';
      case 'critical':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-lg p-4 border ${getAlertColor()} ${
        alert.isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getAlertIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${getTextColor()}`}>
              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(alert.createdAt)}
            </span>
          </div>
          
          <p className={`mt-1 text-sm ${getTextColor()}`}>
            {alert.message}
          </p>
          
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Threshold: {alert.threshold}%
            </span>
            {!alert.isRead && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                New
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {!alert.isRead && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(alert.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Mark as read"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(alert.id)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete alert"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetAlertCard;
