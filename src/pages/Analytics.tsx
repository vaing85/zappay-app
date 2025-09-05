import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getTransactionsForUser } from '../services/mockData';
import { generateAnalyticsSummary, getDateRangeOptions } from '../services/analyticsService';
import { AnalyticsSummary, DateRange } from '../types/Analytics';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const transactions = getTransactionsForUser(user.id);
      const summary = generateAnalyticsSummary(transactions);
      setAnalytics(summary);
      setSelectedDateRange(getDateRangeOptions()[0]); // Default to "This Month"
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view analytics.</div>;
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Prepare chart data
  const categoryChartData = {
    labels: analytics.categoryBreakdown.map(c => c.category),
    datasets: [{
      data: analytics.categoryBreakdown.map(c => c.amount),
      backgroundColor: analytics.categoryBreakdown.map(c => c.color),
      borderColor: analytics.categoryBreakdown.map(c => c.color),
      borderWidth: 2
    }]
  };

  const monthlyChartData = {
    labels: analytics.monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Spent',
        data: analytics.monthlyData.map(m => m.totalSpent),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Received',
        data: analytics.monthlyData.map(m => m.totalReceived),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const dailyChartData = {
    labels: analytics.dailyData.slice(-7).map(d => d.date),
    datasets: [
      {
        label: 'Daily Spending',
        data: analytics.dailyData.slice(-7).map(d => d.totalSpent),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const topRecipientsData = {
    labels: analytics.topRecipients.map(r => r.name),
    datasets: [{
      label: 'Amount Sent',
      data: analytics.topRecipients.map(r => r.amount),
      backgroundColor: '#F59E0B',
      borderColor: '#F59E0B',
      borderWidth: 1
    }]
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics & Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Understand your spending patterns and financial habits
        </p>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
      >
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range</h3>
          <select
            value={selectedDateRange?.label || ''}
            onChange={(e) => {
              const range = getDateRangeOptions().find(r => r.label === e.target.value);
              setSelectedDateRange(range || null);
            }}
            className="ml-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {getDateRangeOptions().map(option => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(analytics.totalSpent)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ArrowDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Received</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(analytics.totalReceived)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Net Amount</p>
              <p className={`text-2xl font-bold ${
                analytics.netAmount >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(analytics.netAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Transactions</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.transactionCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Spending Trend</h3>
          <div className="flex items-center space-x-2">
            {analytics.spendingTrend.trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
            ) : analytics.spendingTrend.trend === 'down' ? (
              <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
            )}
            <span className={`text-sm font-medium ${
              analytics.spendingTrend.trend === 'up' ? 'text-red-600' :
              analytics.spendingTrend.trend === 'down' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {analytics.spendingTrend.trend === 'up' ? 'Increasing' :
               analytics.spendingTrend.trend === 'down' ? 'Decreasing' : 'Stable'}
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.spendingTrend.amount)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">This Month</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              analytics.spendingTrend.change >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {analytics.spendingTrend.change >= 0 ? '+' : ''}{formatCurrency(analytics.spendingTrend.change)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Change</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              analytics.spendingTrend.changePercentage >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {analytics.spendingTrend.changePercentage >= 0 ? '+' : ''}{formatPercentage(analytics.spendingTrend.changePercentage)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Percentage</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Spending by Category
          </h3>
          <PieChart data={categoryChartData} height={300} />
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Trends
          </h3>
          <LineChart data={monthlyChartData} height={300} />
        </motion.div>
      </div>

      {/* Daily Spending & Top Recipients */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Last 7 Days Spending
          </h3>
          <LineChart data={dailyChartData} height={250} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top Recipients
          </h3>
          <BarChart data={topRecipientsData} height={250} />
        </motion.div>
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Insights & Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  insight.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    insight.severity === 'high' ? 'bg-red-100 dark:bg-red-900' :
                    insight.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {insight.severity === 'high' ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <LightBulbIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                    {insight.actionable && insight.actionText && (
                      <button className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium">
                        {insight.actionText} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Recipients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-2 mb-6">
          <UserGroupIcon className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Recipients</h3>
        </div>
        <div className="space-y-4">
          {analytics.topRecipients.map((recipient, index) => (
            <div key={recipient.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {recipient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{recipient.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {recipient.transactionCount} transaction{recipient.transactionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(recipient.amount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(recipient.lastTransaction).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
