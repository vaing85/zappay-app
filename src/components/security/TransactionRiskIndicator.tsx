import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { TransactionRiskScore } from '../../types/TransactionSecurity';

interface TransactionRiskIndicatorProps {
  riskScore: TransactionRiskScore | null;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const TransactionRiskIndicator: React.FC<TransactionRiskIndicatorProps> = ({
  riskScore,
  size = 'md',
  showDetails = false
}) => {
  if (!riskScore) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-pulse bg-gray-300 rounded-full w-4 h-4"></div>
        <span className="text-sm">Analyzing...</span>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'high':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'critical':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ShieldCheckIcon className="w-5 h-5" />;
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'allow':
        return 'Transaction approved';
      case 'review':
        return 'Under review';
      case 'require_2fa':
        return '2FA required';
      case 'block':
        return 'Transaction blocked';
      default:
        return 'Pending analysis';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col space-y-2"
    >
      <div className={`inline-flex items-center space-x-2 rounded-full ${getRiskColor(riskScore.level)} ${getSizeClasses(size)}`}>
        {getRiskIcon(riskScore.level)}
        <span className="font-medium">
          Risk: {riskScore.level.toUpperCase()} ({riskScore.score}/100)
        </span>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recommendation:
            </span>
            <span className={`text-sm font-medium ${
              riskScore.recommendation === 'allow' ? 'text-green-600' :
              riskScore.recommendation === 'review' ? 'text-yellow-600' :
              riskScore.recommendation === 'require_2fa' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {getRecommendationText(riskScore.recommendation)}
            </span>
          </div>

          {riskScore.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Factors:
              </h4>
              <div className="space-y-2">
                {riskScore.factors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {factor.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-red-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${factor.impact}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(factor.impact)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TransactionRiskIndicator;
