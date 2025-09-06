import React from 'react';
import { SpendingForecast } from '../../types/Analytics';
import { ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ForecastCardProps {
  forecast: SpendingForecast;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-500 dark:text-green-400';
    if (confidence >= 0.5) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Spending Forecast
        </h3>
      </div>

      <div className="space-y-4">
        {/* Next Month */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Next Month
              </span>
            </div>
            <span className={`text-xs font-medium ${getConfidenceColor(forecast.nextMonth.confidence)}`}>
              {getConfidenceLabel(forecast.nextMonth.confidence)} Confidence
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${forecast.nextMonth.predicted.toFixed(2)}
          </p>
        </div>

        {/* Next Quarter */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Next Quarter
              </span>
            </div>
            <span className={`text-xs font-medium ${getConfidenceColor(forecast.nextQuarter.confidence)}`}>
              {getConfidenceLabel(forecast.nextQuarter.confidence)} Confidence
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${forecast.nextQuarter.predicted.toFixed(2)}
          </p>
        </div>

        {/* Next Year */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Next Year
              </span>
            </div>
            <span className={`text-xs font-medium ${getConfidenceColor(forecast.nextYear.confidence)}`}>
              {getConfidenceLabel(forecast.nextYear.confidence)} Confidence
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${forecast.nextYear.predicted.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 Forecasts are based on your recent spending patterns and trends. 
          Higher confidence indicates more reliable predictions.
        </p>
      </div>
    </div>
  );
};

export default ForecastCard;
