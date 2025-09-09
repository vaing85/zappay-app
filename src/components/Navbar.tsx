import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import PWAStatus from './PWAStatus';
import NotificationCenter from './NotificationCenter';
import RealtimeNotificationCenter from './RealtimeNotificationCenter';
import RealtimeBalanceIndicator from './RealtimeBalanceIndicator';
import {
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <BoltIcon className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold">
                  <span className="text-yellow-500">Zap</span><span className="text-orange-600">Pay</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-8 rounded"></div>
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BoltIcon className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">
                <span className="text-yellow-500">Zap</span><span className="text-orange-600">Pay</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation and User Controls */}
          <div className="flex items-center space-x-1">
            {user ? (
              <>
                {/* Main Navigation Links - More Compact */}
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/send"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Send
                  </Link>
                  <Link
                    to="/qr"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="QR Pay"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">QR</span>
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Analytics"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Analytics</span>
                  </Link>
                  <Link
                    to="/merchant"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Merchant Dashboard"
                  >
                    <BuildingStorefrontIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Merchant</span>
                  </Link>
                  <Link
                    to="/groups"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Groups"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Groups</span>
                  </Link>
                  <Link
                    to="/payment-settings"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Payment Settings"
                  >
                    <CreditCardIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Payments</span>
                  </Link>
            <Link
              to="/profile"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              title="Profile"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden 2xl:inline">Profile</span>
            </Link>
            <Link
              to="/subscription-plans"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              title="Subscription Plans"
            >
              <CreditCardIcon className="w-4 h-4" />
              <span className="hidden 2xl:inline">Plans</span>
            </Link>
                  <Link
                    to="/budget"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Budget"
                  >
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Budget</span>
                  </Link>
                </div>

                {/* User Controls - More Compact */}
                <div className="flex items-center space-x-1">
                  <PWAStatus />
                  <RealtimeNotificationCenter />
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-2 py-2 rounded-md text-sm font-medium transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:text-orange-600 dark:focus:text-orange-400"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/send"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Send Money
                  </Link>
                  <Link
                    to="/qr"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <QrCodeIcon className="w-5 h-5" />
                    <span>QR Pay</span>
                  </Link>
                  <Link
                    to="/advanced"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <ReceiptPercentIcon className="w-5 h-5" />
                    <span>Advanced</span>
                  </Link>
                  <Link
                    to="/history"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    History
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    to="/groups"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Groups</span>
                  </Link>
                  <Link
                    to="/payment-settings"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Payment Settings</span>
                  </Link>
                  <Link
                    to="/budget"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>Budget</span>
                  </Link>
                  <Link
                    to="/security"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Security</span>
                  </Link>
                  <Link
                    to="/transaction-security"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Transaction Security</span>
                  </Link>
                  <Link
                    to="/data-encryption"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Data Encryption</span>
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Notifications:</span>
                    <NotificationCenter />
                  </div>
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Theme:</span>
                    <ThemeToggle />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Theme:</span>
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;