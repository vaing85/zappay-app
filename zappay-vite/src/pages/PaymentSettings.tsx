import React from 'react';

const PaymentSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Settings</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Manage your payment methods and settings here.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;