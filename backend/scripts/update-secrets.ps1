# ZapPay Secret Values Update Script
# This script safely updates the .env file with actual secret values

param(
    [string]$MongoDBPassword,
    [string]$RedisPassword,
    [string]$JWTSecret,
    [string]$StripeSecretKey,
    [string]$StripeWebhookSecret,
    [string]$SendGridApiKey,
    [string]$SSNEncryptionKey
)

Write-Host "🔐 Updating ZapPay Environment with Secret Values..." -ForegroundColor Blue

$envFile = "backend\.env"

# Check if .env file exists
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found. Please run setup-env.ps1 first." -ForegroundColor Red
    exit 1
}

# Read current content
$content = Get-Content $envFile

# Update secrets if provided
if ($MongoDBPassword) {
    $content = $content -replace 'MONGODB_PASSWORD=.*', "MONGODB_PASSWORD=$MongoDBPassword"
    Write-Host "✅ Updated MONGODB_PASSWORD" -ForegroundColor Green
}

if ($RedisPassword) {
    $content = $content -replace 'REDIS_PASSWORD=.*', "REDIS_PASSWORD=$RedisPassword"
    Write-Host "✅ Updated REDIS_PASSWORD" -ForegroundColor Green
}

if ($JWTSecret) {
    $content = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$JWTSecret"
    Write-Host "✅ Updated JWT_SECRET" -ForegroundColor Green
}

if ($StripeSecretKey) {
    $content = $content -replace 'STRIPE_SECRET_KEY=.*', "STRIPE_SECRET_KEY=$StripeSecretKey"
    Write-Host "✅ Updated STRIPE_SECRET_KEY" -ForegroundColor Green
}

if ($StripeWebhookSecret) {
    $content = $content -replace 'STRIPE_WEBHOOK_SECRET=.*', "STRIPE_WEBHOOK_SECRET=$StripeWebhookSecret"
    Write-Host "✅ Updated STRIPE_WEBHOOK_SECRET" -ForegroundColor Green
}

if ($SendGridApiKey) {
    $content = $content -replace 'SENDGRID_API_KEY=.*', "SENDGRID_API_KEY=$SendGridApiKey"
    Write-Host "✅ Updated SENDGRID_API_KEY" -ForegroundColor Green
}

if ($SSNEncryptionKey) {
    $content = $content -replace 'SSN_ENCRYPTION__KEY=.*', "SSN_ENCRYPTION__KEY=$SSNEncryptionKey"
    Write-Host "✅ Updated SSN_ENCRYPTION__KEY" -ForegroundColor Green
}

# Write updated content back to file
$content | Set-Content $envFile

Write-Host "`n✅ Environment secrets updated successfully!" -ForegroundColor Green
Write-Host "🔍 Run validation: node backend\scripts\validate-env.js" -ForegroundColor Blue

Write-Host "`n📋 Usage Example:" -ForegroundColor Cyan
Write-Host ".\update-secrets.ps1 -MongoDBPassword 'your_mongodb_password' -RedisPassword 'your_redis_password' -JWTSecret 'your_jwt_secret'" -ForegroundColor Gray
