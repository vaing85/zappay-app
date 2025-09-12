import React, { useState } from 'react';
import { 
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const PrivacyInquiries: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    subject: '',
    message: ''
  });

  const inquiryTypes = [
    { value: 'data-access', label: 'Data Access Request', icon: '📋', description: 'Request access to your personal data' },
    { value: 'data-deletion', label: 'Data Deletion Request', icon: '🗑️', description: 'Request deletion of your personal data' },
    { value: 'data-portability', label: 'Data Portability', icon: '📤', description: 'Export your data in a portable format' },
    { value: 'privacy-policy', label: 'Privacy Policy Questions', icon: '📄', description: 'Questions about our privacy policy' },
    { value: 'consent', label: 'Consent Management', icon: '✅', description: 'Manage your privacy preferences' },
    { value: 'breach', label: 'Security Incident', icon: '🚨', description: 'Report a potential security issue' },
    { value: 'other', label: 'Other Privacy Concern', icon: '❓', description: 'Other privacy-related inquiries' }
  ];

  const privacyFeatures = [
    {
      icon: <LockClosedIcon className="w-8 h-8 text-green-500" />,
      title: 'End-to-End Encryption',
      description: 'All your data is encrypted in transit and at rest'
    },
    {
      icon: <EyeSlashIcon className="w-8 h-8 text-blue-500" />,
      title: 'Zero-Knowledge Architecture',
      description: 'We cannot access your personal data without your permission'
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8 text-purple-500" />,
      title: 'Transparent Policies',
      description: 'Clear and understandable privacy policies'
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
    const mailtoLink = `mailto:privacy@zappay.site?subject=Privacy Inquiry: ${formData.subject}&body=Name: ${formData.name}%0AEmail: ${formData.email}%0AInquiry Type: ${formData.inquiryType}%0A%0AMessage:%0A${formData.message}`;
    window.open(mailtoLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Inquiries
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your privacy matters to us. Contact our privacy team for data-related requests and privacy concerns.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Submit a privacy request
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select inquiry type</option>
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {formData.inquiryType && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {inquiryTypes.find(t => t.value === formData.inquiryType)?.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of your request"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Please provide details about your privacy request..."
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Important:</p>
                    <p>We may need to verify your identity before processing certain requests. Please ensure you're using the email address associated with your ZapPay account.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Privacy Request
              </button>
            </form>
          </div>

          {/* Contact Information & Features */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Privacy team contact
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">privacy@zappay.site</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Response within 72 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+1 (555) PRIVACY</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri: 9 AM - 5 PM EST</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Secure Chat</h3>
                    <p className="text-gray-600 dark:text-gray-300">Available 24/7</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">End-to-end encrypted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your privacy is protected
              </h2>
              <div className="space-y-6">
                {privacyFeatures.map((feature, index) => (
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

            {/* Response Times */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Response times
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-900 dark:text-white">Data Access Requests</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-medium">30 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">Data Deletion Requests</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">30 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-900 dark:text-white">General Inquiries</span>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">72 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-900 dark:text-white">Security Incidents</span>
                  </div>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">24 hours</span>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Legal information
              </h2>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  All privacy requests are handled in accordance with applicable data protection laws, 
                  including GDPR, CCPA, and other regional privacy regulations.
                </p>
                <p>
                  We are committed to protecting your privacy and will respond to all legitimate 
                  requests within the legally required timeframes.
                </p>
                <p>
                  For more information about how we handle your data, please review our 
                  <a href="/privacy-policy" className="text-green-600 dark:text-green-400 hover:underline ml-1">
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyInquiries;

