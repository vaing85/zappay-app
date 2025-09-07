const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Retrieve payment intent
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Stripe payment intent retrieval error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create customer
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      success: true,
      customer,
    };
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create setup intent for saving payment methods
const createSetupIntent = async (customerId, metadata = {}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata,
    });

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  } catch (error) {
    console.error('Stripe setup intent creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// List customer payment methods
const listPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return {
      success: true,
      paymentMethods: paymentMethods.data,
    };
  } catch (error) {
    console.error('Stripe payment methods list error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create transfer (for splitting payments)
const createTransfer = async (amount, destination, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination,
      metadata,
    });

    return {
      success: true,
      transfer,
    };
  } catch (error) {
    console.error('Stripe transfer creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return {
      success: true,
      event,
    };
  } catch (error) {
    console.error('Stripe webhook verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
  createCustomer,
  createSetupIntent,
  listPaymentMethods,
  createTransfer,
  verifyWebhookSignature,
};
