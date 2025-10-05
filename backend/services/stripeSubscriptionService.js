const stripe = require('stripe');
const logger = require('../middleware/logger');

/**
 * Stripe Subscription and Membership Service
 * Handles all subscription and membership operations for ZapPay
 */
class StripeSubscriptionService {
  constructor() {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    
    this.stripe = stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Create a product
   * @param {Object} productData - Product details
   * @returns {Promise<Object>} Product response
   */
  async createProduct(productData) {
    try {
      const {
        name,
        description,
        metadata = {},
        images = [],
        active = true
      } = productData;

      const product = await this.stripe.products.create({
        name,
        description,
        metadata: {
          app: 'zappay',
          ...metadata
        },
        images,
        active
      });

      logger.info('Product created successfully', {
        productId: product.id,
        name: product.name
      });

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          created: product.created
        }
      };

    } catch (error) {
      logger.error('Product creation failed', {
        error: error.message,
        productData: productData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create a price for a product
   * @param {Object} priceData - Price details
   * @returns {Promise<Object>} Price response
   */
  async createPrice(priceData) {
    try {
      const {
        productId,
        unitAmount,
        currency = 'usd',
        recurring = null,
        metadata = {},
        active = true
      } = priceData;

      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        recurring,
        metadata: {
          app: 'zappay',
          ...metadata
        },
        active
      });

      logger.info('Price created successfully', {
        priceId: price.id,
        productId: price.product,
        unitAmount: price.unit_amount,
        currency: price.currency
      });

      return {
        success: true,
        price: {
          id: price.id,
          productId: price.product,
          unitAmount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
          active: price.active,
          created: price.created
        }
      };

    } catch (error) {
      logger.error('Price creation failed', {
        error: error.message,
        priceData: priceData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create a subscription
   * @param {Object} subscriptionData - Subscription details
   * @returns {Promise<Object>} Subscription response
   */
  async createSubscription(subscriptionData) {
    try {
      const {
        customerId,
        priceId,
        paymentMethodId,
        trialPeriodDays = null,
        metadata = {},
        collectionMethod = 'charge_automatically'
      } = subscriptionData;

      const subscriptionParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_method: paymentMethodId,
        collection_method: collectionMethod,
        metadata: {
          app: 'zappay',
          ...metadata
        },
        expand: ['latest_invoice.payment_intent']
      };

      if (trialPeriodDays) {
        subscriptionParams.trial_period_days = trialPeriodDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      logger.info('Subscription created successfully', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          trialStart: subscription.trial_start,
          trialEnd: subscription.trial_end,
          latestInvoice: subscription.latest_invoice
        }
      };

    } catch (error) {
      logger.error('Subscription creation failed', {
        error: error.message,
        subscriptionData: subscriptionData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Get subscription details
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer', 'items.data.price.product']
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          trialStart: subscription.trial_start,
          trialEnd: subscription.trial_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at,
          items: subscription.items.data.map(item => ({
            id: item.id,
            priceId: item.price.id,
            productId: item.price.product.id,
            productName: item.price.product.name,
            unitAmount: item.price.unit_amount,
            currency: item.price.currency,
            recurring: item.price.recurring
          }))
        }
      };

    } catch (error) {
      logger.error('Subscription retrieval failed', {
        error: error.message,
        subscriptionId
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Update subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Update response
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const {
        priceId,
        quantity = 1,
        prorationBehavior = 'create_prorations',
        metadata = {}
      } = updateData;

      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionId,
          price: priceId,
          quantity
        }],
        proration_behavior: prorationBehavior,
        metadata: {
          app: 'zappay',
          ...metadata
        }
      });

      logger.info('Subscription updated successfully', {
        subscriptionId: subscription.id,
        status: subscription.status
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end
        }
      };

    } catch (error) {
      logger.error('Subscription update failed', {
        error: error.message,
        subscriptionId,
        updateData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {boolean} immediately - Cancel immediately or at period end
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately
      });

      if (immediately) {
        await this.stripe.subscriptions.del(subscriptionId);
      }

      logger.info('Subscription cancelled', {
        subscriptionId: subscription.id,
        immediately,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at
        }
      };

    } catch (error) {
      logger.error('Subscription cancellation failed', {
        error: error.message,
        subscriptionId,
        immediately
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Resume subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Resume response
   */
  async resumeSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      logger.info('Subscription resumed', {
        subscriptionId: subscription.id,
        status: subscription.status
      });

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      };

    } catch (error) {
      logger.error('Subscription resume failed', {
        error: error.message,
        subscriptionId
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * List customer subscriptions
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Subscriptions list
   */
  async listCustomerSubscriptions(customerId, options = {}) {
    try {
      const {
        limit = 10,
        startingAfter,
        endingBefore,
        status = 'all'
      } = options;

      const params = {
        customer: customerId,
        limit,
        status
      };

      if (startingAfter) params.starting_after = startingAfter;
      if (endingBefore) params.ending_before = endingBefore;

      const subscriptions = await this.stripe.subscriptions.list(params);

      return {
        success: true,
        subscriptions: subscriptions.data.map(sub => ({
          id: sub.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at
        })),
        hasMore: subscriptions.has_more
      };

    } catch (error) {
      logger.error('Customer subscriptions listing failed', {
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
   * Create customer portal session
   * @param {string} customerId - Customer ID
   * @param {string} returnUrl - Return URL
   * @returns {Promise<Object>} Portal session response
   */
  async createCustomerPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      logger.info('Customer portal session created', {
        sessionId: session.id,
        customerId: session.customer,
        url: session.url
      });

      return {
        success: true,
        session: {
          id: session.id,
          url: session.url,
          customerId: session.customer
        }
      };

    } catch (error) {
      logger.error('Customer portal session creation failed', {
        error: error.message,
        customerId,
        returnUrl
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Create checkout session for subscription
   * @param {Object} checkoutData - Checkout session data
   * @returns {Promise<Object>} Checkout session response
   */
  async createCheckoutSession(checkoutData) {
    try {
      const {
        customerId,
        priceId,
        successUrl,
        cancelUrl,
        trialPeriodDays = null,
        metadata = {}
      } = checkoutData;

      const sessionParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          app: 'zappay',
          ...metadata
        }
      };

      if (trialPeriodDays) {
        sessionParams.subscription_data = {
          trial_period_days: trialPeriodDays
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      logger.info('Checkout session created', {
        sessionId: session.id,
        customerId: session.customer,
        url: session.url
      });

      return {
        success: true,
        session: {
          id: session.id,
          url: session.url,
          customerId: session.customer
        }
      };

    } catch (error) {
      logger.error('Checkout session creation failed', {
        error: error.message,
        checkoutData
      });

      return {
        success: false,
        error: error.message,
        details: error.type ? { type: error.type, code: error.code } : null
      };
    }
  }

  /**
   * Get membership plans
   * @returns {Array} Available membership plans
   */
  getMembershipPlans() {
    return [
      {
        id: 'free',
        name: 'Free Plan',
        description: 'Perfect for personal use and small transactions',
        price: 0.00,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 3 transactions per month',
          'Basic payment processing',
          'Email support',
          'Standard security',
          'Mobile app access'
        ],
        limits: {
          monthlyTransactions: 3,
          maxAmount: 100,
          dailyWithdrawal: 100,
          monthlyWithdrawal: 100,
          supportLevel: 'email'
        },
        popular: false
      },
      {
        id: 'starter',
        name: 'Starter Plan',
        description: 'Essential features for individuals',
        price: 4.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 10 transactions per month',
          'Basic payment processing',
          'Email support',
          'Standard security',
          'Mobile app access',
          'Transaction history'
        ],
        limits: {
          monthlyTransactions: 10,
          maxAmount: 500,
          dailyWithdrawal: 500,
          monthlyWithdrawal: 500,
          supportLevel: 'email'
        },
        popular: false
      },
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Great for small businesses and freelancers',
        price: 9.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 25 transactions per month',
          'Advanced payment processing',
          'Email support',
          'Enhanced security',
          'Mobile app access',
          'Transaction history',
          'Basic analytics'
        ],
        limits: {
          monthlyTransactions: 25,
          maxAmount: 2000,
          dailyWithdrawal: 2000,
          monthlyWithdrawal: 2000,
          supportLevel: 'email'
        },
        popular: true
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        description: 'Advanced features for growing businesses',
        price: 19.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 100 transactions per month',
          'Advanced payment processing',
          'Priority support',
          'Enhanced security',
          'Mobile app access',
          'Transaction history',
          'Advanced analytics',
          'API access',
          'QR code payments'
        ],
        limits: {
          monthlyTransactions: 100,
          maxAmount: 10000,
          dailyWithdrawal: 10000,
          monthlyWithdrawal: 10000,
          apiCalls: 10000,
          supportLevel: 'priority'
        },
        popular: false
      },
      {
        id: 'business',
        name: 'Business Plan',
        description: 'Comprehensive features for established businesses',
        price: 49.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 2500 transactions per month',
          'Premium payment processing',
          'Priority support',
          'Maximum security',
          'Mobile app access',
          'Transaction history',
          'Advanced analytics',
          'Full API access',
          'QR code payments',
          'Group payments',
          'Team management',
          'Custom branding'
        ],
        limits: {
          monthlyTransactions: 500,
          maxAmount: 50000,
          dailyWithdrawal: 50000,
          monthlyWithdrawal: 50000,
          teamMembers: 10,
          apiCalls: 50000,
          supportLevel: 'priority'
        },
        popular: false
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full features for large organizations',
        price: 99.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Unlimited transactions',
          'Premium payment processing',
          '24/7 phone support',
          'Maximum security',
          'Mobile app access',
          'Transaction history',
          'Advanced analytics',
          'Full API access',
          'QR code payments',
          'Group payments',
          'Team management',
          'Custom branding',
          'Custom integrations',
          'Dedicated account manager',
          'White-label options'
        ],
        limits: {
          monthlyTransactions: -1, // Unlimited
          maxAmount: 100000,
          dailyWithdrawal: 100000,
          monthlyWithdrawal: 100000,
          teamMembers: -1, // Unlimited
          apiCalls: -1, // Unlimited
          supportLevel: 'dedicated'
        },
        popular: false
      }
    ];
  }

  /**
   * Get subscription status for user
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} User subscription status
   */
  async getUserSubscriptionStatus(customerId) {
    try {
      const subscriptions = await this.listCustomerSubscriptions(customerId, {
        status: 'active',
        limit: 1
      });

      if (!subscriptions.success || subscriptions.subscriptions.length === 0) {
        return {
          success: true,
          hasActiveSubscription: false,
          subscription: null,
          plan: null
        };
      }

      const subscription = subscriptions.subscriptions[0];
      const subscriptionDetails = await this.getSubscription(subscription.id);

      if (!subscriptionDetails.success) {
        return {
          success: false,
          error: 'Failed to get subscription details'
        };
      }

      // Map subscription to plan
      const plan = this.getMembershipPlans().find(p => 
        subscriptionDetails.subscription.items.some(item => 
          item.productName.toLowerCase().includes(p.id)
        )
      );

      return {
        success: true,
        hasActiveSubscription: true,
        subscription: subscriptionDetails.subscription,
        plan: plan || null
      };

    } catch (error) {
      logger.error('Get user subscription status failed', {
        error: error.message,
        customerId
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StripeSubscriptionService();

