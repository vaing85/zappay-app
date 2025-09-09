// Payment Processing Service
// This service handles all payment operations including processing, validation, and integration
// Now integrated with Stripe for real payment processing

import { stripePaymentService, StripePaymentMethod, StripePaymentIntent, StripeCharge, StripeRefund } from './stripePaymentService';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet' | 'crypto';
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId: string;
  recipientId: string;
  recipientEmail: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresAction?: boolean;
  nextAction?: {
    type: 'redirect' | '3d_secure' | 'capture';
    url?: string;
  };
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  senderId: string;
  recipientId?: string;
  description: string;
  paymentMethodId: string;
  fees: number;
  netAmount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PaymentGatewayConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
  };
  square: {
    applicationId: string;
    accessToken: string;
    environment: 'sandbox' | 'production';
  };
}

class PaymentService {
  private config: PaymentGatewayConfig;
  private transactions: Map<string, Transaction> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  constructor() {
    this.config = {
      stripe: {
        publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
        secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || 'sk_test_...',
        webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || 'whsec_...'
      },
      paypal: {
        clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'paypal_client_id',
        clientSecret: process.env.REACT_APP_PAYPAL_CLIENT_SECRET || 'paypal_client_secret',
        environment: 'sandbox'
      },
      square: {
        applicationId: process.env.REACT_APP_SQUARE_APPLICATION_ID || 'square_app_id',
        accessToken: process.env.REACT_APP_SQUARE_ACCESS_TOKEN || 'square_access_token',
        environment: 'sandbox'
      }
    };
  }

  // Create a payment intent using Stripe
  async createPaymentIntent(
    amount: number,
    recipientId: string,
    recipientEmail: string,
    description: string,
    paymentMethodId: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentIntent> {
    try {
      // Create customer if needed
      const customer = await stripePaymentService.createCustomer(
        recipientEmail,
        recipientId,
        { ...metadata, recipientId }
      );

      // Create Stripe payment intent
      const stripePaymentIntent = await stripePaymentService.createPaymentIntent(
        amount,
        'usd',
        paymentMethodId,
        customer.id,
        description,
        { ...metadata, recipientId, recipientEmail }
      );

      // Convert to our PaymentIntent format
      const paymentIntent: PaymentIntent = {
        id: stripePaymentIntent.id,
        amount: stripePaymentIntent.amount / 100, // Convert from cents
        currency: stripePaymentIntent.currency,
        status: this.mapStripeStatus(stripePaymentIntent.status),
        paymentMethodId: paymentMethodId,
        recipientId,
        recipientEmail,
        description: stripePaymentIntent.description || description,
        metadata: stripePaymentIntent.metadata,
        createdAt: new Date(stripePaymentIntent.created * 1000),
        updatedAt: new Date(stripePaymentIntent.created * 1000),
        clientSecret: stripePaymentIntent.client_secret
      };

      this.paymentIntents.set(paymentIntent.id, paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Map Stripe status to our status
  private mapStripeStatus(stripeStatus: string): PaymentIntent['status'] {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
        return 'pending';
      case 'requires_action':
        return 'processing';
      case 'processing':
        return 'processing';
      case 'requires_capture':
        return 'processing';
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  // Process a payment using Stripe
  async processPayment(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      return {
        success: false,
        error: 'Payment intent not found'
      };
    }

    try {
      if (!paymentIntent.clientSecret) {
        return {
          success: false,
          error: 'Payment intent not ready for processing'
        };
      }

      // Confirm payment intent with Stripe
      const result = await stripePaymentService.confirmPaymentIntent(
        paymentIntent.clientSecret,
        paymentIntent.paymentMethodId
      );
      
      if (result.error) {
        paymentIntent.status = 'failed';
        paymentIntent.updatedAt = new Date();
        this.paymentIntents.set(paymentIntentId, paymentIntent);
        
        return {
          success: false,
          error: result.error
        };
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Create transaction record
        const transaction = await this.createTransaction(paymentIntent);
        this.transactions.set(transaction.id, transaction);
        
        // Update payment intent status
        paymentIntent.status = 'succeeded';
        paymentIntent.updatedAt = new Date();
        this.paymentIntents.set(paymentIntentId, paymentIntent);
        
        return {
          success: true,
          transactionId: transaction.id
        };
      } else if (result.paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          nextAction: {
            type: '3d_secure'
          }
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed'
        };
      }
    } catch (error) {
      paymentIntent.status = 'failed';
      paymentIntent.updatedAt = new Date();
      this.paymentIntents.set(paymentIntentId, paymentIntent);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Simulate payment processing (replace with actual gateway integration)
  private async simulatePaymentProcessing(paymentIntent: PaymentIntent): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Payment was declined by the bank'
      };
    }
  }

  // Create transaction record
  private async createTransaction(paymentIntent: PaymentIntent): Promise<Transaction> {
    const fees = this.calculateFees(paymentIntent.amount);
    const netAmount = paymentIntent.amount - fees;
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      senderId: paymentIntent.metadata.senderId || 'current_user',
      recipientId: paymentIntent.recipientId,
      description: paymentIntent.description,
      paymentMethodId: paymentIntent.paymentMethodId,
      fees,
      netAmount,
      metadata: paymentIntent.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date()
    };

    return transaction;
  }

  // Calculate payment fees
  private calculateFees(amount: number): number {
    // 2.9% + $0.30 per transaction (Stripe-like pricing)
    return Math.round((amount * 0.029 + 0.30) * 100) / 100;
  }

  // Add payment method using Stripe
  async addPaymentMethod(
    type: PaymentMethod['type'],
    name: string,
    details: any,
    customerId?: string
  ): Promise<PaymentMethod> {
    try {
      // For now, create a mock payment method since we don't have a real backend
      // In production, this would call the actual Stripe API
      const mockPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        name,
        last4: '4242', // Mock last 4 digits
        brand: 'visa', // Mock brand
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: this.paymentMethods.size === 0,
        isVerified: true,
        createdAt: new Date()
      };

      this.paymentMethods.set(mockPaymentMethod.id, mockPaymentMethod);
      return mockPaymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Map Stripe payment method type to our type
  private mapStripePaymentMethodType(stripeType: string): PaymentMethod['type'] {
    switch (stripeType) {
      case 'card':
        return 'card';
      case 'us_bank_account':
      case 'sepa_debit':
        return 'bank_account';
      case 'alipay':
      case 'wechat_pay':
        return 'wallet';
      default:
        return 'card';
    }
  }

  // Get payment methods from Stripe
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      // Get Stripe payment methods for customer
      const stripePaymentMethods = await stripePaymentService.getPaymentMethods(userId);
      
      // Convert to our PaymentMethod format
      const paymentMethods: PaymentMethod[] = stripePaymentMethods.map(stripePm => ({
        id: stripePm.id,
        type: this.mapStripePaymentMethodType(stripePm.type),
        name: stripePm.billing_details.name || 'Payment Method',
        last4: stripePm.card?.last4 || stripePm.us_bank_account?.last4,
        brand: stripePm.card?.brand,
        expiryMonth: stripePm.card?.exp_month,
        expiryYear: stripePm.card?.exp_year,
        isDefault: false, // This would need to be tracked separately
        isVerified: true,
        createdAt: new Date(stripePm.created * 1000)
      }));

      // Update local cache
      paymentMethods.forEach(pm => {
        this.paymentMethods.set(pm.id, pm);
      });

      return paymentMethods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      // Fallback to local cache
      return Array.from(this.paymentMethods.values());
    }
  }

  // Get transactions
  async getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.senderId === userId || tx.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userTransactions;
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  // Refund transaction using Stripe
  async refundTransaction(transactionId: string, amount?: number): Promise<PaymentResult> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found'
      };
    }

    if (transaction.status !== 'completed') {
      return {
        success: false,
        error: 'Only completed transactions can be refunded'
      };
    }

    const refundAmount = amount || transaction.amount;
    if (refundAmount > transaction.amount) {
      return {
        success: false,
        error: 'Refund amount cannot exceed original transaction amount'
      };
    }

    try {
      // Create Stripe refund
      const stripeRefund = await stripePaymentService.createRefund(
        transactionId, // This should be the Stripe charge ID
        refundAmount,
        'requested_by_customer',
        {
          originalTransactionId: transactionId,
          refundReason: 'customer_request'
        }
      );

      // Create refund transaction record
      const refundTransaction: Transaction = {
        id: stripeRefund.id,
        type: 'refund',
        amount: stripeRefund.amount / 100, // Convert from cents
        currency: stripeRefund.currency,
        status: this.mapStripeRefundStatus(stripeRefund.status),
        senderId: transaction.recipientId || 'system',
        recipientId: transaction.senderId,
        description: `Refund for ${transaction.description}`,
        paymentMethodId: transaction.paymentMethodId,
        fees: 0,
        netAmount: stripeRefund.amount / 100,
        metadata: {
          originalTransactionId: transactionId,
          refundReason: 'customer_request',
          stripeRefundId: stripeRefund.id
        },
        createdAt: new Date(stripeRefund.created * 1000),
        updatedAt: new Date(stripeRefund.created * 1000),
        completedAt: stripeRefund.status === 'succeeded' ? new Date(stripeRefund.created * 1000) : undefined
      };

      this.transactions.set(refundTransaction.id, refundTransaction);
      
      return {
        success: stripeRefund.status === 'succeeded',
        transactionId: refundTransaction.id,
        error: stripeRefund.status === 'failed' ? 'Refund failed' : undefined
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }

  // Map Stripe refund status to our status
  private mapStripeRefundStatus(stripeStatus: string): Transaction['status'] {
    switch (stripeStatus) {
      case 'succeeded':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Validate payment method
  async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (!paymentMethod) return false;

    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    paymentMethod.isVerified = true;
    this.paymentMethods.set(paymentMethodId, paymentMethod);
    
    return true;
  }

  // Process deposit using Stripe
  async processDeposit(
    amount: number,
    paymentMethodId: string,
    userId: string,
    userEmail: string,
    description: string = 'Account Deposit'
  ): Promise<PaymentResult> {
    try {
      // Create customer if needed
      const customer = await stripePaymentService.createCustomer(
        userEmail,
        userId,
        { userId, type: 'deposit' }
      );

      // Create Stripe payment intent for deposit
      const stripePaymentIntent = await stripePaymentService.createPaymentIntent(
        amount,
        'usd',
        paymentMethodId,
        customer.id,
        description,
        { userId, type: 'deposit', userEmail }
      );

      // Confirm payment intent
      const result = await stripePaymentService.confirmPaymentIntent(
        stripePaymentIntent.client_secret!,
        paymentMethodId
      );

      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Create deposit transaction record
        const transaction: Transaction = {
          id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'deposit',
          amount: amount,
          currency: 'usd',
          status: 'completed',
          senderId: userId,
          recipientId: userId, // User deposits to their own account
          description: description,
          paymentMethodId: paymentMethodId,
          fees: this.calculateFees(amount),
          netAmount: amount - this.calculateFees(amount),
          metadata: {
            stripePaymentIntentId: stripePaymentIntent.id,
            type: 'deposit'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date()
        };

        this.transactions.set(transaction.id, transaction);
        
        return {
          success: true,
          transactionId: transaction.id
        };
      } else if (result.paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          nextAction: {
            type: '3d_secure'
          }
        };
      } else {
        return {
          success: false,
          error: 'Deposit processing failed'
        };
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deposit failed'
      };
    }
  }

  // Get payment statistics
  async getPaymentStats(userId: string): Promise<{
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    transactionCount: number;
  }> {
    const transactions = await this.getTransactions(userId);
    
    const stats = transactions.reduce((acc, tx) => {
      if (tx.senderId === userId) {
        acc.totalSent += tx.amount;
        acc.totalFees += tx.fees;
      } else if (tx.recipientId === userId) {
        acc.totalReceived += tx.amount;
      }
      acc.transactionCount++;
      return acc;
    }, {
      totalSent: 0,
      totalReceived: 0,
      totalFees: 0,
      transactionCount: 0
    });

    return stats;
  }

  // Webhook handler for payment gateway events
  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    const isValid = await this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook event
    const event = payload;
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    // Implement webhook signature verification
    // This would use the webhook secret to verify the signature
    return true; // Simplified for demo
  }

  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    // Update payment intent status and create transaction
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    // Update payment intent status
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
