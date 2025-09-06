# 🚀 ZapPay Complete Deployment Guide

## **Step 1: GitHub Repository Rename**

### **Rename Repository:**
1. Go to: https://github.com/vaing85/zappay-app
2. Click **"Settings"** tab
3. Scroll to **"Repository name"** section
4. Change from: `zapcash-app` (if not already renamed)
5. Change to: `zappay-app`
6. Click **"Rename"** button

### **Update Local Repository:**
```bash
# After renaming on GitHub, update local remote
git remote set-url origin https://github.com/vaing85/zappay-app.git

# Verify the change
git remote -v
```

---

## **Step 2: DigitalOcean Backend Deployment**

### **Prerequisites:**
- DigitalOcean account
- GitHub repository renamed to `zappay-app`
- Stripe account (for payment processing)
- SendGrid account (for emails)
- Twilio account (for SMS)

### **Deploy Backend:**

#### **Option A: Using DigitalOcean App Platform (Recommended)**

1. **Go to DigitalOcean App Platform:**
   - Visit: https://cloud.digitalocean.com/apps
   - Click **"Create App"**

2. **Connect GitHub:**
   - Select **"GitHub"** as source
   - Connect your GitHub account
   - Select repository: `zappay-app`
   - Choose branch: `main`

3. **Configure App:**
   - **Root Directory**: `backend`
   - **App Name**: `zappay-backend`
   - **Environment**: `Node.js`
   - **Instance Size**: `Basic XXS` (for testing)

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your_super_secret_jwt_key_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d
   
   # Database (will be added in next step)
   DATABASE_URL=postgres://user:pass@host:port/db
   
   # Redis (will be added in next step)
   REDIS_URL=redis://host:port
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=noreply@zappay.com
   
   # Twilio
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+15017122661
   
   # Frontend URL
   FRONTEND_URL=https://zappayapp.netlify.app
   API_BASE_URL=https://your-app-name.ondigitalocean.app
   ```

5. **Deploy:**
   - Click **"Create Resources"**
   - Wait for deployment to complete
   - Note the app URL (e.g., `https://zappay-backend-xyz.ondigitalocean.app`)

#### **Option B: Using DigitalOcean Droplet**

1. **Create Droplet:**
   - Choose **Ubuntu 22.04**
   - Select **Basic plan** ($6/month)
   - Add **SSH key**

2. **Connect and Setup:**
   ```bash
   # SSH into your droplet
   ssh root@your_droplet_ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PostgreSQL
   apt install postgresql postgresql-contrib -y
   
   # Install Redis
   apt install redis-server -y
   
   # Clone repository
   git clone https://github.com/vaing85/zappay-app.git
   cd zappay-app/backend
   
   # Install dependencies
   npm install --production
   
   # Create environment file
   cp env.example .env
   nano .env  # Edit with your values
   
   # Start the application
   npm start
   ```

---

## **Step 3: Add Databases**

### **PostgreSQL Database:**

#### **Option A: DigitalOcean Managed Database**
1. Go to **"Databases"** in DigitalOcean
2. Click **"Create Database"**
3. Choose **PostgreSQL**
4. Select **Basic plan** ($15/month)
5. Choose same region as your app
6. Set database name: `zappay_production`
7. Note the connection string

#### **Option B: Local PostgreSQL (for testing)**
```bash
# Install PostgreSQL locally
# Create database
createdb zappay_production

# Update DATABASE_URL in your .env file
DATABASE_URL=postgres://username:password@localhost:5432/zappay_production
```

### **Redis Cache:**

#### **Option A: DigitalOcean Managed Redis**
1. Go to **"Databases"** in DigitalOcean
2. Click **"Create Database"**
3. Choose **Redis**
4. Select **Basic plan** ($15/month)
5. Choose same region as your app
6. Note the connection string

#### **Option B: Local Redis (for testing)**
```bash
# Install Redis locally
# Start Redis server
redis-server

# Update REDIS_URL in your .env file
REDIS_URL=redis://localhost:6379
```

---

## **Step 4: Configure External Services**

### **Stripe Setup:**
1. Go to: https://dashboard.stripe.com
2. Get your **Live API keys** (not test keys)
3. Set up **Webhooks**:
   - Endpoint: `https://your-backend-url.ondigitalocean.app/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### **SendGrid Setup:**
1. Go to: https://app.sendgrid.com
2. Create API key
3. Verify sender email: `noreply@zappay.com`

### **Twilio Setup:**
1. Go to: https://console.twilio.com
2. Get Account SID and Auth Token
3. Purchase a phone number

---

## **Step 5: Frontend Deployment (Netlify)**

### **Update Frontend Configuration:**
1. **Update API URL** in your frontend:
   ```bash
   # In your .env file
   REACT_APP_API_URL=https://your-backend-url.ondigitalocean.app
   ```

2. **Redeploy to Netlify:**
   - Push changes to GitHub
   - Netlify will auto-deploy
   - Or manually trigger deploy

---

## **Step 6: Verify Complete Deployment**

### **Backend Health Check:**
```bash
# Test your backend
curl https://your-backend-url.ondigitalocean.app/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **Frontend Test:**
1. Visit: https://zappayapp.netlify.app
2. Test user registration
3. Test payment flow
4. Verify all ZapPay branding

### **Database Test:**
```bash
# Connect to your database
psql "your_database_connection_string"

# Check if tables exist
\dt

# Check users table
SELECT * FROM users LIMIT 5;
```

---

## **Step 7: Production Checklist**

### **✅ Security:**
- [ ] All environment variables set
- [ ] JWT secrets are strong and unique
- [ ] HTTPS enabled on all services
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

### **✅ Database:**
- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] Database migrations completed
- [ ] Backup strategy in place

### **✅ External Services:**
- [ ] Stripe webhooks configured
- [ ] SendGrid email service working
- [ ] Twilio SMS service working
- [ ] All API keys are live (not test)

### **✅ Frontend:**
- [ ] API URL points to production backend
- [ ] All ZapPay branding visible
- [ ] PWA features working
- [ ] Service worker updated

### **✅ Monitoring:**
- [ ] Health check endpoints working
- [ ] Error logging configured
- [ ] Performance monitoring set up

---

## **🎉 Deployment Complete!**

Your ZapPay application is now ready for:
- **Google Play Store** submission
- **Apple App Store** submission
- **Production use**

### **Next Steps:**
1. **Test thoroughly** in production
2. **Set up monitoring** and alerts
3. **Prepare app store** submissions
4. **Create user documentation**

---

## **📞 Support**

If you encounter any issues:
- Check the logs in DigitalOcean dashboard
- Verify all environment variables
- Test each service individually
- Review the troubleshooting guide

**Happy deploying! 🚀**
