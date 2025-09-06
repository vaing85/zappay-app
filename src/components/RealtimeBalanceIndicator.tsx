import React from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useRealtimeBalance } from '../contexts/RealtimeBalanceContext';

interface RealtimeBalanceIndicatorProps {
  showChange?: boolean;
  showLastUpdate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RealtimeBalanceIndicator: React.FC<RealtimeBalanceIndicatorProps> = ({
  showChange = true,
  showLastUpdate = false,
  size = 'md',
  className = ''
}) => {
  const {
    currentBalance,
    previousBalance,
    balanceChange,
    isUpdating,
    lastUpdate
  } = useRealtimeBalance();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatBalance(change)}`;
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Balance Icon */}
      <div className="flex-shrink-0">
        <CurrencyDollarIcon className={`${iconSizes[size]} text-yellow-500`} />
      </div>

      {/* Balance Amount */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <motion.span
            key={currentBalance}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`font-semibold text-gray-900 dark:text-white ${sizeClasses[size]}`}
          >
            {formatBalance(currentBalance)}
          </motion.span>

          {/* Loading Indicator */}
          {isUpdating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-yellow-500"
            >
              <ArrowPathIcon className={`${iconSizes[size]}`} />
            </motion.div>
          )}
        </div>

        {/* Balance Change */}
        {showChange && balanceChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`flex items-center space-x-1 text-xs ${
              balanceChange > 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {balanceChange > 0 ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            <span>{formatChange(balanceChange)}</span>
          </motion.div>
        )}

        {/* Last Update Time */}
        {showLastUpdate && lastUpdate && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated {formatLastUpdate(lastUpdate)}
          </div>
        )}
      </div>

      {/* Balance Status Indicator */}
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${
          isUpdating 
            ? 'bg-yellow-500 animate-pulse' 
            : 'bg-green-500'
        }`} />
      </div>
    </div>
  );
};

export default RealtimeBalanceIndicator;
