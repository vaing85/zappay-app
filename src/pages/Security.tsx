import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import SecurityAlertCard from '../components/security/SecurityAlertCard';
import TwoFactorSetup from '../components/security/TwoFactorSetup';
import PasswordStrengthMeter from '../components/security/PasswordStrengthMeter';
import FraudDetectionDashboard from '../components/FraudDetectionDashboard';
import SecurityErrorBoundary from '../components/SecurityErrorBoundary';
import { TwoFactorMethod } from '../types/Security';

const Security: React.FC = () => {
  const { user } = useAuth();
  
  // Call hooks unconditionally at the top level
  const [activeTab, setActiveTab] = useState<'overview' | '2fa' | 'devices' | 'alerts' | 'events' | 'settings'>('overview');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Call useSecurity hook unconditionally
  const securityContext = useSecurity();

  const {
    securitySettings = null,
    twoFactorMethods = [],
    securityEvents = [],
    trustedDevices = [],
    securityAlerts = [],
    passwordPolicy = null,
    loading = false,
    updateSettings,
    addTwoFactorMethod,
    verifyTwoFactorCode,
    markAlertAsRead,
    resolveAlert
  } = securityContext;

  if (!user) {
    return <div className="text-gray-900 dark:text-white">Please log in to view security settings.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading security settings...</p>
        </div>
      </div>
    );
  }

  const unreadAlerts = securityAlerts.filter(alert => !alert.isRead).length;

  return (
    <SecurityErrorBoundary>
      <div className="max-w-6xl mx-auto w-full px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🛡️ Security Center
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account security and privacy settings
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {securitySettings ? (securitySettings.twoFactorEnabled ? 85 : 60) : 0}
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">2FA Methods</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {twoFactorMethods.length}
              </p>
            </div>
            <KeyIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trusted Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trustedDevices.length}
              </p>
            </div>
            <ComputerDesktopIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {unreadAlerts}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
              { id: '2fa', label: '2FA', icon: KeyIcon },
              { id: 'devices', label: 'Devices', icon: ComputerDesktopIcon },
              { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'events', label: 'Events', icon: ChartBarIcon },
              { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'alerts' && unreadAlerts > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadAlerts}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Security Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings?.twoFactorEnabled 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Biometric Authentication
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings?.biometricEnabled 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {securitySettings?.biometricEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              {securityAlerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Security Alerts
                  </h3>
                  <div className="space-y-3">
                    {securityAlerts.slice(0, 3).map((alert) => (
                      <SecurityAlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2FA Tab */}
          {activeTab === '2fa' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
                <button
                  onClick={() => {
                    const newMethod: Omit<TwoFactorMethod, 'id' | 'createdAt'> = {
                      userId: user.id,
                      type: 'sms',
                      value: user.email,
                      isPrimary: false,
                      isVerified: false
                    };
                    addTwoFactorMethod(newMethod);
                    setSelectedMethod(newMethod as TwoFactorMethod);
                    setShowTwoFactorSetup(true);
                  }}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Method</span>
                </button>
              </div>

              {showTwoFactorSetup && selectedMethod ? (
                <TwoFactorSetup
                  method={selectedMethod}
                  onVerify={async (code) => {
                    const success = await verifyTwoFactorCode(selectedMethod.id, code);
                    if (success) {
                      setShowTwoFactorSetup(false);
                      setSelectedMethod(null);
                    }
                    return success;
                  }}
                  onCancel={() => {
                    setShowTwoFactorSetup(false);
                    setSelectedMethod(null);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {twoFactorMethods.map((method) => (
                    <div key={method.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {method.type === 'sms' && <DevicePhoneMobileIcon className="w-5 h-5 text-blue-500" />}
                          {method.type === 'email' && <KeyIcon className="w-5 h-5 text-green-500" />}
                          {method.type === 'authenticator' && <KeyIcon className="w-5 h-5 text-purple-500" />}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {method.type === 'sms' ? 'SMS' : method.type === 'email' ? 'Email' : 'Authenticator App'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {method.value}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          method.isVerified 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {method.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trusted Devices
              </h3>
              <div className="space-y-4">
                {trustedDevices.map((device) => (
                  <div key={device.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ComputerDesktopIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {device.deviceName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {device.os} • {device.browser}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {device.location.city}, {device.location.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last seen: {new Date(device.lastSeen).toLocaleDateString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          device.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                        }`}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Alerts
                </h3>
                {unreadAlerts > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    {unreadAlerts} unread
                  </span>
                )}
              </div>

              {securityAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No security alerts
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You're all caught up! No security alerts at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <SecurityAlertCard 
                      key={alert.id} 
                      alert={alert}
                      onMarkAsRead={markAlertAsRead}
                      onResolve={resolveAlert}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Events
              </h3>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.ipAddress} • {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                        event.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                        event.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h3>
              
              {/* Password Change */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    />
                    {passwordPolicy && newPassword && (
                      <PasswordStrengthMeter password={newPassword} policy={passwordPolicy} />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <button
                    disabled={!newPassword || newPassword !== confirmPassword}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Security Preferences */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Security Preferences
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Auto-logout after inactivity
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically log out after {securitySettings?.sessionTimeout || 30} minutes of inactivity
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings?.autoLogout || false}
                      onChange={(e) => updateSettings({ autoLogout: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Security alerts
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications for security events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings?.securityAlerts || false}
                      onChange={(e) => updateSettings({ securityAlerts: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Fraud Detection Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <FraudDetectionDashboard />
      </motion.div>
      </div>
    </SecurityErrorBoundary>
  );
};

export default Security;
