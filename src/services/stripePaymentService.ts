// Stripe Payment Service
// Real Stripe integration for payment processing

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, DEFAULT_CURRENCY } from '../config/stripe';
import { API_CONFIG, buildApiUrl } from '../config/api';

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'us_bank_account' | 'sepa_debit' | 'ideal' | 'sofort' | 'bancontact' | 'eps' | 'giropay' | 'p24' | 'alipay' | 'wechat_pay';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  us_bank_account?: {
    bank_name: string;
    account_holder_type: string;
    last4: string;
    routing_number: string;
  };
  sepa_debit?: {
    bank_code: string;
    country: string;
    fingerprint: string;
    last4: string;
  };
  billing_details: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  created: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  client_secret: string;
  payment_method?: string;
  description?: string;
  metadata: Record<string, string>;
  created: number;
  last_payment_error?: {
    code: string;
    message: string;
    type: string;
  };
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  payment_method: string;
  description?: string;
  metadata: Record<string, string>;
  created: number;
  receipt_url?: string;
  failure_code?: string;
  failure_message?: string;
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  charge: string;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata: Record<string, string>;
  created: number;
}

class StripePaymentService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      throw error;
    }
  }

  // Get Stripe instance
  async getStripe(): Promise<Stripe> {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }
    return this.stripe;
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency: string = DEFAULT_CURRENCY,
    paymentMethodId?: string,
    customerId?: string,
    description?: string,
    metadata: Record<string, string> = {}
  ): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_PAYMENT_INTENT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          payment_method: paymentMethodId,
          customer: customerId,
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(
    clientSecret: string,
    paymentMethodId?: string,
    returnUrl?: string
  ): Promise<{ paymentIntent: StripePaymentIntent; error?: string }> {
    try {
      const stripe = await this.getStripe();
      
      const result = await stripe.confirmPayment({
        elements: this.elements!,
        clientSecret,
        confirmParams: {
          payment_method: paymentMethodId,
          return_url: returnUrl || window.location.origin + '/payment/success',
        },
        redirect: 'if_required',
      });

      if (result.error) {
        return {
          paymentIntent: result.paymentIntent as any,
          error: result.error.message,
        };
      }

      return {
        paymentIntent: result.paymentIntent as any,
      };
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  // Create payment method
  async createPaymentMethod(
    type: 'card' | 'us_bank_account' | 'sepa_debit',
    cardElement?: any,
    billingDetails?: any
  ): Promise<StripePaymentMethod> {
    try {
      const stripe = await this.getStripe();
      
      const result = await stripe.createPaymentMethod({
        type,
        card: cardElement,
        billing_details: billingDetails,
      } as any);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to create payment method');
      }

      return result.paymentMethod as StripePaymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string): Promise<StripePaymentMethod[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.GET_PAYMENT_METHODS(customerId)), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<StripePaymentMethod> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.ATTACH_PAYMENT_METHOD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          customer_id: customerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to attach payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  // Detach payment method from customer
  async detachPaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.DETACH_PAYMENT_METHOD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to detach payment method');
      }

      return true;
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
    metadata: Record<string, string> = {}
  ): Promise<StripeRefund> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_REFUND), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          charge_id: chargeId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create refund');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Get charges for customer
  async getCharges(customerId: string, limit: number = 50): Promise<StripeCharge[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.GET_CHARGES(customerId, limit)), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get charges');
      }

      const data = await response.json();
      return data.charges || [];
    } catch (error) {
      console.error('Error getting charges:', error);
      throw error;
    }
  }

  // Create customer
  async createCustomer(
    email: string,
    name?: string,
    metadata: Record<string, string> = {}
  ): Promise<{ id: string; email: string; name?: string }> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CREATE_CUSTOMER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Set elements instance
  setElements(elements: StripeElements): void {
    this.elements = elements;
  }

  // Get elements instance
  getElements(): StripeElements | null {
    return this.elements;
  }

  // Format amount for display
  formatAmount(amount: number, currency: string = DEFAULT_CURRENCY): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  // Validate card number (basic validation)
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Get card brand from number
  getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') && cleaned[1] >= '1' && cleaned[1] <= '5') return 'mastercard';
    if (cleaned.startsWith('3') && (cleaned[1] === '4' || cleaned[1] === '7')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    if (cleaned.startsWith('3') && cleaned[1] === '0') return 'diners';
    if (cleaned.startsWith('3') && cleaned[1] === '5') return 'jcb';
    
    return 'unknown';
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
