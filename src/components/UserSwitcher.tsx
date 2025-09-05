import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const UserSwitcher: React.FC = () => {
  const { user, switchUser, availableUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <UserCircleIcon className="w-5 h-5" />
        <span>{user.firstName} {user.lastName}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Switch Test User
            </div>
            {availableUsers.map((testUser) => (
              <button
                key={testUser.email}
                onClick={() => {
                  switchUser(testUser.email);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                  user.email === testUser.email ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {testUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{testUser.name}</div>
                    <div className="text-xs text-gray-500">{testUser.email}</div>
                  </div>
                </div>
                {user.email === testUser.email && (
                  <CheckIcon className="w-4 h-4 text-orange-600" />
                )}
              </button>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-3 py-2 text-xs text-gray-500">
                Password: <code className="bg-gray-100 px-1 rounded">password123</code>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserSwitcher;
