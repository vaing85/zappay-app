#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set for ZapPay production
 */

// Load environment variables from .env file
require('dotenv').config();

const requiredEnvVars = {
  // Server Configuration
  NODE_ENV: { required: true, type: 'string' },
  PORT: { required: true, type: 'number' },
  HOST: { required: true, type: 'string' },

  // Database Configuration (MongoDB only)

  // MongoDB Configuration (Primary Database)
  MONGODB_URI: { required: true, type: 'string', secret: true },
  MONGODB_DB_NAME: { required: true, type: 'string' },

  // Redis Configuration
  REDIS_URL: { required: true, type: 'string', secret: true },
  REDIS_PASSWORD: { required: true, type: 'string', secret: true },

  // JWT Configuration
  JWT_SECRET: { required: true, type: 'string', secret: true },
  JWT_EXPIRES_IN: { required: true, type: 'string' },
  REFRESH_TOKEN_SECRET: { required: true, type: 'string', secret: true },

  // Stripe Configuration
  STRIPE_SECRET_KEY: { required: true, type: 'string', secret: true },
  STRIPE_PUBLISHABLE_KEY: { required: true, type: 'string' },
  STRIPE_WEBHOOK_SECRET: { required: true, type: 'string', secret: true },

  // Email Configuration
  SENDGRID_API_KEY: { required: true, type: 'string', secret: true },
  FROM_EMAIL: { required: true, type: 'string' },


  // Security Configuration
  SSN_ENCRYPTION__KEY: { required: true, type: 'string', secret: true },
  BCRYPT_ROUNDS: { required: true, type: 'number' },

  // CORS Configuration
  CORS_ORIGIN: { required: true, type: 'string' },
  ALLOWED_ORIGINS: { required: true, type: 'string' },

  // Frontend Configuration
  FRONTEND_URL: { required: true, type: 'string' },

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: { required: true, type: 'number' },
  RATE_LIMIT_MAX_REQUESTS: { required: true, type: 'number' }
};

const optionalEnvVars = {
  // Logging
  LOG_LEVEL: { type: 'string', default: 'info' },
  LOG_FILE: { type: 'string', default: './logs/app.log' },

  // File Upload
  MAX_FILE_SIZE: { type: 'number', default: 5242880 },
  UPLOAD_PATH: { type: 'string', default: './uploads' },

  // Monitoring
  SENTRY_DSN: { type: 'string' },
  NEW_RELIC_LICENSE_KEY: { type: 'string' },

  // SMS Configuration (Optional)
  TWILIO_ACCOUNT_SID: { type: 'string', secret: true },
  TWILIO_AUTH_TOKEN: { type: 'string', secret: true },
  TWILIO_PHONE_NUMBER: { type: 'string' },

  // Rapyd Configuration (Optional)
  RAPYD_ACCESS_KEY: { type: 'string', secret: true },
  RAPYD_SECRET_KEY: { type: 'string', secret: true },
  RAPYD_WEBHOOK_SECRET: { type: 'string', secret: true },
  RAPYD_MERCHANT_ACCOUNT: { type: 'string' },
  RAPYD_P2P_ENABLED: { type: 'string' }
};

function validateEnvironment() {
  console.log('🔍 Validating ZapPay Environment Variables...\n');
  
  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // Check required environment variables
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    
    if (!value) {
      errors.push(`❌ Missing required environment variable: ${key}`);
      hasErrors = true;
      continue;
    }

    // Type validation
    if (config.type === 'number') {
      if (isNaN(Number(value))) {
        errors.push(`❌ ${key} must be a number, got: ${value}`);
        hasErrors = true;
      }
    } else if (config.type === 'boolean') {
      if (!['true', 'false'].includes(value.toLowerCase())) {
        errors.push(`❌ ${key} must be a boolean (true/false), got: ${value}`);
        hasErrors = true;
      }
    }

    // Security check for secrets
    if (config.secret && value.includes('**********')) {
      warnings.push(`⚠️  ${key} appears to be a placeholder value`);
    }
  }

  // Check optional environment variables
  for (const [key, config] of Object.entries(optionalEnvVars)) {
    const value = process.env[key];
    
    if (!value && config.default) {
      console.log(`ℹ️  ${key} not set, using default: ${config.default}`);
    }
  }

  // Security validations
  if (process.env.NODE_ENV === 'production') {
    if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY.includes('pk_test_')) {
      warnings.push('⚠️  Using Stripe test key in production environment');
    }
    
    if (process.env.FROM_EMAIL && !process.env.FROM_EMAIL.includes('@')) {
      errors.push('❌ FROM_EMAIL must be a valid email address');
      hasErrors = true;
    }
  }

  // Display results
  if (errors.length > 0) {
    console.log('❌ Validation Errors:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }

  if (!hasErrors) {
    console.log('✅ All required environment variables are properly configured!');
    
    // Display summary
    console.log('\n📊 Environment Summary:');
    console.log(`  Environment: ${process.env.NODE_ENV}`);
    console.log(`  Port: ${process.env.PORT}`);
    console.log(`  Database: MongoDB (${process.env.MONGODB_DB_NAME})`);
    console.log(`  Redis: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
    console.log(`  Stripe: ${process.env.STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`  Frontend URL: ${process.env.FRONTEND_URL}`);
  } else {
    console.log('❌ Environment validation failed!');
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment, requiredEnvVars, optionalEnvVars };
