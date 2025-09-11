import React, { useState } from 'react';
import { 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const BusinessInquiries: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  const inquiryTypes = [
    { value: 'partnership', label: 'Partnership Opportunities', icon: '🤝' },
    { value: 'enterprise', label: 'Enterprise Solutions', icon: '🏢' },
    { value: 'integration', label: 'API Integration', icon: '🔌' },
    { value: 'custom', label: 'Custom Solutions', icon: '⚙️' },
    { value: 'support', label: 'Business Support', icon: '🎧' },
    { value: 'other', label: 'Other', icon: '💼' }
  ];

  const businessFeatures = [
    {
      icon: <ChartBarIcon className="w-8 h-8 text-blue-500" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive business insights and reporting tools'
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 text-green-500" />,
      title: 'Team Management',
      description: 'Multi-user accounts with role-based permissions'
    },
    {
      icon: <CogIcon className="w-8 h-8 text-purple-500" />,
      title: 'Custom Integrations',
      description: 'Seamless integration with your existing systems'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    const mailtoLink = `mailto:business@zappay.site?subject=Business Inquiry: ${formData.inquiryType}&body=Name: ${formData.name}%0AEmail: ${formData.email}%0ACompany: ${formData.company}%0APhone: ${formData.phone}%0AInquiry Type: ${formData.inquiryType}%0A%0AMessage:%0A${formData.message}`;
    window.open(mailtoLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Business Inquiries
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let's discuss how ZapPay can help grow your business. Get in touch with our business team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inquiry Type *
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select inquiry type</option>
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us about your business needs and how we can help..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information & Features */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Other ways to reach us
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+1 (555) ZAP-PAY</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri: 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">business@zappay.site</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Live Chat</h3>
                    <p className="text-gray-600 dark:text-gray-300">Available 24/7</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered instant support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why choose ZapPay for business?
              </h2>
              <div className="space-y-6">
                {businessFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Business Support Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-900 dark:text-white">Business Team Available</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">Average Response Time</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-900 dark:text-white">Business Hours</span>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">9 AM - 6 PM EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInquiries;
