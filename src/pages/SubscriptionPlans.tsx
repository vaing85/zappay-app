import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  XMarkIcon, 
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../types/Subscription';
import { subscriptionService } from '../services/subscriptionService';
import { toast } from 'react-toastify';

const SubscriptionPlans: React.FC = () => {
  const { plans, currentSubscription, upgradeSubscription, loading } = useSubscription();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (!user) {
      toast.error('Please log in to upgrade your subscription');
      return;
    }

    if (currentSubscription?.planId === planId) {
      toast.info('You are already on this plan');
      return;
    }

    setSelectedPlan(planId);
    setIsUpgrading(true);

    try {
      // In a real app, this would open a payment modal
      // For now, we'll simulate the upgrade
      const result = await upgradeSubscription(planId, 'pm_mock_payment_method');
      
      if (result.success) {
        toast.success(`Successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan!`);
      } else {
        toast.error(result.error || 'Upgrade failed');
      }
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planId: SubscriptionTier) => {
    switch (planId) {
      case 'free':
        return <ShieldCheckIcon className="w-8 h-8" />;
      case 'pro':
        return <ChartBarIcon className="w-8 h-8" />;
      case 'business':
        return <UsersIcon className="w-8 h-8" />;
      case 'enterprise':
        return <StarIcon className="w-8 h-8" />;
      default:
        return <CogIcon className="w-8 h-8" />;
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === currentSubscription?.planId);
  };

  const isCurrentPlan = (planId: SubscriptionTier) => {
    return currentSubscription?.planId === planId;
  };

  const canUpgrade = (planId: SubscriptionTier) => {
    if (!currentSubscription) return true;
    
    const currentPlanIndex = plans.findIndex(p => p.id === currentSubscription.planId);
    const targetPlanIndex = plans.findIndex(p => p.id === planId);
    
    return targetPlanIndex > currentPlanIndex;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Current Plan Status */}
        {currentSubscription && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Current Plan: {getCurrentPlan()?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {getCurrentPlan()?.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    ${getCurrentPlan()?.price}/month
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const canUpgradeToThis = canUpgrade(plan.id);
            const isUpgradingToThis = selectedPlan === plan.id && isUpgrading;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-orange-500' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      plan.id === 'free' ? 'bg-gray-100 dark:bg-gray-700' :
                      plan.id === 'pro' ? 'bg-blue-100 dark:bg-blue-900' :
                      plan.id === 'business' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {feature.included ? (
                            <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <XMarkIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            feature.included 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {feature.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || !canUpgradeToThis || isUpgradingToThis || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : !canUpgradeToThis
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isUpgradingToThis
                        ? 'bg-orange-300 text-white cursor-not-allowed'
                        : plan.id === 'free'
                        ? 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isCurrent ? (
                      'Current Plan'
                    ) : !canUpgradeToThis ? (
                      'Downgrade Not Available'
                    ) : isUpgradingToThis ? (
                      'Upgrading...'
                    ) : plan.id === 'free' ? (
                      'Get Started'
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRightIcon className="w-4 h-4 ml-2 inline" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Feature Comparison
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Compare all features across our plans
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {subscriptionService.getFeatureComparison().map((comparison) => (
                  <tr key={comparison.feature}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {comparison.feature}
                    </td>
                    {plans.map((plan) => {
                      const hasFeature = plan.id === 'free' ? comparison.free :
                                       plan.id === 'pro' ? comparison.pro :
                                       plan.id === 'business' ? comparison.business :
                                       plan.id === 'enterprise' ? comparison.enterprise : false;
                      
                      return (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {hasFeature ? (
                            <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, debit cards, and bank transfers.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can cancel your subscription at any time. No cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
