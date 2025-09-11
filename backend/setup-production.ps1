# ZapPay Production Environment Setup Script (PowerShell)
# This script helps set up the production environment for ZapPay

Write-Host "🚀 Setting up ZapPay Production Environment..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please update with your production values." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists. Skipping creation." -ForegroundColor Yellow
}

# Create logs directory
Write-Host "📁 Creating logs directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Create uploads directory
Write-Host "📁 Creating uploads directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
npm install --production

# Generate secure JWT secrets if not set
Write-Host "🔐 Generating secure JWT secrets..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your_super_secure_jwt_secret_key_here") {
    # Generate random secrets
    $jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $refreshSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    
    # Update .env file
    $envContent = $envContent -replace "your_super_secure_jwt_secret_key_here_256_bits_minimum", $jwtSecret
    $envContent = $envContent -replace "your_super_secure_refresh_token_secret_here_256_bits_minimum", $refreshSecret
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "✅ JWT secrets generated and updated in .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  JWT secrets already configured in .env" -ForegroundColor Yellow
}

# Create PM2 ecosystem file
Write-Host "📝 Creating PM2 ecosystem file..." -ForegroundColor Yellow
$ecosystemConfig = @"
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
"@

Set-Content -Path "ecosystem.config.js" -Value $ecosystemConfig
Write-Host "✅ PM2 ecosystem file created" -ForegroundColor Green

# Create production startup script
Write-Host "📝 Creating production startup script..." -ForegroundColor Yellow
$startupScript = @"
# PowerShell script to start ZapPay Production Server
Write-Host "🚀 Starting ZapPay Production Server..." -ForegroundColor Green

# Check if PM2 is installed
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "📦 Using PM2 to start the application..." -ForegroundColor Yellow
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
} else {
    Write-Host "⚠️  PM2 not found. Starting with Node.js directly..." -ForegroundColor Yellow
    Write-Host "   Install PM2 for better process management: npm install -g pm2" -ForegroundColor Gray
    node server.js
}
"@

Set-Content -Path "start-production.ps1" -Value $startupScript
Write-Host "✅ Production startup script created" -ForegroundColor Green

# Create health check script
Write-Host "📝 Creating health check script..." -ForegroundColor Yellow
$healthCheckScript = @"
# PowerShell script to check ZapPay API health
Write-Host "🏥 Checking ZapPay API health..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is healthy" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ API is not responding (Status: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ API is not responding" -ForegroundColor Red
    exit 1
}
"@

Set-Content -Path "health-check.ps1" -Value $healthCheckScript
Write-Host "✅ Health check script created" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "🎉 Production environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your production values:" -ForegroundColor White
Write-Host "   - Database connection details" -ForegroundColor Gray
Write-Host "   - Stripe live API keys" -ForegroundColor Gray
Write-Host "   - SendGrid API key" -ForegroundColor Gray
Write-Host "   - Twilio credentials" -ForegroundColor Gray
Write-Host "   - Redis connection details" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up your production database:" -ForegroundColor White
Write-Host "   - Create PostgreSQL database" -ForegroundColor Gray
Write-Host "   - Run migrations if needed" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the production server:" -ForegroundColor White
Write-Host "   .\start-production.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Monitor the application:" -ForegroundColor White
Write-Host "   .\health-check.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🔒 Security reminders:" -ForegroundColor Red
Write-Host "- Use strong, unique passwords" -ForegroundColor Gray
Write-Host "- Enable SSL/TLS for all connections" -ForegroundColor Gray
Write-Host "- Set up proper firewall rules" -ForegroundColor Gray
Write-Host "- Monitor logs regularly" -ForegroundColor Gray
Write-Host "- Keep dependencies updated" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For more information, see PRODUCTION_SETUP.md" -ForegroundColor Cyan
