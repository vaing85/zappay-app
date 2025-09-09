import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  KeyIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useSubscription } from '../contexts/SubscriptionContext';

interface APIKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  createdAt: string;
  permissions: string[];
  isActive: boolean;
}

const APIKeyManager: React.FC = () => {
  const { hasFeatureAccess } = useSubscription();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const availablePermissions = [
    { id: 'payments:read', name: 'Read Payments', description: 'View payment history and details' },
    { id: 'payments:write', name: 'Create Payments', description: 'Create new payments' },
    { id: 'transactions:read', name: 'Read Transactions', description: 'View transaction history' },
    { id: 'transactions:write', name: 'Create Transactions', description: 'Create new transactions' },
    { id: 'webhooks:manage', name: 'Manage Webhooks', description: 'Create and manage webhooks' },
    { id: 'users:read', name: 'Read User Data', description: 'View user profile information' }
  ];

  // Mock API keys for demo
  useEffect(() => {
    const mockKeys: APIKey[] = [
      {
        id: 'key_1',
        name: 'Production App',
        key: 'zappay_live_1234567890abcdef',
        lastUsed: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        permissions: ['payments:read', 'payments:write', 'transactions:read'],
        isActive: true
      },
      {
        id: 'key_2',
        name: 'Development Testing',
        key: 'zappay_test_abcdef1234567890',
        lastUsed: '2024-01-14T15:45:00Z',
        createdAt: '2024-01-10T00:00:00Z',
        permissions: ['payments:read', 'transactions:read'],
        isActive: true
      }
    ];
    setApiKeys(mockKeys);
  }, []);

  const generateAPIKey = () => {
    const prefix = 'zappay_live_';
    const randomPart = Math.random().toString(36).substring(2, 18);
    return prefix + randomPart;
  };

  const createAPIKey = () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return;

    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: generateAPIKey(),
      createdAt: new Date().toISOString(),
      permissions: selectedPermissions,
      isActive: true
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setSelectedPermissions([]);
    setShowCreateForm(false);
  };

  const deleteAPIKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskAPIKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••';
  };

  if (!hasFeatureAccess('api_access')) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              API Access Requires Pro Subscription
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              To create and manage API keys, you need a Pro subscription or higher.
            </p>
            <a
              href="/subscription-plans"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Keys
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API keys for ZapPay integration
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create API Key
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New API Key
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production App, Development Testing"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, permission.id]);
                        } else {
                          setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={createAPIKey}
                disabled={!newKeyName.trim() || selectedPermissions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Key
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <KeyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {apiKey.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Created {formatDate(apiKey.createdAt)}
                    </span>
                    {apiKey.lastUsed && (
                      <span>Last used {formatDate(apiKey.lastUsed)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  apiKey.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {apiKey.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => deleteAPIKey(apiKey.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskAPIKey(apiKey.key)}
                  </div>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {copiedKey === apiKey.id ? (
                      <CheckIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission) => {
                    const perm = availablePermissions.find(p => p.id === permission);
                    return (
                      <span
                        key={permission}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                      >
                        {perm?.name || permission}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {apiKeys.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No API Keys
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first API key to start integrating with ZapPay
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create API Key
          </button>
        </div>
      )}
    </div>
  );
};

export default APIKeyManager;
