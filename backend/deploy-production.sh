#!/bin/bash

# ZapPay Production Deployment Script
# This script deploys ZapPay to DigitalOcean App Platform

echo "🚀 Deploying ZapPay to Production..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl is not installed. Please install it first:"
    echo "   https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if user is authenticated
if ! doctl account get &> /dev/null; then
    echo "❌ Not authenticated with DigitalOcean. Please run:"
    echo "   doctl auth init"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup-production.sh first."
    exit 1
fi

# Check if app.yaml exists
if [ ! -f .do/app.yaml ]; then
    echo "❌ .do/app.yaml not found. Please create it first."
    exit 1
fi

# Create the app
echo "📦 Creating DigitalOcean App..."
doctl apps create --spec .do/app.yaml

# Get the app ID
APP_ID=$(doctl apps list --format ID,Name --no-header | grep zappay-api | awk '{print $1}')

if [ -z "$APP_ID" ]; then
    echo "❌ Failed to create app or get app ID"
    exit 1
fi

echo "✅ App created with ID: $APP_ID"

# Deploy the app
echo "🚀 Deploying app..."
doctl apps create-deployment $APP_ID

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
doctl apps get-deployment $APP_ID --wait

# Get the app URL
APP_URL=$(doctl apps get $APP_ID --format DefaultIngress --no-header)

echo "🎉 Deployment complete!"
echo "📱 App URL: $APP_URL"
echo "🏥 Health check: $APP_URL/health"
echo "📊 Metrics: $APP_URL/metrics"

# Test the deployment
echo "🧪 Testing deployment..."
if curl -f -s "$APP_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Update your frontend to use the new API URL: $APP_URL"
echo "2. Set up your domain and SSL certificates"
echo "3. Configure monitoring and alerts"
echo "4. Test all functionality"
echo "5. Deploy to app stores"
