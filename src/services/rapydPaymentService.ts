// Rapyd Payment Service
// Handles all payment operations using Rapyd API

import { apiClient } from './apiClient';

export interface RapydPaymentMethod {
  id: string;
  type: string;
  name: string;
  category: string;
  image: string;
  is_online: boolean;
  is_offline: boolean;
  is_online_offline: boolean;
  supports_refund: boolean;
  supports_capture: boolean;
  supports_partial_capture: boolean;
  supports_void: boolean;
  countries: string[];
  currencies: string[];
}

export interface RapydPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'NEW' | 'ACT' | 'CLO' | 'CAN' | 'EXP' | 'REV' | 'AUT' | 'CAP' | 'REF' | 'PAY' | 'CLI' | 'REJ';
  payment_method: string;
  customer: string;
  description: string;
  metadata: Record<string, any>;
  redirect_url: string;
  cancel_url: string;
  created_at: number;
  updated_at: number;
}

export interface RapydWallet {
  id: string;
  ewallet_reference_id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
  accounts: Array<{
    id: string;
    currency: string;
    balance: number;
    frozen_balance: number;
    status: string;
  }>;
  created_at: number;
  updated_at: number;
}

export interface RapydP2PTransfer {
  id: string;
  source_ewallet: string;
  destination_ewallet: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  metadata: Record<string, any>;
  created_at: number;
  updated_at: number;
}

class RapydPaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://zappayapp-ie9d2.ondigitalocean.app';
  }

  // Create a payment
  async createPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    description?: string;
    metadata?: Record<string, any>;
    redirectUrl?: string;
    cancelUrl?: string;
  }): Promise<{ success: boolean; data?: RapydPayment; error?: string }> {
    try {
      const response = await apiClient.post('/api/payments/create', paymentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Payment creation failed'
      };
    }
  }

  // Create P2P payment
  async createP2PPayment(p2pData: {
    toWalletId: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: RapydP2PTransfer; error?: string }> {
    try {
      const response = await apiClient.post('/api/payments/p2p', p2pData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'P2P payment creation failed'
      };
    }
  }

  // Create customer wallet
  async createCustomerWallet(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    country?: string;
    currency?: string;
  }): Promise<{ success: boolean; data?: RapydWallet; error?: string }> {
    try {
      const response = await apiClient.post('/api/payments/create-wallet', customerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Wallet creation failed'
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<{ success: boolean; data?: RapydPayment; error?: string }> {
    try {
      const response = await apiClient.get(`/api/payments/status/${paymentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Payment status retrieval failed'
      };
    }
  }

  // Get available payment methods for country
  async getPaymentMethods(country: string): Promise<{ success: boolean; data?: RapydPaymentMethod[]; error?: string }> {
    try {
      const response = await apiClient.get(`/api/payments/methods/${country}`);
      return {
        success: true,
        data: response.data.paymentMethods
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Payment methods retrieval failed'
      };
    }
  }

  // Get wallet balance
  async getWalletBalance(walletId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.get(`/api/payments/balance/${walletId}`);
      return {
        success: true,
        data: response.data.balance
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Wallet balance retrieval failed'
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/api/payments/refund', {
        paymentId,
        amount,
        reason: reason || 'Refund requested'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Refund failed'
      };
    }
  }

  // Test Rapyd connection
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post('/api/payments/test');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Connection test failed'
      };
    }
  }

  // Map Rapyd payment status to user-friendly status
  mapPaymentStatus(rapydStatus: string): string {
    switch (rapydStatus) {
      case 'NEW':
        return 'Pending';
      case 'ACT':
        return 'Active';
      case 'CLO':
        return 'Closed';
      case 'CAN':
        return 'Cancelled';
      case 'EXP':
        return 'Expired';
      case 'REV':
        return 'Reversed';
      case 'AUT':
        return 'Authorized';
      case 'CAP':
        return 'Captured';
      case 'REF':
        return 'Refunded';
      case 'PAY':
        return 'Paid';
      case 'CLI':
        return 'Client Error';
      case 'REJ':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  // Map Rapyd payment method type to display name
  mapPaymentMethodType(type: string): string {
    switch (type) {
      case 'card':
        return 'Credit/Debit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'ewallet':
        return 'E-Wallet';
      case 'cash':
        return 'Cash';
      case 'bank_redirect':
        return 'Bank Redirect';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  }
}

export const rapydPaymentService = new RapydPaymentService();
export default rapydPaymentService;
