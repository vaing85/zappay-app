import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGroup } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/AuthContext';
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
import { Group, PaymentRequest } from '../../types/Social';
import CreatePaymentRequestModal from './CreatePaymentRequestModal';

interface PaymentRequestsProps {
  group: Group;
}

const PaymentRequests: React.FC<PaymentRequestsProps> = ({ group }) => {
  const { user } = useAuth();
  const { paymentRequests, createPaymentRequest, updatePaymentRequest, isLoading } = useGroup();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'expired'>('all');

  const filteredRequests = paymentRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'declined':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'expired':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'declined':
        return <XCircleIcon className="w-4 h-4" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      await updatePaymentRequest(requestId, {
        status: 'accepted',
        paidAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to accept payment request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      await updatePaymentRequest(requestId, {
        status: 'declined'
      });
    } catch (error) {
      console.error('Failed to decline payment request:', error);
    }
  };

  const handleCreateRequest = async (requestData: any) => {
    try {
      await createPaymentRequest({
        ...requestData,
        fromUserId: user?.id || '',
        currency: group.settings.currency
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create payment request:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Requests
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Send and manage payment requests
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Request</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'All', count: paymentRequests.length },
          { id: 'pending', label: 'Pending', count: paymentRequests.filter(r => r.status === 'pending').length },
          { id: 'accepted', label: 'Accepted', count: paymentRequests.filter(r => r.status === 'accepted').length },
          { id: 'declined', label: 'Declined', count: paymentRequests.filter(r => r.status === 'declined').length },
          { id: 'expired', label: 'Expired', count: paymentRequests.filter(r => isExpired(r.expiresAt)).length }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payment requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Create your first payment request to get started.'
                : `No ${filter} requests found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Request</span>
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const isFromCurrentUser = request.fromUserId === user?.id;
            const isExpiredRequest = isExpired(request.expiresAt);
            const canRespond = !isFromCurrentUser && request.status === 'pending' && !isExpiredRequest;
            
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.description}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isExpiredRequest ? getStatusColor('expired') : getStatusColor(request.status)
                      }`}>
                        {getStatusIcon(isExpiredRequest ? 'expired' : request.status)}
                        <span className="capitalize">
                          {isExpiredRequest ? 'Expired' : request.status}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>${request.amount.toFixed(2)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {isFromCurrentUser ? 'You requested' : 'Requested from you'}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(request.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${request.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {request.currency}
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Category
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.category}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Due Date
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(request.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {request.isRecurring && request.recurringSettings && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Recurring Request
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {request.recurringSettings.frequency} - 
                        Every {request.recurringSettings.interval} {request.recurringSettings.frequency}
                      </p>
                    </div>
                  )}

                  {request.attachments && request.attachments.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Attachments
                      </p>
                      <div className="flex space-x-2">
                        {request.attachments.map((attachment, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            Attachment {index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {canRespond && (
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Accept & Pay
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {isFromCurrentUser && request.status === 'pending' && !isExpiredRequest && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Waiting for response from recipient
                    </p>
                  </div>
                )}

                {isExpiredRequest && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      This request has expired
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Payment Request Modal */}
      {showCreateModal && (
        <CreatePaymentRequestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onRequestCreated={handleCreateRequest}
          group={group}
        />
      )}
    </div>
  );
};

export default PaymentRequests;
