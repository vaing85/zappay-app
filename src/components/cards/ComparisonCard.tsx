import React from 'react';
import { ComparisonData } from '../../types/Analytics';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ComparisonCardProps {
  title: string;
  data: ComparisonData;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, data }) => {
  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const isNeutral = data.change === 0;

  const getChangeColor = () => {
    if (isPositive) return 'text-red-500 dark:text-red-400';
    if (isNegative) return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getChangeIcon = () => {
    if (isPositive) return <ArrowTrendingUpIcon className="w-4 h-4" />;
    if (isNegative) return <ArrowTrendingDownIcon className="w-4 h-4" />;
    return <MinusIcon className="w-4 h-4" />;
  };

  const getChangeLabel = () => {
    if (isPositive) return 'Increase';
    if (isNegative) return 'Decrease';
    return 'No Change';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="space-y-4">
        {/* Current Period */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Period</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.current.period}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${data.current.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Previous Period */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Previous Period</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.previous.period}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${data.previous.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Change Summary */}
        <div className="p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getChangeIcon()}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {getChangeLabel()}
              </span>
            </div>
            <div className={`text-right ${getChangeColor()}`}>
              <p className="text-lg font-bold">
                {isPositive ? '+' : ''}${data.change.toFixed(2)}
              </p>
              <p className="text-sm">
                {isPositive ? '+' : ''}{data.changePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Change Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isPositive 
                  ? 'bg-red-500' 
                  : isNegative 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
              }`}
              style={{ 
                width: `${Math.min(Math.abs(data.changePercentage), 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isPositive && (
              <>📈 Your spending increased by {data.changePercentage.toFixed(1)}% compared to the previous period.</>
            )}
            {isNegative && (
              <>📉 Great job! Your spending decreased by {Math.abs(data.changePercentage).toFixed(1)}% compared to the previous period.</>
            )}
            {isNeutral && (
              <>➡️ Your spending remained the same compared to the previous period.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
