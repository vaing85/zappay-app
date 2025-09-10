import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Chatbot from '../components/Chatbot';

const ContactSupport: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const supportOptions = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Assistant',
      description: 'Get instant help with our AI-powered chatbot',
      action: 'Start Chat',
      onClick: () => setIsChatbotOpen(true),
      color: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Call us for urgent issues or complex problems',
      action: 'Call Now',
      onClick: () => window.open('tel:+1-555-ZAPPAY'),
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Send us a detailed message and we\'ll respond within 24 hours',
      action: 'Send Email',
      onClick: () => window.open('mailto:support@zappay.site'),
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const faqItems = [
    {
      question: 'How do I send money to someone?',
      answer: 'Tap "Send Money" on your dashboard, enter the recipient\'s email or phone number, add the amount, and confirm the transaction.'
    },
    {
      question: 'Is my money safe with ZapPay?',
      answer: 'Yes! We use bank-level security with end-to-end encryption, two-factor authentication, and real-time fraud detection.'
    },
    {
      question: 'What are the fees for using ZapPay?',
      answer: 'Personal transfers are free! Business payments have a small fee of 2.9% + $0.30. All fees are clearly shown before you confirm.'
    },
    {
      question: 'How long do transfers take?',
      answer: 'Most transfers are instant! Standard transfers may take 1-3 business days depending on the recipient\'s bank.'
    },
    {
      question: 'Can I cancel a payment?',
      answer: 'You can cancel pending payments before they\'re accepted. Once accepted, you\'ll need to request a refund from the recipient.'
    },
    {
      question: 'What if I forget my password?',
      answer: 'Use the "Forgot Password" link on the login screen. We\'ll send you a secure reset link to your registered email.'
    }
  ];

  const supportHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
    { day: 'Sunday', hours: '12:00 PM - 4:00 PM EST' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're here to help! Choose the best way to get support for your ZapPay account.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className={`${option.bgColor} ${option.borderColor} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
              onClick={option.onClick}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} text-white`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <h3 className={`text-xl font-semibold ml-3 ${option.textColor}`}>
                  {option.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {option.description}
              </p>
              <button className={`w-full py-2 px-4 bg-gradient-to-r ${option.color} text-white rounded-lg hover:opacity-90 transition-opacity`}>
                {option.action}
              </button>
            </div>
          ))}
        </div>

        {/* Status Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Status
              </h3>
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium">
              All systems operational
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: 2 minutes ago
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-3">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Response Time
              </h3>
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              AI Assistant: Instant
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Email: Within 24 hours
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-3">
              <InformationCircleIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Support Hours
              </h3>
            </div>
            <p className="text-purple-600 dark:text-purple-400 font-medium">
              Mon-Fri: 9 AM - 6 PM EST
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI Assistant: 24/7
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Support Hours
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {supportHours.map((schedule, index) => (
              <div key={index} className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {schedule.day}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {schedule.hours}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Our AI Assistant is available 24/7 for instant help with most questions!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
};

export default ContactSupport;
