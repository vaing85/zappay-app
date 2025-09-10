import { create } from 'zustand';
import { paymentApi, Transaction } from '../services/paymentApi';

// Payment state interface
interface PaymentState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

// Payment actions interface
interface PaymentActions {
  sendMoney: (recipient: string, amount: number, note?: string) => Promise<boolean>;
  getTransactionHistory: (params?: {
    page?: number;
    limit?: number;
    type?: 'sent' | 'received' | 'all';
    status?: 'pending' | 'completed' | 'failed' | 'all';
    search?: string;
  }) => Promise<void>;
  getBalance: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Combined payment store type
type PaymentStore = PaymentState & PaymentActions;

// Create payment store
export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // Initial state
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Actions
  sendMoney: async (recipient: string, amount: number, note?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await paymentApi.sendMoney({
        recipient,
        amount,
        note,
      });
      
      if (response.success) {
        // Update balance
        set({ balance: response.data.newBalance });
        
        // Add transaction to list
        const { addTransaction } = get();
        addTransaction(response.data.transaction);
        
        set({ isLoading: false, error: null });
        return true;
      }
      
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  getTransactionHistory: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await paymentApi.getTransactionHistory({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params,
      });
      
      if (response.success) {
        const { transactions, page, total } = response.data;
        
        set((state) => ({
          transactions: page === 1 ? transactions : [...state.transactions, ...transactions],
          hasMore: transactions.length === (params.limit || 20),
          currentPage: page,
          isLoading: false,
          error: null,
        }));
      } else {
        set({ error: 'Failed to load transactions', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const balance = await paymentApi.getBalance();
      
      set({ balance, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => {
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...updates }
          : transaction
      ),
    }));
  },

  clearTransactions: () => {
    set({
      transactions: [],
      hasMore: true,
      currentPage: 1,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Selectors
export const useBalance = () => usePaymentStore((state) => state.balance);

export const useTransactions = () => usePaymentStore((state) => state.transactions);

export const usePaymentLoading = () => usePaymentStore((state) => state.isLoading);

export const usePaymentError = () => usePaymentStore((state) => state.error);

export const usePaymentActions = () => usePaymentStore((state) => ({
  sendMoney: state.sendMoney,
  getTransactionHistory: state.getTransactionHistory,
  getBalance: state.getBalance,
  addTransaction: state.addTransaction,
  updateTransaction: state.updateTransaction,
  clearTransactions: state.clearTransactions,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}));

