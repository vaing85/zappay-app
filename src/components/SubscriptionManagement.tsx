import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../types/Subscription';
import { toast } from 'react-toastify';

const SubscriptionManagement: React.FC = () => {
  const { 
    currentSubscription, 
    plans, 
    billingHistory, 
    loading, 
    upgradeSubscription, 
    cancelSubscription,
    loadBillingHistory 
  } = useSubscription();
  const { user } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = plans.find(plan => plan.id === currentSubscription?.planId);

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (!user) {
      toast.error('Please log in to upgrade your subscription');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await upgradeSubscription(planId, 'pm_mock_payment_method');
      
      if (result.success) {
        toast.success(`Successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan!`);
      } else {
        toast.error(result.error || 'Upgrade failed');
      }
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const result = await cancelSubscription();
      
      if (result.success) {
        toast.success('Subscription cancelled successfully');
        setShowCancelModal(false);
      } else {
        toast.error(result.error || 'Cancellation failed');
      }
    } catch (error) {
      toast.error('Cancellation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'expired':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'trial':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'trial':
        return <CalendarIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading subscription...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Subscription
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription?.status || '')}`}>
            {getStatusIcon(currentSubscription?.status || '')}
            <span className="ml-1 capitalize">{currentSubscription?.status || 'Unknown'}</span>
          </div>
        </div>

        {currentPlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentPlan.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {currentPlan.description}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                ${currentPlan.price}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-500">
                {currentSubscription?.nextBillingDate && `Next billing: ${formatDate(currentSubscription.nextBillingDate)}`}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      {currentSubscription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Usage This Month
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSubscription.usage.monthlyTransactions}
              </div>
              <div className="text-sm text-gray-500">Transactions</div>
              <div className="text-xs text-gray-400">
                Limit: {currentPlan?.limits.monthlyTransactions || 'Unlimited'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentSubscription.usage.monthlyWithdrawal.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Withdrawn</div>
              <div className="text-xs text-gray-400">
                Limit: ${currentPlan?.limits.monthlyWithdrawal.toLocaleString() || 'Unlimited'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentSubscription.usage.monthlyDeposit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Deposited</div>
              <div className="text-xs text-gray-400">
                Limit: ${currentPlan?.limits.monthlyDeposit.toLocaleString() || 'Unlimited'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSubscription.usage.teamMembers || 0}
              </div>
              <div className="text-sm text-gray-500">Team Members</div>
              <div className="text-xs text-gray-400">
                Limit: {currentPlan?.limits.teamMembers || 'Unlimited'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Upgrade Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upgrade Your Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans
            .filter(plan => plan.id !== currentSubscription?.planId)
            .map((plan) => (
              <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="text-2xl font-bold text-orange-600 my-2">
                    ${plan.price}/month
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isProcessing ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Billing History
          </h3>
          <button
            onClick={loadBillingHistory}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        {billingHistory.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No billing history available
          </p>
        ) : (
          <div className="space-y-3">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <CreditCardIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bill.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(bill.date)} • {bill.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${bill.amount}
                  </div>
                  <div className={`text-sm ${
                    bill.status === 'paid' ? 'text-green-600' :
                    bill.status === 'pending' ? 'text-yellow-600' :
                    bill.status === 'failed' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cancel Subscription
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features immediately.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
