import React from 'react';
import { motion } from 'framer-motion';
import { BudgetGoal } from '../../types/Budget';
import { 
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface BudgetGoalCardProps {
  goal: BudgetGoal;
  onEdit?: (goal: BudgetGoal) => void;
  onDelete?: (goalId: string) => void;
}

const BudgetGoalCard: React.FC<BudgetGoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.isCompleted || progress >= 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return '💰';
      case 'debt_payment':
        return '💳';
      case 'investment':
        return '📈';
      case 'purchase':
        return '🛍️';
      default:
        return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return 'text-green-600 dark:text-green-400';
      case 'debt_payment':
        return 'text-red-600 dark:text-red-400';
      case 'investment':
        return 'text-blue-600 dark:text-blue-400';
      case 'purchase':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow ${
        isCompleted ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getCategoryIcon(goal.category)}</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {goal.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {goal.description}
            </p>
          </div>
        </div>
        {isCompleted && (
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isCompleted 
                ? 'bg-green-500' 
                : progress >= 75 
                  ? 'bg-blue-500' 
                  : progress >= 50 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${goal.currentAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${goal.targetAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isCompleted ? 'Completed!' : 'Remaining'}
          </span>
        </div>
        <span className={`font-semibold ${
          isCompleted 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-900 dark:text-white'
        }`}>
          {isCompleted ? '🎉' : `$${remaining.toFixed(2)}`}
        </span>
      </div>

      {/* Deadline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Deadline</span>
        </div>
        <span className={`text-sm font-medium ${
          daysRemaining < 0 
            ? 'text-red-600 dark:text-red-400' 
            : daysRemaining < 7 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-gray-900 dark:text-white'
        }`}>
          {daysRemaining < 0 
            ? `Overdue by ${Math.abs(daysRemaining)} days` 
            : `${daysRemaining} days left`
          }
        </span>
      </div>

      {/* Category */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
        </div>
        <span className={`text-sm font-medium capitalize ${getCategoryColor(goal.category)}`}>
          {goal.category.replace('_', ' ')}
        </span>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && !isCompleted && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="flex-1 px-3 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
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

export default BudgetGoalCard;
