import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon,
  KeyIcon,
  DocumentTextIcon,
  PlayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const APIDocumentation: React.FC = () => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const [selectedEndpoint, setSelectedEndpoint] = useState('auth');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const endpoints = {
    auth: {
      title: 'Authentication',
      description: 'Manage user authentication and API access',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          description: 'Authenticate user and get access token',
          example: {
            request: {
              email: 'user@example.com',
              password: 'password123'
            },
            response: {
              success: true,
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              user: {
                id: 'user_123',
                email: 'user@example.com',
                name: 'John Doe'
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/api/v1/auth/register',
          description: 'Register a new user account',
          example: {
            request: {
              email: 'newuser@example.com',
              password: 'password123',
              firstName: 'John',
              lastName: 'Doe'
            },
            response: {
              success: true,
              message: 'User registered successfully',
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      ]
    },
    payments: {
      title: 'Payments',
      description: 'Process payments and manage transactions',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/payments/create',
          description: 'Create a new payment',
          example: {
            request: {
              amount: 100.00,
              currency: 'USD',
              recipient: 'recipient@example.com',
              description: 'Payment for services'
            },
            response: {
              success: true,
              paymentId: 'pay_123456789',
              status: 'pending',
              amount: 100.00,
              currency: 'USD'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/v1/payments/{paymentId}',
          description: 'Get payment details',
          example: {
            request: null,
            response: {
              success: true,
              payment: {
                id: 'pay_123456789',
                amount: 100.00,
                currency: 'USD',
                status: 'completed',
                createdAt: '2024-01-15T10:30:00Z'
              }
            }
          }
        }
      ]
    },
    transactions: {
      title: 'Transactions',
      description: 'Retrieve transaction history and details',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/transactions',
          description: 'Get user transaction history',
          example: {
            request: null,
            response: {
              success: true,
              transactions: [
                {
                  id: 'txn_123',
                  amount: 50.00,
                  type: 'send',
                  status: 'completed',
                  createdAt: '2024-01-15T10:30:00Z'
                }
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 100
              }
            }
          }
        }
      ]
    },
    webhooks: {
      title: 'Webhooks',
      description: 'Receive real-time notifications about events',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/webhooks',
          description: 'Configure webhook endpoints',
          example: {
            request: {
              url: 'https://your-app.com/webhooks/zappay',
              events: ['payment.completed', 'payment.failed']
            },
            response: {
              success: true,
              webhookId: 'wh_123456789',
              secret: 'whsec_...'
            }
          }
        }
      ]
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCodeExample = (endpoint: any) => {
    const baseUrl = 'https://api.zappay.site/v1';
    const apiKey = 'your_api_key_here';
    
    return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.example.request, null, 2)}'`;
  };

  const isProUser = hasFeatureAccess('api_access');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4"
          >
            <CodeBracketIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ZapPay API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Integrate ZapPay into your applications with our comprehensive REST API. 
            Build powerful payment solutions with our developer-friendly endpoints.
          </p>
        </div>

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              API Status: All systems operational
            </span>
          </div>
        </motion.div>

        {/* Subscription Warning */}
        {!isProUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-yellow-800 dark:text-yellow-400 font-medium mb-1">
                  API Access Requires Pro Subscription
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  To access the ZapPay API, you need a Pro subscription or higher. 
                  <a href="/subscription-plans" className="underline ml-1">Upgrade now</a> to get started.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Endpoints
                </h3>
                <nav className="space-y-2">
                  {Object.entries(endpoints).map(([key, endpoint]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedEndpoint(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedEndpoint === key
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {endpoint.title}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Quick Links
                  </h4>
                  <div className="space-y-2">
                    <a
                      href="#getting-started"
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Getting Started
                    </a>
                    <a
                      href="#authentication"
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Authentication
                    </a>
                    <a
                      href="#rate-limits"
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Rate Limits
                    </a>
                    <a
                      href="#webhooks"
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Webhooks
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={selectedEndpoint}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
            >
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].description}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {endpoints[selectedEndpoint as keyof typeof endpoints].methods.map((method, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            method.method === 'GET' ? 'bg-green-100 text-green-800' :
                            method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {method.method}
                          </span>
                          <code className="text-gray-900 dark:text-white font-mono">
                            {method.path}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(generateCodeExample(method), `${selectedEndpoint}-${index}`)}
                          className="flex items-center space-x-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          {copiedCode === `${selectedEndpoint}-${index}` ? (
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                          <span className="text-sm">Copy</span>
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {method.description}
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Request
                          </h4>
                          <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <code className="text-sm text-gray-800 dark:text-gray-200">
                              {method.example.request ? JSON.stringify(method.example.request, null, 2) : 'No request body required for GET requests'}
                            </code>
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Response
                          </h4>
                          <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <code className="text-sm text-gray-800 dark:text-gray-200">
                              {JSON.stringify(method.example.response, null, 2)}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <h2 id="getting-started" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Getting Started
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Get Your API Key
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign up for a ZapPay account and generate your API key from the developer dashboard.
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  zappay_api_key = "zappay_live_1234567890abcdef"
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Make Your First Request
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Use your API key to authenticate requests to our API endpoints.
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  curl -H "Authorization: Bearer $zappay_api_key" \<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;https://api.zappay.site/v1/transactions
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default APIDocumentation;
