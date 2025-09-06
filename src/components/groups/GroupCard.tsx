import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Group } from '../../types/Social';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      {/* Group Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: group.color }}
          >
            {group.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {group.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {group.description || 'No description'}
            </p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.isActive)}`}>
          {group.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${group.totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {group.totalTransactions}
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UsersIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {group.members.length} members
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(group.updatedAt)}
          </span>
        </div>
      </div>

      {/* Member Avatars */}
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300"
              style={{ zIndex: 3 - index }}
            >
              {member.firstName.charAt(0)}
            </div>
          ))}
        </div>
        
        {group.members.length > 3 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            +{group.members.length - 3} more
          </span>
        )}
      </div>

      {/* Privacy Badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          group.settings.privacy === 'public' 
            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
            : group.settings.privacy === 'private'
            ? 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
            : 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
        }`}>
          {group.settings.privacy === 'public' ? 'Public' : 
           group.settings.privacy === 'private' ? 'Private' : 'Invite Only'}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {group.settings.currency}
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;
