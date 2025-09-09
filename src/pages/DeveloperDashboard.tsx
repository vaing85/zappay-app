import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import APIKeyManager from '../components/APIKeyManager';

interface APIUsage {
  date: string;
  requests: number;
  errors: number;
}

interface APIStats {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  successRate: number;
  dailyUsage: APIUsage[];
}

const DeveloperDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasFeatureAccess, currentSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStats, setApiStats] = useState<APIStats | null>(null);

  // Mock API stats for demo
  useEffect(() => {
    const mockStats: APIStats = {
      totalRequests: 15420,
      totalErrors: 23,
      averageResponseTime: 245,
      successRate: 99.85,
      dailyUsage: [
        { date: '2024-01-09', requests: 1200, errors: 2 },
        { date: '2024-01-10', requests: 1350, errors: 1 },
        { date: '2024-01-11', requests: 1100, errors: 3 },
        { date: '2024-01-12', requests: 1600, errors: 0 },
        { date: '2024-01-13', requests: 1800, errors: 1 },
        { date: '2024-01-14', requests: 2000, errors: 2 },
        { date: '2024-01-15', requests: 2370, errors: 1 }
      ]
    };
    setApiStats(mockStats);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'api-keys', name: 'API Keys', icon: CodeBracketIcon },
    { id: 'usage', name: 'Usage & Limits', icon: ClockIcon },
    { id: 'webhooks', name: 'Webhooks', icon: InformationCircleIcon }
  ];

  const isProUser = hasFeatureAccess('api_access');

  if (!isProUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-yellow-800 dark:text-yellow-400 mb-4">
              Developer Dashboard Requires Pro Subscription
            </h1>
            <p className="text-yellow-700 dark:text-yellow-300 mb-6 max-w-2xl mx-auto">
              Access the developer dashboard, manage API keys, and monitor your API usage with a Pro subscription or higher.
            </p>
            <a
              href="/subscription-plans"
              className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-lg font-medium"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Developer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API integration and monitor usage
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {apiStats?.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {apiStats?.successRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {apiStats?.averageResponseTime}ms
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Errors</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {apiStats?.totalErrors}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily API Usage
                </h3>
                <div className="h-64 flex items-end space-x-2">
                  {apiStats?.dailyUsage.map((day, index) => {
                    const maxRequests = Math.max(...apiStats.dailyUsage.map(d => d.requests));
                    const height = (day.requests / maxRequests) * 200;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${height}px` }}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {day.requests}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        API key "Production App" used for payment creation
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        Rate limit warning for key "Development Testing"
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        New API key "Mobile App" created
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <APIKeyManager />
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Usage Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Monthly Requests
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentSubscription?.planId === 'pro' ? '10,000' : 
                         currentSubscription?.planId === 'business' ? '100,000' : 
                         currentSubscription?.planId === 'enterprise' ? 'Unlimited' : '1,000'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((apiStats?.totalRequests || 0) / 10000 * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {apiStats?.totalRequests.toLocaleString()} requests used this month
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rate Limit
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentSubscription?.planId === 'pro' ? '100/min' : 
                         currentSubscription?.planId === 'business' ? '1,000/min' : 
                         currentSubscription?.planId === 'enterprise' ? '10,000/min' : '10/min'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-1/4" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Currently within limits
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Endpoints Usage
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">POST /api/v1/payments/create</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">8,420 requests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">GET /api/v1/transactions</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">4,200 requests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">POST /api/v1/auth/login</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">1,800 requests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">GET /api/v1/payments/{id}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">1,000 requests</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Webhook Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure webhooks to receive real-time notifications about events in your ZapPay account.
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  Configure Webhooks
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Events</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• payment.created</li>
                      <li>• payment.completed</li>
                      <li>• payment.failed</li>
                      <li>• payment.refunded</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transaction Events</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• transaction.created</li>
                      <li>• transaction.updated</li>
                      <li>• transaction.cancelled</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
