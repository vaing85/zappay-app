import React from 'react';
import { SpendingGoal } from '../../types/Analytics';
import { TagIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface GoalCardProps {
  goal: SpendingGoal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const getStatusColor = (status: SpendingGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 dark:text-green-400';
      case 'ahead':
        return 'text-blue-500 dark:text-blue-400';
      case 'on-track':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'behind':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: SpendingGoal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'ahead':
        return <TagIcon className="w-4 h-4" />;
      case 'behind':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <TagIcon className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: SpendingGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ahead':
        return 'Ahead of Schedule';
      case 'on-track':
        return 'On Track';
      case 'behind':
        return 'Behind Schedule';
      default:
        return 'Unknown';
    }
  };

  const getProgressColor = (status: SpendingGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'ahead':
        return 'bg-blue-500';
      case 'on-track':
        return 'bg-yellow-500';
      case 'behind':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {goal.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {goal.category}
          </p>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(goal.status)}`}>
          {getStatusIcon(goal.status)}
          <span className="text-xs font-medium">
            {getStatusLabel(goal.status)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{goal.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.status)}`}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Current</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ${goal.currentAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Target</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ${goal.targetAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Remaining Info */}
      {goal.status !== 'completed' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${remainingAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Deadline</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
            </span>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {goal.status === 'completed' && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
            🎉 Goal completed! Great job!
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalCard;
