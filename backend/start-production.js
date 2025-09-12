#!/usr/bin/env node

/**
 * Production Startup Script for ZapPay
 * Handles missing environment variables gracefully
 */

const fs = require('fs');
const path = require('path');

// Check for required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET'
];

const optionalEnvVars = [
  'RAPYD_ACCESS_KEY',
  'RAPYD_SECRET_KEY',
  'RAPYD_WEBHOOK_SECRET',
  'RAPYD_MERCHANT_ACCOUNT',
  'REDIS_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'SENDGRID_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN'
];

console.log('🚀 Starting ZapPay Production Server...');
console.log('📋 Environment Check:');

// Check required variables
let missingRequired = [];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingRequired.push(envVar);
    console.log(`❌ ${envVar}: Missing`);
  } else {
    console.log(`✅ ${envVar}: Set`);
  }
});

// Check optional variables
let missingOptional = [];
optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingOptional.push(envVar);
    console.log(`⚠️  ${envVar}: Missing (optional)`);
  } else {
    console.log(`✅ ${envVar}: Set`);
  }
});

// Handle missing required variables
if (missingRequired.length > 0) {
  console.error('🚨 CRITICAL: Missing required environment variables:');
  missingRequired.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('💡 Please set these environment variables in DigitalOcean App Platform');
  process.exit(1);
}

// Handle missing optional variables
if (missingOptional.length > 0) {
  console.warn('⚠️  WARNING: Missing optional environment variables:');
  missingOptional.forEach(envVar => {
    console.warn(`   - ${envVar}`);
  });
  console.warn('💡 Some features may not work properly without these variables');
}

// Set defaults for missing optional variables
if (!process.env.RAPYD_ACCESS_KEY) {
  console.log('🔧 Setting Rapyd to disabled mode');
  process.env.RAPYD_P2P_ENABLED = 'false';
}

if (!process.env.REDIS_URL) {
  console.log('🔧 Setting Redis to disabled mode');
  process.env.REDIS_ENABLED = 'false';
}

// Log configuration
console.log('\n📊 Configuration Summary:');
console.log(`   Environment: ${process.env.NODE_ENV}`);
console.log(`   Port: ${process.env.PORT}`);
console.log(`   Database: ${process.env.DB_URL ? 'Connected' : 'Not configured'}`);
console.log(`   Redis: ${process.env.REDIS_URL ? 'Enabled' : 'Disabled'}`);
console.log(`   Rapyd: ${process.env.RAPYD_ACCESS_KEY ? 'Enabled' : 'Disabled'}`);
console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Enabled' : 'Disabled'}`);
console.log(`   Email: ${process.env.SENDGRID_API_KEY ? 'Enabled' : 'Disabled'}`);
console.log(`   SMS: ${process.env.TWILIO_ACCOUNT_SID ? 'Enabled' : 'Disabled'}`);

console.log('\n🚀 Starting server...');

// Start the server
try {
  require('./server-production.js');
} catch (error) {
  console.error('💥 Failed to start server:', error.message);
  console.error('📝 Stack trace:', error.stack);
  process.exit(1);
}
