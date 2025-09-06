import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGroup } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import GroupAnalytics from '../components/groups/GroupAnalytics';
import GroupExpenses from '../components/groups/GroupExpenses';
import PaymentRequests from '../components/groups/PaymentRequests';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const { 
    groups, 
    currentGroup, 
    setCurrentGroup, 
    isLoading, 
    error,
    loadGroups 
  } = useGroup();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'analytics' | 'requests'>('overview');

  const handleGroupSelect = (group: any) => {
    setCurrentGroup(group);
    setActiveTab('overview');
  };

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    loadGroups();
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              👥 Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage shared expenses and group payments
            </p>
          </div>
          
          <button
            onClick={handleCreateGroup}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors mt-4 sm:mt-0"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Groups Grid */}
        {!currentGroup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => handleGroupSelect(group)}
              />
            ))}
            
            {groups.length === 0 && (
              <div className="col-span-full text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No groups yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first group to start sharing expenses with friends and family.
                </p>
                <button
                  onClick={handleCreateGroup}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: currentGroup.color }}
                  >
                    {currentGroup.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentGroup.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentGroup.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentGroup(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${currentGroup.totalExpenses.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Expenses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentGroup.totalTransactions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Transactions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentGroup.members.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Members
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentGroup.members.filter(m => m.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: UserGroupIcon },
                { id: 'expenses', label: 'Expenses', icon: ChartBarIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                { id: 'requests', label: 'Requests', icon: BellIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Expenses */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Expenses
                    </h3>
                    <div className="space-y-3">
                      {currentGroup.members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {member.firstName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${member.totalContributed.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              contributed
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-left"
                    >
                      <ChartBarIcon className="w-8 h-8 text-blue-500 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Manage Expenses
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Add new expenses and track payments
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('requests')}
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-left"
                    >
                      <BellIcon className="w-8 h-8 text-green-500 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Payment Requests
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Send and manage payment requests
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <GroupExpenses group={currentGroup} />
              )}

              {activeTab === 'analytics' && (
                <GroupAnalytics group={currentGroup} />
              )}

              {activeTab === 'requests' && (
                <PaymentRequests group={currentGroup} />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default Groups;
