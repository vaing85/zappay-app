#!/usr/bin/env node

/**
 * Stripe Membership Setup Script
 * This script sets up the membership products and prices in Stripe for ZapPay
 */

const stripeSubscriptionService = require('./services/stripeSubscriptionService');
require('dotenv').config();

const MEMBERSHIP_PLANS = [
  {
    id: 'free',
    name: 'ZapPay Free',
    description: 'Perfect for personal use - Up to 25 transactions per month',
    price: 0.00,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 25 transactions per month',
      'Basic payment processing',
      'Email support',
      'Standard security',
      'Mobile app access'
    ],
    metadata: {
      plan_type: 'free',
      max_transactions: '25',
      support_level: 'email'
    }
  },
  {
    id: 'starter',
    name: 'ZapPay Starter',
    description: 'Essential features for individuals - Up to 250 transactions per month',
    price: 4.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 250 transactions per month',
      'Basic payment processing',
      'Email support',
      'Standard security',
      'Mobile app access',
      'Transaction history'
    ],
    metadata: {
      plan_type: 'starter',
      max_transactions: '250',
      support_level: 'email'
    }
  },
  {
    id: 'basic',
    name: 'ZapPay Basic',
    description: 'Great for small businesses - Up to 500 transactions per month',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 500 transactions per month',
      'Advanced payment processing',
      'Email support',
      'Enhanced security',
      'Mobile app access',
      'Transaction history',
      'Basic analytics'
    ],
    metadata: {
      plan_type: 'basic',
      max_transactions: '500',
      support_level: 'email'
    }
  },
  {
    id: 'pro',
    name: 'ZapPay Pro',
    description: 'Advanced features for growing businesses - Up to 1000 transactions per month',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 1000 transactions per month',
      'Advanced payment processing',
      'Priority support',
      'Enhanced security',
      'Mobile app access',
      'Transaction history',
      'Advanced analytics',
      'API access',
      'QR code payments'
    ],
    metadata: {
      plan_type: 'pro',
      max_transactions: '1000',
      support_level: 'priority'
    }
  },
  {
    id: 'business',
    name: 'ZapPay Business',
    description: 'Comprehensive features for established businesses - Up to 2500 transactions per month',
    price: 49.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 2500 transactions per month',
      'Premium payment processing',
      'Priority support',
      'Maximum security',
      'Mobile app access',
      'Transaction history',
      'Advanced analytics',
      'Full API access',
      'QR code payments',
      'Group payments',
      'Team management',
      'Custom branding'
    ],
    metadata: {
      plan_type: 'business',
      max_transactions: '2500',
      support_level: 'priority'
    }
  },
  {
    id: 'enterprise',
    name: 'ZapPay Enterprise',
    description: 'Full features for large organizations - Unlimited transactions',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited transactions',
      'Premium payment processing',
      '24/7 phone support',
      'Maximum security',
      'Mobile app access',
      'Transaction history',
      'Advanced analytics',
      'Full API access',
      'QR code payments',
      'Group payments',
      'Team management',
      'Custom branding',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options'
    ],
    metadata: {
      plan_type: 'enterprise',
      max_transactions: 'unlimited',
      support_level: 'dedicated'
    }
  }
];

async function setupMembershipPlans() {
  console.log('🚀 Setting up ZapPay membership plans in Stripe...\n');
  
  const results = {
    products: [],
    prices: [],
    errors: []
  };

  for (const plan of MEMBERSHIP_PLANS) {
    console.log(`📦 Creating product: ${plan.name}`);
    
    try {
      // Create product
      const productResult = await stripeSubscriptionService.createProduct({
        name: plan.name,
        description: plan.description,
        metadata: {
          ...plan.metadata,
          features: JSON.stringify(plan.features)
        },
        active: true
      });

      if (productResult.success) {
        console.log(`  ✅ Product created: ${productResult.product.id}`);
        results.products.push(productResult.product);

        // Create price for the product
        console.log(`  💰 Creating price: $${plan.price}/${plan.interval}`);
        
        const priceResult = await stripeSubscriptionService.createPrice({
          productId: productResult.product.id,
          unitAmount: plan.price,
          currency: plan.currency,
          recurring: {
            interval: plan.interval
          },
          metadata: {
            plan_id: plan.id,
            plan_type: plan.metadata.plan_type
          },
          active: true
        });

        if (priceResult.success) {
          console.log(`  ✅ Price created: ${priceResult.price.id}`);
          results.prices.push(priceResult.price);
        } else {
          console.log(`  ❌ Price creation failed: ${priceResult.error}`);
          results.errors.push({
            type: 'price',
            plan: plan.id,
            error: priceResult.error
          });
        }
      } else {
        console.log(`  ❌ Product creation failed: ${productResult.error}`);
        results.errors.push({
          type: 'product',
          plan: plan.id,
          error: productResult.error
        });
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error creating ${plan.name}: ${error.message}`);
      results.errors.push({
        type: 'general',
        plan: plan.id,
        error: error.message
      });
    }
  }

  // Print summary
  console.log('📊 Setup Summary:');
  console.log(`✅ Products created: ${results.products.length}/${MEMBERSHIP_PLANS.length}`);
  console.log(`✅ Prices created: ${results.prices.length}/${MEMBERSHIP_PLANS.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(error => {
      console.log(`  - ${error.type} for ${error.plan}: ${error.error}`);
    });
  }

  if (results.products.length > 0) {
    console.log('\n🎉 Membership plans setup completed!');
    console.log('\n📋 Product IDs:');
    results.products.forEach(product => {
      console.log(`  ${product.name}: ${product.id}`);
    });
    
    console.log('\n💰 Price IDs:');
    results.prices.forEach(price => {
      console.log(`  $${price.unitAmount / 100}/${price.recurring?.interval || 'one-time'}: ${price.id}`);
    });
  }

  return results;
}

async function verifySetup() {
  console.log('\n🔍 Verifying setup...');
  
  try {
    // Test getting membership plans
    const plans = stripeSubscriptionService.getMembershipPlans();
    console.log(`✅ Membership plans service: ${plans.length} plans available`);
    
    // Test Stripe connection
    const testResult = await stripeSubscriptionService.createProduct({
      name: 'Test Product',
      description: 'Test product for verification',
      metadata: { test: true }
    });
    
    if (testResult.success) {
      console.log('✅ Stripe connection: Working');
      
      // Clean up test product
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.products.del(testResult.product.id);
        console.log('✅ Test cleanup: Completed');
      } catch (cleanupError) {
        console.log(`⚠️ Test cleanup: ${cleanupError.message}`);
      }
    } else {
      console.log(`❌ Stripe connection: ${testResult.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
  }
}

async function main() {
  try {
    // Check if Stripe keys are configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
      console.log('Please set your Stripe secret key in the .env file');
      process.exit(1);
    }

    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      console.error('❌ STRIPE_PUBLISHABLE_KEY not found in environment variables');
      console.log('Please set your Stripe publishable key in the .env file');
      process.exit(1);
    }

    console.log('🔑 Stripe keys found, proceeding with setup...\n');

    // Setup membership plans
    const results = await setupMembershipPlans();
    
    // Verify setup
    await verifySetup();

    if (results.errors.length === 0) {
      console.log('\n🎉 All membership plans setup successfully!');
      console.log('\nNext steps:');
      console.log('1. Update your frontend with the product and price IDs');
      console.log('2. Configure webhook endpoints in Stripe dashboard');
      console.log('3. Test subscription creation and management');
    } else {
      console.log('\n⚠️ Setup completed with some errors. Please review and fix them.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  setupMembershipPlans,
  verifySetup,
  MEMBERSHIP_PLANS
};

