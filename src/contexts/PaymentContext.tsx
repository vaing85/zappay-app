import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { rapydPaymentService, RapydPaymentMethod, RapydPayment, RapydP2PTransfer, RapydWallet } from '../services/rapydPaymentService';

interface PaymentContextType {
  paymentMethods: RapydPaymentMethod[];
  transactions: any[];
  isLoading: boolean;
  error: string | null;
  wallet: RapydWallet | null;
  createWallet: (customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    country?: string;
    currency?: string;
  }) => Promise<{ success: boolean; data?: RapydWallet; error?: string }>;
  createPayment: (paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    description?: string;
    metadata?: Record<string, any>;
    redirectUrl?: string;
    cancelUrl?: string;
  }) => Promise<{ success: boolean; data?: RapydPayment; error?: string }>;
  createP2PPayment: (p2pData: {
    toWalletId: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }) => Promise<{ success: boolean; data?: RapydP2PTransfer; error?: string }>;
  getPaymentMethods: (country: string) => Promise<{ success: boolean; data?: RapydPaymentMethod[]; error?: string }>;
  getWalletBalance: (walletId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getPaymentStatus: (paymentId: string) => Promise<{ success: boolean; data?: RapydPayment; error?: string }>;
  refundPayment: (paymentId: string, amount: number, reason?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  testConnection: () => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshData: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<RapydPaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallet, setWallet] = useState<RapydWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createWallet = useCallback(async (customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    country?: string;
    currency?: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await rapydPaymentService.createCustomerWallet(customerData);
      if (result.success && result.data) {
        setWallet(result.data);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wallet creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    description?: string;
    metadata?: Record<string, any>;
    redirectUrl?: string;
    cancelUrl?: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await rapydPaymentService.createPayment(paymentData);
      if (result.success) {
        // Refresh transactions
        await refreshData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createP2PPayment = useCallback(async (p2pData: {
    toWalletId: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await rapydPaymentService.createP2PPayment(p2pData);
      if (result.success) {
        // Refresh transactions
        await refreshData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'P2P payment creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentMethods = useCallback(async (country: string) => {
    try {
      setError(null);
      const result = await rapydPaymentService.getPaymentMethods(country);
      if (result.success && result.data) {
        setPaymentMethods(result.data);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment methods';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const getWalletBalance = useCallback(async (walletId: string) => {
    try {
      setError(null);
      return await rapydPaymentService.getWalletBalance(walletId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wallet balance';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      setError(null);
      return await rapydPaymentService.getPaymentStatus(paymentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: string, amount: number, reason?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await rapydPaymentService.refundPayment(paymentId, amount, reason);
      if (result.success) {
        // Refresh transactions
        await refreshData();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refund failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async () => {
    try {
      setError(null);
      return await rapydPaymentService.testConnection();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load payment methods for user's country (default to US)
      const country = user.address?.country || 'US';
      await getPaymentMethods(country);

      // If user has a wallet, load balance
      if (wallet?.id) {
        await getWalletBalance(wallet.id);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh payment data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, wallet, getPaymentMethods, getWalletBalance]);

  // Load data when user changes
  useEffect(() => {
    if (user && user.id) {
      refreshData();
    } else {
      setPaymentMethods([]);
      setTransactions([]);
      setWallet(null);
    }
  }, [user, refreshData]);

  const value: PaymentContextType = {
    paymentMethods,
    transactions,
    isLoading,
    error,
    wallet,
    createWallet,
    createPayment,
    createP2PPayment,
    getPaymentMethods,
    getWalletBalance,
    getPaymentStatus,
    refundPayment,
    testConnection,
    refreshData,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};