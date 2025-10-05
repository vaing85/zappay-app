const express = require('express');
const router = express.Router();
const { webhookLimiter } = require('../middleware/rateLimiting');
const logger = require('../middleware/logger');

// Lazy load Stripe service to avoid initialization errors
let stripePaymentService;
const getStripePaymentService = () => {
  if (!stripePaymentService) {
    try {
      stripePaymentService = require('../services/stripePaymentService');
    } catch (error) {
      throw new Error(`Stripe service initialization failed: ${error.message}`);
    }
  }
  return stripePaymentService;
};

// Apply rate limiting to webhook routes
router.use(webhookLimiter);

/**
 * Stripe Webhook Handler
 * Handles all Stripe webhook events
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    if (!signature) {
      logger.error('Stripe webhook signature missing', {
        headers: req.headers
      });
      return res.status(400).json({
        success: false,
        message: 'Missing Stripe signature'
      });
    }

    // Verify webhook signature
    const verification = getStripePaymentService().verifyWebhookSignature(payload, signature);
    
    if (!verification.success) {
      logger.error('Stripe webhook signature verification failed', {
        error: verification.error
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = verification.event;

    logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object);
        break;
      
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      
      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        logger.info('Unhandled Stripe webhook event type', {
          type: event.type,
          id: event.id
        });
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    logger.error('Stripe webhook processing error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    logger.info('Payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer
    });

    // TODO: Update payment status in database
    // await updatePaymentStatus(paymentIntent.id, 'succeeded', paymentIntent);

    // TODO: Send success notification to user
    // await sendPaymentSuccessNotification(paymentIntent.customer, paymentIntent.amount, paymentIntent.currency);

    // TODO: Update user balance or process the payment
    // await processSuccessfulPayment(paymentIntent);

  } catch (error) {
    logger.error('Error handling payment intent succeeded', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    logger.info('Payment intent failed', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer,
      lastPaymentError: paymentIntent.last_payment_error
    });

    // TODO: Update payment status in database
    // await updatePaymentStatus(paymentIntent.id, 'failed', paymentIntent);

    // TODO: Send failure notification to user
    // await sendPaymentFailureNotification(paymentIntent.customer, paymentIntent.amount, paymentIntent.currency, paymentIntent.last_payment_error);

  } catch (error) {
    logger.error('Error handling payment intent failed', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle payment intent canceled
 */
async function handlePaymentIntentCanceled(paymentIntent) {
  try {
    logger.info('Payment intent canceled', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer
    });

    // TODO: Update payment status in database
    // await updatePaymentStatus(paymentIntent.id, 'canceled', paymentIntent);

  } catch (error) {
    logger.error('Error handling payment intent canceled', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle payment intent requires action
 */
async function handlePaymentIntentRequiresAction(paymentIntent) {
  try {
    logger.info('Payment intent requires action', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerId: paymentIntent.customer,
      nextAction: paymentIntent.next_action
    });

    // TODO: Update payment status in database
    // await updatePaymentStatus(paymentIntent.id, 'requires_action', paymentIntent);

    // TODO: Notify user that additional action is required
    // await sendPaymentActionRequiredNotification(paymentIntent.customer, paymentIntent.next_action);

  } catch (error) {
    logger.error('Error handling payment intent requires action', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle charge succeeded
 */
async function handleChargeSucceeded(charge) {
  try {
    logger.info('Charge succeeded', {
      chargeId: charge.id,
      paymentIntentId: charge.payment_intent,
      amount: charge.amount,
      currency: charge.currency,
      customerId: charge.customer
    });

    // TODO: Process successful charge
    // await processSuccessfulCharge(charge);

  } catch (error) {
    logger.error('Error handling charge succeeded', {
      error: error.message,
      chargeId: charge.id
    });
  }
}

/**
 * Handle charge failed
 */
async function handleChargeFailed(charge) {
  try {
    logger.info('Charge failed', {
      chargeId: charge.id,
      paymentIntentId: charge.payment_intent,
      amount: charge.amount,
      currency: charge.currency,
      customerId: charge.customer,
      failureCode: charge.failure_code,
      failureMessage: charge.failure_message
    });

    // TODO: Process failed charge
    // await processFailedCharge(charge);

  } catch (error) {
    logger.error('Error handling charge failed', {
      error: error.message,
      chargeId: charge.id
    });
  }
}

/**
 * Handle charge dispute created
 */
async function handleChargeDisputeCreated(dispute) {
  try {
    logger.info('Charge dispute created', {
      disputeId: dispute.id,
      chargeId: dispute.charge,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status
    });

    // TODO: Handle dispute
    // await handleDispute(dispute);

  } catch (error) {
    logger.error('Error handling charge dispute created', {
      error: error.message,
      disputeId: dispute.id
    });
  }
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer) {
  try {
    logger.info('Customer created', {
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });

    // TODO: Store customer information
    // await storeCustomer(customer);

  } catch (error) {
    logger.error('Error handling customer created', {
      error: error.message,
      customerId: customer.id
    });
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer) {
  try {
    logger.info('Customer updated', {
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });

    // TODO: Update customer information
    // await updateCustomer(customer);

  } catch (error) {
    logger.error('Error handling customer updated', {
      error: error.message,
      customerId: customer.id
    });
  }
}

/**
 * Handle customer deleted
 */
async function handleCustomerDeleted(customer) {
  try {
    logger.info('Customer deleted', {
      customerId: customer.id
    });

    // TODO: Handle customer deletion
    // await deleteCustomer(customer.id);

  } catch (error) {
    logger.error('Error handling customer deleted', {
      error: error.message,
      customerId: customer.id
    });
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    logger.info('Invoice payment succeeded', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_paid,
      currency: invoice.currency
    });

    // TODO: Handle successful invoice payment
    // await handleSuccessfulInvoicePayment(invoice);

  } catch (error) {
    logger.error('Error handling invoice payment succeeded', {
      error: error.message,
      invoiceId: invoice.id
    });
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    logger.info('Invoice payment failed', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_due,
      currency: invoice.currency
    });

    // TODO: Handle failed invoice payment
    // await handleFailedInvoicePayment(invoice);

  } catch (error) {
    logger.error('Error handling invoice payment failed', {
      error: error.message,
      invoiceId: invoice.id
    });
  }
}

/**
 * Health check for webhook endpoints
 * GET /api/payments/webhook/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stripe webhook handler is healthy',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      'payment_intent.requires_action',
      'charge.succeeded',
      'charge.failed',
      'charge.dispute.created',
      'customer.created',
      'customer.updated',
      'customer.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ]
  });
});

module.exports = router;
