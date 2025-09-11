import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Chatbot from '../components/Chatbot';

const HelpCenter: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          question: 'How do I create a ZapPay account?',
          answer: 'Click "Get Started" on our homepage, enter your email and create a secure password. Verify your email and you\'re ready to go!'
        },
        {
          question: 'What information do I need to get started?',
          answer: 'Just your email address and a secure password. For enhanced security, we recommend adding your phone number and enabling two-factor authentication.'
        },
        {
          question: 'Is ZapPay free to use?',
          answer: 'Yes! Our basic plan is completely free and includes sending money, QR payments, and basic analytics. Premium features are available with our Pro, Business, and Enterprise plans.'
        }
      ]
    },
    {
      title: 'Sending Money',
      icon: '💸',
      questions: [
        {
          question: 'How do I send money to someone?',
          answer: 'Go to your dashboard, click "Send Money", enter the recipient\'s email or phone number, add the amount, and confirm the transaction. It\'s that simple!'
        },
        {
          question: 'How long do transfers take?',
          answer: 'Most transfers are instant! Standard transfers may take 1-3 business days depending on the recipient\'s bank. You\'ll see the estimated time before confirming.'
        },
        {
          question: 'What are the fees for sending money?',
          answer: 'Personal transfers are completely free! Business payments have a small fee of 2.9% + $0.30. All fees are clearly shown before you confirm any transaction.'
        }
      ]
    },
    {
      title: 'Security & Safety',
      icon: '🔒',
      questions: [
        {
          question: 'Is my money safe with ZapPay?',
          answer: 'Absolutely! We use bank-level security with end-to-end encryption, two-factor authentication, and real-time fraud detection. Your money is protected with military-grade security.'
        },
        {
          question: 'What if I forget my password?',
          answer: 'Use the "Forgot Password" link on the login screen. We\'ll send you a secure reset link to your registered email address.'
        },
        {
          question: 'Can I cancel a payment?',
          answer: 'You can cancel pending payments before they\'re accepted by the recipient. Once accepted, you\'ll need to request a refund from the recipient.'
        }
      ]
    },
    {
      title: 'Business Features',
      icon: '🏢',
      questions: [
        {
          question: 'How do I accept payments for my business?',
          answer: 'Upgrade to our Business plan to access merchant features. Generate QR codes, create payment links, and manage transactions through your merchant dashboard.'
        },
        {
          question: 'What payment methods can I accept?',
          answer: 'Accept payments via credit cards, bank transfers, and digital wallets. We support all major payment methods to maximize your customer reach.'
        },
        {
          question: 'How do I track my business payments?',
          answer: 'Use our comprehensive analytics dashboard to track sales, customer behavior, revenue trends, and transaction history in real-time.'
        }
      ]
    }
  ];

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

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
            <QuestionMarkCircleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions and get the help you need
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
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

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">{category.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.title}
                </h2>
              </div>
              <div className="space-y-4">
                {category.questions.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
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
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try searching with different keywords or contact our support team
            </p>
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Contact Support
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
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
      </div>

      {/* Chatbot Modal */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
};

export default HelpCenter;
