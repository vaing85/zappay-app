# ZapPay Environment Setup Script for Windows PowerShell
# This script helps set up environment variables for ZapPay

Write-Host "🔧 Setting up ZapPay Environment Variables..." -ForegroundColor Blue

# Check if .env file exists
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Write-Host "⚠️  .env file already exists. Creating backup..." -ForegroundColor Yellow
    Copy-Item $envFile "$envFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}

# Copy from example
if (Test-Path "backend\env.example") {
    Copy-Item "backend\env.example" $envFile
    Write-Host "✅ Created .env file from env.example" -ForegroundColor Green
} else {
    Write-Host "❌ env.example file not found!" -ForegroundColor Red
    exit 1
}

# Function to generate random secret
function Generate-Secret {
    $bytes = New-Object Byte[] 32
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    return [Convert]::ToBase64String($bytes) -replace '[+/=]', '' | Select-Object -First 32
}

Write-Host "`n🔐 Generating secure secrets..." -ForegroundColor Blue

# Read the .env file content
$content = Get-Content $envFile

# Replace placeholder secrets with generated ones
$content = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$(Generate-Secret)"
$content = $content -replace 'SSN_ENCRYPTION__KEY=.*', "SSN_ENCRYPTION__KEY=$(Generate-Secret)"

# Write back to file
$content | Set-Content $envFile

Write-Host "✅ Generated secure JWT_SECRET and SSN_ENCRYPTION__KEY" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and replace ********** with your actual values:" -ForegroundColor White
Write-Host "   - MONGODB_PASSWORD" -ForegroundColor Gray
Write-Host "   - REDIS_PASSWORD" -ForegroundColor Gray
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor Gray
Write-Host "   - STRIPE_WEBHOOK_SECRET" -ForegroundColor Gray
Write-Host "   - SENDGRID_API_KEY" -ForegroundColor Gray

Write-Host "`n2. Validate your environment:" -ForegroundColor White
Write-Host "   node backend\scripts\validate-env.js" -ForegroundColor Gray

Write-Host "`n3. Start your application:" -ForegroundColor White
Write-Host "   cd backend && npm start" -ForegroundColor Gray

Write-Host "`n✅ Environment setup complete!" -ForegroundColor Green
Write-Host "📖 See ENVIRONMENT_SETUP.md for detailed configuration guide" -ForegroundColor Blue
