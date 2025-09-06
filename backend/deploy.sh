#!/bin/bash

# ZapPay Backend Deployment Script
echo "🚀 Starting ZapPay Backend Deployment..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install --production
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
}

# Check environment variables
check_env() {
    echo "🔧 Checking environment variables..."
    
    required_vars=(
        "NODE_ENV"
        "PORT"
        "DB_URL"
        "JWT_SECRET"
        "REFRESH_TOKEN_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo "Please set these variables before running the deployment."
        exit 1
    fi
    
    echo "✅ Environment variables check passed"
}

# Run database migrations
run_migrations() {
    echo "🗄️ Running database migrations..."
    if [ -f "scripts/migrate.js" ]; then
        node scripts/migrate.js
        if [ $? -eq 0 ]; then
            echo "✅ Database migrations completed"
        else
            echo "❌ Database migrations failed"
            exit 1
        fi
    else
        echo "⚠️ No migration script found, skipping..."
    fi
}

# Start the application
start_app() {
    echo "🚀 Starting ZapPay Backend..."
    
    # Check if PM2 is available
    if command -v pm2 &> /dev/null; then
        echo "Using PM2 to start the application..."
        pm2 start server.js --name zappay-backend
        pm2 save
        echo "✅ Application started with PM2"
    else
        echo "Starting application directly..."
        node server.js
    fi
}

# Health check
health_check() {
    echo "🏥 Performing health check..."
    sleep 5
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-3001}/health)
        if [ "$response" = "200" ]; then
            echo "✅ Health check passed"
        else
            echo "❌ Health check failed (HTTP $response)"
            exit 1
        fi
    else
        echo "⚠️ curl not available, skipping health check"
    fi
}

# Main deployment function
main() {
    echo "⚡ ZapPay Backend Deployment Script"
    echo "=================================="
    
    check_requirements
    install_dependencies
    check_env
    run_migrations
    start_app
    health_check
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "Your ZapPay backend is now running on port ${PORT:-3001}"
    echo "Health check: http://localhost:${PORT:-3001}/health"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend to use this API URL"
    echo "2. Configure your domain and SSL"
    echo "3. Set up monitoring and alerts"
    echo "4. Test all endpoints thoroughly"
}

# Run main function
main "$@"
