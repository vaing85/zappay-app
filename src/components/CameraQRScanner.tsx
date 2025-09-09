import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  QrCodeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import jsQR from 'jsqr';

interface QRScanResult {
  data: string;
  format: string;
  timestamp: Date;
}

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: QRScanResult) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  onError,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // QR code detection using jsQR library
  const detectQRCode = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Use jsQR library to detect QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      const result: QRScanResult = {
        data: code.data,
        format: 'QR_CODE',
        timestamp: new Date()
      };
      
      onScan(result);
      setIsScanning(false);
    }
  }, [onScan]);


  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setHasPermission(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setHasPermission(false);
      onError?.(errorMessage);
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Start scanning when component mounts
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Scan loop
  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        detectQRCode(videoRef.current, canvasRef.current);
      }
    }, 100); // Scan every 100ms

    return () => clearInterval(scanInterval);
  }, [isScanning, detectQRCode]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 ${className}`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <QrCodeIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code Scanner
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Camera View */}
          <div className="relative mb-4">
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-yellow-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex items-center justify-center space-x-4 mt-2">
              {hasPermission === null && (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                  <span className="text-sm">Initializing camera...</span>
                </div>
              )}
              
              {hasPermission === true && isScanning && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="text-sm">Scanning for QR codes...</span>
                </div>
              )}
              
              {hasPermission === false && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">Camera access denied</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>• Point your camera at a QR code</p>
            <p>• Make sure the QR code is well-lit and in focus</p>
            <p>• The scanner will automatically detect and process the code</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            {hasPermission === false && (
              <button
                onClick={startCamera}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraQRScanner;
