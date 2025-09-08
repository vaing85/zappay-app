import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using ZapPay, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, you may not use our service",
        "These terms apply to all users, including visitors, registered users, and premium users",
        "We reserve the right to modify these terms at any time with notice"
      ]
    },
    {
      icon: <ScaleIcon className="w-6 h-6" />,
      title: "Service Description",
      content: [
        "ZapPay is a peer-to-peer payment application that facilitates secure money transfers",
        "We provide payment processing services through third-party providers like Stripe",
        "Our service includes transaction history, user profiles, and payment management tools",
        "We are not a bank and do not hold funds in traditional bank accounts"
      ]
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: "User Responsibilities",
      content: [
        "Provide accurate and complete information during registration",
        "Maintain the security of your account credentials",
        "Use the service only for lawful purposes",
        "Comply with all applicable laws and regulations",
        "Report any suspicious activity or security breaches immediately"
      ]
    },
    {
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      title: "Prohibited Activities",
      content: [
        "Fraudulent or illegal transactions",
        "Money laundering or terrorist financing",
        "Circumventing security measures",
        "Creating multiple accounts to avoid restrictions",
        "Using the service for unauthorized commercial purposes"
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
            <ScaleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully before using ZapPay
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
              Welcome to ZapPay! These Terms of Service ("Terms") govern your use of our payment 
              application and services. By using ZapPay, you agree to these terms and our Privacy Policy. 
              Please read them carefully.
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

          {/* Payment Terms */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Payment Terms
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Transaction Fees:</strong> ZapPay may charge fees for certain transactions. 
                All fees will be clearly disclosed before you complete a transaction.
              </p>
              <p>
                <strong>Payment Processing:</strong> Payments are processed through secure third-party 
                providers. We are not responsible for delays or issues caused by payment processors.
              </p>
              <p>
                <strong>Refunds:</strong> Refund policies vary by transaction type. Contact support 
                for assistance with refund requests.
              </p>
              <p>
                <strong>Currency:</strong> All transactions are processed in the currency specified 
                at the time of the transaction.
              </p>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Security
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Responsibilities</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Keep your login credentials secure</li>
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication</li>
                  <li>• Log out from shared devices</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Our Protections</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Encrypted data transmission</li>
                  <li>• Secure data storage</li>
                  <li>• Fraud monitoring</li>
                  <li>• Account activity alerts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, ZapPay shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to 
              loss of profits, data, or use, arising out of or relating to your use of our service.
            </p>
            <p className="text-gray-600">
              Our total liability to you for any claims arising from these terms or your use of 
              our service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </div>

          {/* Termination */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Termination
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>By You:</strong> You may terminate your account at any time by contacting 
                our support team or using the account deletion feature in your settings.
              </p>
              <p>
                <strong>By Us:</strong> We may suspend or terminate your account if you violate 
                these terms, engage in fraudulent activity, or for other reasons at our discretion.
              </p>
              <p>
                <strong>Effect of Termination:</strong> Upon termination, your right to use the 
                service ceases immediately, but certain provisions of these terms will survive.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Governing Law and Disputes
            </h2>
            <p className="text-gray-600 mb-4">
              These terms are governed by the laws of the jurisdiction where ZapPay operates. 
              Any disputes arising from these terms or your use of our service will be resolved 
              through binding arbitration.
            </p>
            <p className="text-gray-600">
              Before initiating any legal proceedings, we encourage you to contact us directly 
              to resolve any issues through our customer support channels.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 mt-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">
              Contact Information
            </h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> legal@zappay.site</p>
              <p><strong>Support:</strong> support@zappay.site</p>
              <p><strong>Website:</strong> https://zappay.site</p>
              <p><strong>Response Time:</strong> We respond to legal inquiries within 72 hours</p>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms of Service at any time. We will notify 
              users of material changes through email or in-app notifications. Your continued use 
              of our service after changes become effective constitutes acceptance of the updated terms.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
