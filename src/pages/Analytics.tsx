import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import PremiumAnalytics from '../components/PremiumAnalytics';
import { useSubscription } from '../contexts/SubscriptionContext';
import { ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  const { hasFeatureAccess } = useSubscription();
  const [activeTab, setActiveTab] = useState<'basic' | 'premium'>('basic');

  const hasAdvancedFeatures = hasFeatureAccess('AI Recommendations') || 
                             hasFeatureAccess('Advanced Analytics') || 
                             hasFeatureAccess('Custom Branding');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Basic Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'premium'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Premium Analytics</span>
              {!hasAdvancedFeatures && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                  Upgrade Required
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'basic' && <AnalyticsDashboard />}
      {activeTab === 'premium' && <PremiumAnalytics />}
    </motion.div>
  );
};

export default Analytics;