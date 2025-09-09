import React, { useState } from 'react';
import { Elements, CardElement } from '@stripe/react-stripe-js';
import { stripePromise, stripeOptions } from '../config/stripe';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StripeCardInputProps {
  onCardChange?: (isComplete: boolean, error?: string) => void;
  onCardReady?: (element: any) => void;
  className?: string;
  disabled?: boolean;
}

const CardInputForm: React.FC<StripeCardInputProps> = ({ 
  onCardChange, 
  onCardReady, 
  className = '', 
  disabled = false 
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: any) => {
    setError(event.error ? event.error.message : null);
    onCardChange?.(event.complete, event.error?.message);
  };

  const handleReady = (element: any) => {
    onCardReady?.(element);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        padding: '12px',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
    disabled,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Card Information
      </label>
      <div className="relative">
        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent bg-white dark:bg-gray-700">
          <CardElement
            options={cardElementOptions}
            onChange={handleChange}
            onReady={handleReady}
          />
        </div>
        {error && (
          <div className="flex items-center space-x-1 mt-2 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const StripeCardInput: React.FC<StripeCardInputProps> = (props) => {
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <CardInputForm {...props} />
    </Elements>
  );
};

export default StripeCardInput;
