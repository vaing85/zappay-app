import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  ReceiptPercentIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getSplitBillsForUser, getPaymentRequestsForUser, getPendingRequestsForUser, getPendingSplitBillsForUser } from '../services/advancedPaymentData';

const AdvancedPayments: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'split-bills' | 'payment-requests'>('overview');

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view advanced payments.</div>;
  }

  const splitBills = getSplitBillsForUser(user.id);
  const paymentRequests = getPaymentRequestsForUser(user.id);
  const pendingRequests = getPendingRequestsForUser(user.id);
  const pendingSplitBills = getPendingSplitBillsForUser(user.id);

  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalSplitAmount = pendingSplitBills.reduce((sum, bill) => {
    const userParticipant = bill.participants.find(p => p.userId === user.id);
    return sum + (userParticipant?.amount || 0);
  }, 0);

  const quickStats = [
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      amount: totalPendingAmount,
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      title: 'Split Bills',
      value: splitBills.length,
      amount: totalSplitAmount,
      icon: <ReceiptPercentIcon className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Total Requests',
      value: paymentRequests.length,
      amount: paymentRequests.reduce((sum, req) => sum + req.amount, 0),
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900'
    }
  ];

  const recentActivity = [
    ...pendingRequests.slice(0, 3).map(req => ({
      id: req.id,
      type: 'request',
      title: `Payment request from ${req.requestedByName}`,
      amount: req.amount,
      status: 'pending',
      timestamp: req.createdAt
    })),
    ...pendingSplitBills.slice(0, 2).map(bill => ({
      id: bill.id,
      type: 'split',
      title: `Split bill: ${bill.title}`,
      amount: bill.participants.find(p => p.userId === user.id)?.amount || 0,
      status: 'pending',
      timestamp: bill.createdAt
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Split bills, request payments, and manage group expenses
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: <ChartBarIcon className="w-5 h-5" /> },
            { key: 'split-bills', label: 'Split Bills', icon: <ReceiptPercentIcon className="w-5 h-5" /> },
            { key: 'payment-requests', label: 'Payment Requests', icon: <CurrencyDollarIcon className="w-5 h-5" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${stat.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'request' 
                          ? 'bg-yellow-100 dark:bg-yellow-900' 
                          : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {activity.type === 'request' ? (
                          <CurrencyDollarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <ReceiptPercentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${activity.amount.toFixed(2)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <ReceiptPercentIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Split Bills</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Split expenses with friends and track who has paid
              </p>
              <button
                onClick={() => setActiveTab('split-bills')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Manage Split Bills</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Requests</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Request money from friends or respond to requests
              </p>
              <button
                onClick={() => setActiveTab('payment-requests')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Manage Requests</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'split-bills' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center py-12">
            <ReceiptPercentIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Split Bills Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This feature will be available in the next update
            </p>
            <button
              onClick={() => setActiveTab('overview')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Overview
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'payment-requests' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Payment Requests Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This feature will be available in the next update
            </p>
            <button
              onClick={() => setActiveTab('overview')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Overview
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedPayments;
