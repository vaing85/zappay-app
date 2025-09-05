import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { QrCodeIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface QRCodeGeneratorProps {
  userEmail: string;
  amount?: number;
  note?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ userEmail, amount, note }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      
      // Create payment data object
      const paymentData = {
        type: 'zapcash_payment',
        recipient: userEmail,
        amount: amount || 0,
        note: note || '',
        timestamp: new Date().toISOString(),
        app: 'ZapCash'
      };

      // Generate QR code
      const qrCodeString = JSON.stringify(paymentData);
      const dataURL = await QRCode.toDataURL(qrCodeString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff'  // White
        }
      });
      
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [userEmail, amount, note]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const copyToClipboard = async () => {
    try {
      const paymentData = {
        type: 'zapcash_payment',
        recipient: userEmail,
        amount: amount || 0,
        note: note || '',
        timestamp: new Date().toISOString(),
        app: 'ZapCash'
      };
      
      await navigator.clipboard.writeText(JSON.stringify(paymentData));
      setCopied(true);
      toast.success('Payment link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `zapcash-payment-${userEmail}-${Date.now()}.png`;
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <QrCodeIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {amount ? `Request $${amount.toFixed(2)}` : 'Receive Payment'}
        </h3>
        <p className="text-gray-600">
          {amount ? 'Share this QR code to receive payment' : 'Share this QR code to receive any amount'}
        </p>
        {note && (
          <p className="text-sm text-gray-500 mt-2">"{note}"</p>
        )}
      </div>

      <div className="flex justify-center mb-6">
        {loading ? (
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-4 rounded-lg shadow-inner"
          >
            <img
              src={qrCodeDataURL}
              alt="Payment QR Code"
              className="w-64 h-64"
            />
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={copyToClipboard}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-5 h-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy Payment Link</span>
            </>
          )}
        </button>

        <button
          onClick={downloadQRCode}
          disabled={loading || !qrCodeDataURL}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Download QR Code
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800 text-center">
          💡 <strong>Tip:</strong> Others can scan this QR code with ZapCash to send you money instantly!
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
