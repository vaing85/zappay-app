import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Stripe types
interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name?: string;
    email?: string;
  };
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface StripeSubscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan: {
    id: string;
    nickname: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

interface PaymentContextType {
  paymentMethods: StripePaymentMethod[];
  subscriptions: StripeSubscription[];
  isLoading: boolean;
  error: string | null;
  
  // Payment Methods
  getPaymentMethods: () => Promise<{ success: boolean; data?: StripePaymentMethod[]; error?: string }>;
  addPaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; data?: StripePaymentMethod; error?: string }>;
  removePaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Payment Intents
  createPaymentIntent: (amount: number, currency: string, description?: string) => Promise<{ success: boolean; data?: StripePaymentIntent; error?: string }>;
  confirmPaymentIntent: (paymentIntentId: string, paymentMethodId: string) => Promise<{ success: boolean; data?: StripePaymentIntent; error?: string }>;
  
  // Subscriptions
  getSubscriptions: () => Promise<{ success: boolean; data?: StripeSubscription[]; error?: string }>;
  createSubscription: (priceId: string, paymentMethodId?: string) => Promise<{ success: boolean; data?: StripeSubscription; error?: string }>;
  cancelSubscription: (subscriptionId: string) => Promise<{ success: boolean; error?: string }>;
  updateSubscription: (subscriptionId: string, priceId: string) => Promise<{ success: boolean; data?: StripeSubscription; error?: string }>;
  
  // Customer Portal
  createCustomerPortalSession: (returnUrl: string) => Promise<{ success: boolean; data?: { url: string }; error?: string }>;
  
  // Utility
  testConnection: () => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshData: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([]);
  const [subscriptions, setSubscriptions] = useState<StripeSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zappayapp-ie9d2.ondigitalocean.app';

  // Test Stripe connection
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe-health`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: 'Stripe connection successful' };
      } else {
        return { success: false, error: data.message || 'Stripe connection failed' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to connect to Stripe service' };
    }
  }, [API_BASE_URL]);

  // Get payment methods
  const getPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods || []);
        return { success: true, data: data.paymentMethods || [] };
      } else {
        setError(data.error || 'Failed to fetch payment methods');
        return { success: false, error: data.error || 'Failed to fetch payment methods' };
      }
    } catch (error) {
      const errorMessage = 'Failed to fetch payment methods';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();
      
      if (data.success) {
        await getPaymentMethods(); // Refresh payment methods
        return { success: true, data: data.paymentMethod };
      } else {
        setError(data.error || 'Failed to add payment method');
        return { success: false, error: data.error || 'Failed to add payment method' };
      }
    } catch (error) {
      const errorMessage = 'Failed to add payment method';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getPaymentMethods]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await getPaymentMethods(); // Refresh payment methods
        return { success: true };
      } else {
        setError(data.error || 'Failed to remove payment method');
        return { success: false, error: data.error || 'Failed to remove payment method' };
      }
    } catch (error) {
      const errorMessage = 'Failed to remove payment method';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getPaymentMethods]);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-methods/${paymentMethodId}/default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await getPaymentMethods(); // Refresh payment methods
        return { success: true };
      } else {
        setError(data.error || 'Failed to set default payment method');
        return { success: false, error: data.error || 'Failed to set default payment method' };
      }
    } catch (error) {
      const errorMessage = 'Failed to set default payment method';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getPaymentMethods]);

  // Create payment intent
  const createPaymentIntent = useCallback(async (amount: number, currency: string, description?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency, description }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.paymentIntent };
      } else {
        setError(data.error || 'Failed to create payment intent');
        return { success: false, error: data.error || 'Failed to create payment intent' };
      }
    } catch (error) {
      const errorMessage = 'Failed to create payment intent';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token]);

  // Confirm payment intent
  const confirmPaymentIntent = useCallback(async (paymentIntentId: string, paymentMethodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/payment-intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.paymentIntent };
      } else {
        setError(data.error || 'Failed to confirm payment intent');
        return { success: false, error: data.error || 'Failed to confirm payment intent' };
      }
    } catch (error) {
      const errorMessage = 'Failed to confirm payment intent';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token]);

  // Get subscriptions
  const getSubscriptions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        return { success: true, data: data.subscriptions || [] };
      } else {
        setError(data.error || 'Failed to fetch subscriptions');
        return { success: false, error: data.error || 'Failed to fetch subscriptions' };
      }
    } catch (error) {
      const errorMessage = 'Failed to fetch subscriptions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token]);

  // Create subscription
  const createSubscription = useCallback(async (priceId: string, paymentMethodId?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, paymentMethodId }),
      });

      const data = await response.json();
      
      if (data.success) {
        await getSubscriptions(); // Refresh subscriptions
        return { success: true, data: data.subscription };
      } else {
        setError(data.error || 'Failed to create subscription');
        return { success: false, error: data.error || 'Failed to create subscription' };
      }
    } catch (error) {
      const errorMessage = 'Failed to create subscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getSubscriptions]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await getSubscriptions(); // Refresh subscriptions
        return { success: true };
      } else {
        setError(data.error || 'Failed to cancel subscription');
        return { success: false, error: data.error || 'Failed to cancel subscription' };
      }
    } catch (error) {
      const errorMessage = 'Failed to cancel subscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getSubscriptions]);

  // Update subscription
  const updateSubscription = useCallback(async (subscriptionId: string, priceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      
      if (data.success) {
        await getSubscriptions(); // Refresh subscriptions
        return { success: true, data: data.subscription };
      } else {
        setError(data.error || 'Failed to update subscription');
        return { success: false, error: data.error || 'Failed to update subscription' };
      }
    } catch (error) {
      const errorMessage = 'Failed to update subscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token, getSubscriptions]);

  // Create customer portal session
  const createCustomerPortalSession = useCallback(async (returnUrl: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/customer-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnUrl }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: { url: data.url } };
      } else {
        setError(data.error || 'Failed to create customer portal session');
        return { success: false, error: data.error || 'Failed to create customer portal session' };
      }
    } catch (error) {
      const errorMessage = 'Failed to create customer portal session';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE_URL, user?.token]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        getPaymentMethods(),
        getSubscriptions(),
      ]);
    } catch (error) {
      console.error('Error refreshing payment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getPaymentMethods, getSubscriptions]);

  // Load data on mount
  useEffect(() => {
    if (user?.token) {
      refreshData();
    }
  }, [user?.token, refreshData]);

  const value: PaymentContextType = {
    paymentMethods,
    subscriptions,
    isLoading,
    error,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createPaymentIntent,
    confirmPaymentIntent,
    getSubscriptions,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    createCustomerPortalSession,
    testConnection,
    refreshData,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};