# Stripe Integration Setup

This guide will help you set up Stripe payment processing for ZapCash.

## 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account verification process

## 2. Get Your API Keys

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

## 3. Set Environment Variables

Create a `.env` file in the root directory with your Stripe keys:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51O...
REACT_APP_STRIPE_SECRET_KEY=sk_test_51O...
REACT_APP_STRIPE_WEBHOOK_SECRET=whsec_...

# Other environment variables
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WEBSOCKET_URL=http://localhost:3001
```

## 4. Test Cards

Use these test card numbers for testing:

### Successful Payments
- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

### Declined Payments
- **Generic decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995
- **Lost card**: 4000 0000 0000 9987
- **Stolen card**: 4000 0000 0000 9979

### 3D Secure Authentication
- **Requires authentication**: 4000 0025 0000 3155
- **Authentication fails**: 4000 0000 0000 9995

## 5. Webhook Setup (Optional)

For production, set up webhooks to handle payment events:

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks) in your Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret to your environment variables

## 6. Testing

1. Start the development server: `npm start`
2. Go to Payment Settings
3. Add a test payment method using the test card numbers
4. Try making a payment

## 7. Production Deployment

Before going live:

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Set up webhook endpoints
4. Test with real (small) transactions
5. Enable fraud protection features

## Security Notes

- Never commit your secret keys to version control
- Use environment variables for all sensitive data
- Implement proper webhook signature verification
- Use HTTPS in production
- Regularly rotate your API keys

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord](https://discord.gg/stripe)
