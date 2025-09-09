import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { 
  QrCodeIcon, 
  ClipboardIcon, 
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface BusinessQRCode {
  id: string;
  name: string;
  description: string;
  amount: number | null; // null for any amount
  category: string;
  isActive: boolean;
  scans: number;
  revenue: number;
  createdAt: string;
  expiresAt?: string;
  qrCodeDataURL: string;
}

interface BusinessQRGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onQRGenerated: (qrData: BusinessQRCode) => void;
}

const BusinessQRGenerator: React.FC<BusinessQRGeneratorProps> = ({ 
  isOpen, 
  onClose, 
  onQRGenerated 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  
  // QR Creation Form
  const [qrName, setQrName] = useState('');
  const [qrDescription, setQrDescription] = useState('');
  const [qrAmount, setQrAmount] = useState<number | null>(null);
  const [qrCategory, setQrCategory] = useState('General');
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  
  // QR Management
  const [qrCodes, setQrCodes] = useState<BusinessQRCode[]>([]);
  const [selectedQR, setSelectedQR] = useState<BusinessQRCode | null>(null);

  const categories = [
    'General',
    'Food & Dining',
    'Retail',
    'Services',
    'Entertainment',
    'Transportation',
    'Healthcare',
    'Education',
    'Other'
  ];

  const generateQRCode = useCallback(async (qrData: Partial<BusinessQRCode>) => {
    try {
      setLoading(true);
      
      // Create business payment data object
      const paymentData = {
        type: 'zappay_business_payment',
        businessId: user?.id || 'business',
        businessName: user ? `${user.firstName} ${user.lastName}` : 'Business',
        businessEmail: user?.email || 'business@example.com',
        qrId: qrData.id || `qr_${Date.now()}`,
        name: qrData.name || 'Business Payment',
        description: qrData.description || '',
        amount: qrData.amount || null,
        category: qrData.category || 'General',
        timestamp: new Date().toISOString(),
        expiresAt: qrData.expiresAt || null,
        app: 'ZapPay Business'
      };

      // Generate QR code with business branding
      const qrCodeString = JSON.stringify(paymentData);
      const dataURL = await QRCode.toDataURL(qrCodeString, {
        width: 300,
        margin: 3,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff'  // White
        },
        errorCorrectionLevel: 'M'
      });
      
      return dataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createQRCode = async () => {
    if (!qrName.trim()) {
      toast.error('Please enter a QR code name');
      return;
    }

    const qrId = `qr_${Date.now()}`;
    const expiresAt = qrExpiry ? new Date(Date.now() + qrExpiry * 24 * 60 * 60 * 1000).toISOString() : undefined;
    
    const qrData: Partial<BusinessQRCode> = {
      id: qrId,
      name: qrName,
      description: qrDescription,
      amount: qrAmount,
      category: qrCategory,
      expiresAt,
      isActive: true,
      scans: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    const dataURL = await generateQRCode(qrData);
    if (dataURL) {
      const newQR: BusinessQRCode = {
        ...qrData as BusinessQRCode,
        qrCodeDataURL: dataURL
      };
      
      setQrCodes(prev => [newQR, ...prev]);
      onQRGenerated(newQR);
      
      // Reset form
      setQrName('');
      setQrDescription('');
      setQrAmount(null);
      setQrCategory('General');
      setQrExpiry(null);
      
      toast.success('QR code created successfully!');
    }
  };

  const copyToClipboard = async (qrCode: BusinessQRCode) => {
    try {
      const paymentData = {
        type: 'zappay_business_payment',
        businessId: user?.id || 'business',
        businessName: user ? `${user.firstName} ${user.lastName}` : 'Business',
        businessEmail: user?.email || 'business@example.com',
        qrId: qrCode.id,
        name: qrCode.name,
        description: qrCode.description,
        amount: qrCode.amount,
        category: qrCode.category,
        timestamp: new Date().toISOString(),
        expiresAt: qrCode.expiresAt,
        app: 'ZapPay Business'
      };
      
      await navigator.clipboard.writeText(JSON.stringify(paymentData));
      toast.success('QR code data copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadQRCode = (qrCode: BusinessQRCode) => {
    if (qrCode.qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `zappay-business-${qrCode.name.replace(/\s+/g, '-')}-${qrCode.id}.png`;
      link.href = qrCode.qrCodeDataURL;
      link.click();
    }
  };

  const toggleQRActive = (qrId: string) => {
    setQrCodes(prev => prev.map(qr => 
      qr.id === qrId ? { ...qr, isActive: !qr.isActive } : qr
    ));
  };

  const deleteQRCode = (qrId: string) => {
    setQrCodes(prev => prev.filter(qr => qr.id !== qrId));
    if (selectedQR?.id === qrId) {
      setSelectedQR(null);
    }
  };

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New QR Code
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              QR Code Name *
            </label>
            <input
              type="text"
              value={qrName}
              onChange={(e) => setQrName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Coffee Counter, Event Tickets"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={qrDescription}
              onChange={(e) => setQrDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of what this QR code is for"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={qrAmount || ''}
                  onChange={(e) => setQrAmount(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for any amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={qrCategory}
                onChange={(e) => setQrCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiry (Optional)
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={qrExpiry || ''}
                onChange={(e) => setQrExpiry(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="30"
                min="1"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of days until QR code expires
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={createQRCode}
            disabled={loading || !qrName.trim()}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                <span>Create QR Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Manage QR Codes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {qrCodes.length} QR codes
        </span>
      </div>

      {qrCodes.length === 0 ? (
        <div className="text-center py-12">
          <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No QR Codes Yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first QR code to start accepting payments
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create QR Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {qr.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {qr.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleQRActive(qr.id)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      qr.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      qr.isActive ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <button
                    onClick={() => deleteQRCode(qr.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {qr.amount ? `$${qr.amount.toFixed(2)}` : 'Any amount'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{qr.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Scans:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{qr.scans}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${qr.revenue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedQR(qr)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => copyToClipboard(qr)}
                  className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => downloadQRCode(qr)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BuildingStorefrontIcon className="w-8 h-8 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Business QR Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage QR codes for your business
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Create QR Code
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Manage QR Codes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'manage' && renderManageTab()}
        </div>

        {/* QR Code Preview Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedQR.name}
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                  <img
                    src={selectedQR.qrCodeDataURL}
                    alt="Business QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => copyToClipboard(selectedQR)}
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Copy Data
                  </button>
                  <button
                    onClick={() => downloadQRCode(selectedQR)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Download
                  </button>
                </div>
                <button
                  onClick={() => setSelectedQR(null)}
                  className="mt-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BusinessQRGenerator;
