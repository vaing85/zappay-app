// Stripe API endpoints for the frontend
// This would typically be a separate backend service

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-08-27.basil',
});

// Mock API endpoints - In a real app, these would be actual Express.js routes
export const stripeApiEndpoints = {
  // Create payment intent
  createPaymentIntent: async (data: {
    amount: number;
    currency: string;
    payment_method?: string;
    customer?: string;
    description?: string;
    metadata: Record<string, string>;
  }) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        customer: data.customer,
        description: data.description,
        metadata: data.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        payment_method: paymentIntent.payment_method,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create customer
  createCustomer: async (data: {
    email: string;
    name?: string;
    metadata: Record<string, string>;
  }) => {
    try {
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      });

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Get payment methods for customer
  getPaymentMethods: async (customerId: string) => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card,
          us_bank_account: pm.us_bank_account,
          sepa_debit: pm.sepa_debit,
          billing_details: pm.billing_details,
          created: pm.created,
        })),
      };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  // Attach payment method to customer
  attachPaymentMethod: async (data: {
    payment_method_id: string;
    customer_id: string;
  }) => {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        data.payment_method_id,
        {
          customer: data.customer_id,
        }
      );

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card,
        us_bank_account: paymentMethod.us_bank_account,
        sepa_debit: paymentMethod.sepa_debit,
        billing_details: paymentMethod.billing_details,
        created: paymentMethod.created,
      };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  },

  // Detach payment method from customer
  detachPaymentMethod: async (data: {
    payment_method_id: string;
  }) => {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(
        data.payment_method_id
      );

      return {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card,
          us_bank_account: paymentMethod.us_bank_account,
          sepa_debit: paymentMethod.sepa_debit,
          billing_details: paymentMethod.billing_details,
          created: paymentMethod.created,
        },
      };
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  },

  // Create refund
  createRefund: async (data: {
    charge_id: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata: Record<string, string>;
  }) => {
    try {
      const refund = await stripe.refunds.create({
        charge: data.charge_id,
        amount: data.amount,
        reason: data.reason,
        metadata: data.metadata,
      });

      return {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        charge: refund.charge,
        reason: refund.reason,
        metadata: refund.metadata,
        created: refund.created,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  },

  // Get charges for customer
  getCharges: async (customerId: string, limit: number = 50) => {
    try {
      const charges = await stripe.charges.list({
        customer: customerId,
        limit,
      });

      return {
        charges: charges.data.map(charge => ({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          payment_method: charge.payment_method,
          description: charge.description,
          metadata: charge.metadata,
          created: charge.created,
          receipt_url: charge.receipt_url,
          failure_code: charge.failure_code,
          failure_message: charge.failure_message,
        })),
      };
    } catch (error) {
      console.error('Error getting charges:', error);
      throw error;
    }
  },
};

// Mock fetch implementation for development
// In production, this would be replaced with actual API calls
export const mockStripeApi = {
  async post(url: string, data: any) {
    const endpoint = url.replace('/api/stripe/', '');
    
    switch (endpoint) {
      case 'create-payment-intent':
        return {
          ok: true,
          json: () => stripeApiEndpoints.createPaymentIntent(data),
        };
      case 'create-customer':
        return {
          ok: true,
          json: () => stripeApiEndpoints.createCustomer(data),
        };
      case 'attach-payment-method':
        return {
          ok: true,
          json: () => stripeApiEndpoints.attachPaymentMethod(data),
        };
      case 'detach-payment-method':
        return {
          ok: true,
          json: () => stripeApiEndpoints.detachPaymentMethod(data),
        };
      case 'create-refund':
        return {
          ok: true,
          json: () => stripeApiEndpoints.createRefund(data),
        };
      default:
        return {
          ok: false,
          json: () => ({ error: 'Endpoint not found' }),
        };
    }
  },

  async get(url: string) {
    const endpoint = url.replace('/api/stripe/', '');
    
    if (endpoint.startsWith('payment-methods/')) {
      const customerId = endpoint.split('/')[1];
      return {
        ok: true,
        json: () => stripeApiEndpoints.getPaymentMethods(customerId),
      };
    }
    
    if (endpoint.startsWith('charges/')) {
      const customerId = endpoint.split('/')[1];
      const limit = new URLSearchParams(url.split('?')[1] || '').get('limit') || '50';
      return {
        ok: true,
        json: () => stripeApiEndpoints.getCharges(customerId, parseInt(limit)),
      };
    }
    
    return {
      ok: false,
      json: () => ({ error: 'Endpoint not found' }),
    };
  },
};

// Override fetch for development
if (process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  (window as any).fetch = async (url: string | URL | Request, options?: RequestInit) => {
    const urlString = url.toString();
    
    if (urlString.startsWith('/api/stripe/')) {
      if (options?.method === 'POST') {
        const data = JSON.parse(options.body as string);
        return mockStripeApi.post(urlString, data);
      } else if (options?.method === 'GET' || !options?.method) {
        return mockStripeApi.get(urlString);
      }
    }
    
    return originalFetch(url, options);
  };
}
