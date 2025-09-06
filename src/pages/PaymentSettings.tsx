import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import PaymentMethodsManager from '../components/PaymentMethodsManager';

const PaymentSettings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view payment settings.</div>;
  }

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-8"
      >
        <PaymentMethodsManager />
      </motion.div>
    </div>
  );
};

export default PaymentSettings;
