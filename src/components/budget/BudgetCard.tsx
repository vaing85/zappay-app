import React from 'react';
import { motion } from 'framer-motion';
import { Budget } from '../../types/Budget';
import { calculateBudgetProgress, getBudgetStatus } from '../../services/budgetService';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budgetId: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const progress = calculateBudgetProgress(budget);
  const status = getBudgetStatus(budget);
  const remaining = budget.amount - budget.spent;

  const getStatusColor = () => {
    switch (status) {
      case 'exceeded':
        return 'text-red-600 dark:text-red-400';
      case 'critical':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'exceeded':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-500';
      case 'critical':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{budget.category.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {budget.category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Budgeted</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${budget.amount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${budget.spent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Remaining/Over Budget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {remaining >= 0 ? 'Remaining' : 'Over Budget'}
          </span>
        </div>
        <span className={`font-semibold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {remaining >= 0 ? '+' : ''}${remaining.toFixed(2)}
        </span>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="flex-1 px-3 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BudgetCard;
