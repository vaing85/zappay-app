# 🚀 ZapPay Rapyd Production Deployment Guide

This guide will help you deploy ZapPay with Rapyd integration for production once you get approved.

## 📋 Prerequisites

### Required Accounts
- [ ] Rapyd Production Account (approved)
- [ ] DigitalOcean Account
- [ ] Domain Name
- [ ] SSL Certificate

### Required Rapyd Credentials
- [ ] Production Access Key
- [ ] Production Secret Key
- [ ] Webhook Secret
- [ ] Merchant Account ID

## 🔧 Rapyd Production Setup

### 1. Environment Configuration

Update your `.env` file with Rapyd production credentials:

```bash
# Rapyd Production Configuration
RAPYD_ACCESS_KEY=your_production_access_key
RAPYD_SECRET_KEY=your_production_secret_key
RAPYD_BASE_URL=https://api.rapyd.net
RAPYD_WEBHOOK_SECRET=your_production_webhook_secret
RAPYD_MERCHANT_ACCOUNT=your_merchant_account_id
RAPYD_P2P_ENABLED=true

# Webhook URLs (update with your production domain)
RAPYD_WEBHOOK_SUCCESS_URL=https://yourdomain.com/api/payments/webhook/success
RAPYD_WEBHOOK_FAILED_URL=https://yourdomain.com/api/payments/webhook/failed
RAPYD_WEBHOOK_PENDING_URL=https://yourdomain.com/api/payments/webhook/pending
RAPYD_WEBHOOK_REFUND_URL=https://yourdomain.com/api/payments/webhook/refund
```

### 2. Rapyd Production Configuration

The production configuration includes:
- ✅ **Enhanced Security**: Production-grade signature validation
- ✅ **Rate Limiting**: Advanced rate limiting for payment endpoints
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Webhook Security**: Secure webhook signature validation
- ✅ **Payment Validation**: Amount and currency validation
- ✅ **Country Support**: 50+ supported countries
- ✅ **Currency Support**: 25+ supported currencies

### 3. Webhook Configuration

Configure webhooks in your Rapyd dashboard:

1. **Payment Success Webhook**:
   - URL: `https://yourdomain.com/api/payments/webhook/success`
   - Events: `payment.completed`

2. **Payment Failed Webhook**:
   - URL: `https://yourdomain.com/api/payments/webhook/failed`
   - Events: `payment.failed`

3. **Payment Pending Webhook**:
   - URL: `https://yourdomain.com/api/payments/webhook/pending`
   - Events: `payment.pending`

4. **Refund Webhook**:
   - URL: `https://yourdomain.com/api/payments/webhook/refund`
   - Events: `refund.completed`

5. **P2P Transfer Webhook**:
   - URL: `https://yourdomain.com/api/payments/webhook/p2p-success`
   - Events: `transfer.completed`

## 🧪 Testing Rapyd Integration

### 1. Run Rapyd Production Tests

```bash
# Test Rapyd integration
npm run test:rapyd

# This will test:
# - Rapyd configuration
# - Payment validation
# - Country/currency support
# - API endpoints
# - Webhook endpoints
# - Security measures
```

### 2. Manual Testing

```bash
# Test Rapyd health
curl https://yourdomain.com/rapyd-health

# Test payment methods
curl "https://yourdomain.com/api/payments/methods?country=US"

# Test customer wallet creation
curl -X POST https://yourdomain.com/api/payments/customer-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_customer_123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "country": "US"
  }'
```

## 🚀 Production Deployment

### 1. Deploy to DigitalOcean

```bash
# Deploy with Rapyd configuration
npm run deploy

# The deployment includes:
# - Rapyd production configuration
# - Webhook endpoints
# - Security measures
# - Monitoring
```

### 2. Configure Domain and SSL

1. **Set up your domain**:
   - Point your domain to DigitalOcean
   - Configure DNS records
   - Set up SSL certificate

2. **Update webhook URLs**:
   - Update webhook URLs in Rapyd dashboard
   - Update CORS origins in environment
   - Test webhook delivery

### 3. Rapyd Dashboard Configuration

1. **API Keys**:
   - Use production access key and secret
   - Enable all required permissions
   - Set up IP whitelisting (optional)

2. **Webhooks**:
   - Configure all webhook endpoints
   - Test webhook delivery
   - Set up retry policies

3. **Merchant Settings**:
   - Configure business information
   - Set up compliance settings
   - Enable required features

## 🔒 Security Configuration

### 1. Webhook Security

The production setup includes:
- ✅ **Signature Validation**: All webhooks are validated
- ✅ **Timestamp Validation**: Prevents replay attacks
- ✅ **IP Whitelisting**: Optional IP restrictions
- ✅ **Rate Limiting**: Prevents webhook abuse

### 2. Payment Security

- ✅ **Amount Validation**: Min/max amount limits
- ✅ **Currency Validation**: Supported currency checks
- ✅ **Country Validation**: Supported country checks
- ✅ **Customer Validation**: Customer data validation

### 3. API Security

- ✅ **Rate Limiting**: Advanced rate limiting
- ✅ **Input Validation**: All inputs validated
- ✅ **Error Handling**: Secure error responses
- ✅ **Logging**: Comprehensive security logging

## 📊 Monitoring and Logging

### 1. Rapyd Monitoring

Monitor your Rapyd integration:
- **Transaction Volume**: Track payment volume
- **Success Rate**: Monitor payment success rate
- **Error Rate**: Track payment failures
- **Webhook Delivery**: Monitor webhook delivery

### 2. Application Monitoring

- **Health Checks**: `/rapyd-health` endpoint
- **Metrics**: `/metrics` endpoint
- **Logs**: Winston logging with rotation
- **Alerts**: Set up monitoring alerts

### 3. Business Metrics

Track key business metrics:
- **Total Transaction Volume**
- **Average Transaction Size**
- **Payment Method Distribution**
- **Geographic Distribution**
- **Customer Growth**

## 🎯 Going Live Checklist

### Before Going Live
- [ ] Rapyd production account approved
- [ ] All environment variables configured
- [ ] Webhook endpoints tested
- [ ] Payment flows tested
- [ ] Security measures verified
- [ ] Monitoring set up
- [ ] Domain and SSL configured
- [ ] Compliance requirements met

### Post-Launch
- [ ] Monitor transaction volume
- [ ] Track success rates
- [ ] Monitor error rates
- [ ] Review webhook delivery
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Plan feature updates

## 🚨 Troubleshooting

### Common Issues

**1. Webhook Signature Validation Failed**
```bash
# Check webhook secret
echo $RAPYD_WEBHOOK_SECRET

# Verify webhook URL
curl -X POST https://yourdomain.com/api/payments/webhook/success \
  -H "rapyd-signature: test" \
  -H "rapyd-salt: test" \
  -H "rapyd-timestamp: $(date +%s)" \
  -d '{"test": "data"}'
```

**2. Payment Creation Failed**
```bash
# Check Rapyd credentials
curl https://yourdomain.com/rapyd-health

# Test payment methods
curl "https://yourdomain.com/api/payments/methods?country=US"
```

**3. P2P Transfer Failed**
```bash
# Check P2P configuration
echo $RAPYD_P2P_ENABLED

# Test P2P endpoint
curl -X POST https://yourdomain.com/api/payments/p2p \
  -H "Content-Type: application/json" \
  -d '{"fromWalletId": "test", "toWalletId": "test", "amount": 10, "currency": "USD"}'
```

### Log Analysis

```bash
# View Rapyd logs
tail -f logs/combined.log | grep -i rapyd

# View webhook logs
tail -f logs/combined.log | grep -i webhook

# View payment logs
tail -f logs/combined.log | grep -i payment
```

## 📈 Performance Optimization

### 1. Database Optimization
- [x] Payment table indexing
- [x] Customer table indexing
- [x] Transaction table indexing
- [x] Connection pooling

### 2. Caching
- [x] Payment method caching
- [x] Country/currency caching
- [x] Customer data caching

### 3. Monitoring
- [x] Response time monitoring
- [x] Error rate tracking
- [x] Webhook delivery monitoring
- [x] Payment success rate tracking

## 🔄 Maintenance

### Daily Tasks
- [ ] Check Rapyd health status
- [ ] Monitor webhook delivery
- [ ] Review payment success rates
- [ ] Check error logs

### Weekly Tasks
- [ ] Review transaction volume
- [ ] Analyze payment method distribution
- [ ] Check compliance status
- [ ] Update monitoring dashboards

### Monthly Tasks
- [ ] Review Rapyd performance
- [ ] Analyze customer growth
- [ ] Check security logs
- [ ] Plan feature updates

## 📞 Support

### Getting Help
- **Rapyd Support**: Contact Rapyd support for API issues
- **Documentation**: See README.md and API docs
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@zappay.com

### Emergency Procedures
1. **Payment Processing Down**: Check Rapyd status and logs
2. **Webhook Issues**: Verify webhook configuration
3. **Security Breach**: Review logs and block suspicious IPs
4. **High Error Rate**: Check Rapyd API status and configuration

---

**🎉 Congratulations! Your ZapPay Rapyd integration is ready for production!**

Remember to:
- Monitor your Rapyd dashboard regularly
- Keep your webhook endpoints secure
- Track your transaction volume and success rates
- Stay compliant with financial regulations
- Scale your infrastructure as you grow

For questions or support, please contact the ZapPay team.
