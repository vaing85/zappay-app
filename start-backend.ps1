# Start ZapPay Backend Server
Write-Host "🚀 Starting ZapPay Backend Server..." -ForegroundColor Green

# Change to backend directory
Set-Location "C:\zapcash-complete\backend"

# Start the server
Write-Host "📡 Starting server on port 3001..." -ForegroundColor Yellow
node server.js
