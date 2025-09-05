import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { getPaymentRequestsForUser, getPendingRequestsForUser } from '../services/advancedPaymentData';
import { PaymentRequest } from '../types/Payment';
import { toast } from 'react-toastify';

const PaymentRequests: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view payment requests.</div>;
  }

  const userRequests = getPaymentRequestsForUser(user.id);
  const pendingRequests = getPendingRequestsForUser(user.id);
  
  const filteredRequests = userRequests.filter(request => {
    if (activeTab === 'sent') {
      return request.requestedBy === user.id;
    }
    if (activeTab === 'received') {
      return request.requestedFrom === user.id;
    }
    if (activeTab === 'pending') {
      return request.status === 'pending';
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'declined': return 'text-red-600 dark:text-red-400';
      case 'expired': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircleIcon className="w-5 h-5" />;
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'declined': return <XCircleIcon className="w-5 h-5" />;
      case 'expired': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'transport': return '🚗';
      case 'entertainment': return '🎬';
      case 'shopping': return '🛍️';
      case 'utilities': return '⚡';
      default: return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    toast.success('Payment request accepted! 💰');
    // In a real app, this would process the payment
  };

  const handleDeclineRequest = (requestId: string) => {
    toast.info('Payment request declined');
    // In a real app, this would update the request status
  };

  const getRequestType = (request: PaymentRequest) => {
    if (request.requestedBy === user.id) {
      return { type: 'sent', label: 'You requested', person: request.requestedFromName };
    } else {
      return { type: 'received', label: 'Requested from you', person: request.requestedByName };
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Request money from friends or respond to requests
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Request</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Accepted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRequests.filter(r => r.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Declined</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRequests.filter(r => r.status === 'declined').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Requests', count: userRequests.length },
            { key: 'sent', label: 'Sent', count: userRequests.filter(r => r.requestedBy === user.id).length },
            { key: 'received', label: 'Received', count: userRequests.filter(r => r.requestedFrom === user.id).length },
            { key: 'pending', label: 'Pending', count: pendingRequests.length }
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
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.key
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Payment Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payment requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? 'Create your first payment request to get started'
                : `No ${activeTab} payment requests at the moment`
              }
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Payment Request
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((request, index) => {
            const requestType = getRequestType(request);
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(request.category)}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {request.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">{request.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {requestType.label} <span className="font-medium">{requestType.person}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Amount</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${request.amount.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">From/To</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {requestType.person}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {request.note && (
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> {request.note}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {requestType.type === 'received' && request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Accept & Pay</span>
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {requestType.type === 'sent' && request.status === 'pending' && (
                    <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                      <ClockIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Waiting for response...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Create Payment Request Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Payment Request
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="friend@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="What's this for?"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Payment request created!');
                    setShowCreateForm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentRequests;
