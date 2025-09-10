import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BoltIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  BuildingStorefrontIcon,
  QrCodeIcon,
  StarIcon,
  UsersIcon,
  SparklesIcon,
  BanknotesIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const Home: React.FC = memo(() => {
  // Memoize features to prevent recreation on every render
  const features = useMemo(() => [
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Send money in seconds, not minutes"
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "Your money is protected with military-grade encryption"
    },
    {
      icon: <QrCodeIcon className="w-8 h-8" />,
      title: "QR Code Payments",
      description: "Scan and pay instantly with QR codes"
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "AI-powered insights and spending analysis"
    },
    {
      icon: <BuildingStorefrontIcon className="w-8 h-8" />,
      title: "Merchant Services",
      description: "Accept payments for your business"
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: "Premium Features",
      description: "Advanced tools for power users"
    }
  ], []);

  // Memoize brand name component to avoid repetition
  const BrandName = useMemo(() => (
    <>
      <span className="text-yellow-500">Zap</span><span className="text-orange-600">Pay</span>
    </>
  ), []);

  // Memoize CTA button styles to avoid repetition
  const ctaButtonStyles = useMemo(() => ({
    primary: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg",
    secondary: "border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors"
  }), []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20"
      >
        <div className="mb-8">
          <BoltIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            {BrandName}
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          ⚡ The complete payment platform for individuals and businesses. Send money instantly, 
          accept payments with QR codes, get AI-powered insights, and grow your business with 
          our merchant tools. Experience the future of digital transactions.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className={ctaButtonStyles.primary}
          >
            ⚡ Get Started
          </Link>
          <Link
            to="/login"
            className={ctaButtonStyles.secondary}
          >
            Sign In
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose {BrandName}?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50"
              >
                <div className="text-yellow-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include core payment features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
            >
              <div className="text-center mb-6">
                <CreditCardIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <p className="text-gray-600">Perfect for personal use</p>
                <div className="text-4xl font-bold text-gray-900 mt-4">$0<span className="text-lg text-gray-500">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Send & receive money
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  QR code payments
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Basic analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  50 transactions/month
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center block"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-500 relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <StarIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <p className="text-gray-600">For power users</p>
                <div className="text-4xl font-bold text-gray-900 mt-4">$9.99<span className="text-lg text-gray-500">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Everything in Free
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  AI recommendations
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Free withdrawals
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Unlimited transactions
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/subscription-plans"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center block"
              >
                Upgrade to Pro
              </Link>
            </motion.div>

            {/* Business Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-500"
            >
              <div className="text-center mb-6">
                <UsersIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Business</h3>
                <p className="text-gray-600">For growing businesses</p>
                <div className="text-4xl font-bold text-gray-900 mt-4">$29.99<span className="text-lg text-gray-500">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Merchant dashboard
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Custom branding
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  API access
                </li>
              </ul>
              <Link
                to="/subscription-plans"
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center block"
              >
                Start Business
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-500"
            >
              <div className="text-center mb-6">
                <SparklesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="text-gray-600">For large organizations</p>
                <div className="text-4xl font-bold text-gray-900 mt-4">$99.99<span className="text-lg text-gray-500">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Everything in Business
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  White-label solution
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  SLA guarantee
                </li>
              </ul>
              <Link
                to="/subscription-plans"
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors text-center block"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Merchant Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <BuildingStorefrontIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Accept payments, manage transactions, and grow your business with our comprehensive merchant tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50"
            >
              <QrCodeIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">QR Code Payments</h3>
              <p className="text-gray-600">Generate QR codes for fixed or dynamic amounts. Track scans and revenue in real-time.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50"
            >
              <ChartBarIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business Analytics</h3>
              <p className="text-gray-600">Get insights into your sales, customer behavior, and revenue trends.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50"
            >
              <BanknotesIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transaction Management</h3>
              <p className="text-gray-600">View, filter, and manage all your business transactions in one place.</p>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/merchant"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-lg"
            >
              <BuildingStorefrontIcon className="w-6 h-6 mr-2" />
              Explore Merchant Dashboard
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/contact-support" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
                <li><a href="mailto:business@zappay.site" className="text-gray-400 hover:text-white transition-colors">Business Inquiries</a></li>
                <li><a href="mailto:privacy@zappay.site" className="text-gray-400 hover:text-white transition-colors">Privacy Inquiries</a></li>
                <li><Link to="/subscription-plans" className="text-gray-400 hover:text-white transition-colors">Upgrade Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal & Security</h3>
              <ul className="space-y-2 mb-4">
                <li>
                  <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <p className="text-gray-400 text-sm">
                Bank-level security with end-to-end encryption. Your money and data are protected with military-grade security.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ZapPay. All rights reserved. | Built for the future of payments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
