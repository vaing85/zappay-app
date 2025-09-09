import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';
import { Link } from 'react-router-dom';

const PremiumAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { hasFeatureAccess, currentSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'reports' | 'alerts'>('insights');
  
  const [insights, setInsights] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPremiumData();
    }
  }, [user, activeTab]);

  const loadPremiumData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create a synchronous wrapper for hasFeatureAccess
      const syncHasFeatureAccess = (feature: string): boolean => {
        // For now, return true for all features - in a real app, this would check the current subscription
        return currentSubscription?.planId !== 'free' || false;
      };
      
      switch (activeTab) {
        case 'insights':
          const insightsData = await analyticsService.getAdvancedInsights(user.id, syncHasFeatureAccess);
          setInsights(insightsData);
          break;
        case 'predictions':
          const predictionsData = await analyticsService.getPredictiveAnalytics(user.id, syncHasFeatureAccess);
          setPredictions(predictionsData);
          break;
        case 'reports':
          const reportsData = await analyticsService.getCustomReports(user.id, syncHasFeatureAccess);
          setReports(reportsData);
          break;
        case 'alerts':
          const alertsData = await analyticsService.getRealTimeAlerts(user.id, syncHasFeatureAccess);
          setAlerts(alertsData);
          break;
      }
    } catch (error) {
      console.error('Error loading premium analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPlanIcon = () => {
    if (!currentSubscription) return <StarIcon className="w-6 h-6" />;
    
    switch (currentSubscription.planId) {
      case 'pro':
        return <StarIcon className="w-6 h-6" />;
      case 'business':
        return <UsersIcon className="w-6 h-6" />;
      case 'enterprise':
        return <StarIcon className="w-6 h-6" />;
      default:
        return <StarIcon className="w-6 h-6" />;
    }
  };

  const renderInsights = () => {
    if (!insights) return null;

    if (!insights.isPremium) {
      return (
        <div className="text-center py-12">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI-Powered Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {insights.upgradeMessage}
          </p>
          <Link
            to="/subscription-plans"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <StarIcon className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* AI Insights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.insights.map((insight: any) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.impact)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                  <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                    {insight.impact.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                  <span>{insight.category}</span>
                </div>
                {insight.recommendation && (
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-orange-500">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {insights.recommendations.map((rec: any) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {rec.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Estimated Savings
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      ${rec.estimatedSavings || rec.estimatedReturns}/month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Action Items
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {rec.actionItems.length} steps
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Action Items:
                  </h5>
                  <ul className="space-y-1">
                    {rec.actionItems.map((item: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPredictions = () => {
    if (!predictions) return null;

    if (!predictions.isPremium) {
      return (
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Predictive Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {predictions.upgradeMessage}
          </p>
          <Link
            to="/subscription-plans"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Upgrade to Business
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Predictive Analytics
          </h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">Model Version:</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {predictions.modelVersion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.predictions.map((prediction: any) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {prediction.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  prediction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {prediction.riskLevel.toUpperCase()}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${prediction.predictedAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {(prediction.confidence * 100).toFixed(0)}%
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Key Factors:
                </h5>
                <ul className="space-y-1">
                  {prediction.factors.map((factor: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <ArrowUpIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    if (!reports) return null;

    if (!reports.isPremium) {
      return (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Custom Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {reports.upgradeMessage}
          </p>
          <Link
            to="/subscription-plans"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Upgrade to Business
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Custom Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.reports.map((report: any) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {report.name}
                </h4>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {report.type.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {report.description}
              </p>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Frequency: {report.frequency}
                  </h5>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Includes:
                  </h5>
                  <ul className="space-y-1">
                    {report.includes.map((item: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Customization:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(report.customization).map(([key, value]) => (
                      <span
                        key={key}
                        className={`px-2 py-1 rounded text-xs ${
                          value ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {key}: {value ? 'Yes' : 'No'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Generate Report
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    if (!alerts) return null;

    if (!alerts.isPremium) {
      return (
        <div className="text-center py-12">
          <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Real-time Alerts
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {alerts.upgradeMessage}
          </p>
          <Link
            to="/subscription-plans"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <StarIcon className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Real-time Alerts
        </h3>

        <div className="space-y-4">
          {alerts.alerts.map((alert: any) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  {alert.actionRequired && (
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                        Action Required
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Category: {alert.category}
                </span>
                {alert.actions && alert.actions.length > 0 && (
                  <div className="flex space-x-2">
                    {alert.actions.slice(0, 2).map((action: string, index: number) => (
                      <button
                        key={index}
                        className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Premium Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced insights powered by AI and machine learning
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {getPlanIcon()}
          <span>{currentSubscription?.planId || 'Free'} Plan</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'insights', name: 'AI Insights', icon: SparklesIcon },
            { id: 'predictions', name: 'Predictions', icon: ChartBarIcon },
            { id: 'reports', name: 'Custom Reports', icon: DocumentTextIcon },
            { id: 'alerts', name: 'Real-time Alerts', icon: BellIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="py-6">
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'alerts' && renderAlerts()}
      </div>
    </div>
  );
};

export default PremiumAnalytics;
