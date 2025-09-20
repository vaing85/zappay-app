import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
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
  ArrowUpTrayIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  StarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getRecentTransactions } from '../services/mockData';
import { getAriaLabel } from '../utils/accessibility';
import RealtimeBalanceIndicator from '../components/RealtimeBalanceIndicator';
// DepositWithdrawModal removed - using Stripe for payments

const Dashboard: React.FC = memo(() => {
  const { user } = useAuth();
  const { currentSubscription, plans } = useSubscription();
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
          <h2 className="text-lg font-medium" id="balance-label">ZapPay Balance</h2>
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

      {/* Subscription Status */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {currentSubscription.planId === 'free' ? (
                <ShieldCheckIcon className="w-8 h-8 text-gray-500" />
              ) : currentSubscription.planId === 'pro' ? (
                <StarIcon className="w-8 h-8 text-blue-500" />
              ) : currentSubscription.planId === 'business' ? (
                <UsersIcon className="w-8 h-8 text-green-500" />
              ) : (
                <StarIcon className="w-8 h-8 text-purple-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plans.find(p => p.id === currentSubscription.planId)?.name} Plan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plans.find(p => p.id === currentSubscription.planId)?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                ${plans.find(p => p.id === currentSubscription.planId)?.price}/month
              </div>
              <Link
                to="/subscription-plans"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {currentSubscription.planId === 'free' ? 'Upgrade Now' : 'Manage Plan'}
              </Link>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentSubscription.planId === 'free' ? '50 transactions/month' : 'Unlimited transactions'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {currentSubscription.planId === 'free' ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentSubscription.planId === 'free' ? 'Withdrawal fees apply' : 'Free withdrawals'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {currentSubscription.planId === 'free' ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentSubscription.planId === 'free' ? 'Basic analytics' : 'Advanced analytics'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Funding Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Funds to Your Account</h2>
            <p className="text-yellow-100">Quick and secure ways to fund your ZapPay wallet</p>
          </div>
          <CreditCardIcon className="w-8 h-8 text-yellow-200" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <ArrowDownTrayIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Add Money</span>
            <span className="block text-xs text-yellow-100 mt-1">Instant deposit</span>
          </button>
          <Link
            to="/payment-settings"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <CreditCardIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Payment Methods</span>
            <span className="block text-xs text-yellow-100 mt-1">Manage cards & banks</span>
          </Link>
          <Link
            to="/payment-settings"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <Cog6ToothIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Settings</span>
            <span className="block text-xs text-yellow-100 mt-1">Configure payments</span>
          </Link>
        </div>
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

      {/* App Features Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
          <BoltIcon className="w-6 h-6 text-yellow-500 mr-2" />
          ZapPay Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Payment Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CreditCardIcon className="w-5 h-5 text-blue-500 mr-2" />
              Payments
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send & Receive Money</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">QR Code Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Split Bills & Groups</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">ACH Deposits & Withdrawals</span>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ShieldCheckIcon className="w-5 h-5 text-red-500 mr-2" />
              Security
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">End-to-End Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Fraud Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Transaction Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">2FA Authentication</span>
              </div>
            </div>
          </div>

          {/* Analytics & Insights */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
              Analytics
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Spending Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Budget Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">AI Recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Real-time Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Highlight */}
        {currentSubscription?.planId === 'free' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Unlock Premium Features
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  Get unlimited transactions, free withdrawals, and advanced analytics
                </p>
              </div>
              <Link
                to="/subscription-plans"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}
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
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(transaction.timestamp || transaction.createdAt)}</p>
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

      {/* Modals - Using Stripe for secure payments */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
            <p className="text-gray-600 mb-4">
              Deposits are processed securely through Stripe. All payment data is encrypted and PCI compliant.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue with Stripe
              </button>
            </div>
          </div>
        </div>
      )}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
            <p className="text-gray-600 mb-4">
              Withdrawals are processed securely through Stripe. Funds will be transferred to your linked account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue with Stripe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
