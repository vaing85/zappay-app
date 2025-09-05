import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import {
  ChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetGoalCard from '../components/budget/BudgetGoalCard';
import BudgetAlertCard from '../components/budget/BudgetAlertCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { Budget as BudgetType, BudgetGoal } from '../types/Budget';

const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const {
    budgets = [],
    budgetGoals = [],
    budgetAlerts = [],
    budgetReport = null,
    budgetInsights = [],
    loading = false
  } = useBudget();

  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'goals' | 'alerts' | 'insights'>('overview');
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view your budget.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading budget data...</p>
        </div>
      </div>
    );
  }

  const unreadAlerts = (budgetAlerts || []).filter(alert => !alert.isRead).length;
  const totalBudget = (budgets || []).reduce((sum, budget) => sum + (budget?.amount || 0), 0);
  const totalSpent = (budgets || []).reduce((sum, budget) => sum + (budget?.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💰 Budget Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your spending, set limits, and achieve your financial goals
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalBudget.toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className={`text-2xl font-bold ${
                totalRemaining >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${totalRemaining.toFixed(2)}
              </p>
            </div>
            <TagIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {unreadAlerts}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'budgets', label: 'Budgets', icon: CurrencyDollarIcon },
              { id: 'goals', label: 'Goals', icon: TagIcon },
              { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'insights', label: 'Insights', icon: Cog6ToothIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'alerts' && unreadAlerts > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadAlerts}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Budget Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Budget Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.slice(0, 6).map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} />
                  ))}
                </div>
              </div>

              {/* Recent Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetGoals.slice(0, 4).map((goal) => (
                    <BudgetGoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </div>

              {/* Recent Alerts */}
              {budgetAlerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Alerts
                  </h3>
                  <div className="space-y-3">
                    {budgetAlerts.slice(0, 3).map((alert) => (
                      <BudgetAlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budgets Tab */}
          {activeTab === 'budgets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Budgets
                </h3>
                <button
                  onClick={() => setShowCreateBudget(true)}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Budget</span>
                </button>
              </div>

              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No budgets yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first budget to start tracking your spending
                  </p>
                  <button
                    onClick={() => setShowCreateBudget(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create Budget
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Goals
                </h3>
                <button
                  onClick={() => setShowCreateGoal(true)}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>

              {budgetGoals.length === 0 ? (
                <div className="text-center py-12">
                  <TagIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No goals yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Set your first financial goal to start saving
                  </p>
                  <button
                    onClick={() => setShowCreateGoal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetGoals.map((goal) => (
                    <BudgetGoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Budget Alerts
                </h3>
                {unreadAlerts > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    {unreadAlerts} unread
                  </span>
                )}
              </div>

              {budgetAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No alerts
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You're all caught up! No budget alerts at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {budgetAlerts.map((alert) => (
                    <BudgetAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Budget Insights
              </h3>

              {budgetInsights.length === 0 ? (
                <div className="text-center py-12">
                  <Cog6ToothIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No insights yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Insights will appear as you use the budget features.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {insight.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default BudgetPage;
