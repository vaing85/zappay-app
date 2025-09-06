#!/bin/bash

# ZapPay Backend DigitalOcean Deployment Script
echo "🚀 Starting ZapPay Backend Deployment on DigitalOcean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if doctl is installed
check_doctl() {
    echo -e "${BLUE}📋 Checking DigitalOcean CLI...${NC}"
    
    if ! command -v doctl &> /dev/null; then
        echo -e "${RED}❌ doctl is not installed. Please install it first:${NC}"
        echo "   curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv"
        echo "   sudo mv doctl /usr/local/bin"
        exit 1
    fi
    
    echo -e "${GREEN}✅ doctl is installed${NC}"
}

# Check if user is authenticated
check_auth() {
    echo -e "${BLUE}🔐 Checking DigitalOcean authentication...${NC}"
    
    if ! doctl account get &> /dev/null; then
        echo -e "${RED}❌ Not authenticated with DigitalOcean. Please run:${NC}"
        echo "   doctl auth init"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authenticated with DigitalOcean${NC}"
}

# Deploy using App Platform
deploy_app_platform() {
    echo -e "${BLUE}🚀 Deploying to DigitalOcean App Platform...${NC}"
    
    # Check if app exists
    if doctl apps list --format Name | grep -q "zappay-backend"; then
        echo -e "${YELLOW}⚠️ App already exists. Updating...${NC}"
        doctl apps update $(doctl apps list --format ID,Name | grep "zappay-backend" | awk '{print $1}') --spec .do/app.yaml
    else
        echo -e "${BLUE}📦 Creating new app...${NC}"
        doctl apps create --spec .do/app.yaml
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ App deployed successfully!${NC}"
        echo -e "${BLUE}🌐 Your API will be available at: https://your-app-name.ondigitalocean.app${NC}"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
}

# Deploy using Droplet
deploy_droplet() {
    echo -e "${BLUE}🖥️ Deploying to DigitalOcean Droplet...${NC}"
    
    # Create droplet
    echo -e "${BLUE}📦 Creating droplet...${NC}"
    doctl compute droplet create zappay-backend \
        --image ubuntu-22-04-x64 \
        --size s-1vcpu-1gb \
        --region nyc1 \
        --ssh-keys $(doctl compute ssh-key list --format ID,Name | head -n 2 | tail -n 1 | awk '{print $1}') \
        --wait
    
    # Get droplet IP
    DROPLET_IP=$(doctl compute droplet list --format Name,PublicIPv4 | grep "zappay-backend" | awk '{print $2}')
    
    echo -e "${GREEN}✅ Droplet created with IP: $DROPLET_IP${NC}"
    echo -e "${YELLOW}⚠️ Please manually configure the droplet:${NC}"
    echo "   1. SSH into the droplet: ssh root@$DROPLET_IP"
    echo "   2. Follow the manual setup instructions in deploy-digitalocean.md"
}

# Deploy using Kubernetes
deploy_kubernetes() {
    echo -e "${BLUE}☸️ Deploying to DigitalOcean Kubernetes...${NC}"
    
    # Check if cluster exists
    if doctl kubernetes cluster list --format Name | grep -q "zappay-cluster"; then
        echo -e "${YELLOW}⚠️ Cluster already exists${NC}"
        CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name | grep "zappay-cluster" | awk '{print $1}')
    else
        echo -e "${BLUE}📦 Creating Kubernetes cluster...${NC}"
        doctl kubernetes cluster create zappay-cluster \
            --region nyc1 \
            --version 1.28.2-do.0 \
            --node-pool "name=worker-pool;size=s-1vcpu-2gb;count=1" \
            --wait
        CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name | grep "zappay-cluster" | awk '{print $1}')
    fi
    
    echo -e "${GREEN}✅ Kubernetes cluster ready: $CLUSTER_ID${NC}"
    echo -e "${YELLOW}⚠️ Please manually deploy your application to the cluster${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}⚡ ZapPay Backend DigitalOcean Deployment${NC}"
    echo "=============================================="
    
    check_doctl
    check_auth
    
    echo ""
    echo "Choose deployment method:"
    echo "1) App Platform (Recommended - Easiest)"
    echo "2) Droplet (More Control)"
    echo "3) Kubernetes (Advanced)"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            deploy_app_platform
            ;;
        2)
            deploy_droplet
            ;;
        3)
            deploy_kubernetes
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment process completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables"
    echo "2. Set up your domain and SSL"
    echo "3. Test your API endpoints"
    echo "4. Update your frontend to use the new API URL"
    echo "5. Deploy your frontend application"
}

# Run main function
main "$@"
