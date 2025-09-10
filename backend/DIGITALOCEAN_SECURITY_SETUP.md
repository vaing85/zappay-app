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

## 🔐 Getting SSL Certificates - DETAILED GUIDE

### For DigitalOcean Managed Databases:

#### Step 1: Access Your Database Cluster
1. **Log into DigitalOcean Dashboard**
   - Go to https://cloud.digitalocean.com/
   - Sign in with your credentials

2. **Navigate to Databases**
   - Click on **Databases** in the left sidebar
   - Find your **zappay-postgres** cluster
   - Click on the cluster name to open it

#### Step 2: Download CA Certificate
1. **Open Connection Details**
   - Click on **Connection Details** tab
   - Scroll down to **SSL Certificate** section

2. **Download CA Certificate**
   - Click **Download** next to "CA Certificate"
   - Save the file as `ca-cert.pem` on your local machine
   - **Important:** This is the Certificate Authority certificate

3. **Copy Certificate Content**
   - Open the downloaded `ca-cert.pem` file in a text editor
   - Copy the entire content including `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
   - This will be your `DB_CA_CERT` environment variable

#### Step 3: Generate Client Certificates (Required for App Authentication)

**Option A: Using DigitalOcean's Built-in Certificate Generation (Recommended)**

1. **Generate Client Certificate in DigitalOcean**
   - In your database cluster, go to **Settings** tab
   - Scroll down to **Client Certificates** section
   - Click **Generate Certificate**
   - Enter a name like "zappay-app-client"
   - Click **Generate**

2. **Download Client Certificate Files**
   - Download the **Client Certificate** file (save as `client-cert.pem`)
   - Download the **Client Private Key** file (save as `client-key.pem`)
   - **Important:** Keep these files secure and never commit them to Git

**Option B: Generate Your Own Client Certificates (Advanced)**

1. **Install OpenSSL** (if not already installed)
   ```bash
   # On Windows (using Git Bash or WSL)
   # OpenSSL should be included with Git for Windows
   
   # On macOS
   brew install openssl
   
   # On Ubuntu/Debian
   sudo apt-get install openssl
   ```

2. **Generate Private Key**
   ```bash
   # Create a directory for certificates
   mkdir certificates
   cd certificates
   
   # Generate a 2048-bit RSA private key
   openssl genrsa -out client-key.pem 2048
   
   # Set proper permissions (important for security)
   chmod 600 client-key.pem
   ```

3. **Generate Certificate Signing Request (CSR)**
   ```bash
   # Create a CSR for the client certificate
   openssl req -new -key client-key.pem -out client.csr
   
   # When prompted, fill in the details:
   # Country Name: US
   # State: Your State
   # City: Your City
   # Organization: ZapPay
   # Organizational Unit: IT Department
   # Common Name: zappay-app-client
   # Email: your-email@example.com
   # Challenge Password: (leave empty)
   # Optional Company Name: (leave empty)
   ```

4. **Sign the Certificate with DigitalOcean's CA**
   ```bash
   # Note: DigitalOcean manages the CA, so you'll need to use their certificate generation
   # The above steps are for reference - use Option A instead
   ```

#### Step 4: Prepare Certificate Content for Environment Variables

1. **Get CA Certificate Content**
   ```bash
   # Open ca-cert.pem and copy the entire content
   cat ca-cert.pem
   ```
   - Copy everything from `-----BEGIN CERTIFICATE-----` to `-----END CERTIFICATE-----`
   - This becomes your `DB_CA_CERT` environment variable

2. **Get Client Certificate Content**
   ```bash
   # Open client-cert.pem and copy the entire content
   cat client-cert.pem
   ```
   - Copy everything from `-----BEGIN CERTIFICATE-----` to `-----END CERTIFICATE-----`
   - This becomes your `DB_CLIENT_CERT` environment variable

3. **Get Client Private Key Content**
   ```bash
   # Open client-key.pem and copy the entire content
   cat client-key.pem
   ```
   - Copy everything from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----`
   - This becomes your `DB_CLIENT_KEY` environment variable

#### Step 5: Verify Certificate Format

Each certificate should look like this:
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/OvM8WQkMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjBF
... (more certificate data) ...
-----END CERTIFICATE-----
```

#### Step 6: Test Certificate Connection (Optional)

1. **Test PostgreSQL Connection with SSL**
   ```bash
   # Install PostgreSQL client if not already installed
   # On Ubuntu: sudo apt-get install postgresql-client
   # On macOS: brew install postgresql
   
   # Test connection with SSL
   psql "host=your-db-host port=25060 dbname=zappay_production user=zappay_user sslmode=require sslcert=client-cert.pem sslkey=client-key.pem sslrootcert=ca-cert.pem"
   ```

2. **Verify SSL Connection**
   - If successful, you should see a PostgreSQL prompt
   - Type `\q` to quit
   - This confirms your certificates are working correctly

## 📸 Visual Guide - DigitalOcean Interface

### Finding Your Database Cluster:
1. **Dashboard Navigation:**
   ```
   DigitalOcean Dashboard
   ├── Databases (Left Sidebar)
   └── zappay-postgres (Your Cluster)
   ```

2. **Connection Details Tab:**
   ```
   zappay-postgres Cluster
   ├── Overview
   ├── Connection Details ← Click Here
   ├── Settings
   └── Backups
   ```

3. **SSL Certificate Section:**
   ```
   Connection Details
   ├── Connection Parameters
   ├── Connection String
   └── SSL Certificate ← Scroll Down Here
       ├── CA Certificate [Download] ← Click This
       └── Connection String with SSL
   ```

### Generating Client Certificates:
1. **Settings Tab:**
   ```
   zappay-postgres Cluster
   ├── Overview
   ├── Connection Details
   └── Settings ← Click Here
   ```

2. **Client Certificates Section:**
   ```
   Settings
   ├── General
   ├── Maintenance
   └── Client Certificates ← Scroll Down Here
       └── Generate Certificate [Button] ← Click This
   ```

## 🔧 Troubleshooting Common Issues

### Issue 1: "Certificate not found" Error
**Solution:**
- Ensure you copied the entire certificate including headers
- Check for extra spaces or line breaks
- Verify the certificate format matches the example above

### Issue 2: "SSL connection failed" Error
**Solution:**
- Verify all three certificates are properly set
- Check that `DB_CA_CERT` contains the CA certificate
- Ensure `DB_CLIENT_CERT` and `DB_CLIENT_KEY` are from the same generation

### Issue 3: "Permission denied" Error
**Solution:**
- Make sure the database user has proper permissions
- Verify the connection string includes the correct database name
- Check that the user exists in the database

### Issue 4: "Connection timeout" Error
**Solution:**
- Verify the database host and port are correct
- Check that your IP is whitelisted in database settings
- Ensure the database cluster is running and healthy

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
