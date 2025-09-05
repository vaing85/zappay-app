import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { TransactionSecuritySettings, TransactionValidationRule } from '../../types/TransactionSecurity';
import { useTransactionSecurity } from '../../contexts/TransactionSecurityContext';

interface TransactionSecuritySettingsProps {
  className?: string;
}

const TransactionSecuritySettingsComponent: React.FC<TransactionSecuritySettingsProps> = ({
  className = ''
}) => {
  const {
    settings,
    validationRules,
    updateSecuritySettings,
    loading
  } = useTransactionSecurity();

  const [localSettings, setLocalSettings] = useState<TransactionSecuritySettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'rules' | 'notifications'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      await updateSecuritySettings(localSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalSettings = (updates: Partial<TransactionSecuritySettings>) => {
    setLocalSettings(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateFraudDetection = (updates: Partial<TransactionSecuritySettings['fraudDetection']>) => {
    if (!localSettings) return;
    updateLocalSettings({
      fraudDetection: {
        ...localSettings.fraudDetection,
        ...updates
      }
    });
  };

  const updateTimeRestrictions = (updates: Partial<TransactionSecuritySettings['timeRestrictions']>) => {
    if (!localSettings) return;
    updateLocalSettings({
      timeRestrictions: {
        ...localSettings.timeRestrictions,
        ...updates
      }
    });
  };

  const updateNotificationSettings = (updates: Partial<TransactionSecuritySettings['notificationSettings']>) => {
    if (!localSettings) return;
    updateLocalSettings({
      notificationSettings: {
        ...localSettings.notificationSettings,
        ...updates
      }
    });
  };

  const toggleRule = (ruleId: string) => {
    if (!localSettings) return;
    
    const updatedRules = localSettings.fraudDetection.rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    
    updateFraudDetection({ rules: updatedRules });
  };

  if (loading || !localSettings) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: ShieldCheckIcon },
    { id: 'rules', name: 'Rules', icon: ExclamationTriangleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Security Settings
          </h3>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <XMarkIcon className="w-4 h-4" />
                <span className="text-sm">Error</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Fraud Detection */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Fraud Detection
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Fraud Detection
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically detect and flag suspicious transactions
                      </p>
                    </div>
                    <button
                      onClick={() => updateFraudDetection({ enabled: !localSettings.fraudDetection.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.fraudDetection.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.fraudDetection.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Daily Amount ($)
                      </label>
                      <input
                        type="number"
                        value={localSettings.maxDailyAmount}
                        onChange={(e) => updateLocalSettings({ maxDailyAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Single Transaction ($)
                      </label>
                      <input
                        type="number"
                        value={localSettings.maxSingleTransaction}
                        onChange={(e) => updateLocalSettings({ maxSingleTransaction: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Authentication
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require 2FA for Transactions
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Always require two-factor authentication for transactions
                    </p>
                  </div>
                  <button
                    onClick={() => updateLocalSettings({ twoFactorRequired: !localSettings.twoFactorRequired })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.twoFactorRequired ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Location Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Location & Device
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Device Verification
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Verify transactions from trusted devices only
                      </p>
                    </div>
                    <button
                      onClick={() => updateLocalSettings({ deviceVerification: !localSettings.deviceVerification })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.deviceVerification ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.deviceVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location Verification
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Flag transactions from unusual locations
                      </p>
                    </div>
                    <button
                      onClick={() => updateLocalSettings({ locationVerification: !localSettings.locationVerification })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.locationVerification ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.locationVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Validation Rules
              </h4>
              <div className="space-y-3">
                {validationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              rule.enabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rule.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                        rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rule.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h4>
              <div className="space-y-4">
                {Object.entries(localSettings.notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key} Notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive security alerts via {key}
                      </p>
                    </div>
                    <button
                      onClick={() => updateNotificationSettings({ [key]: !value })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionSecuritySettingsComponent;
