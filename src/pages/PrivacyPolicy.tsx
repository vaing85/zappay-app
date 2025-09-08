import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "Personal information you provide (name, email, phone number)",
        "Payment information processed securely through Stripe",
        "Transaction history and payment records",
        "Device information for security purposes",
        "Usage analytics to improve our service"
      ]
    },
    {
      icon: <LockClosedIcon className="w-6 h-6" />,
      title: "How We Protect Your Data",
      content: [
        "End-to-end encryption for all sensitive data",
        "Secure servers with industry-standard security",
        "Regular security audits and updates",
        "Limited access to personal information",
        "Compliance with financial data protection standards"
      ]
    },
    {
      icon: <EyeIcon className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        "Process payments and transactions",
        "Provide customer support",
        "Improve our services and user experience",
        "Comply with legal and regulatory requirements",
        "Prevent fraud and ensure security"
      ]
    },
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        "Access your personal information",
        "Correct inaccurate data",
        "Delete your account and data",
        "Opt-out of marketing communications",
        "Data portability upon request"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <ShieldCheckIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy and security are our top priorities
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              ZapPay ("we," "our," or "us") is committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our payment application and services.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="text-yellow-500 mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Data Sharing */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Sharing and Third Parties
            </h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              information only in the following circumstances:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• With payment processors (Stripe) to process transactions</li>
              <li>• With email service providers (SendGrid) for notifications</li>
              <li>• With SMS providers (Twilio) for verification codes</li>
              <li>• When required by law or legal process</li>
              <li>• To protect our rights and prevent fraud</li>
            </ul>
          </div>

          {/* Security Measures */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Security Measures
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Technical Security</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• SSL/TLS encryption</li>
                  <li>• Secure data centers</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and monitoring</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Operational Security</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Employee training</li>
                  <li>• Incident response procedures</li>
                  <li>• Data backup and recovery</li>
                  <li>• Compliance monitoring</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 mt-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">
              Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@zappay.site</p>
              <p><strong>Website:</strong> https://zappay.site</p>
              <p><strong>Response Time:</strong> We respond to privacy inquiries within 48 hours</p>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Policy Updates
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new Privacy Policy on this page and updating the 
              "Last updated" date. Your continued use of our service after any modifications 
              constitutes acceptance of the updated Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
