import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCodeIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface QRCodeScannerProps {
  onScan: (data: any) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start scanning for QR codes
      scanForQRCode();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const scanForQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simple QR code detection (in a real app, you'd use a proper QR library)
        // For now, we'll simulate a successful scan after a delay
        setTimeout(() => {
          // Simulate QR code data
          const mockQRData = {
            type: 'zappay_payment',
            recipient: 'john@zappay.com',
            amount: 25.00,
            note: 'Coffee payment',
            timestamp: new Date().toISOString(),
            app: 'ZapPay'
          };
          
          onScan(mockQRData);
          stopScanning();
        }, 2000);
      }

      if (isScanning) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <QrCodeIcon className="w-8 h-8 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CameraIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {isScanning && (
            <div className="absolute inset-0 border-2 border-yellow-500 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>
            </div>
          )}
        </div>

        <div className="text-center">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="bg-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              Start Scanning
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">Point your camera at a QR code</p>
              <button
                onClick={stopScanning}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Tip:</strong> Make sure the QR code is well-lit and centered in the frame
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeScanner;
