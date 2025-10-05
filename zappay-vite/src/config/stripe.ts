// Stripe Configuration for ZapPay Vite
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here',
  SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here',
  WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_your_stripe_webhook_secret_here',
};

export const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.PUBLISHABLE_KEY;
export const DEFAULT_CURRENCY = 'usd';

export const stripeOptions = {
  apiVersion: '2023-10-16' as const,
  locale: 'en' as const,
  currency: 'usd' as const,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#f59e0b',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
};

export const STRIPE_OPTIONS = stripeOptions;

// Create Stripe promise
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
