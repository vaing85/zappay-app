import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { paymentService, PaymentMethod, Transaction, PaymentIntent, PaymentResult } from '../services/paymentService';

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addPaymentMethod: (type: PaymentMethod['type'], name: string, details: any) => Promise<PaymentMethod>;
  removePaymentMethod: (id: string) => Promise<boolean>;
  setDefaultPaymentMethod: (id: string) => Promise<boolean>;
  processPayment: (amount: number, recipientId: string, recipientEmail: string, description: string, paymentMethodId: string) => Promise<PaymentResult>;
  getTransactions: (limit?: number) => Promise<Transaction[]>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  refundTransaction: (transactionId: string, amount?: number) => Promise<PaymentResult>;
  getPaymentStats: () => Promise<{
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    transactionCount: number;
  }>;
  refreshData: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const addPaymentMethod = useCallback(async (
    type: PaymentMethod['type'],
    name: string,
    details: any
  ): Promise<PaymentMethod> => {
    try {
      setError(null);
      const paymentMethod = await paymentService.addPaymentMethod(type, name, details);
      setPaymentMethods(prev => [...prev, paymentMethod]);
      return paymentMethod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const removePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      // In a real app, this would call the API to remove the payment method
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method';
      setError(errorMessage);
      return false;
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      setPaymentMethods(prev => 
        prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
      );
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method';
      setError(errorMessage);
      return false;
    }
  }, []);

  const processPayment = useCallback(async (
    amount: number,
    recipientId: string,
    recipientEmail: string,
    description: string,
    paymentMethodId: string
  ): Promise<PaymentResult> => {
    try {
      setError(null);
      setIsLoading(true);

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        amount,
        recipientId,
        recipientEmail,
        description,
        paymentMethodId,
        { senderId: user?.id }
      );

      // Process payment
      const result = await paymentService.processPayment(paymentIntent.id);

      if (result.success) {
        // Refresh transactions
        await getTransactions();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getTransactions = useCallback(async (limit: number = 50): Promise<Transaction[]> => {
    if (!user) return [];

    try {
      setError(null);
      const userTransactions = await paymentService.getTransactions(user.id, limit);
      setTransactions(userTransactions);
      return userTransactions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
      return [];
    }
  }, [user]);

  const getTransaction = useCallback(async (id: string): Promise<Transaction | null> => {
    try {
      setError(null);
      return await paymentService.getTransaction(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transaction';
      setError(errorMessage);
      return null;
    }
  }, []);

  const refundTransaction = useCallback(async (transactionId: string, amount?: number): Promise<PaymentResult> => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await paymentService.refundTransaction(transactionId, amount);

      if (result.success) {
        // Refresh transactions
        await getTransactions();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refund failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [getTransactions]);

  const getPaymentStats = useCallback(async () => {
    if (!user) {
      return {
        totalSent: 0,
        totalReceived: 0,
        totalFees: 0,
        transactionCount: 0
      };
    }

    try {
      setError(null);
      return await paymentService.getPaymentStats(user.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment stats';
      setError(errorMessage);
      return {
        totalSent: 0,
        totalReceived: 0,
        totalFees: 0,
        transactionCount: 0
      };
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load payment methods and transactions in parallel
      const [methods, userTransactions] = await Promise.all([
        paymentService.getPaymentMethods(user.id),
        paymentService.getTransactions(user.id)
      ]);

      setPaymentMethods(methods);
      setTransactions(userTransactions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh payment data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setPaymentMethods([]);
      setTransactions([]);
    }
  }, [user, refreshData]);

  const value: PaymentContextType = {
    paymentMethods,
    transactions,
    isLoading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    processPayment,
    getTransactions,
    getTransaction,
    refundTransaction,
    getPaymentStats,
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
