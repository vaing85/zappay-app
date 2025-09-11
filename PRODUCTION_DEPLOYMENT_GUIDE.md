# 🚀 ZapPay Production Deployment Guide

This guide will help you deploy ZapPay to production with all necessary security, monitoring, and scalability features.

## 📋 Prerequisites

### Required Accounts
- [ ] DigitalOcean Account
- [ ] Stripe Live Account
- [ ] SendGrid Account
- [ ] Twilio Account
- [ ] Domain Name (optional)

### Required Tools
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] DigitalOcean CLI (doctl) installed
- [ ] PM2 installed globally (`npm install -g pm2`)

## 🏗️ Production Setup

### 1. Environment Configuration

```bash
# Navigate to backend directory
cd backend

# Run production setup script
./setup-production.ps1  # Windows PowerShell
# OR
./setup-production.sh   # Linux/Mac

# Update .env file with your production values
nano .env
```

**Required Environment Variables:**
```bash
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database (use your production database URL)
DB_URL=postgresql://user:password@host:5432/database

# JWT Secrets (generated automatically)
JWT_SECRET=your_generated_secret
REFRESH_TOKEN_SECRET=your_generated_secret

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@zappay.com

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# CORS (your production domains)
CORS_ORIGIN=https://zappay.com,https://www.zappay.com
FRONTEND_URL=https://zappay.com
```

### 2. Database Setup

```bash
# Set up production database
npm run setup:prod

# This will:
# - Create database if it doesn't exist
# - Create database user with proper permissions
# - Create all tables and indexes
# - Test the connection
```

### 3. Security Configuration

The production setup includes:
- ✅ Enhanced rate limiting
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration
- ✅ Request size limiting
- ✅ IP whitelisting for admin endpoints

### 4. Monitoring Setup

Production monitoring includes:
- ✅ Winston logging with file rotation
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Health checks
- ✅ Metrics endpoint
- ✅ Security event logging

## 🚀 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

```bash
# Install DigitalOcean CLI
# Windows: choco install doctl
# Mac: brew install doctl
# Linux: See https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate with DigitalOcean
doctl auth init

# Deploy to DigitalOcean
npm run deploy
```

**DigitalOcean Configuration:**
- **App Platform**: $6/month (Basic XXS)
- **PostgreSQL Database**: $15/month
- **Redis Database**: $15/month
- **Total**: ~$36/month

### Option 2: VPS Deployment

```bash
# Set up your VPS (Ubuntu 20.04+ recommended)
# Install Node.js, PostgreSQL, Redis, Nginx

# Clone repository
git clone https://github.com/vaing85/zappay-app.git
cd zappay-app/backend

# Install dependencies
npm install --production

# Set up environment
cp env.example .env
# Edit .env with your production values

# Set up database
npm run setup:prod

# Start with PM2
npm run pm2:start

# Set up Nginx reverse proxy
# Configure SSL certificates
# Set up firewall rules
```

### Option 3: Docker Deployment

```bash
# Build Docker image
docker build -t zappay-api .

# Run with Docker Compose
docker-compose up -d

# Or run individual containers
docker run -d \
  --name zappay-api \
  -p 3001:3001 \
  --env-file .env \
  zappay-api
```

## 🧪 Testing

### 1. Run Production Tests

```bash
# Test all production endpoints
npm run test:prod

# This will test:
# - Health checks
# - Database connectivity
# - External services (Stripe, SendGrid, Twilio)
# - Security headers
# - Rate limiting
# - Authentication flow
# - Protected endpoints
```

### 2. Manual Testing

```bash
# Health check
curl https://your-api-url.com/health

# Metrics
curl https://your-api-url.com/metrics

# Stripe test
curl https://your-api-url.com/stripe-test

# SendGrid test
curl https://your-api-url.com/email-test

# Twilio test
curl -X POST https://your-api-url.com/sms-test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## 📊 Monitoring

### 1. Health Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics`
- **Logs**: Check `logs/` directory

### 2. PM2 Monitoring

```bash
# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Restart if needed
npm run pm2:restart
```

### 3. External Monitoring

Set up monitoring with:
- **Uptime Robot**: For uptime monitoring
- **Sentry**: For error tracking
- **New Relic**: For performance monitoring
- **DataDog**: For comprehensive monitoring

## 🔒 Security Checklist

### Backend Security
- [x] HTTPS enabled
- [x] JWT tokens with proper expiration
- [x] Rate limiting implemented
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS protection
- [x] CORS properly configured
- [x] Security headers (Helmet.js)
- [x] Environment variables secured
- [x] Request size limiting
- [x] IP whitelisting for admin

### Database Security
- [x] SSL/TLS encryption
- [x] Strong passwords
- [x] Limited user permissions
- [x] Regular backups
- [x] Connection pooling

### Infrastructure Security
- [x] Firewall rules
- [x] Regular security updates
- [x] Log monitoring
- [x] Access control
- [x] Backup strategy

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database URL
echo $DB_URL

# Test connection
npm run setup:prod
```

**2. Rate Limiting Too Strict**
```bash
# Adjust rate limits in .env
RATE_LIMIT_MAX_REQUESTS=500
```

**3. CORS Issues**
```bash
# Check CORS_ORIGIN in .env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

**4. External Service Failures**
```bash
# Test individual services
curl https://your-api-url.com/stripe-test
curl https://your-api-url.com/email-test
curl -X POST https://your-api-url.com/sms-test -d '{"phoneNumber": "+1234567890"}'
```

### Log Analysis

```bash
# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log

# Search for specific errors
grep "ERROR" logs/combined.log
```

## 📈 Performance Optimization

### 1. Database Optimization
- [x] Proper indexing
- [x] Connection pooling
- [x] Query optimization
- [x] Regular maintenance

### 2. Caching
- [x] Redis for session storage
- [x] Response caching
- [x] Database query caching

### 3. Monitoring
- [x] Performance metrics
- [x] Memory usage tracking
- [x] Response time monitoring
- [x] Error rate tracking

## 🔄 Maintenance

### Daily Tasks
- [ ] Check health status
- [ ] Monitor error logs
- [ ] Verify backups

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Check security alerts

### Monthly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Update documentation

## 📞 Support

### Getting Help
- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Email**: support@zappay.com

### Emergency Procedures
1. **Service Down**: Check health endpoint
2. **Database Issues**: Check connection and logs
3. **Security Breach**: Review logs and block IPs
4. **Performance Issues**: Check metrics and restart services

## 🎯 Post-Deployment

### 1. Update Frontend
Update your frontend to use the production API URL:
```javascript
// src/config/api.js
export const API_BASE_URL = 'https://your-api-url.com';
export const WEBSOCKET_URL = 'wss://your-api-url.com';
```

### 2. Set Up Domain
- Configure DNS records
- Set up SSL certificates
- Update CORS origins

### 3. Monitor Performance
- Set up alerts
- Monitor logs
- Track metrics
- Review user feedback

### 4. Scale as Needed
- Add more instances
- Upgrade database
- Implement CDN
- Add load balancing

---

**🎉 Congratulations! Your ZapPay production environment is ready!**

Remember to:
- Keep your dependencies updated
- Monitor your logs regularly
- Test your backups
- Review security regularly
- Scale as your user base grows

For questions or support, please contact the ZapPay team.
