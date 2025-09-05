import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useDataEncryption } from '../../contexts/DataEncryptionContext';

interface EncryptionStatusProps {
  className?: string;
  showDetails?: boolean;
}

const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  className = '',
  showDetails = false
}) => {
  const {
    isEncrypted,
    encryptionKey,
    settings,
    loading,
    encrypting,
    decrypting
  } = useDataEncryption();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <div className="animate-pulse bg-gray-300 rounded-full w-4 h-4"></div>
        <span className="text-sm">Loading encryption status...</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (isEncrypted && encryptionKey) {
      return 'text-green-600 bg-green-100';
    } else if (encrypting || decrypting) {
      return 'text-blue-600 bg-blue-100';
    } else {
      return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = () => {
    if (isEncrypted && encryptionKey) {
      return <ShieldCheckIcon className="w-5 h-5" />;
    } else if (encrypting) {
      return <LockClosedIcon className="w-5 h-5 animate-pulse" />;
    } else if (decrypting) {
      return <LockClosedIcon className="w-5 h-5 animate-pulse" />;
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    if (isEncrypted && encryptionKey) {
      return 'Data Encrypted';
    } else if (encrypting) {
      return 'Encrypting...';
    } else if (decrypting) {
      return 'Decrypting...';
    } else {
      return 'Not Encrypted';
    }
  };

  const getEncryptionStrength = () => {
    if (!encryptionKey) return 'None';
    
    switch (encryptionKey.algorithm) {
      case 'AES':
        return `AES-${encryptionKey.keySize}`;
      case 'RSA':
        return `RSA-${encryptionKey.keySize}`;
      case 'ChaCha20':
        return 'ChaCha20-256';
      default:
        return 'Unknown';
    }
  };

  const getKeyStatus = () => {
    if (!encryptionKey) return 'No Key';
    
    const now = new Date();
    const expiresAt = encryptionKey.expiresAt;
    
    if (expiresAt && now > expiresAt) {
      return 'Expired';
    } else if (expiresAt && now > new Date(expiresAt.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      return 'Expires Soon';
    } else {
      return 'Valid';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col space-y-2 ${className}`}
    >
      <div className={`inline-flex items-center space-x-2 rounded-full px-3 py-1.5 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </div>

      {showDetails && encryptionKey && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Encryption Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Algorithm:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getEncryptionStrength()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Key Status:</span>
                  <span className={`text-sm font-medium ${
                    getKeyStatus() === 'Valid' ? 'text-green-600' :
                    getKeyStatus() === 'Expires Soon' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getKeyStatus()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(encryptionKey.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {encryptionKey.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(encryptionKey.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Features
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {settings.enableAtRestEncryption ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    At-Rest Encryption
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.enableInTransitEncryption ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    In-Transit Encryption
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.enableEndToEndEncryption ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    End-to-End Encryption
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.secureStorage ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Secure Storage
                  </span>
                </div>
              </div>
            </div>
          </div>

          {settings.masterPasswordRequired && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <KeyIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Master password protection enabled
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EncryptionStatus;
