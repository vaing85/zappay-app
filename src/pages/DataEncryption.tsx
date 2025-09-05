import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useDataEncryption } from '../contexts/DataEncryptionContext';
import EncryptionStatus from '../components/security/EncryptionStatus';
import DataClassificationPanel from '../components/security/DataClassificationPanel';

const DataEncryption: React.FC = () => {
  const {
    isEncrypted,
    encryptionKey,
    settings,
    dataClassifications,
    loading,
    encrypting,
    decrypting,
    encryptData,
    generateKeyPair,
    rotateKeys,
    revokeKey,
    updateEncryptionSettings,
    updateDataClassification,
    refreshAuditLogs
  } = useDataEncryption();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'classifications' | 'keys' | 'audit'>('overview');
  const [testData, setTestData] = useState({
    message: 'This is a test message to encrypt',
    classification: 'confidential'
  });
  const [encryptedTestData, setEncryptedTestData] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    refreshAuditLogs();
  }, [refreshAuditLogs]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'classifications', name: 'Classifications', icon: DocumentTextIcon },
    { id: 'keys', name: 'Keys', icon: KeyIcon },
    { id: 'audit', name: 'Audit Log', icon: ClockIcon }
  ];

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      await generateKeyPair();
    } catch (error) {
      console.error('Failed to generate key:', error);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRotateKeys = async () => {
    try {
      await rotateKeys();
    } catch (error) {
      console.error('Failed to rotate keys:', error);
    }
  };

  const handleRevokeKey = async () => {
    if (encryptionKey) {
      try {
        await revokeKey(encryptionKey.id);
      } catch (error) {
        console.error('Failed to revoke key:', error);
      }
    }
  };

  const handleTestEncryption = async () => {
    if (!isEncrypted || !encryptionKey) return;

    try {
      const classification = dataClassifications.find(c => c.level === testData.classification);
      if (!classification) return;

      const encrypted = await encryptData(testData.message, classification);
      setEncryptedTestData(encrypted.data);
    } catch (error) {
      console.error('Encryption test failed:', error);
    }
  };

  const getStats = () => {
    const totalClassifications = dataClassifications.length;
    const encryptedClassifications = dataClassifications.filter(c => c.encryptionRequired).length;
    const keyStatus = encryptionKey ? (encryptionKey.isActive ? 'Active' : 'Inactive') : 'None';
    const encryptionEnabled = settings.enableAtRestEncryption && settings.enableInTransitEncryption;

    return {
      totalClassifications,
      encryptedClassifications,
      keyStatus,
      encryptionEnabled
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Data Encryption & Protection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage data encryption, security settings, and data protection policies
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Data Classifications
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.totalClassifications}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <LockClosedIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Encrypted Types
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.encryptedClassifications}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <KeyIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Key Status
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.keyStatus}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      stats.encryptionEnabled 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {stats.encryptionEnabled ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Encryption
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stats.encryptionEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Encryption Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Encryption Status
                </h3>
                <EncryptionStatus showDetails={true} />
              </div>

              {/* Test Encryption */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Test Encryption
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Test Data
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          value={testData.message}
                          onChange={(e) => setTestData(prev => ({
                            ...prev,
                            message: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Classification
                        </label>
                        <select
                          value={testData.classification}
                          onChange={(e) => setTestData(prev => ({
                            ...prev,
                            classification: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {dataClassifications.map(classification => (
                            <option key={classification.level} value={classification.level}>
                              {classification.level} {classification.encryptionRequired ? '(Encrypted)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleTestEncryption}
                        disabled={!isEncrypted || encrypting}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {encrypting ? 'Encrypting...' : 'Test Encryption'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Encrypted Result
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {encryptedTestData ? (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Encrypted data (Base64):
                          </p>
                          <code className="text-xs text-gray-800 dark:text-gray-200 break-all">
                            {encryptedTestData}
                          </code>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No encrypted data yet. Click "Test Encryption" to encrypt the message.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Encryption Settings
              </h3>
              <div className="space-y-6">
                {/* Algorithm Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Encryption Algorithm
                  </h4>
                  <select
                    value={settings.defaultAlgorithm}
                    onChange={(e) => updateEncryptionSettings({ 
                      defaultAlgorithm: e.target.value as any 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="AES-256-GCM">AES-256-GCM</option>
                    <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
                    <option value="RSA-OAEP">RSA-OAEP</option>
                  </select>
                </div>

                {/* Security Features */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Security Features
                  </h4>
                  <div className="space-y-4">
                    {Object.entries({
                      enableAtRestEncryption: 'At-Rest Encryption',
                      enableInTransitEncryption: 'In-Transit Encryption',
                      enableEndToEndEncryption: 'End-to-End Encryption',
                      masterPasswordRequired: 'Master Password Required',
                      biometricUnlock: 'Biometric Unlock',
                      secureStorage: 'Secure Storage'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'enableAtRestEncryption' && 'Encrypt data when stored'}
                            {key === 'enableInTransitEncryption' && 'Encrypt data during transmission'}
                            {key === 'enableEndToEndEncryption' && 'Encrypt data end-to-end'}
                            {key === 'masterPasswordRequired' && 'Require master password for access'}
                            {key === 'biometricUnlock' && 'Allow biometric authentication'}
                            {key === 'secureStorage' && 'Use secure storage mechanisms'}
                          </p>
                        </div>
                        <button
                          onClick={() => updateEncryptionSettings({ 
                            [key]: !settings[key as keyof typeof settings] 
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Management */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Key Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Key Rotation Interval (days)
                      </label>
                      <input
                        type="number"
                        value={settings.keyRotationInterval}
                        onChange={(e) => updateEncryptionSettings({ 
                          keyRotationInterval: Number(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auto Lock Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.autoLockTimeout}
                        onChange={(e) => updateEncryptionSettings({ 
                          autoLockTimeout: Number(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classifications' && (
            <DataClassificationPanel
              classifications={dataClassifications}
              onUpdateClassification={updateDataClassification}
            />
          )}

          {activeTab === 'keys' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Encryption Keys
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGenerateKey}
                    disabled={isGeneratingKey || isEncrypted}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGeneratingKey ? 'Generating...' : 'Generate New Key'}
                  </button>
                  {isEncrypted && (
                    <>
                      <button
                        onClick={handleRotateKeys}
                        className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200"
                      >
                        Rotate Keys
                      </button>
                      <button
                        onClick={handleRevokeKey}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                      >
                        Revoke Key
                      </button>
                    </>
                  )}
                </div>
              </div>

              {encryptionKey ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <KeyIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        Active Encryption Key
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Algorithm:</strong> {encryptionKey.algorithm}</p>
                        <p><strong>Key Size:</strong> {encryptionKey.keySize} bits</p>
                        <p><strong>Created:</strong> {new Date(encryptionKey.createdAt).toLocaleString()}</p>
                        {encryptionKey.expiresAt && (
                          <p><strong>Expires:</strong> {new Date(encryptionKey.expiresAt).toLocaleString()}</p>
                        )}
                        <p><strong>Status:</strong> {encryptionKey.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    No Encryption Key
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generate an encryption key to start protecting your data
                  </p>
                  <button
                    onClick={handleGenerateKey}
                    disabled={isGeneratingKey}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGeneratingKey ? 'Generating...' : 'Generate Key'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Encryption Audit Log
              </h3>
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Audit Log Coming Soon
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track encryption operations and security events
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DataEncryption;
