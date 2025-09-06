# 🚀 Railway Deployment Guide for ZapPay Backend

## Prerequisites
- [ ] GitHub account
- [ ] Railway account (free at railway.app)
- [ ] Stripe account (for payments)
- [ ] SendGrid account (for emails)
- [ ] Twilio account (for SMS)

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

## Step 2: Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `zappay-app` repository
4. Select the `backend` folder as root directory
5. Railway will automatically detect it's a Node.js app

## Step 3: Add Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the connection details

## Step 4: Add Redis Cache
1. In your Railway project, click "New"
2. Select "Database" → "Redis"
3. Railway will automatically create a Redis instance
4. Copy the connection details

## Step 5: Configure Environment Variables
In Railway dashboard, go to your backend service → Variables tab:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Database (Railway will provide these)
DB_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Secrets (Generate strong secrets)
JWT_SECRET=your_super_secure_jwt_secret_256_bits_here
REFRESH_TOKEN_SECRET=your_super_secure_refresh_secret_256_bits_here

# Stripe (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Get from SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@zappay.com
FROM_NAME=ZapPay

# SMS (Get from Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# CORS (Your frontend URL)
FRONTEND_URL=https://zappay.com
CORS_ORIGIN=https://zappay.com,https://www.zappay.com
```

## Step 6: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Check the deployment logs
3. Your API will be available at: `https://your-app-name.railway.app`

## Step 7: Test Deployment
```bash
# Test health endpoint
curl https://your-app-name.railway.app/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

## Step 8: Set Up Custom Domain (Optional)
1. In Railway dashboard, go to your backend service
2. Click "Settings" → "Domains"
3. Add your custom domain: `api.zappay.com`
4. Update DNS records as instructed
5. SSL certificate will be automatically provisioned

## Step 9: Monitor Your App
1. Check Railway dashboard for logs
2. Monitor resource usage
3. Set up alerts if needed

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**
   - Check DB_URL environment variable
   - Ensure PostgreSQL service is running

2. **Redis Connection Failed**
   - Check REDIS_URL environment variable
   - Ensure Redis service is running

3. **Build Failed**
   - Check package.json dependencies
   - Review build logs in Railway dashboard

4. **Environment Variables Not Working**
   - Ensure all required variables are set
   - Check variable names match exactly

## Next Steps:
1. Update your frontend to use the new API URL
2. Test all endpoints
3. Set up monitoring
4. Configure webhooks for Stripe
5. Deploy frontend to production

## Cost Estimation:
- Railway: $5/month (after free tier)
- Stripe: 2.9% + 30¢ per transaction
- SendGrid: Free tier (100 emails/day)
- Twilio: Pay per SMS sent
- **Total: ~$10-20/month** (excluding transaction fees)
