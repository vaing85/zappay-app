import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BoltIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

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
      icon: <ClockIcon className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Access your money anytime, anywhere"
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: "Zero Fees",
      description: "No hidden charges, no surprise costs"
    }
  ], []);

  // Memoize brand name component to avoid repetition
  const BrandName = useMemo(() => (
    <>
      <span className="text-yellow-500">Zap</span><span className="text-orange-600">Cash</span>
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
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          ⚡ Lightning-fast payments that zap money instantly to anyone, anywhere. 
          Experience the future of digital transactions.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Stats Section - More valuable than redundant CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white">
        <div className="text-center max-w-4xl mx-auto px-4">
          <BoltIcon className="w-20 h-20 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-6">
            Trusted by Thousands
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$2M+</div>
              <div className="text-lg opacity-90">Transactions Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
