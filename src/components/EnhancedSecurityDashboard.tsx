import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  FingerPrintIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { biometricAuthService, BiometricCapability, BiometricEnrollment, BiometricSettings, BiometricAnalytics } from '../services/biometricAuthService';
import { enhancedFraudDetectionService, FraudAlert, FraudAnalytics, FraudPattern, FraudRule } from '../services/enhancedFraudDetectionService';

const EnhancedSecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'biometric' | 'fraud' | 'settings'>('overview');
  const [capabilities, setCapabilities] = useState<BiometricCapability[]>([]);
  const [enrollments, setEnrollments] = useState<BiometricEnrollment[]>([]);
  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings | null>(null);
  const [biometricAnalytics, setBiometricAnalytics] = useState<BiometricAnalytics | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [fraudAnalytics, setFraudAnalytics] = useState<FraudAnalytics | null>(null);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [, setRules] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Initialize biometric service
      const settings = await biometricAuthService.initializeUser(user.id);
      const caps = biometricAuthService.getCapabilities();
      const enrolls = biometricAuthService.getUserEnrollments(user.id);
      const bioAnalytics = biometricAuthService.getAnalytics();

      // Load fraud detection data
      const alerts = enhancedFraudDetectionService.getAlerts();
      const fraudAnalyticsData = enhancedFraudDetectionService.getAnalytics();
      const patternsData = enhancedFraudDetectionService.getPatterns();
      const rulesData = enhancedFraudDetectionService.getRules();

      setBiometricSettings(settings);
      setCapabilities(caps);
      setEnrollments(enrolls);
      setBiometricAnalytics(bioAnalytics);
      setFraudAlerts(alerts);
      setFraudAnalytics(fraudAnalyticsData);
      setPatterns(patternsData);
      setRules(rulesData);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return <FingerPrintIcon className="w-6 h-6" />;
      case 'face': return <FaceSmileIcon className="w-6 h-6" />;
      case 'voice': return <MicrophoneIcon className="w-6 h-6" />;
      case 'iris': return <EyeIcon className="w-6 h-6" />;
      case 'palm': return <DevicePhoneMobileIcon className="w-6 h-6" />;
      default: return <ShieldCheckIcon className="w-6 h-6" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  const enrollBiometric = async (type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm') => {
    try {
      // Simulate biometric enrollment
      const mockData = `mock_${type}_data_${Date.now()}`;
      const enrollment = await biometricAuthService.enrollBiometric(user!.id, type, mockData);
      setEnrollments(prev => [...prev, enrollment]);
    } catch (error) {
      console.error('Error enrolling biometric:', error);
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      await biometricAuthService.deleteEnrollment(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  const resolveAlert = (alertId: string) => {
    enhancedFraudDetectionService.resolveAlert(alertId, {
      resolvedBy: user!.id,
      resolvedAt: new Date(),
      action: 'Manual review completed',
      notes: 'Alert resolved by user'
    });
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShieldCheckIcon className="w-8 h-8 text-orange-500 mr-3" />
            Enhanced Security Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive security monitoring and biometric authentication
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'biometric', name: 'Biometric Auth', icon: FingerPrintIcon },
            { id: 'fraud', name: 'Fraud Detection', icon: ExclamationTriangleIcon },
            { id: 'settings', name: 'Settings', icon: CogIcon }
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

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Biometric Enrollments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {enrollments.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FingerPrintIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fraudAlerts.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fraudAnalytics ? `${(fraudAnalytics.detectionRate * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {biometricAnalytics ? `${(biometricAnalytics.successRate * 100).toFixed(0)}%` : '0%'}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Security Alerts
              </h3>
              <div className="space-y-3">
                {fraudAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.status === 'active' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'biometric' && (
          <div className="space-y-6">
            {/* Biometric Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available Biometric Methods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {capabilities.map((capability) => (
                  <div key={capability.type} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      {getBiometricIcon(capability.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {capability.type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {capability.available ? 'Available' : 'Not Available'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Enrolled:</span>
                        <span className={capability.enrolled ? 'text-green-600' : 'text-red-600'}>
                          {capability.enrolled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className="text-gray-900 dark:text-white">
                          {(capability.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Error Rate:</span>
                        <span className="text-gray-900 dark:text-white">
                          {(capability.errorRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {capability.available && !capability.enrolled && (
                      <button
                        onClick={() => enrollBiometric(capability.type as any)}
                        className="w-full mt-3 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Current Enrollments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Enrollments
              </h3>
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getBiometricIcon(enrollment.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {enrollment.type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quality: {(enrollment.quality * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                        Active
                      </span>
                      <button
                        onClick={() => deleteEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Biometric Analytics */}
            {biometricAnalytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Biometric Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {biometricAnalytics.totalAttempts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(biometricAnalytics.successRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {biometricAnalytics.averageResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="space-y-6">
            {/* Fraud Detection Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fraud Detection Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fraudAnalytics?.totalTransactions || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fraudAnalytics?.flaggedTransactions || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Flagged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fraudAnalytics ? `${(fraudAnalytics.detectionRate * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fraudAnalytics ? `${(fraudAnalytics.accuracy * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
              </div>
            </motion.div>

            {/* Active Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Fraud Alerts
              </h3>
              <div className="space-y-3">
                {fraudAlerts.filter(alert => alert.status === 'active').map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(alert.riskScore >= 80 ? 'critical' : alert.riskScore >= 60 ? 'high' : 'medium')}`}>
                          {alert.riskScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </span>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Detection Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detection Patterns
              </h3>
              <div className="space-y-3">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{pattern.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(pattern.riskLevel)}`}>
                        {pattern.riskLevel.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {pattern.frequency} detections
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Biometric Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable biometric authentication for enhanced security
                    </p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      biometricSettings?.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        biometricSettings?.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Require Biometric for Payments</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require biometric authentication for all payment transactions
                    </p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      biometricSettings?.requireBiometricForPayments ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        biometricSettings?.requireBiometricForPayments ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Auto Lock</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically lock the app after period of inactivity
                    </p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      biometricSettings?.autoLock ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        biometricSettings?.autoLock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSecurityDashboard;
