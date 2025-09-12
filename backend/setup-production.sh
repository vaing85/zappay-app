#!/bin/bash

# ZapPay Production Environment Setup Script
# This script helps set up the production environment for ZapPay

echo "🚀 Setting up ZapPay Production Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update with your production values."
else
    echo "⚠️  .env file already exists. Skipping creation."
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
chmod 755 logs

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Generate secure JWT secrets if not set
echo "🔐 Generating secure JWT secrets..."
if ! grep -q "your_super_secure_jwt_secret_key_here" .env; then
    JWT_SECRET=$(openssl rand -base64 32)
    REFRESH_SECRET=$(openssl rand -base64 32)
    
    # Update .env file with generated secrets
    sed -i "s/your_super_secure_jwt_secret_key_here_256_bits_minimum/$JWT_SECRET/g" .env
    sed -i "s/your_super_secure_refresh_token_secret_here_256_bits_minimum/$REFRESH_SECRET/g" .env
    
    echo "✅ JWT secrets generated and updated in .env"
else
    echo "⚠️  JWT secrets already configured in .env"
fi

# Set proper permissions
echo "🔒 Setting proper file permissions..."
chmod 600 .env
chmod 755 server.js
chmod 755 startup-check.js

# Create systemd service file (for Linux systems)
echo "⚙️  Creating systemd service file..."
cat > /tmp/zappay.service << EOF
[Unit]
Description=ZapPay Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

echo "📝 Systemd service file created at /tmp/zappay.service"
echo "   To install: sudo cp /tmp/zappay.service /etc/systemd/system/"
echo "   To enable: sudo systemctl enable zappay"
echo "   To start: sudo systemctl start zappay"

# Create PM2 ecosystem file
echo "📝 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'zappay-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

echo "✅ PM2 ecosystem file created"

# Create production startup script
echo "📝 Creating production startup script..."
cat > start-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting ZapPay Production Server..."

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "📦 Using PM2 to start the application..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
else
    echo "⚠️  PM2 not found. Starting with Node.js directly..."
    echo "   Install PM2 for better process management: npm install -g pm2"
    node server.js
fi
EOF

chmod +x start-production.sh

echo "✅ Production startup script created"

# Create health check script
echo "📝 Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash

echo "🏥 Checking ZapPay API health..."

# Check if server is running
if curl -f -s http://localhost:3001/health > /dev/null; then
    echo "✅ API is healthy"
    exit 0
else
    echo "❌ API is not responding"
    exit 1
fi
EOF

chmod +x health-check.sh

echo "✅ Health check script created"

# Display next steps
echo ""
echo "🎉 Production environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your production values:"
echo "   - Database connection details"
echo "   - Stripe live API keys"
echo "   - SendGrid API key"
echo "   - Twilio credentials"
echo "   - Redis connection details"
echo ""
echo "2. Set up your production database:"
echo "   - Create PostgreSQL database"
echo "   - Run migrations if needed"
echo ""
echo "3. Start the production server:"
echo "   ./start-production.sh"
echo ""
echo "4. Monitor the application:"
echo "   ./health-check.sh"
echo ""
echo "🔒 Security reminders:"
echo "- Use strong, unique passwords"
echo "- Enable SSL/TLS for all connections"
echo "- Set up proper firewall rules"
echo "- Monitor logs regularly"
echo "- Keep dependencies updated"
echo ""
echo "📚 For more information, see PRODUCTION_SETUP.md"
