import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TwoFactorMethod } from '../../types/Security';
import { 
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface TwoFactorSetupProps {
  method: TwoFactorMethod;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ method, onVerify, onCancel }) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const getMethodIcon = () => {
    switch (method.type) {
      case 'sms':
        return <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500" />;
      case 'email':
        return <EnvelopeIcon className="w-6 h-6 text-green-500" />;
      case 'authenticator':
        return <KeyIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <KeyIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getMethodTitle = () => {
    switch (method.type) {
      case 'sms':
        return 'SMS Verification';
      case 'email':
        return 'Email Verification';
      case 'authenticator':
        return 'Authenticator App';
      default:
        return 'Two-Factor Authentication';
    }
  };

  const getMethodDescription = () => {
    switch (method.type) {
      case 'sms':
        return `We'll send a verification code to ${method.value}`;
      case 'email':
        return `We'll send a verification code to ${method.value}`;
      case 'authenticator':
        return 'Use your authenticator app to scan the QR code and get a verification code';
      default:
        return 'Enter the verification code to complete setup';
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const success = await onVerify(code);
      if (success) {
        setIsVerified(true);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Two-Factor Authentication Enabled
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your {getMethodTitle().toLowerCase()} has been successfully set up and verified.
        </p>
        <button
          onClick={onCancel}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getMethodIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {getMethodTitle()}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {getMethodDescription()}
        </p>
      </div>

      {method.type === 'authenticator' && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Scan this QR code with your authenticator app
          </p>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg inline-block">
            {/* In a real app, this would be a QR code */}
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
              <QrCodeIcon className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          maxLength={6}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <XCircleIcon className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleVerify}
          disabled={isVerifying || !code.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </motion.div>
  );
};

export default TwoFactorSetup;
