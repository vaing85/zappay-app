import { api } from './apiClient';

// Types
export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  note?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SendMoneyRequest {
  recipient: string; // email, phone, or username
  amount: number;
  note?: string;
  paymentMethod?: string;
}

export interface SendMoneyResponse {
  success: boolean;
  message: string;
  data: {
    transaction: Transaction;
    newBalance: number;
  };
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface QRCodeData {
  type: 'user_profile' | 'payment_request';
  userId: string;
  userName: string;
  userEmail: string;
  amount?: number;
  note?: string;
  timestamp: string;
}

export interface PaymentRequest {
  amount: number;
  note?: string;
  expiresAt?: string;
}

export interface PaymentRequestResponse {
  success: boolean;
  data: {
    requestId: string;
    qrCode: string;
    paymentUrl: string;
  };
}

// Payment API methods
export const paymentApi = {
  // Send money to another user
  sendMoney: async (request: SendMoneyRequest): Promise<SendMoneyResponse> => {
    try {
      const response = await api.post<SendMoneyResponse>('/payments/send', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Send money failed');
    }
  },

  // Get transaction history
  getTransactionHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: 'sent' | 'received' | 'all';
    status?: 'pending' | 'completed' | 'failed' | 'all';
    search?: string;
  }): Promise<TransactionHistoryResponse> => {
    try {
      const response = await api.get<TransactionHistoryResponse>('/payments/history', {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transaction history');
    }
  },

  // Get transaction by ID
  getTransaction: async (transactionId: string): Promise<Transaction> => {
    try {
      const response = await api.get<{ success: boolean; data: Transaction }>(`/payments/transaction/${transactionId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transaction');
    }
  },

  // Get user balance
  getBalance: async (): Promise<number> => {
    try {
      const response = await api.get<{ success: boolean; data: { balance: number } }>('/payments/balance');
      return response.data.data.balance;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get balance');
    }
  },

  // Create payment request (for QR code)
  createPaymentRequest: async (request: PaymentRequest): Promise<PaymentRequestResponse> => {
    try {
      const response = await api.post<PaymentRequestResponse>('/payments/request', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment request');
    }
  },

  // Process payment request (scan QR code)
  processPaymentRequest: async (requestId: string, amount: number): Promise<SendMoneyResponse> => {
    try {
      const response = await api.post<SendMoneyResponse>(`/payments/process/${requestId}`, {
        amount,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process payment request');
    }
  },

  // Get user profile for QR code
  getUserProfile: async (): Promise<{
    id: string;
    name: string;
    email: string;
    qrCode: string;
  }> => {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/payments/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  },

  // Cancel transaction
  cancelTransaction: async (transactionId: string): Promise<void> => {
    try {
      await api.post(`/payments/cancel/${transactionId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel transaction');
    }
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<{
    id: string;
    type: 'bank_account' | 'debit_card' | 'credit_card';
    last4: string;
    brand?: string;
    isDefault: boolean;
  }[]> => {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/payments/methods');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment methods');
    }
  },

  // Add payment method
  addPaymentMethod: async (methodData: {
    type: 'bank_account' | 'debit_card' | 'credit_card';
    token: string;
    isDefault?: boolean;
  }): Promise<void> => {
    try {
      await api.post('/payments/methods', methodData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add payment method');
    }
  },

  // Remove payment method
  removePaymentMethod: async (methodId: string): Promise<void> => {
    try {
      await api.delete(`/payments/methods/${methodId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove payment method');
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (methodId: string): Promise<void> => {
    try {
      await api.post(`/payments/methods/${methodId}/default`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set default payment method');
    }
  },
};

