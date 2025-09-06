import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGroup } from '../../contexts/GroupContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Group, GroupExpense } from '../../types/Social';
import CreateExpenseModal from './CreateExpenseModal';

interface GroupExpensesProps {
  group: Group;
}

const GroupExpenses: React.FC<GroupExpensesProps> = ({ group }) => {
  const { user } = useAuth();
  const { expenses, createExpense, updateExpense, payExpenseSplit, isLoading } = useGroup();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'partial':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handlePaySplit = async (expenseId: string, userId: string, amount: number) => {
    if (!user) return;
    
    try {
      await payExpenseSplit(expenseId, userId, amount);
    } catch (error) {
      console.error('Failed to pay expense split:', error);
    }
  };

  const handleCreateExpense = async (expenseData: any) => {
    try {
      await createExpense({
        ...expenseData,
        groupId: group.id,
        createdBy: user?.id || ''
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Group Expenses
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage shared expenses and track payments
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'All', count: expenses.length },
          { id: 'pending', label: 'Pending', count: expenses.filter(e => e.status === 'pending').length },
          { id: 'partial', label: 'Partial', count: expenses.filter(e => e.status === 'partial').length },
          { id: 'completed', label: 'Completed', count: expenses.filter(e => e.status === 'completed').length }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No expenses found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Create your first expense to get started.'
                : `No ${filter} expenses found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Expense Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {expense.title}
                    </h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      <span className="capitalize">{expense.status}</span>
                    </span>
                  </div>
                  
                  {expense.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {expense.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>${expense.amount.toFixed(2)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{expense.splits.length} people</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDate(expense.createdAt)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedExpense(expense)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Splits */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Status
                </h4>
                
                {expense.splits.map((split, index) => {
                  const member = group.members.find(m => m.userId === split.userId);
                  const isCurrentUser = split.userId === user?.id;
                  const isPaid = split.isPaid;
                  const remainingAmount = split.remainingAmount;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isPaid ? 'Paid' : `Owes $${remainingAmount.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            ${split.amount.toFixed(2)}
                          </p>
                          {split.paidAmount > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Paid: ${split.paidAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        {isCurrentUser && !isPaid && remainingAmount > 0 && (
                          <button
                            onClick={() => handlePaySplit(expense.id, split.userId, remainingAmount)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                        
                        {isPaid && (
                          <div className="text-green-600">
                            <CheckCircleIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tags */}
              {expense.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {expense.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <CreateExpenseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onExpenseCreated={handleCreateExpense}
          group={group}
        />
      )}
    </div>
  );
};

export default GroupExpenses;
