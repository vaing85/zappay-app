# ZapPay Environment Setup Guide

## 🚀 Production Environment Variables

This guide covers the complete setup of environment variables for ZapPay production deployment.

## 📋 Environment Variables Overview

### Server Configuration
```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

### MongoDB Configuration (Primary Database)
```bash
MONGODB_URI=mongodb+srv://villaaing_db_user:${MONGODB_PASSWORD}@cluster0.8zftps3.mongodb.net/zappay?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=zappay
MONGODB_PASSWORD=**********
```

### Redis Configuration (DigitalOcean)
```bash
REDIS_URL=redis://default:${REDIS_PASSWORD}@zappay-redis-do-user-24731503-0.k.db.ondigitalocean.com:25061
REDIS_PASSWORD=**********
```

### JWT Configuration
```bash
JWT_SECRET=**********
JWT_EXPIRES_IN=7d
```

### Stripe Configuration (Production)
```bash
STRIPE_SECRET_KEY=**********
STRIPE_PUBLISHABLE_KEY=pk_test_51S81D7PFGMTp6wyHqRpdhl9yGm2RtvyHAGYOVVqyMg9HCQilnOU8TzdBvVtIOp53p45QVzVbfor1USguk7fJUcMG00boL74m0G
STRIPE_WEBHOOK_SECRET=**********
```

### Email Configuration (SendGrid)
```bash
SENDGRID_API_KEY=**********
FROM_EMAIL=noreply@zappay.site
```

### Security Configuration
```bash
SSN_ENCRYPTION__KEY=**********
BCRYPT_ROUNDS=12
```

### CORS Configuration
```bash
CORS_ORIGIN=https://zappay.site,https://www.zappay.site,https://api.zappay.site,https://zappay.com,https://www.zappay.com
ALLOWED_ORIGINS=https://zappay.site,https://www.zappay.site,https://api.zappay.site,https://zappay.com,https://www.zappay.com
```

### Frontend Configuration
```bash
FRONTEND_URL=https://zappay.site
```

### Rate Limiting Configuration
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 Setup Instructions

### 1. Local Development Setup

1. Copy the example environment file:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Update the `.env` file with your actual values (replace `**********` with real secrets)

3. Validate your environment:
   ```bash
   node backend/scripts/validate-env.js
   ```

### 2. DigitalOcean App Platform Setup

The environment variables are already configured in `backend/.do/app.yaml`. To deploy:

1. Ensure you have the DigitalOcean CLI installed:
   ```bash
   doctl apps create --spec backend/.do/app.yaml
   ```

2. Set the secret environment variables in DigitalOcean dashboard:
   - `MONGODB_PASSWORD`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SENDGRID_API_KEY`
   - `SSN_ENCRYPTION__KEY`

### 3. Environment Validation

Run the validation script to ensure all required variables are set:

```bash
# From the project root
node backend/scripts/validate-env.js
```

## 🔒 Security Considerations

### Secret Management
- Never commit actual secrets to version control
- Use DigitalOcean's secret management for production
- Rotate secrets regularly
- Use different secrets for different environments

### Database Security
- MongoDB uses secure connection string with authentication
- Use strong passwords for database access
- Regularly backup your databases

### API Keys
- Stripe keys are configured for production
- SendGrid API key is set for email functionality
- All API keys should be stored as secrets

## 🚨 Important Notes

1. **Port Configuration**: Changed from 3001 to 5000 to match your production setup
2. **Database**: Using MongoDB as primary database
3. **Redis**: Configured for caching and session management
4. **CORS**: Updated to include both zappay.site and zappay.com domains
5. **Email**: Updated FROM_EMAIL to use zappay.site domain

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MONGODB_URI connection string
   - Check MongoDB authentication

2. **Redis Connection Issues**
   - Verify REDIS_URL and REDIS_PASSWORD
   - Ensure Redis instance is accessible

3. **Stripe Integration Problems**
   - Verify STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
   - Check webhook endpoint configuration

4. **Email Delivery Issues**
   - Verify SENDGRID_API_KEY
   - Check FROM_EMAIL configuration

### Validation Script

The validation script (`backend/scripts/validate-env.js`) will help identify missing or incorrectly configured environment variables.

## 📞 Support

If you encounter issues with environment setup, check:
1. All required variables are set
2. Secret values are not placeholder text
3. Database and Redis connections are accessible
4. API keys are valid and have proper permissions
