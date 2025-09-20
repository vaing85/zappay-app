import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/authService';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://zappayapp-ie9d2.ondigitalocean.app'}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The token may be invalid or expired.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setResendMessage('Email address not found. Please try registering again.');
      return;
    }

    try {
      setIsResending(true);
      setResendMessage('');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://zappayapp-ie9d2.ondigitalocean.app'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(data.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendMessage('Network error. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <ArrowPathIcon className="w-16 h-16 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {status === 'loading' ? 'Please wait...' : 'Complete your account setup'}
            </p>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {message}
            </p>
          </div>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  🎉 Your email has been verified! You'll be redirected to the login page shortly.
                </p>
              </div>
              <Link
                to="/login?verified=true"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-center block"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {message}
                </p>
              </div>
              
              {email && (
                <div className="space-y-3">
                  <button
                    onClick={resendVerificationEmail}
                    disabled={isResending}
                    className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isResending ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                  
                  {resendMessage && (
                    <p className={`text-sm text-center ${
                      resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex space-x-3">
                <Link
                  to="/register"
                  className="flex-1 bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200 text-center"
                >
                  Try Again
                </Link>
                <Link
                  to="/login"
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-center"
                >
                  Login
                </Link>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Having trouble? Check your spam folder or{' '}
              <Link to="/contact-support" className="text-yellow-600 hover:text-yellow-700">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
