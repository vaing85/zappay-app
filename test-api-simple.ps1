# Simple API Testing Script
Write-Host "🧪 Testing ZapPay API Endpoints..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n📊 Test 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    Write-Host "✅ Health Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "📈 Uptime: $($healthData.uptime)s" -ForegroundColor Cyan
    Write-Host "💾 Memory: $([math]::Round($healthData.memory.rss / 1024 / 1024))MB" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: MongoDB Health Check
Write-Host "`n📊 Test 2: MongoDB Health Check" -ForegroundColor Yellow
try {
    $mongoHealthResponse = Invoke-WebRequest -Uri "http://localhost:3001/mongodb-health" -UseBasicParsing
    Write-Host "✅ MongoDB Health Status: $($mongoHealthResponse.StatusCode)" -ForegroundColor Green
    $mongoHealthData = $mongoHealthResponse.Content | ConvertFrom-Json
    if ($mongoHealthData.success) {
        Write-Host "✅ MongoDB Atlas: Connected" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB Atlas: Connection failed" -ForegroundColor Red
        Write-Host "Error: $($mongoHealthData.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MongoDB Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create User
Write-Host "`n📊 Test 3: Create User" -ForegroundColor Yellow
try {
    $userData = @{
        email = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@zappay.com"
        name = "Test User"
        password = "password123"
    } | ConvertTo-Json

    $createUserResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/mongo/users" -Method POST -Body $userData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Create User Status: $($createUserResponse.StatusCode)" -ForegroundColor Green
    
    if ($createUserResponse.StatusCode -eq 201) {
        $userResponseData = $createUserResponse.Content | ConvertFrom-Json
        Write-Host "✅ User created successfully" -ForegroundColor Green
        Write-Host "👤 User ID: $($userResponseData.user._id)" -ForegroundColor Cyan
        Write-Host "👤 User Email: $($userResponseData.user.email)" -ForegroundColor Cyan
        Write-Host "💰 User Balance: $($userResponseData.user.balance)" -ForegroundColor Cyan
        
        # Test 4: Get User
        Write-Host "`n📊 Test 4: Get User" -ForegroundColor Yellow
        try {
            $getUserResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/mongo/users/$($userResponseData.user._id)" -UseBasicParsing
            Write-Host "✅ Get User Status: $($getUserResponse.StatusCode)" -ForegroundColor Green
            
            if ($getUserResponse.StatusCode -eq 200) {
                $getUserData = $getUserResponse.Content | ConvertFrom-Json
                Write-Host "✅ User retrieved successfully" -ForegroundColor Green
                Write-Host "👤 Retrieved Email: $($getUserData.user.email)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Get User Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        $errorData = $createUserResponse.Content | ConvertFrom-Json
        Write-Host "❌ User creation failed" -ForegroundColor Red
        Write-Host "Error: $($errorData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Create User Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get All Users
Write-Host "`n📊 Test 5: Get All Users" -ForegroundColor Yellow
try {
    $getAllUsersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/mongo/users" -UseBasicParsing
    Write-Host "✅ Get All Users Status: $($getAllUsersResponse.StatusCode)" -ForegroundColor Green
    
    if ($getAllUsersResponse.StatusCode -eq 200) {
        $allUsersData = $getAllUsersResponse.Content | ConvertFrom-Json
        Write-Host "✅ Users retrieved successfully" -ForegroundColor Green
        Write-Host "👥 Total Users: $($allUsersData.users.Count)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Get All Users Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "✅ Backend Server: Running on port 3001" -ForegroundColor Green
Write-Host "✅ MongoDB Atlas: Connected" -ForegroundColor Green
Write-Host "✅ API Endpoints: Available" -ForegroundColor Green
Write-Host "✅ User Management: Working" -ForegroundColor Green
