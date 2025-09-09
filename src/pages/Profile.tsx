import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  ClockIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BankAccountModal from '../components/BankAccountModal';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'preferences' | 'verification' | 'banking'>('personal');
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update the user
    toast.success('Profile updated successfully! ⚡');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">Manage your ZapPay account information</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
      >
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-8 py-12 text-white">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-yellow-100 text-lg mb-2">
                {user.occupation} {user.company && `at ${user.company}`}
              </p>
              <p className="text-yellow-100 text-sm">
                ZapPay Member since {formatDate(user.createdAt)}
              </p>
              {user.bio && (
                <p className="text-yellow-100 text-sm mt-2 italic">
                  "{user.bio}"
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-2">
                ${user.balance.toLocaleString()}
              </div>
              <p className="text-yellow-100 text-sm">Account Balance</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: UserIcon },
              { id: 'professional', label: 'Professional', icon: BriefcaseIcon },
              { id: 'banking', label: 'Banking', icon: CurrencyDollarIcon },
              { id: 'preferences', label: 'Preferences', icon: CogIcon },
              { id: 'verification', label: 'Verification', icon: CheckCircleIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>


        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <p className="text-gray-900 py-3 text-lg font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900 py-3">
                    {user.dateOfBirth ? `${formatDate(user.dateOfBirth)} (Age ${getAge(user.dateOfBirth)})` : 'Not provided'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900 py-3">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <p className="text-gray-900 py-3">{user.phoneNumber}</p>
              </div>

              {user.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <p className="text-gray-900 py-3">
                    {user.address.street}<br />
                    {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                    {user.address.country}
                  </p>
                </div>
              )}

              {user.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Website
                  </label>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}

              {user.socialMedia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                    Social Media
                  </label>
                  <div className="flex space-x-4">
                    {user.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${user.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Twitter: {user.socialMedia.twitter}
                      </a>
                    )}
                    {user.socialMedia.linkedin && (
                      <a
                        href={`https://${user.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900"
                      >
                        LinkedIn: {user.socialMedia.linkedin}
                      </a>
                    )}
                    {user.socialMedia.instagram && (
                      <a
                        href={`https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-700"
                      >
                        Instagram: {user.socialMedia.instagram}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BriefcaseIcon className="w-4 h-4 inline mr-2" />
                  Occupation
                </label>
                <p className="text-gray-900 py-3 text-lg">
                  {user.occupation || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BriefcaseIcon className="w-4 h-4 inline mr-2" />
                  Company
                </label>
                <p className="text-gray-900 py-3">
                  {user.company || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Member Since
                </label>
                <p className="text-gray-900 py-3">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && user.preferences && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                    Preferred Currency
                  </label>
                  <p className="text-gray-900 py-3">{user.preferences.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LanguageIcon className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <p className="text-gray-900 py-3">{user.preferences.language.toUpperCase()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-2" />
                  Timezone
                </label>
                <p className="text-gray-900 py-3">{user.preferences.timezone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BellIcon className="w-4 h-4 inline mr-2" />
                  Notifications
                </label>
                <p className="text-gray-900 py-3">
                  {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
              
              {/* Bank Account Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Linked Bank Account</h4>
                {user.bankAccount ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <p className="text-gray-900">{user.bankAccount.bankName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <p className="text-gray-900 capitalize">{user.bankAccount.accountType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <p className="text-gray-900">****{user.bankAccount.accountNumber.slice(-4)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Verification Status
                        </label>
                        <div className="flex items-center space-x-2">
                          {user.bankAccount.isVerified ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <span className={user.bankAccount.isVerified ? 'text-green-600' : 'text-red-600'}>
                            {user.bankAccount.isVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user.bankAccount.lastVerified && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Verified
                        </label>
                        <p className="text-gray-900">{formatDate(user.bankAccount.lastVerified)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bank Account Linked</h3>
                    <p className="text-gray-600 mb-4">
                      Link your bank account to enable ACH deposits and withdrawals
                    </p>
                    <button 
                      onClick={() => setIsBankAccountModalOpen(true)}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Add Bank Account
                    </button>
                  </div>
                )}
              </div>

              {/* Withdrawal Preferences */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Withdrawal Preferences</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Withdrawal Method
                    </label>
                    <p className="text-gray-900">
                      {user.withdrawalPreferences?.defaultMethod === 'ach' ? 'ACH Bank Transfer' : 'Debit Card'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={user.withdrawalPreferences?.achEnabled || false}
                        disabled
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm text-gray-700">ACH Withdrawals Enabled</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={user.withdrawalPreferences?.debitCardEnabled || false}
                        disabled
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm text-gray-700">Debit Card Withdrawals Enabled</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Limits */}
              {user.limits && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Account Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Deposit Limit
                      </label>
                      <p className="text-gray-900">${user.limits.dailyDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Deposit Limit
                      </label>
                      <p className="text-gray-900">${user.limits.monthlyDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Withdrawal Limit
                      </label>
                      <p className="text-gray-900">${user.limits.dailyWithdrawal.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Withdrawal Limit
                      </label>
                      <p className="text-gray-900">${user.limits.monthlyWithdrawal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Level */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Verification Level</h4>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.verificationLevel === 'premium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : user.verificationLevel === 'verified'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.verificationLevel?.toUpperCase() || 'BASIC'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {user.verificationLevel === 'premium' 
                      ? 'Premium users get free withdrawals and higher limits'
                      : user.verificationLevel === 'verified'
                      ? 'Verified users get reduced fees and higher limits'
                      : 'Basic users have standard fees and limits'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && user.verificationStatus && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Verification Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'email', label: 'Email Address', description: 'Verified email address' },
                  { key: 'phone', label: 'Phone Number', description: 'Verified phone number' },
                  { key: 'identity', label: 'Identity', description: 'Government ID verified' },
                  { key: 'address', label: 'Address', description: 'Address verification completed' },
                  { key: 'bankAccount', label: 'Bank Account', description: 'Bank account verified' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center space-x-3 p-4 border rounded-lg">
                    {user.verificationStatus![item.key as keyof typeof user.verificationStatus] ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="px-8 py-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bank Account Modal */}
      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setIsBankAccountModalOpen(false)}
        onBankAccountAdded={(bankAccount) => {
          // In a real app, this would update the user's bank account info
          toast.success('Bank account added successfully!');
          setIsBankAccountModalOpen(false);
        }}
      />
    </div>
  );
};

export default Profile;
