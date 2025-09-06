# ⚡ ZapPay Quick Start Guide

## **🚀 Ready to Deploy? Follow These Steps:**

### **Step 1: Rename GitHub Repository (2 minutes)**
1. Go to: https://github.com/vaing85/zappay-app
2. Click **Settings** → **Repository name**
3. Change to: `zappay-app`
4. Click **Rename**

### **Step 2: Update Local Repository (1 minute)**
```bash
# Run this after renaming on GitHub
git remote set-url origin https://github.com/vaing85/zappay-app.git
git remote -v
```

### **Step 3: Deploy Backend to DigitalOcean (10 minutes)**
1. **Go to DigitalOcean App Platform:**
   - Visit: https://cloud.digitalocean.com/apps
   - Click **"Create App"**

2. **Connect GitHub:**
   - Select **"GitHub"** as source
   - Choose repository: `zappay-app`
   - Set **Root Directory**: `backend`

3. **Configure App:**
   - **App Name**: `zappay-backend`
   - **Environment**: `Node.js`
   - **Instance Size**: `Basic XXS`

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your_super_secret_jwt_key_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d
   FRONTEND_URL=https://zappayapp.netlify.app
   API_BASE_URL=https://your-app-name.ondigitalocean.app
   ```

5. **Deploy:**
   - Click **"Create Resources"**
   - Wait for deployment
   - Note your backend URL

### **Step 4: Add Databases (5 minutes)**
1. **PostgreSQL:**
   - Go to **"Databases"** in DigitalOcean
   - Create **PostgreSQL** database
   - Choose **Basic plan** ($15/month)
   - Name: `zappay_production`

2. **Redis:**
   - Create **Redis** database
   - Choose **Basic plan** ($15/month)
   - Name: `zappay_redis`

3. **Update Environment Variables:**
   - Add `DATABASE_URL` from PostgreSQL
   - Add `REDIS_URL` from Redis

### **Step 5: Configure External Services (15 minutes)**
1. **Stripe:**
   - Get live API keys from https://dashboard.stripe.com
   - Add to environment variables

2. **SendGrid:**
   - Create API key from https://app.sendgrid.com
   - Add to environment variables

3. **Twilio:**
   - Get credentials from https://console.twilio.com
   - Add to environment variables

### **Step 6: Update Frontend (2 minutes)**
1. **Update API URL:**
   ```bash
   # In your .env file
   REACT_APP_API_URL=https://your-backend-url.ondigitalocean.app
   ```

2. **Redeploy to Netlify:**
   - Push changes to GitHub
   - Netlify auto-deploys

### **Step 7: Test Everything (5 minutes)**
1. **Backend Health Check:**
   ```bash
   curl https://your-backend-url.ondigitalocean.app/health
   ```

2. **Frontend Test:**
   - Visit: https://zappayapp.netlify.app
   - Test user registration
   - Test payment flow

## **🎉 You're Done!**

Your ZapPay app is now:
- ✅ **Production ready**
- ✅ **App store ready**
- ✅ **Fully branded**
- ✅ **Scalable**

## **📋 Total Time: ~40 minutes**
## **💰 Monthly Cost: ~$36 (DigitalOcean)**
## **🚀 Ready for: Google Play & App Store**

---

## **Need Help?**
- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- All configuration files are ready in `backend/` folder
- Your app is already rebranded to ZapPay

**Let's get this deployed! 🚀**
