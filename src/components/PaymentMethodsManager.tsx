import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  PlusIcon, 
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { usePayment } from '../contexts/PaymentContext';
import { PaymentMethod } from '../services/paymentService';
import StripeCardInput from './StripeCardInput';

interface PaymentMethodsManagerProps {
  className?: string;
}

const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({ className = '' }) => {
  const { 
    paymentMethods, 
    isLoading, 
    error, 
    addPaymentMethod, 
    removePaymentMethod, 
    setDefaultPaymentMethod 
  } = usePayment();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'card' as PaymentMethod['type'],
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });
  const [cardElement, setCardElement] = useState<any>(null);

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return <CreditCardIcon className="w-6 h-6" />;
      case 'bank_account':
        return <BanknotesIcon className="w-6 h-6" />;
      case 'wallet':
        return <DevicePhoneMobileIcon className="w-6 h-6" />;
      case 'crypto':
        return <BanknotesIcon className="w-6 h-6" />;
      default:
        return <CreditCardIcon className="w-6 h-6" />;
    }
  };

  const getMethodColor = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'bank_account':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'wallet':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'crypto':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMethod.name) {
      return;
    }

    try {
      await addPaymentMethod(
        newMethod.type,
        newMethod.name,
        {
          cardElement: cardElement,
          email: newMethod.email,
          phone: newMethod.phone,
          address: newMethod.address
        }
      );
      
      setNewMethod({
        type: 'card',
        name: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US'
        }
      });
      // Reset form state
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const handleCardChange = (isComplete: boolean, error?: string) => {
    // Card change handler - can be used for validation if needed
  };

  const handleCardReady = (element: any) => {
    setCardElement(element);
  };

  const handleRemoveMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      await removePaymentMethod(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPaymentMethod(id);
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading payment methods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Payment Methods
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Method</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleAddMethod} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newMethod.email}
                  onChange={(e) => setNewMethod({ ...newMethod, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newMethod.phone}
                  onChange={(e) => setNewMethod({ ...newMethod, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <StripeCardInput
                onCardChange={handleCardChange}
                onCardReady={handleCardReady}
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={newMethod.address.line1}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, line1: e.target.value }
                    })}
                    placeholder="123 Main St"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={newMethod.address.line2}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, line2: e.target.value }
                    })}
                    placeholder="Apt 4B"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newMethod.address.city}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, city: e.target.value }
                    })}
                    placeholder="New York"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={newMethod.address.state}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, state: e.target.value }
                    })}
                    placeholder="NY"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={newMethod.address.postal_code}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, postal_code: e.target.value }
                    })}
                    placeholder="10001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    value={newMethod.address.country}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      address: { ...newMethod.address, country: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newMethod.name}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Payment Methods List */}
      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Payment Methods
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add a payment method to start making payments
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getMethodColor(method.type)}`}>
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.type === 'card' && method.last4 ? `**** **** **** ${method.last4}` : method.type}
                      {method.brand && ` • ${method.brand}`}
                      {method.expiryMonth && method.expiryYear && ` • ${method.expiryMonth}/${method.expiryYear}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                      {method.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMethod(method.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    title="Remove payment method"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsManager;
