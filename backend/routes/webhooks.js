const express = require('express');
const router = express.Router();
const { validateWebhookSignature } = require('../config/rapyd');
const logger = require('../middleware/logger');

// Rapyd webhook handler
router.post('/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['rapyd-signature'];
    const body = req.body;
    const salt = req.headers['rapyd-salt'];
    const timestamp = req.headers['rapyd-timestamp'];

    // Validate webhook signature
    const isValid = validateWebhookSignature(signature, body, salt, timestamp);
    if (!isValid) {
      logger.error('Invalid webhook signature', {
        signature,
        salt,
        timestamp
      });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);
    logger.info('Webhook received', {
      type: event.type,
      id: event.data?.id,
      status: event.data?.status
    });

    // Handle different event types
    switch (event.type) {
      case 'payment.updated':
        await handlePaymentUpdated(event.data);
        break;
      case 'payment.completed':
        await handlePaymentCompleted(event.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;
      case 'payment.cancelled':
        await handlePaymentCancelled(event.data);
        break;
      case 'transfer.updated':
        await handleTransferUpdated(event.data);
        break;
      case 'transfer.completed':
        await handleTransferCompleted(event.data);
        break;
      case 'refund.updated':
        await handleRefundUpdated(event.data);
        break;
      case 'refund.completed':
        await handleRefundCompleted(event.data);
        break;
      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    logger.error('Webhook processing error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment event handlers
async function handlePaymentUpdated(payment) {
  logger.info('Payment updated', {
    paymentId: payment.id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency
  });

  // Update payment status in your database
  // This would typically update a payments table
  // await updatePaymentStatus(payment.id, payment.status);
}

async function handlePaymentCompleted(payment) {
  logger.info('Payment completed', {
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    customer: payment.customer
  });

  // Process completed payment
  // - Update user balance
  // - Send confirmation email
  // - Create transaction record
  // await processCompletedPayment(payment);
}

async function handlePaymentFailed(payment) {
  logger.info('Payment failed', {
    paymentId: payment.id,
    status: payment.status,
    error: payment.error
  });

  // Handle failed payment
  // - Notify user
  // - Log failure reason
  // await handleFailedPayment(payment);
}

async function handlePaymentCancelled(payment) {
  logger.info('Payment cancelled', {
    paymentId: payment.id,
    status: payment.status
  });

  // Handle cancelled payment
  // await handleCancelledPayment(payment);
}

// Transfer event handlers
async function handleTransferUpdated(transfer) {
  logger.info('Transfer updated', {
    transferId: transfer.id,
    status: transfer.status,
    amount: transfer.amount,
    currency: transfer.currency
  });

  // Update transfer status
  // await updateTransferStatus(transfer.id, transfer.status);
}

async function handleTransferCompleted(transfer) {
  logger.info('Transfer completed', {
    transferId: transfer.id,
    amount: transfer.amount,
    currency: transfer.currency,
    sourceWallet: transfer.source_ewallet,
    destinationWallet: transfer.destination_ewallet
  });

  // Process completed transfer
  // - Update wallet balances
  // - Send notifications
  // await processCompletedTransfer(transfer);
}

// Refund event handlers
async function handleRefundUpdated(refund) {
  logger.info('Refund updated', {
    refundId: refund.id,
    status: refund.status,
    amount: refund.amount,
    currency: refund.currency
  });

  // Update refund status
  // await updateRefundStatus(refund.id, refund.status);
}

async function handleRefundCompleted(refund) {
  logger.info('Refund completed', {
    refundId: refund.id,
    amount: refund.amount,
    currency: refund.currency,
    paymentId: refund.payment
  });

  // Process completed refund
  // - Update user balance
  // - Send notification
  // await processCompletedRefund(refund);
}

module.exports = router;
