import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { SpendingCategory, SpendingTrend, MonthlyReport, SpendingForecast, SpendingGoal, ComparisonData } from '../types/Analytics';
import CategoryChart from './charts/CategoryChart';
import TrendChart from './charts/TrendChart';
import ForecastCard from './cards/ForecastCard';
import GoalCard from './cards/GoalCard';
import ComparisonCard from './cards/ComparisonCard';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [forecast, setForecast] = useState<SpendingForecast | null>(null);
  const [goals, setGoals] = useState<SpendingGoal[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<ComparisonData | null>(null);
  const [yearlyComparison, setYearlyComparison] = useState<ComparisonData | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      // Load all analytics data
      const [
        categoriesData,
        trendsData,
        monthlyReportData,
        forecastData,
        goalsData,
        monthlyComparisonData,
        yearlyComparisonData
      ] = await Promise.all([
        analyticsService.getSpendingCategories(user.id, startDate, endDate),
        analyticsService.getSpendingTrends(user.id, 6),
        analyticsService.getMonthlyReport(user.id, selectedYear, selectedMonth),
        analyticsService.getSpendingForecast(user.id),
        analyticsService.getSpendingGoals(user.id),
        analyticsService.getComparisonData(user.id, 'monthly'),
        analyticsService.getComparisonData(user.id, 'yearly')
      ]);

      setCategories(categoriesData);
      setTrends(trendsData);
      setMonthlyReport(monthlyReportData);
      setForecast(forecastData);
      setGoals(goalsData);
      setMonthlyComparison(monthlyComparisonData);
      setYearlyComparison(yearlyComparisonData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, loadAnalyticsData]);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!user) return;
    
    const data = analyticsService.exportReport(user.id, format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zappay-report-${selectedYear}-${selectedMonth}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalSpending = useMemo(() => 
    categories.reduce((sum, cat) => sum + cat.amount, 0), 
    [categories]
  );

  const averageSpending = useMemo(() => 
    trends.length > 0 ? trends.reduce((sum, t) => sum + t.amount, 0) / trends.length : 0,
    [trends]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Insights into your spending patterns and financial trends
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Period Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalSpending.toFixed(2)}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${averageSpending.toFixed(2)}
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
                {categories.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthlyReport?.savingsRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h3>
          <CategoryChart categories={categories} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending Trends
          </h3>
          <TrendChart trends={trends} />
        </motion.div>
      </div>

      {/* Forecast and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ForecastCard forecast={forecast} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending Goals
          </h3>
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <ComparisonCard 
              title="Monthly Comparison" 
              data={monthlyComparison} 
            />
          </motion.div>
        )}

        {yearlyComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <ComparisonCard 
              title="Yearly Comparison" 
              data={yearlyComparison} 
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
