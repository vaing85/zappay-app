# 🚀 DigitalOcean Deployment Guide for ZapPay Backend

## Prerequisites
- [ ] DigitalOcean account
- [ ] GitHub account
- [ ] Stripe account (for payments)
- [ ] SendGrid account (for emails)
- [ ] Twilio account (for SMS)

## Option 1: DigitalOcean App Platform (Recommended - Easiest)

### Step 1: Create App on DigitalOcean
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub account
4. Select your `zapcash-app` repository
5. Choose "Backend Service" and set root directory to `backend`

### Step 2: Configure App Settings
```yaml
# App Spec (auto-generated)
name: zappay-backend
services:
- name: api
  source_dir: /backend
  github:
    repo: yourusername/zapcash-app
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3001
  health_check:
    http_path: /health
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3001"
```

### Step 3: Add Database
1. In your app, click "Create" → "Database"
2. Choose "PostgreSQL"
3. Select plan: "Basic" ($15/month)
4. Name: `zappay-postgres`
5. DigitalOcean will automatically provide connection string

### Step 4: Add Redis Cache
1. In your app, click "Create" → "Database"
2. Choose "Redis"
3. Select plan: "Basic" ($15/month)
4. Name: `zappay-redis`
5. DigitalOcean will automatically provide connection string

### Step 5: Configure Environment Variables
In your app settings → Environment Variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Database (DigitalOcean will provide these)
DB_URL=${{zappay-postgres.DATABASE_URL}}
REDIS_URL=${{zappay-redis.REDIS_URL}}

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

### Step 6: Deploy
1. Click "Create Resources"
2. DigitalOcean will automatically build and deploy
3. Your API will be available at: `https://your-app-name.ondigitalocean.app`

## Option 2: DigitalOcean Droplet (More Control)

### Step 1: Create Droplet
1. Go to [DigitalOcean Droplets](https://cloud.digitalocean.com/droplets)
2. Click "Create Droplet"
3. Choose Ubuntu 22.04 LTS
4. Select plan: Basic $12/month (2GB RAM, 1 CPU)
5. Add SSH key
6. Name: `zappay-backend`

### Step 2: Connect to Droplet
```bash
ssh root@your-droplet-ip
```

### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Redis
apt install redis-server -y

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### Step 4: Configure Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE zappay_production;
CREATE USER zappay_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zappay_production TO zappay_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment and set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local   all             zappay_user                            md5

# Restart PostgreSQL
systemctl restart postgresql
```

### Step 5: Configure Redis
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
systemctl restart redis-server
```

### Step 6: Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/zapcash-app.git
cd zapcash-app/backend

# Install dependencies
npm install --production

# Create environment file
nano .env
# Add all environment variables

# Start with PM2
pm2 start server.js --name zappay-backend
pm2 startup
pm2 save
```

### Step 7: Configure Nginx
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/zappay-backend

# Add configuration:
server {
    listen 80;
    server_name api.zappay.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/zappay-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Configure SSL
```bash
# Get SSL certificate
sudo certbot --nginx -d api.zappay.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Option 3: DigitalOcean Kubernetes (Advanced)

### Step 1: Create Kubernetes Cluster
1. Go to [DigitalOcean Kubernetes](https://cloud.digitalocean.com/kubernetes)
2. Click "Create Cluster"
3. Choose region and node pool
4. Name: `zappay-cluster`

### Step 2: Deploy with Kubernetes
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zappay-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: zappay-backend
  template:
    metadata:
      labels:
        app: zappay-backend
    spec:
      containers:
      - name: zappay-backend
        image: your-registry/zappay-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: zappay-secrets
              key: db-url
---
apiVersion: v1
kind: Service
metadata:
  name: zappay-backend-service
spec:
  selector:
    app: zappay-backend
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

## Testing Your Deployment

### Health Check
```bash
# Test health endpoint
curl https://api.zappay.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### API Endpoints Test
```bash
# Test registration
curl -X POST https://api.zappay.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
  }'

# Test login
curl -X POST https://api.zappay.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Monitoring and Maintenance

### Set Up Monitoring
```bash
# Install monitoring tools
npm install -g @sentry/cli
npm install @sentry/node

# Configure Sentry
export SENTRY_DSN="your_sentry_dsn"
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
pg_dump -h localhost -U zappay_user zappay_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to DigitalOcean Spaces
s3cmd put backup_*.sql s3://zappay-backups/
```

## Cost Estimation

### App Platform (Recommended)
- App: $5/month
- PostgreSQL: $15/month
- Redis: $15/month
- **Total: $35/month**

### Droplet (More Control)
- Droplet: $12/month
- Managed Database: $15/month
- Managed Redis: $15/month
- **Total: $42/month**

### Kubernetes (Advanced)
- Cluster: $30/month
- Managed Database: $15/month
- Managed Redis: $15/month
- **Total: $60/month**

## Next Steps

1. **Deploy Backend**: Choose one of the options above
2. **Update Frontend**: Point to your new API URL
3. **Configure Domain**: Set up api.zappay.com
4. **Test Everything**: Run comprehensive tests
5. **Set Up Monitoring**: Configure alerts and logging
6. **Deploy Frontend**: Deploy your React app

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**
   - Check DB_URL environment variable
   - Ensure database is running and accessible

2. **Redis Connection Failed**
   - Check REDIS_URL environment variable
   - Ensure Redis is running

3. **Build Failed**
   - Check Node.js version (18+)
   - Review build logs

4. **SSL Issues**
   - Ensure domain is properly configured
   - Check DNS settings

## Support

- DigitalOcean Documentation: https://docs.digitalocean.com/
- DigitalOcean Community: https://www.digitalocean.com/community
- ZapPay Support: support@zappay.com
