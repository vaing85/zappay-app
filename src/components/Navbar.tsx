import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import PWAStatus from './PWAStatus';
import NotificationCenter from './NotificationCenter';
import UserSwitcher from './UserSwitcher';
import {
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
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
                  <span className="text-yellow-500">Zap</span><span className="text-orange-600">Cash</span>
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
                <span className="text-yellow-500">Zap</span><span className="text-orange-600">Cash</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation and User Controls */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Main Navigation Links */}
                <div className="hidden lg:flex items-center space-x-1">
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
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">QR Pay</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Profile</span>
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Analytics</span>
                  </Link>
                  <Link
                    to="/budget"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Budget</span>
                  </Link>
                </div>

                {/* Security Links - Dropdown or Collapsed */}
                <div className="hidden lg:flex items-center space-x-1">
                  <Link
                    to="/security"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Security</span>
                  </Link>
                </div>

                {/* User Controls */}
                <div className="flex items-center space-x-1">
                  <PWAStatus />
                  <NotificationCenter />
                  <ThemeToggle />
                  <UserSwitcher />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-2 py-2 rounded-md text-sm font-medium transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
                >
                  ⚡ Get Started
                </Link>
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
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Theme:</span>
                    <ThemeToggle />
                  </div>
                  <UserSwitcher />
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
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white block px-3 py-2 rounded-md text-base font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    ⚡ Get Started
                  </Link>
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