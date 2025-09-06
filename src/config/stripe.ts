import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51O...'; // Replace with your actual publishable key
export const STRIPE_SECRET_KEY = process.env.REACT_APP_STRIPE_SECRET_KEY || 'sk_test_51O...'; // This should only be used on the backend
export const STRIPE_WEBHOOK_SECRET = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || 'whsec_...';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Stripe configuration options
export const stripeOptions = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#f59e0b', // Yellow-500 to match ZapCash theme
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
      },
      '.Input:focus': {
        borderColor: '#f59e0b',
        boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px',
      },
    },
  },
  loader: 'auto' as const,
};

// Payment method types supported by Stripe
export const SUPPORTED_PAYMENT_METHOD_TYPES = [
  'card',
  'us_bank_account',
  'sepa_debit',
  'ideal',
  'sofort',
  'bancontact',
  'eps',
  'giropay',
  'p24',
  'alipay',
  'wechat_pay',
] as const;

export type SupportedPaymentMethodType = typeof SUPPORTED_PAYMENT_METHOD_TYPES[number];

// Currency configuration
export const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'] as const;
export const DEFAULT_CURRENCY = 'usd';

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
