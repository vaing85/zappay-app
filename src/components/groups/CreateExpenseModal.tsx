import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroup } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  XMarkIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  TagIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Group, GroupExpense, ExpenseSplit } from '../../types/Social';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: (expenseData: any) => void;
  group: Group;
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onExpenseCreated,
  group 
}) => {
  const { user } = useAuth();
  const { createExpense, isLoading } = useGroup();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Food',
    splitMethod: 'equal' as 'equal' | 'percentage' | 'custom',
    dueDate: '',
    tags: '',
    receipt: ''
  });

  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping',
    'Travel', 'Healthcare', 'Education', 'Other'
  ];

  const splitMethods = [
    { id: 'equal', label: 'Equal Split', description: 'Split equally among all members' },
    { id: 'percentage', label: 'Percentage', description: 'Split by percentage' },
    { id: 'custom', label: 'Custom Amounts', description: 'Set custom amounts for each member' }
  ];

  const calculateSplits = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return;

    const activeMembers = group.members.filter(member => member.isActive);
    
    switch (formData.splitMethod) {
      case 'equal':
        const equalAmount = amount / activeMembers.length;
        setSplits(activeMembers.map(member => ({
          userId: member.userId,
          amount: equalAmount,
          isPaid: false,
          paidAmount: 0,
          remainingAmount: equalAmount
        })));
        break;
        
      case 'percentage':
        // For percentage, we'll need to collect percentages from user
        setSplits(activeMembers.map(member => ({
          userId: member.userId,
          amount: 0,
          percentage: 100 / activeMembers.length,
          isPaid: false,
          paidAmount: 0,
          remainingAmount: 0
        })));
        break;
        
      case 'custom':
        setSplits(activeMembers.map(member => ({
          userId: member.userId,
          amount: 0,
          isPaid: false,
          paidAmount: 0,
          remainingAmount: 0
        })));
        break;
    }
  };

  const updateSplitAmount = (userId: string, amount: number) => {
    setSplits(prev => prev.map(split => 
      split.userId === userId 
        ? { ...split, amount, remainingAmount: amount - split.paidAmount }
        : split
    ));
  };

  const updateSplitPercentage = (userId: string, percentage: number) => {
    const totalAmount = parseFloat(formData.amount);
    const amount = (totalAmount * percentage) / 100;
    
    setSplits(prev => prev.map(split => 
      split.userId === userId 
        ? { ...split, amount, percentage, remainingAmount: amount - split.paidAmount }
        : split
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);

    // Validate splits
    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
    const expenseAmount = parseFloat(formData.amount);
    
    if (Math.abs(totalSplitAmount - expenseAmount) > 0.01) {
      setError('Split amounts must equal the total expense amount');
      return;
    }

    try {
      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: expenseAmount,
        currency: group.settings.currency,
        category: formData.category,
        splitMethod: formData.splitMethod,
        splits: splits,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        receipt: formData.receipt || undefined
      };

      onExpenseCreated(expenseData);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'Food',
      splitMethod: 'equal',
      dueDate: '',
      tags: '',
      receipt: ''
    });
    setSplits([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate splits when amount or method changes
  React.useEffect(() => {
    if (formData.amount && formData.splitMethod === 'equal') {
      calculateSplits();
    }
  }, [formData.amount, formData.splitMethod]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add Expense
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Split expenses with {group.name}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Dinner at Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Add details about this expense..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Split Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Split Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {splitMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, splitMethod: method.id as any })}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        formData.splitMethod === method.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:border-green-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {method.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Splits */}
              {splits.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Split Details
                  </label>
                  <div className="space-y-3">
                    {splits.map((split, index) => {
                      const member = group.members.find(m => m.userId === split.userId);
                      return (
                        <div key={split.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {member?.firstName.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {member ? `${member.firstName} ${member.lastName}` : 'Unknown User'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {formData.splitMethod === 'percentage' && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={split.percentage || 0}
                                  onChange={(e) => updateSplitPercentage(split.userId, parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={split.amount}
                                onChange={(e) => updateSplitAmount(split.userId, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ${splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., dinner, restaurant, celebration"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim() || !formData.amount || splits.length === 0}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateExpenseModal;
