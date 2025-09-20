const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');
const { webhookLimiter } = require('../middleware/rateLimiting');

// Stripe webhook handler
router.post('/payments/webhook/stripe', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const body = req.body;

    // Log webhook headers for debugging
    logger.info('Stripe webhook received', {
      headers: {
        'stripe-signature': signature ? 'present' : 'missing',
        'content-type': req.headers['content-type']
      },
      bodyLength: body ? body.length : 0
    });

    // Note: In production, you should validate the webhook signature
    // For now, we'll process the webhook without validation
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    const event = JSON.parse(body);
    logger.info('Stripe webhook event received', {
      type: event.type,
      id: event.id,
      created: event.created
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        logger.info('Unhandled Stripe webhook event type', { type: event.type });
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    logger.error('Stripe webhook processing error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment Intent event handlers
async function handlePaymentIntentSucceeded(paymentIntent) {
  logger.info('Payment intent succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer
  });

  // Process successful payment
  // - Update user balance
  // - Send confirmation email
  // - Create transaction record
  // await processSuccessfulPayment(paymentIntent);
}

async function handlePaymentIntentFailed(paymentIntent) {
  logger.info('Payment intent failed', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    last_payment_error: paymentIntent.last_payment_error
  });

  // Handle failed payment
  // - Notify user
  // - Log failure reason
  // await handleFailedPayment(paymentIntent);
}

// Payment Method event handlers
async function handlePaymentMethodAttached(paymentMethod) {
  logger.info('Payment method attached', {
    paymentMethodId: paymentMethod.id,
    type: paymentMethod.type,
    customer: paymentMethod.customer
  });

  // Process attached payment method
  // - Update user's payment methods
  // - Send confirmation
  // await processAttachedPaymentMethod(paymentMethod);
}

// Subscription event handlers
async function handleSubscriptionCreated(subscription) {
  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    plan: subscription.items.data[0]?.price?.id
  });

  // Process new subscription
  // - Update user membership status
  // - Send welcome email
  // - Grant access to premium features
  // await processNewSubscription(subscription);
}

async function handleSubscriptionUpdated(subscription) {
  logger.info('Subscription updated', {
    subscriptionId: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    plan: subscription.items.data[0]?.price?.id
  });

  // Process subscription update
  // - Update user membership status
  // - Send notification if needed
  // await processSubscriptionUpdate(subscription);
}

async function handleSubscriptionDeleted(subscription) {
  logger.info('Subscription deleted', {
    subscriptionId: subscription.id,
    customer: subscription.customer,
    status: subscription.status
  });

  // Process subscription cancellation
  // - Update user membership status
  // - Send cancellation confirmation
  // - Revoke premium access
  // await processSubscriptionCancellation(subscription);
}

// Invoice event handlers
async function handleInvoicePaymentSucceeded(invoice) {
  logger.info('Invoice payment succeeded', {
    invoiceId: invoice.id,
    customer: invoice.customer,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    subscription: invoice.subscription
  });

  // Process successful invoice payment
  // - Update subscription status
  // - Send receipt
  // await processSuccessfulInvoicePayment(invoice);
}

async function handleInvoicePaymentFailed(invoice) {
  logger.info('Invoice payment failed', {
    invoiceId: invoice.id,
    customer: invoice.customer,
    amount: invoice.amount_due,
    currency: invoice.currency,
    subscription: invoice.subscription
  });

  // Handle failed invoice payment
  // - Notify user
  // - Update subscription status
  // - Send payment reminder
  // await handleFailedInvoicePayment(invoice);
}

// Test webhook endpoint (for debugging)
router.post('/test-stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const body = req.body;
    const event = JSON.parse(body);
    
    res.json({
      success: true,
      message: 'Test webhook received',
      event: {
        type: event.type,
        id: event.id,
        created: event.created
      },
      instructions: {
        message: 'This endpoint can be used to test Stripe webhook processing',
        webhookUrl: 'https://zappayapp-ie9d2.ondigitalocean.app/api/payments/webhook/stripe',
        testWith: 'Send Stripe webhook events to this endpoint for testing'
      }
    });
  } catch (error) {
    logger.error('Test webhook error', { error: error.message });
    res.status(500).json({ error: 'Test webhook failed' });
  }
});

module.exports = router;