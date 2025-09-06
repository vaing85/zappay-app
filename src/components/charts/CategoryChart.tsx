import React from 'react';
import { SpendingCategory } from '../../types/Analytics';

interface CategoryChartProps {
  categories: SpendingCategory[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No spending data available</p>
        </div>
      </div>
    );
  }

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div key={category.id} className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-2xl">{category.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {category.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.percentage.toFixed(1)}% • ${category.amount.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-32">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;
