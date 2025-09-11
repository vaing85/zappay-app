import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { toast } from 'react-toastify';

const SendMoney: React.FC = () => {
  const { user } = useAuth();
  const { paymentMethods, createPayment, isLoading } = usePayment();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default payment method when available
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      const defaultMethod = paymentMethods.find(pm => pm.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else {
        setSelectedPaymentMethod(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount || !selectedPaymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (sendAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (sendAmount > user!.balance) {
      toast.error('Insufficient funds');
      return;
    }

    setLoading(true);
    
    try {
      const result = await createPayment({
        amount: sendAmount,
        currency: 'USD',
        paymentMethod: selectedPaymentMethod,
        description: note || `Payment to ${recipient}`,
        metadata: {
          recipient: recipient,
          type: 'send_money'
        }
      });

      if (result.success) {
        toast.success(`⚡ $${sendAmount} zapped to ${recipient}`);
        setRecipient('');
        setAmount('');
        setNote('');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          ⚡ Zap Money
        </h1>
        
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email or Phone
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter email or phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Available: ${user?.balance.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            {paymentMethods.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No payment methods available. Please add a payment method first.
                </p>
              </div>
            ) : (
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} {method.last4 ? `(****${method.last4})` : ''} {method.isDefault ? '- Default' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="What's this for?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Zapping...
              </div>
            ) : (
              '⚡ Zap Money'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SendMoney;
