# DigitalOcean Security Setup Guide

## 🛡️ Database Security Environment Variables

This guide will help you set up the required environment variables in DigitalOcean App Platform for enhanced database security.

## 📋 Required Environment Variables

### 1. Database SSL Certificates
You need to add these environment variables in your DigitalOcean App Platform:

```bash
# PostgreSQL SSL Certificates (Required for secure connections)
DB_CA_CERT=your_ca_certificate_here
DB_CLIENT_CERT=your_client_certificate_here
DB_CLIENT_KEY=your_client_private_key_here

# Redis Authentication
REDIS_PASSWORD=your_strong_redis_password
REDIS_USERNAME=your_redis_username
```

### 2. Security Configuration
```bash
# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/zappay/app.log
```

## 🔧 How to Add Environment Variables in DigitalOcean

### Step 1: Access DigitalOcean App Platform
1. Log into your DigitalOcean dashboard
2. Go to **Apps** → **zappay-backend**
3. Click on **Settings** tab
4. Scroll down to **App-Level Environment Variables**

### Step 2: Add Database Certificates
1. Click **Edit** next to App-Level Environment Variables
2. Add each variable with the **Add Variable** button:

#### For PostgreSQL SSL:
- **Key:** `DB_CA_CERT`
- **Value:** `-----BEGIN CERTIFICATE-----` (your CA certificate)
- **Type:** Secret

- **Key:** `DB_CLIENT_CERT`  
- **Value:** `-----BEGIN CERTIFICATE-----` (your client certificate)
- **Type:** Secret

- **Key:** `DB_CLIENT_KEY`
- **Value:** `-----BEGIN PRIVATE KEY-----` (your private key)
- **Type:** Secret

#### For Redis Security:
- **Key:** `REDIS_PASSWORD`
- **Value:** `your_strong_redis_password_here`
- **Type:** Secret

- **Key:** `REDIS_USERNAME`
- **Value:** `your_redis_username`
- **Type:** Secret

### Step 3: Add Security Configuration
Add these non-secret variables:

- **Key:** `BCRYPT_ROUNDS`, **Value:** `12`
- **Key:** `RATE_LIMIT_WINDOW_MS`, **Value:** `900000`
- **Key:** `RATE_LIMIT_MAX_REQUESTS`, **Value:** `100`
- **Key:** `LOG_LEVEL`, **Value:** `info`
- **Key:** `LOG_FILE`, **Value:** `/var/log/zappay/app.log`

## 🔐 Getting SSL Certificates

### For DigitalOcean Managed Databases:

1. **Download Certificates:**
   - Go to **Databases** → **zappay-postgres**
   - Click **Connection Details**
   - Download the CA certificate file
   - Copy the certificate content

2. **Generate Client Certificates:**
   ```bash
   # Generate private key
   openssl genrsa -out client-key.pem 2048
   
   # Generate certificate signing request
   openssl req -new -key client-key.pem -out client.csr
   
   # Generate client certificate (you'll need the CA to sign this)
   openssl x509 -req -in client.csr -CA ca-cert.pem -CAkey ca-key.pem -out client-cert.pem
   ```

## 🚨 Security Checklist

- [ ] All database ports (5432, 6379) are not exposed to internet
- [ ] SSL certificates are properly configured
- [ ] Strong passwords are set for Redis and PostgreSQL
- [ ] Rate limiting is enabled
- [ ] Logging is configured for security monitoring
- [ ] Environment variables are marked as "Secret" where appropriate

## 🔄 After Adding Variables

1. **Save** the environment variables
2. **Deploy** the updated configuration
3. **Monitor** the logs for any SSL connection issues
4. **Test** database connectivity

## 📞 Support

If you encounter issues:
1. Check the application logs in DigitalOcean
2. Verify certificate formats (PEM format required)
3. Ensure all required variables are set
4. Test database connection from your local environment first

## ⚠️ Important Notes

- **Never commit certificates to Git** - Use environment variables only
- **Rotate certificates regularly** - Set up certificate rotation schedule
- **Monitor access logs** - Watch for unauthorized connection attempts
- **Backup certificates securely** - Store in secure password manager
