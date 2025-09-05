import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { DataClassification } from '../../types/DataEncryption';
import { useDataEncryption } from '../../contexts/DataEncryptionContext';

interface DataClassificationPanelProps {
  classifications: DataClassification[];
  onUpdateClassification: (classification: DataClassification) => void;
  className?: string;
}

const DataClassificationPanel: React.FC<DataClassificationPanelProps> = ({
  classifications,
  onUpdateClassification,
  className = ''
}) => {
  const [selectedClassification, setSelectedClassification] = useState<DataClassification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'internal':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'confidential':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'restricted':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <EyeIcon className="w-5 h-5" />;
      case 'internal':
        return <EyeSlashIcon className="w-5 h-5" />;
      case 'confidential':
        return <LockClosedIcon className="w-5 h-5" />;
      case 'restricted':
        return <ShieldCheckIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const handleEdit = (classification: DataClassification) => {
    setSelectedClassification(classification);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = () => {
    if (selectedClassification) {
      onUpdateClassification(selectedClassification);
      setSelectedClassification(null);
      setIsEditing(false);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setSelectedClassification(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setSelectedClassification({
      level: 'internal',
      categories: [],
      retentionPeriod: 90,
      encryptionRequired: true,
      accessControls: {
        roles: ['user'],
        permissions: ['read']
      }
    });
    setIsEditing(false);
    setShowForm(true);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Classifications
          </h3>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Classification</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {classifications.map((classification, index) => (
            <motion.div
              key={classification.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getLevelColor(classification.level)}`}>
                    {getLevelIcon(classification.level)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white capitalize">
                        {classification.level}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(classification.level)}`}>
                        {classification.encryptionRequired ? 'Encrypted' : 'Unencrypted'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                          <strong>Categories:</strong> {classification.categories.join(', ')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Retention:</strong> {classification.retentionPeriod} days
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                          <strong>Roles:</strong> {classification.accessControls.roles.join(', ')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Permissions:</strong> {classification.accessControls.permissions.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleEdit(classification)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit/Add Form Modal */}
      {showForm && selectedClassification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Classification' : 'Add New Classification'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Classification Level
                </label>
                <select
                  value={selectedClassification.level}
                  onChange={(e) => setSelectedClassification(prev => 
                    prev ? { ...prev, level: e.target.value as any } : null
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedClassification.categories.join(', ')}
                  onChange={(e) => setSelectedClassification(prev => 
                    prev ? { 
                      ...prev, 
                      categories: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    } : null
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., personal, financial, business"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={selectedClassification.retentionPeriod}
                    onChange={(e) => setSelectedClassification(prev => 
                      prev ? { ...prev, retentionPeriod: Number(e.target.value) } : null
                    )}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="encryptionRequired"
                    checked={selectedClassification.encryptionRequired}
                    onChange={(e) => setSelectedClassification(prev => 
                      prev ? { ...prev, encryptionRequired: e.target.checked } : null
                    )}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="encryptionRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Encryption Required
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedClassification.accessControls.roles.join(', ')}
                  onChange={(e) => setSelectedClassification(prev => 
                    prev ? { 
                      ...prev, 
                      accessControls: {
                        ...prev.accessControls,
                        roles: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                      }
                    } : null
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., user, admin, manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions (comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedClassification.accessControls.permissions.join(', ')}
                  onChange={(e) => setSelectedClassification(prev => 
                    prev ? { 
                      ...prev, 
                      accessControls: {
                        ...prev.accessControls,
                        permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                      }
                    } : null
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., read, write, delete"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Add'} Classification
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DataClassificationPanel;
