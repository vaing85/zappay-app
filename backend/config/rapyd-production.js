const crypto = require('crypto');

/**
 * Rapyd Production Configuration
 * This configuration is optimized for production deployment with Rapyd
 */

const RAPYD_PRODUCTION_CONFIG = {
  // Production API Configuration
  ACCESS_KEY: process.env.RAPYD_ACCESS_KEY,
  SECRET_KEY: process.env.RAPYD_SECRET_KEY,
  BASE_URL: process.env.RAPYD_BASE_URL || 'https://api.rapyd.net',
  
  // Webhook Configuration
  WEBHOOK_SECRET: process.env.RAPYD_WEBHOOK_SECRET,
  
  // Merchant Account Configuration
  MERCHANT_ACCOUNT: process.env.RAPYD_MERCHANT_ACCOUNT,
  
  // P2P Configuration
  P2P_ENABLED: process.env.RAPYD_P2P_ENABLED === 'true',
  
  // Production Security Settings
  SIGNATURE_TIMEOUT: 300, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Supported Countries for Production
  SUPPORTED_COUNTRIES: [
    'US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH',
    'AU', 'JP', 'SG', 'HK', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE',
    'NZ', 'NO', 'SE', 'DK', 'FI', 'IE', 'PT', 'GR', 'CZ', 'HU', 'PL',
    'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU'
  ],
  
  // Production Payment Methods
  PAYMENT_METHODS: {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    E_WALLET: 'ewallet',
    CASH: 'cash',
    BANK_REDIRECT: 'bank_redirect',
    MOBILE_MONEY: 'mobile_money',
    DIGITAL_WALLET: 'digital_wallet',
    CRYPTOCURRENCY: 'cryptocurrency'
  },
  
  // Production Currency Configuration
  DEFAULT_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'HKD', 'INR', 
    'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'NZD', 'NOK', 'SEK', 
    'DKK', 'CHF', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD'
  ],
  
  // Production Limits
  MIN_PAYMENT_AMOUNT: 0.01,
  MAX_PAYMENT_AMOUNT: 100000,
  DAILY_LIMIT: 10000,
  MONTHLY_LIMIT: 100000,
  
  // Production Webhook URLs
  WEBHOOK_URLS: {
    PAYMENT_SUCCESS: process.env.RAPYD_WEBHOOK_SUCCESS_URL || '/api/payments/webhook/success',
    PAYMENT_FAILED: process.env.RAPYD_WEBHOOK_FAILED_URL || '/api/payments/webhook/failed',
    PAYMENT_PENDING: process.env.RAPYD_WEBHOOK_PENDING_URL || '/api/payments/webhook/pending',
    REFUND_SUCCESS: process.env.RAPYD_WEBHOOK_REFUND_URL || '/api/payments/webhook/refund'
  },
  
  // Production Error Handling
  ERROR_CODES: {
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
    PAYMENT_DECLINED: 'PAYMENT_DECLINED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    INVALID_SIGNATURE: 'INVALID_SIGNATURE'
  }
};

/**
 * Enhanced signature generation for production
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {string} body - Request body
 * @param {string} salt - Random salt
 * @returns {string} Signature (BASE64 encoded)
 */
function generateProductionSignature(method, path, body, salt) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = method + path + salt + timestamp + RAPYD_PRODUCTION_CONFIG.ACCESS_KEY + RAPYD_PRODUCTION_CONFIG.SECRET_KEY + body;
  return crypto.createHmac('sha256', RAPYD_PRODUCTION_CONFIG.SECRET_KEY).update(toSign).digest('base64');
}

/**
 * Generate cryptographically secure salt for production
 * @returns {string} Random salt
 */
function generateProductionSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Get production Rapyd headers with enhanced security
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {string} body - Request body
 * @returns {Object} Headers object
 */
function getProductionRapydHeaders(method, path, body) {
  const salt = generateProductionSalt();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateProductionSignature(method, path, body, salt);
  
  return {
    'access_key': RAPYD_PRODUCTION_CONFIG.ACCESS_KEY,
    'salt': salt,
    'timestamp': timestamp,
    'signature': signature,
    'Content-Type': 'application/json',
    'User-Agent': 'ZapPay-Production/1.0.0'
  };
}

/**
 * Enhanced webhook signature validation for production
 * @param {string} signature - Webhook signature (BASE64 encoded)
 * @param {string} body - Webhook body
 * @param {string} salt - Webhook salt
 * @param {string} timestamp - Webhook timestamp
 * @param {string} urlPath - Webhook URL path
 * @returns {boolean} Valid signature
 */
function validateProductionWebhookSignature(signature, body, salt, timestamp, urlPath = '/api/payments/webhook') {
  // Check timestamp to prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  const webhookTime = parseInt(timestamp);
  
  if (Math.abs(currentTime - webhookTime) > RAPYD_PRODUCTION_CONFIG.SIGNATURE_TIMEOUT) {
    return false;
  }
  
  // Validate signature
  const toSign = urlPath + salt + timestamp + RAPYD_PRODUCTION_CONFIG.ACCESS_KEY + RAPYD_PRODUCTION_CONFIG.SECRET_KEY + body;
  const expectedSignature = crypto.createHmac('sha256', RAPYD_PRODUCTION_CONFIG.SECRET_KEY).update(toSign).digest('base64');
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Validate payment amount for production limits
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 * @returns {Object} Validation result
 */
function validatePaymentAmount(amount, currency = 'USD') {
  const minAmount = RAPYD_PRODUCTION_CONFIG.MIN_PAYMENT_AMOUNT;
  const maxAmount = RAPYD_PRODUCTION_CONFIG.MAX_PAYMENT_AMOUNT;
  
  if (amount < minAmount) {
    return {
      valid: false,
      error: 'Payment amount too small',
      code: 'AMOUNT_TOO_SMALL',
      minAmount
    };
  }
  
  if (amount > maxAmount) {
    return {
      valid: false,
      error: 'Payment amount too large',
      code: 'AMOUNT_TOO_LARGE',
      maxAmount
    };
  }
  
  return { valid: true };
}

/**
 * Validate country for production support
 * @param {string} country - Country code
 * @returns {boolean} Country supported
 */
function isCountrySupported(country) {
  return RAPYD_PRODUCTION_CONFIG.SUPPORTED_COUNTRIES.includes(country.toUpperCase());
}

/**
 * Validate currency for production support
 * @param {string} currency - Currency code
 * @returns {boolean} Currency supported
 */
function isCurrencySupported(currency) {
  return RAPYD_PRODUCTION_CONFIG.SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}

/**
 * Get production error message
 * @param {string} errorCode - Error code
 * @returns {string} User-friendly error message
 */
function getProductionErrorMessage(errorCode) {
  const errorMessages = {
    INSUFFICIENT_FUNDS: 'Insufficient funds in your account',
    INVALID_PAYMENT_METHOD: 'Invalid payment method selected',
    PAYMENT_DECLINED: 'Payment was declined by your bank',
    NETWORK_ERROR: 'Network error occurred. Please try again.',
    TIMEOUT: 'Request timed out. Please try again.',
    INVALID_SIGNATURE: 'Security validation failed',
    AMOUNT_TOO_SMALL: 'Payment amount is too small',
    AMOUNT_TOO_LARGE: 'Payment amount exceeds limit',
    COUNTRY_NOT_SUPPORTED: 'Country not supported',
    CURRENCY_NOT_SUPPORTED: 'Currency not supported'
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred';
}

module.exports = {
  RAPYD_PRODUCTION_CONFIG,
  generateProductionSignature,
  generateProductionSalt,
  getProductionRapydHeaders,
  validateProductionWebhookSignature,
  validatePaymentAmount,
  isCountrySupported,
  isCurrencySupported,
  getProductionErrorMessage
};
