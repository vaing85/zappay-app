const stripe = require('stripe');
const logger = require('../middleware/logger');

/**
 * Stripe Payment Service
 * Handles all Stripe payment operations for ZapPay
 */
class StripePaymentService {
  constructor() {
    this.stripe = stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  }

  /**
   * Create a payment intent
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment intent response
   */
  async createPaymentIntent(paymentData) {
    try {
      const {
        amount,
        currency = 'usd',
        customerId,
        description,
        metadata = {},
        paymentMethodId,
        confirm = false
      } = paymentData;

      // Validate amount (Stripe uses cents)
      const amountInCents = Math.round(amount * 100);
      if (amountInCents < 50) { // Minimum $0.50
        throw new Error('Amount must be at least $0.50');
      }

      const paymentIntentData = {
        amount: amountInCents,
        currency: currency.toLowerCase(),
        description: description || 'ZapPay Payment',
        metadata: {
          app: 'zappay',
          ...metadata
        }
      };

      // Add customer if provided
      if (customerId) {
        paymentIntentData.customer = customerId;
      }

      // Add payment method if provided
      if (paymentMethodId) {
        paymentIntentData.payment_method = paymentMethodId;
        paymentIntentData.confirm = confirm;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentIntent.status
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          description: paymentIntent.description,
          metadata: paymentIntent.metadata
        }
      };

    } catch (error) {
      logger.error('Payment intent creation failed', {
        error: error.message,
        paymentData: paymentData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create a customer
   * @param {Object} customerData - Customer details
   * @returns {Promise<Object>} Customer response
   */
  async createCustomer(customerData) {
    try {
      const {
        email,
        name,
        phone,
        metadata = {}
      } = customerData;

      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          app: 'zappay',
          ...metadata
        }
      });

      logger.info('Customer created successfully', {
        customerId: customer.id,
        email: customer.email
      });

      return {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          created: customer.created
        }
      };

    } catch (error) {
      logger.error('Customer creation failed', {
        error: error.message,
        customerData: customerData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create a payment method
   * @param {Object} paymentMethodData - Payment method details
   * @returns {Promise<Object>} Payment method response
   */
  async createPaymentMethod(paymentMethodData) {
    try {
      const {
        type = 'card',
        card,
        billingDetails
      } = paymentMethodData;

      const paymentMethod = await this.stripe.paymentMethods.create({
        type,
        card,
        billing_details: billingDetails
      });

      logger.info('Payment method created successfully', {
        paymentMethodId: paymentMethod.id,
        type: paymentMethod.type
      });

      return {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card,
          billingDetails: paymentMethod.billing_details
        }
      };

    } catch (error) {
      logger.error('Payment method creation failed', {
        error: error.message,
        paymentMethodData: paymentMethodData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Confirmation response
   */
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      logger.info('Payment intent confirmed', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      };

    } catch (error) {
      logger.error('Payment intent confirmation failed', {
        error: error.message,
        paymentIntentId,
        paymentMethodId
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Retrieve a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment intent details
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          description: paymentIntent.description,
          metadata: paymentIntent.metadata,
          created: paymentIntent.created
        }
      };

    } catch (error) {
      logger.error('Payment intent retrieval failed', {
        error: error.message,
        paymentIntentId
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Cancel a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      logger.info('Payment intent cancelled', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      };

    } catch (error) {
      logger.error('Payment intent cancellation failed', {
        error: error.message,
        paymentIntentId
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create a refund
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund response
   */
  async createRefund(refundData) {
    try {
      const {
        paymentIntentId,
        amount,
        reason = 'requested_by_customer',
        metadata = {}
      } = refundData;

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason,
        metadata: {
          app: 'zappay',
          ...metadata
        }
      });

      logger.info('Refund created successfully', {
        refundId: refund.id,
        paymentIntentId: refund.payment_intent,
        amount: refund.amount
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason,
          paymentIntentId: refund.payment_intent
        }
      };

    } catch (error) {
      logger.error('Refund creation failed', {
        error: error.message,
        refundData: refundData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * List payment intents for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Payment intents list
   */
  async listPaymentIntents(customerId, options = {}) {
    try {
      const {
        limit = 10,
        startingAfter,
        endingBefore
      } = options;

      const params = {
        customer: customerId,
        limit
      };

      if (startingAfter) params.starting_after = startingAfter;
      if (endingBefore) params.ending_before = endingBefore;

      const paymentIntents = await this.stripe.paymentIntents.list(params);

      return {
        success: true,
        paymentIntents: paymentIntents.data.map(pi => ({
          id: pi.id,
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          description: pi.description,
          created: pi.created
        })),
        hasMore: paymentIntents.has_more
      };

    } catch (error) {
      logger.error('Payment intents listing failed', {
        error: error.message,
        customerId,
        options
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Webhook signature
   * @returns {Object} Webhook event or error
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        success: true,
        event
      };

    } catch (error) {
      logger.error('Webhook signature verification failed', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get supported payment methods
   * @returns {Array} Supported payment methods
   */
  getSupportedPaymentMethods() {
    return [
      {
        id: 'card',
        type: 'card',
        name: 'Credit/Debit Card',
        supported: true,
        currencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'sgd', 'hkd']
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Bank Transfer',
        supported: true,
        currencies: ['usd', 'eur', 'gbp']
      },
      {
        id: 'wallet',
        type: 'wallet',
        name: 'Digital Wallet',
        supported: true,
        currencies: ['usd', 'eur', 'gbp']
      }
    ];
  }

  /**
   * Get supported currencies
   * @returns {Array} Supported currencies
   */
  getSupportedCurrencies() {
    return [
      'usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'sgd', 'hkd', 'inr',
      'brl', 'mxn', 'ars', 'clp', 'cop', 'pen', 'nzd', 'nok', 'sek',
      'dkk', 'chf', 'pln', 'czk', 'huf', 'ron', 'bgn', 'hrk', 'rsd'
    ];
  }
}

module.exports = new StripePaymentService();
