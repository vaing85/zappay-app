import React from 'react';
import { SpendingTrend } from '../../types/Analytics';

interface SpendingChartProps {
  trends: SpendingTrend[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ trends }) => {
  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No spending data available</p>
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
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 250">
          {/* Grid lines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={250 * ratio}
              x2="400"
              y2={250 * ratio}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
            const value = minAmount + (range * (1 - ratio));
            return (
              <text
                key={index}
                x="10"
                y={250 * ratio + 4}
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                ${value.toFixed(0)}
              </text>
            );
          })}
          
          {/* Trend line */}
          <polyline
            points={trends.map((trend, index) => {
              const x = 50 + (index / (trends.length - 1)) * 350;
              const y = range > 0 ? 20 + ((trend.amount - minAmount) / range) * 200 : 120;
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
            const x = 50 + (index / (trends.length - 1)) * 350;
            const y = range > 0 ? 20 + ((trend.amount - minAmount) / range) * 200 : 120;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#F59E0B"
                  className="hover:r-8 transition-all duration-200"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="white"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 ml-12 mr-2">
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

      {/* Summary Stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Highest</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${maxAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Lowest</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${minAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Average</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${(trends.reduce((sum, t) => sum + t.amount, 0) / trends.length).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
