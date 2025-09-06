import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  QrCodeIcon, 
  CameraIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeScanner from '../components/QRCodeScanner';
import CameraQRScanner from '../components/CameraQRScanner';
import { toast } from 'react-toastify';

const QRPayment: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [showScanner, setShowScanner] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNote, setRequestNote] = useState('');

  const handleQRScan = (data: any) => {
    // QR Code scanned successfully
    
    // In a real app, this would navigate to a payment confirmation screen
    toast.success(`QR Code scanned! Payment to ${data.recipient} for $${data.amount}`);
    setShowScanner(false);
  };

  const handleCameraScan = (result: any) => {
    // Handle camera QR scan result
    console.log('Camera QR scan result:', result);
    toast.success(`QR Code scanned: ${result.data}`);
    setShowScanner(false);
  };

  const handleGenerateQR = () => {
    if (requestAmount && parseFloat(requestAmount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    // QR will be generated automatically by the QRCodeGenerator component
  };

  if (!user) {
    return <div>Please log in to use QR payments.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          QR Code Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate QR codes to receive payments or scan codes to send money
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <QrCodeIcon className="w-5 h-5" />
            <span>Generate QR</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'scan'
                ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CameraIcon className="w-5 h-5" />
            <span>Scan QR</span>
          </button>
        </div>
      </motion.div>

      {/* Generate QR Tab */}
      {activeTab === 'generate' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* QR Code Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BoltIcon className="w-6 h-6 text-yellow-500 mr-2" />
              Payment Request
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Optional)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to receive any amount
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note (Optional)
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="What's this payment for?"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateQR}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Generate QR Code
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div>
            <QRCodeGenerator
              userEmail={user.email}
              amount={requestAmount ? parseFloat(requestAmount) : undefined}
              note={requestNote}
            />
          </div>
        </motion.div>
      )}

      {/* Scan QR Tab */}
      {activeTab === 'scan' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg">
            <CameraIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Scan QR Code
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Click the button below to open the camera and scan a QR code
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-yellow-500 text-white py-4 px-8 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-lg"
            >
              Open Camera Scanner
            </button>
          </div>
        </motion.div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <CameraQRScanner
          isOpen={showScanner}
          onScan={handleCameraScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default QRPayment;
