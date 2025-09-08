#!/usr/bin/env node

// Startup check script to diagnose deployment issues
console.log('🔍 ZapPay Backend Startup Check');
console.log('================================');

// Check Node.js version
console.log(`📊 Node.js version: ${process.version}`);

// Check environment variables
console.log('\n📝 Environment Variables:');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_URL',
  'REDIS_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'SENDGRID_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: set`);
  } else {
    console.log(`  ❌ ${envVar}: not set`);
  }
});

// Check if we can require the main modules
console.log('\n📦 Module Dependencies:');
try {
  require('express');
  console.log('  ✅ express: available');
} catch (error) {
  console.log('  ❌ express: not available');
}

try {
  require('sequelize');
  console.log('  ✅ sequelize: available');
} catch (error) {
  console.log('  ❌ sequelize: not available');
}

try {
  require('redis');
  console.log('  ✅ redis: available');
} catch (error) {
  console.log('  ❌ redis: not available');
}

try {
  require('stripe');
  console.log('  ✅ stripe: available');
} catch (error) {
  console.log('  ❌ stripe: not available');
}

// Check if server.js can be loaded
console.log('\n🚀 Server File Check:');
try {
  require('./server.js');
  console.log('  ✅ server.js: can be loaded');
} catch (error) {
  console.log('  ❌ server.js: cannot be loaded');
  console.log(`  📝 Error: ${error.message}`);
}

console.log('\n✅ Startup check completed');
