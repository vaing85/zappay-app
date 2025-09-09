import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { aiInsightsService, SpendingAnalysis } from '../services/aiInsightsService';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'anomalies' | 'optimization'>('overview');

  const loadAnalysis = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const spendingAnalysis = await aiInsightsService.analyzeSpending(user.id, 'month');
      setAnalysis(spendingAnalysis);
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAnalysis();
    }
  }, [user, loadAnalysis]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load analytics data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="w-8 h-8 text-orange-500 mr-3" />
            Advanced Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            AI-powered insights into your spending patterns and financial health
          </p>
        </div>
      </div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ShieldCheckIcon className="w-6 h-6 text-green-500 mr-2" />
            Financial Health Score
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(analysis.financialHealth.overall)}`}>
            {analysis.financialHealth.overall}/100
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Spending', score: analysis.financialHealth.spending },
            { label: 'Savings', score: analysis.financialHealth.savings },
            { label: 'Debt', score: analysis.financialHealth.debt },
            { label: 'Income', score: analysis.financialHealth.income }
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {item.score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {analysis.financialHealth.recommendations.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {analysis.financialHealth.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <ArrowRightIcon className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'patterns', name: 'Spending Patterns', icon: ClockIcon },
            { id: 'anomalies', name: 'Anomalies', icon: ExclamationTriangleIcon },
            { id: 'optimization', name: 'Budget Optimization', icon: LightBulbIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${analysis.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <ArrowTrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${analysis.averageDailySpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analysis.topCategories.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Spending Categories
              </h3>
              <div className="space-y-4">
                {analysis.topCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${category.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detected Spending Patterns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.spendingPatterns.map((pattern) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pattern.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pattern.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${pattern.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {pattern.frequency}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {pattern.category}
                    </span>
                  </div>
                  
                  {(pattern.timeOfDay || pattern.dayOfWeek) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {pattern.timeOfDay && (
                          <span>Most common time: {pattern.timeOfDay}</span>
                        )}
                        {pattern.dayOfWeek && (
                          <span>Most common day: {pattern.dayOfWeek}</span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Anomaly Detection
            </h3>
            <div className="space-y-4">
              {analysis.anomalyDetection.map((anomaly) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {anomaly.description}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {anomaly.recommendation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  {anomaly.expectedValue && anomaly.actualValue && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Expected: ${anomaly.expectedValue.toFixed(2)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Actual: ${anomaly.actualValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Budget Optimization Recommendations
            </h3>
            <div className="space-y-4">
              {analysis.budgetOptimization.map((optimization) => (
                <motion.div
                  key={optimization.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {optimization.category}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {optimization.reasoning}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        Save ${optimization.potentialSavings.toFixed(2)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(optimization.priority)}`}>
                        {optimization.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Current Spending
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${optimization.currentSpending.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Recommended Budget
                      </p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        ${optimization.recommendedBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Action Items:
                    </h5>
                    <ul className="space-y-1">
                      {optimization.actionItems.map((item, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ArrowRightIcon className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
