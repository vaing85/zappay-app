import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  QrCodeIcon,
  BoltIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { getRecentTransactions } from '../services/mockData';
import { getAriaLabel } from '../utils/accessibility';
import RealtimeBalanceIndicator from '../components/RealtimeBalanceIndicator';
import DepositWithdrawModal from '../components/DepositWithdrawModal';

const Dashboard: React.FC = memo(() => {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Memoize expensive calculations
  const recentTransactions = useMemo(() => 
    user ? getRecentTransactions(user.id) : [], [user]
  );

  const quickActions = useMemo(() => [
    { 
      icon: <ArrowUpIcon className="w-6 h-6" />, 
      label: "Zap Money", 
      link: "/send", 
      color: "bg-yellow-500",
      ariaLabel: getAriaLabel('send-money')
    },
    { 
      icon: <ArrowDownTrayIcon className="w-6 h-6" />, 
      label: "Add Money", 
      action: () => setShowDepositModal(true), 
      color: "bg-green-500",
      ariaLabel: "Add money to account"
    },
    { 
      icon: <ArrowUpTrayIcon className="w-6 h-6" />, 
      label: "Withdraw", 
      action: () => setShowWithdrawModal(true), 
      color: "bg-red-500",
      ariaLabel: "Withdraw money from account"
    },
    { 
      icon: <QrCodeIcon className="w-6 h-6" />, 
      label: "QR Zap", 
      link: "/qr", 
      color: "bg-orange-500",
      ariaLabel: getAriaLabel('qr-payment')
    },
    { 
      icon: <ReceiptPercentIcon className="w-6 h-6" />, 
      label: "Advanced", 
      link: "/advanced", 
      color: "bg-blue-500",
      ariaLabel: getAriaLabel('advanced-payments')
    },
    { 
      icon: <ChartBarIcon className="w-6 h-6" />, 
      label: "Analytics", 
      link: "/analytics", 
      color: "bg-green-500",
      ariaLabel: getAriaLabel('analytics')
    },
    { 
      icon: <CurrencyDollarIcon className="w-6 h-6" />, 
      label: "Budget", 
      link: "/budget", 
      color: "bg-purple-500",
      ariaLabel: getAriaLabel('budget')
    },
    { 
      icon: <ShieldCheckIcon className="w-6 h-6" />, 
      label: "Security", 
      link: "/security", 
      color: "bg-red-500",
      ariaLabel: getAriaLabel('security-settings')
    },
  ], []);

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto">
                    <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ⚡ Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Ready to zap some payments?</p>
              </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white mb-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium" id="balance-label">ZapCash Balance</h2>
          <BoltIcon className="w-8 h-8 animate-pulse" aria-hidden="true" />
        </div>
        <div className="text-white">
          <RealtimeBalanceIndicator 
            size="lg" 
            showChange={true} 
            showLastUpdate={true}
            className="text-white"
          />
        </div>
        <p className="text-yellow-100 mt-2" aria-hidden="true">⚡ Ready to Zap</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {quickActions.map((action, index) => {
          const content = (
            <>
              <div 
                className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3`}
                aria-hidden="true"
              >
                {action.icon}
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
            </>
          );

          if (action.action) {
            return (
              <button
                key={index}
                onClick={action.action}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 w-full"
                aria-label={action.ariaLabel}
                type="button"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              to={action.link!}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              aria-label={action.ariaLabel}
              role="button"
              tabIndex={0}
            >
              {content}
            </Link>
          );
        })}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <BoltIcon className="w-6 h-6 text-yellow-500 mr-2" />
          Recent Zaps
        </h3>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'send' 
                      ? 'bg-red-100 dark:bg-red-900' 
                      : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    {transaction.type === 'send' ? (
                      <ArrowUpIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <ArrowDownIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.type === 'send' 
                        ? `Zapped to ${transaction.recipient}`
                        : `Received from ${transaction.sender}`
                      }
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.note}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(transaction.timestamp)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'send' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {transaction.type === 'send' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BoltIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start zapping money to see your activity here</p>
            </div>
          )}
        </div>
        <Link
          to="/history"
          className="block text-center text-orange-600 dark:text-orange-400 font-medium mt-4 hover:text-orange-700 dark:hover:text-orange-300"
        >
          View All Zaps
        </Link>
      </motion.div>

      {/* Modals */}
      <DepositWithdrawModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        type="deposit"
      />
      <DepositWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        type="withdraw"
      />
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
