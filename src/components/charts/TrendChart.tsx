import React from 'react';
import { SpendingTrend } from '../../types/Analytics';

interface TrendChartProps {
  trends: SpendingTrend[];
}

const TrendChart: React.FC<TrendChartProps> = ({ trends }) => {
  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...trends.map(t => t.amount));
  const minAmount = Math.min(...trends.map(t => t.amount));
  const range = maxAmount - minAmount;

  return (
    <div className="space-y-4">
      {/* Chart Area */}
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={200 * ratio}
              x2="400"
              y2={200 * ratio}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}
          
          {/* Trend line */}
          <polyline
            points={trends.map((trend, index) => {
              const x = (index / (trends.length - 1)) * 400;
              const y = range > 0 ? 200 - ((trend.amount - minAmount) / range) * 200 : 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {trends.map((trend, index) => {
            const x = (index / (trends.length - 1)) * 400;
            const y = range > 0 ? 200 - ((trend.amount - minAmount) / range) * 200 : 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#F59E0B"
                className="hover:r-6 transition-all duration-200"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        {trends.map((trend, index) => (
          <div key={index} className="text-center">
            <div>{trend.period}</div>
            <div className="font-medium text-gray-900 dark:text-white">
              ${trend.amount.toFixed(0)}
            </div>
            {trend.change !== 0 && (
              <div className={`text-xs ${
                trend.change > 0 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-green-500 dark:text-green-400'
              }`}>
                {trend.change > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Highest</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${maxAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Lowest</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${minAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
