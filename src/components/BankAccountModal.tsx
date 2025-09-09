import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-toastify';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBankAccountAdded: (bankAccount: any) => void;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  onBankAccountAdded
}) => {
  const [formData, setFormData] = useState({
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
    confirmAccountNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [verificationAmounts, setVerificationAmounts] = useState<number[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }

    if (formData.routingNumber.length !== 9) {
      toast.error('Routing number must be 9 digits');
      return;
    }

    if (formData.accountNumber.length < 4) {
      toast.error('Account number must be at least 4 digits');
      return;
    }

    setLoading(true);
    try {
      // Simulate bank account addition
      const bankAccount = await withdrawalService.addBankAccount('user_id', {
        routingNumber: formData.routingNumber,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        bankName: formData.bankName,
        isVerified: false
      });

      // Simulate micro-deposits for verification
      const amounts = [0.01, 0.02]; // In real app, these would be actual micro-deposits
      setVerificationAmounts(amounts);
      setStep('verification');
      
      toast.success('Bank account added! Please verify with micro-deposits.');
    } catch (error) {
      toast.error('Failed to add bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    setLoading(true);
    try {
      const isValid = await withdrawalService.verifyBankAccount('bank_account_id', verificationAmounts);
      
      if (isValid) {
        toast.success('Bank account verified successfully!');
        onBankAccountAdded({
          bankName: formData.bankName,
          accountType: formData.accountType,
          accountNumber: formData.accountNumber,
          isVerified: true,
          lastVerified: new Date().toISOString()
        });
        onClose();
      } else {
        toast.error('Verification failed. Please check the amounts and try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'checking',
      confirmAccountNumber: ''
    });
    setStep('form');
    setVerificationAmounts([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === 'form' ? 'Add Bank Account' : 'Verify Bank Account'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Chase, Bank of America"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="9-digit routing number"
                  maxLength={9}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm your account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🔒 Secure & Encrypted
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your bank account information is encrypted and securely stored. 
                  We use bank-level security to protect your data.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Bank Account'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Verify Your Bank Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent two small deposits to your account. Please check your bank statement 
                  and enter the amounts below.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  💡 Look for these amounts in your bank account:
                </h4>
                <div className="space-y-1">
                  {verificationAmounts.map((amount, index) => (
                    <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      • ${amount.toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {verificationAmounts.map((amount, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount #{index + 1}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={`Enter $${amount.toFixed(2)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerification}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BankAccountModal;
