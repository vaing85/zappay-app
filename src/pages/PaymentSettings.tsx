import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import PaymentMethodsManager from '../components/PaymentMethodsManager';
import { 
  PlusIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PaymentSettings: React.FC = () => {
  const { user } = useAuth();
  const { paymentMethods, addPaymentMethod } = usePayment();
  const [showAddForm, setShowAddForm] = useState(false);

  if (!user) {
    return <div>Please log in to view payment settings.</div>;
  }

  const handleQuickAdd = async () => {
    try {
      // Add a demo payment method for testing
      await addPaymentMethod('card', 'Demo Card', {
        cardElement: null,
        email: user.email,
        phone: user.phone || '',
        address: {
          line1: '123 Demo St',
          line2: '',
          city: 'Demo City',
          state: 'DC',
          postal_code: '12345',
          country: 'US'
        }
      });
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your payment methods and transaction preferences
        </p>
      </motion.div>

      {/* Quick Add Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Add Payment Method</h2>
            <p className="text-yellow-100">Securely add cards, bank accounts, or digital wallets</p>
          </div>
          <CreditCardIcon className="w-8 h-8 text-yellow-200" />
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <CreditCardIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Credit/Debit Card</span>
            <span className="block text-xs text-yellow-100 mt-1">Visa, Mastercard, etc.</span>
          </button>
          
          <button
            onClick={handleQuickAdd}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <BanknotesIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Bank Account</span>
            <span className="block text-xs text-yellow-100 mt-1">ACH transfers</span>
          </button>
          
          <button
            onClick={handleQuickAdd}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <DevicePhoneMobileIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Digital Wallet</span>
            <span className="block text-xs text-yellow-100 mt-1">Apple Pay, Google Pay</span>
          </button>
          
          <button
            onClick={handleQuickAdd}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-lg text-center transition-all duration-200 border border-white/20"
          >
            <BanknotesIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Crypto Wallet</span>
            <span className="block text-xs text-yellow-100 mt-1">Bitcoin, Ethereum</span>
          </button>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Secure Payment Processing
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              All payment methods are encrypted and processed securely through Stripe. 
              Your financial information is never stored on our servers and is protected 
              with bank-level security.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-8"
      >
        <PaymentMethodsManager />
      </motion.div>
    </div>
  );
};

export default PaymentSettings;
