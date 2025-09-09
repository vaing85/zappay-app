import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-toastify';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
}

const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({ 
  isOpen, 
  onClose, 
  type 
}) => {
  const { user, updateUser } = useAuth();
  const { paymentMethods, processDeposit } = usePayment();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'ach' | 'debit_card'>('ach');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Add Money' : 'Withdraw Money';
  const icon = isDeposit ? ArrowDownTrayIcon : ArrowUpTrayIcon;
  const Icon = icon;

  // Calculate withdrawal fee
  const withdrawalFee = !isDeposit && amount 
    ? withdrawalService.calculateWithdrawalFee(
        parseFloat(amount) || 0, 
        withdrawalMethod, 
        user?.verificationLevel || 'basic'
      )
    : 0;
  
  const netAmount = !isDeposit && amount 
    ? (parseFloat(amount) || 0) - withdrawalFee
    : parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const transactionAmount = parseFloat(amount);
    if (transactionAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!isDeposit && transactionAmount > (user?.balance || 0)) {
      toast.error('Insufficient funds');
      return;
    }

    setLoading(true);

    try {
      if (isDeposit) {
        // Use real Stripe integration for deposits
        const result = await processDeposit(
          transactionAmount,
          selectedMethod,
          notes || 'Account Deposit'
        );

        if (result.success) {
          // Update user balance
          const newBalance = (user?.balance || 0) + transactionAmount;
          updateUser({
            ...user!,
            balance: newBalance
          });

          toast.success(
            `$${transactionAmount.toFixed(2)} added to your account successfully!`
          );

          // Reset form
          setAmount('');
          setSelectedMethod('');
          setNotes('');
          onClose();
        } else {
          toast.error(result.error || 'Deposit failed. Please try again.');
        }
      } else {
        // Process withdrawal with fees
        const result = await withdrawalService.processWithdrawal({
          userId: user!.id,
          amount: transactionAmount,
          method: withdrawalMethod,
          description: notes || 'Account Withdrawal'
        }, user!.verificationLevel || 'basic');

        if (result.success) {
          // Update user balance
          const newBalance = (user?.balance || 0) - transactionAmount;
          updateUser({
            ...user!,
            balance: newBalance
          });

          const feeText = result.fee && result.fee > 0 ? ` (Fee: $${result.fee.toFixed(2)})` : ' (No fee)';
          toast.success(
            `$${transactionAmount.toFixed(2)} withdrawn from your account${feeText}`
          );

          // Reset form
          setAmount('');
          setSelectedMethod('');
          setNotes('');
          onClose();
        } else {
          toast.error(result.error || 'Withdrawal failed. Please try again.');
        }
      }
    } catch (error) {
      toast.error(`${isDeposit ? 'Deposit' : 'Withdrawal'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDeposit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${user?.balance?.toFixed(2) || '0.00'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isDeposit ? 'Payment Method' : 'Withdrawal Method'}
            </label>
            {isDeposit ? (
              paymentMethods.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    No payment methods available. Please add a payment method first.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      // Navigate to payment settings
                      window.location.href = '/payment-settings';
                    }}
                    className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} {method.last4 ? `(****${method.last4})` : ''}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawalMethod('ach')}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      withdrawalMethod === 'ach'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900 dark:border-orange-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">ACH Transfer</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1-3 business days</div>
                    <div className="text-sm text-gray-500">Fee: $1.99</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalMethod('debit_card')}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      withdrawalMethod === 'debit_card'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900 dark:border-orange-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Debit Card</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Instant</div>
                    <div className="text-sm text-gray-500">Fee: $2.99</div>
                  </button>
                </div>
                {user?.verificationLevel === 'premium' && (
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      🎉 Premium users get free withdrawals!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Withdrawal Fee Display */}
          {!isDeposit && amount && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Withdrawal Amount:</span>
                <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                <span className="font-medium text-red-600">
                  {withdrawalFee > 0 ? `-$${withdrawalFee.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>You'll Receive:</span>
                  <span className="text-green-600">${netAmount.toFixed(2)}</span>
                </div>
              </div>
              {withdrawalMethod === 'ach' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Funds will arrive in 1-3 business days
                </p>
              )}
              {withdrawalMethod === 'debit_card' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Funds will arrive instantly
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={`${isDeposit ? 'Add' : 'Withdraw'} money ${isDeposit ? 'to' : 'from'} account`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || !selectedMethod}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isDeposit
                  ? 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400'
                  : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-400'
              } disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `${isDeposit ? 'Add' : 'Withdraw'} $${amount || '0.00'}`
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DepositWithdrawModal;
