#!/bin/bash

# ZapPay Backend Environment Setup Script
echo "🔧 Setting up ZapPay Backend Environment Variables..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Generate random secrets
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Create .env file
create_env_file() {
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    
    cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration (DigitalOcean will provide these)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zappay_production
DB_USER=zappay_user
DB_PASSWORD=your_secure_password
DB_URL=postgresql://zappay_user:your_secure_password@localhost:5432/zappay_production

# JWT Configuration
JWT_SECRET=$(generate_secret)
REFRESH_TOKEN_SECRET=$(generate_secret)

# Stripe Configuration (REPLACE WITH YOUR LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Redis Configuration (DigitalOcean will provide this)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Email Configuration (REPLACE WITH YOUR SENDGRID KEYS)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@zappay.com
FROM_NAME=ZapPay

# SMS Configuration (REPLACE WITH YOUR TWILIO KEYS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://zappay.com,https://www.zappay.com
ALLOWED_ORIGINS=https://zappay.com,https://www.zappay.com

# Frontend Configuration
FRONTEND_URL=https://zappay.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring Configuration (OPTIONAL)
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_new_relic_key
EOF

    echo -e "${GREEN}✅ .env file created${NC}"
}

# Display next steps
show_next_steps() {
    echo ""
    echo -e "${YELLOW}⚠️ IMPORTANT: You need to update the following values in your .env file:${NC}"
    echo ""
    echo "1. Database Configuration:"
    echo "   - DB_URL: Get from DigitalOcean database"
    echo "   - DB_PASSWORD: Set a secure password"
    echo ""
    echo "2. Stripe Configuration:"
    echo "   - STRIPE_SECRET_KEY: Get from Stripe Dashboard (Live keys)"
    echo "   - STRIPE_PUBLISHABLE_KEY: Get from Stripe Dashboard (Live keys)"
    echo "   - STRIPE_WEBHOOK_SECRET: Get from Stripe Dashboard"
    echo ""
    echo "3. Email Configuration:"
    echo "   - SENDGRID_API_KEY: Get from SendGrid Dashboard"
    echo ""
    echo "4. SMS Configuration:"
    echo "   - TWILIO_ACCOUNT_SID: Get from Twilio Dashboard"
    echo "   - TWILIO_AUTH_TOKEN: Get from Twilio Dashboard"
    echo "   - TWILIO_PHONE_NUMBER: Get from Twilio Dashboard"
    echo ""
    echo "5. Domain Configuration:"
    echo "   - FRONTEND_URL: Your frontend domain"
    echo "   - CORS_ORIGIN: Your frontend domain"
    echo ""
    echo -e "${BLUE}📋 After updating .env file, run:${NC}"
    echo "   npm install"
    echo "   npm start"
}

# Main function
main() {
    echo -e "${BLUE}⚡ ZapPay Backend Environment Setup${NC}"
    echo "====================================="
    
    create_env_file
    show_next_steps
    
    echo ""
    echo -e "${GREEN}🎉 Environment setup completed!${NC}"
    echo -e "${BLUE}📁 Your .env file is ready for configuration${NC}"
}

# Run main function
main "$@"
