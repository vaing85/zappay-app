import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { smartBudgetService, SmartBudgetAnalysis, BudgetRecommendation, BudgetGoal } from '../services/smartBudgetService';

interface SmartBudgetRecommendationsProps {
  className?: string;
}

const SmartBudgetRecommendations: React.FC<SmartBudgetRecommendationsProps> = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState<SmartBudgetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'goals' | 'insights'>('recommendations');

  useEffect(() => {
    loadBudgetAnalysis();
  }, []);

  const loadBudgetAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const budgetAnalysis = await smartBudgetService.analyzeBudget('user123');
      setAnalysis(budgetAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium':
        return <LightBulbIcon className="w-5 h-5" />;
      case 'low':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <LightBulbIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Analyzing your budget...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analysis Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadBudgetAnalysis}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Budget Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We need more transaction data to provide budget recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Smart Budget Recommendations
            </h2>
          </div>
          <button
            onClick={loadBudgetAnalysis}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Refresh Analysis"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ${analysis.totalIncome.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              ${analysis.totalExpenses.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {analysis.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'recommendations', label: 'Recommendations', count: analysis.recommendations.length },
          { id: 'goals', label: 'Goals', count: analysis.goals.length },
          { id: 'insights', label: 'Insights', count: analysis.insights.riskFactors.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getPriorityIcon(recommendation.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {recommendation.category}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {recommendation.reasoning}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${recommendation.currentSpending.toFixed(0)}
                          </p>
                        </div>
                        <ArrowDownIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Recommended</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${recommendation.recommendedAmount.toFixed(0)}
                          </p>
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          <p className="text-xs">Savings</p>
                          <p className="font-semibold">${recommendation.savings.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                    {recommendation.actionable && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Action Steps:
                        </p>
                        <ul className="space-y-1">
                          {recommendation.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'goals' && (
          <div className="space-y-4">
            {analysis.goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.category} • Due {goal.deadline.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {goal.priority}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {goal.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${goal.currentAmount.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${goal.targetAmount.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${goal.recommendedMonthlyContribution.toFixed(0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-6">
            {/* Risk Factors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Risk Factors
              </h3>
              <div className="space-y-2">
                {analysis.insights.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-800 dark:text-red-200">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Spending Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Overspending Categories
                  </h4>
                  <div className="space-y-1">
                    {analysis.insights.overspendingCategories.map((category, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        • {category}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Underspending Categories
                  </h4>
                  <div className="space-y-1">
                    {analysis.insights.underspendingCategories.map((category, index) => (
                      <div key={index} className="text-sm text-green-600 dark:text-green-400">
                        • {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Potential Savings */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  Potential Monthly Savings
                </h4>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${analysis.insights.potentialSavings.toFixed(0)}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                By following our recommendations, you could save this much per month.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartBudgetRecommendations;
