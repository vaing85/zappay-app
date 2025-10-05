# ZapPay Vite Frontend Deployment Script
# This script builds and prepares the Vite frontend for production deployment

Write-Host "🚀 Starting ZapPay Vite Frontend Deployment..." -ForegroundColor Green

# Step 1: Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Previous build cleaned" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Run TypeScript check
Write-Host "🔍 Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript check failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript check passed" -ForegroundColor Green

# Step 4: Build for production
Write-Host "🏗️ Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Production build completed" -ForegroundColor Green

# Step 5: Verify build output
Write-Host "🔍 Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    Write-Host "✅ index.html created" -ForegroundColor Green
} else {
    Write-Host "❌ index.html not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "dist/assets") {
    $assetCount = (Get-ChildItem "dist/assets" -File).Count
    Write-Host "✅ Assets folder created with $assetCount files" -ForegroundColor Green
} else {
    Write-Host "❌ Assets folder not found" -ForegroundColor Red
    exit 1
}

# Step 6: Show build statistics
Write-Host "📊 Build Statistics:" -ForegroundColor Cyan
$indexSize = (Get-Item "dist/index.html").Length
Write-Host "   index.html: $([math]::Round($indexSize/1KB, 2)) KB" -ForegroundColor White

if (Test-Path "dist/assets") {
    $totalSize = (Get-ChildItem "dist/assets" -File | Measure-Object -Property Length -Sum).Sum
    Write-Host "   Total assets: $([math]::Round($totalSize/1KB, 2)) KB" -ForegroundColor White
}

# Step 7: Deployment instructions
Write-Host "`n🎯 Deployment Ready!" -ForegroundColor Green
Write-Host "📁 Build output: dist/ folder" -ForegroundColor White
Write-Host "🌐 Deploy to: Netlify, Vercel, or any static hosting" -ForegroundColor White
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Upload dist/ folder to your hosting provider" -ForegroundColor White
Write-Host "2. Configure custom domain (optional)" -ForegroundColor White
Write-Host "3. Set up environment variables for production" -ForegroundColor White
Write-Host "4. Test the deployed application" -ForegroundColor White

Write-Host "`n🎉 ZapPay Vite Frontend is ready for production deployment!" -ForegroundColor Green
