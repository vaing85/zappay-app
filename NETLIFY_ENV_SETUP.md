# 🌐 Netlify Environment Variables Setup

## Required Environment Variables for ZapCash

You need to add these environment variables to your Netlify deployment:

### 🔑 **Essential Variables (Required)**

#### **Stripe Configuration**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51O...
REACT_APP_STRIPE_SECRET_KEY=sk_test_51O...
REACT_APP_STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **API Configuration**
```
REACT_APP_API_URL=https://your-app-name.netlify.app
REACT_APP_WEBSOCKET_URL=wss://your-app-name.netlify.app
```

### 🔧 **Optional Variables (Recommended)**

#### **Push Notifications**
```
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
REACT_APP_VAPID_PRIVATE_KEY=your_vapid_private_key
```

#### **Payment Providers (Optional)**
```
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
REACT_APP_SQUARE_APPLICATION_ID=your_square_app_id
REACT_APP_SQUARE_ACCESS_TOKEN=your_square_access_token
```

---

## 🚀 **How to Add Environment Variables in Netlify**

### **Step 1: Go to Site Settings**
1. Open your Netlify dashboard
2. Click on your ZapCash site
3. Go to **Site settings** → **Environment variables**

### **Step 2: Add Each Variable**
1. Click **Add variable**
2. Enter the **Variable name** (e.g., `REACT_APP_STRIPE_PUBLISHABLE_KEY`)
3. Enter the **Value** (your actual key)
4. Click **Save**

### **Step 3: Redeploy**
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Your app will rebuild with the new environment variables

---

## 🔑 **Getting Your Stripe Keys**

### **For Testing (Recommended First)**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Make sure you're in **Test mode** (toggle in top left)
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### **For Production (Later)**
1. Switch to **Live mode** in Stripe Dashboard
2. Get your live keys (starts with `pk_live_` and `sk_live_`)
3. Update environment variables in Netlify

---

## 📱 **Testing Your Deployment**

### **Test Cards (Use These for Testing)**
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005
- **Declined**: 4000 0000 0000 0002

### **What to Test**
1. **App loads** without errors
2. **Payment methods** can be added
3. **Payments** work with test cards
4. **PWA installation** works
5. **Offline mode** functions

---

## ⚠️ **Important Security Notes**

### **Never Commit These to GitHub:**
- Secret keys (sk_test_, sk_live_)
- Webhook secrets
- Private keys
- Client secrets

### **Use Environment Variables:**
- All sensitive data should be in Netlify environment variables
- Never hardcode keys in your source code
- Use different keys for development and production

---

## 🎯 **Quick Setup Checklist**

- [ ] Get Stripe test keys from dashboard
- [ ] Add `REACT_APP_STRIPE_PUBLISHABLE_KEY` to Netlify
- [ ] Add `REACT_APP_STRIPE_SECRET_KEY` to Netlify
- [ ] Add `REACT_APP_API_URL` to Netlify
- [ ] Add `REACT_APP_WEBSOCKET_URL` to Netlify
- [ ] Redeploy your site
- [ ] Test payment functionality
- [ ] Test PWA installation

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **App won't load**: Check if all required environment variables are set
2. **Payments fail**: Verify Stripe keys are correct
3. **WebSocket errors**: Check REACT_APP_WEBSOCKET_URL is set
4. **PWA not working**: Ensure HTTPS is enabled (Netlify does this automatically)

### **Need Help?**
- Check Netlify build logs for errors
- Verify environment variables are set correctly
- Test with Stripe test cards first
- Check browser console for errors

---

**Your ZapCash app will be live and working once you add these environment variables! 🚀**
