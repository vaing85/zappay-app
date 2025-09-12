# ZapPay Production Environment Setup Script (PowerShell)
# This script helps set up the production environment for ZapPay

Write-Host "Starting ZapPay Production Environment Setup..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host ".env file created. Please update with your production values." -ForegroundColor Green
} else {
    Write-Host ".env file already exists. Skipping creation." -ForegroundColor Yellow
}

# Create logs directory
Write-Host "Creating logs directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Create uploads directory
Write-Host "Creating uploads directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

# Install production dependencies
Write-Host "Installing production dependencies..." -ForegroundColor Yellow
npm install --production

# Generate secure JWT secrets if not set
Write-Host "Generating secure JWT secrets..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your_super_secure_jwt_secret_key_here") {
    # Generate random secrets
    $jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32))
    $refreshSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32))
    
    # Update .env file
    $envContent = $envContent -replace "your_super_secure_jwt_secret_key_here_256_bits_minimum", $jwtSecret
    $envContent = $envContent -replace "your_super_secure_refresh_token_secret_here_256_bits_minimum", $refreshSecret
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "JWT secrets generated and updated in .env" -ForegroundColor Green
} else {
    Write-Host "JWT secrets already configured in .env" -ForegroundColor Yellow
}

# Create PM2 ecosystem file
Write-Host "Creating PM2 ecosystem file..." -ForegroundColor Yellow
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
Write-Host "PM2 ecosystem file created" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "Production environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your production values" -ForegroundColor White
Write-Host "2. Set up your production database" -ForegroundColor White
Write-Host "3. Start the production server with: node server.js" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see PRODUCTION_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
