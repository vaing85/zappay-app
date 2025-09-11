const crypto = require('crypto');

const RAPYD_CONFIG = {
  // Rapyd API Configuration
  ACCESS_KEY: process.env.RAPYD_ACCESS_KEY,
  SECRET_KEY: process.env.RAPYD_SECRET_KEY,
  BASE_URL: process.env.RAPYD_BASE_URL || 'https://sandboxapi.rapyd.net', // Use 'https://api.rapyd.net' for production
  
  // Webhook Configuration
  WEBHOOK_SECRET: process.env.RAPYD_WEBHOOK_SECRET,
  
  // Multi-app Configuration
  MERCHANT_ACCOUNT: process.env.RAPYD_MERCHANT_ACCOUNT,
  
  // P2P Configuration
  P2P_ENABLED: process.env.RAPYD_P2P_ENABLED === 'true',
  
  // Supported Countries (expand as needed)
  SUPPORTED_COUNTRIES: [
    'US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH',
    'AU', 'JP', 'SG', 'HK', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE'
  ],
  
  // Supported Payment Methods
  PAYMENT_METHODS: {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    E_WALLET: 'ewallet',
    CASH: 'cash',
    BANK_REDIRECT: 'bank_redirect',
    MOBILE_MONEY: 'mobile_money'
  },
  
  // Currency Configuration
  DEFAULT_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'HKD', 'INR', 'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN']
};

/**
 * Generate Rapyd signature for API authentication
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {string} body - Request body
 * @param {string} salt - Random salt
 * @returns {string} Signature (BASE64 encoded)
 */
function generateSignature(method, path, body, salt) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = method + path + salt + timestamp + RAPYD_CONFIG.ACCESS_KEY + RAPYD_CONFIG.SECRET_KEY + body;
  return crypto.createHmac('sha256', RAPYD_CONFIG.SECRET_KEY).update(toSign).digest('base64');
}

/**
 * Generate random salt for API requests
 * @returns {string} Random salt
 */
function generateSalt() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * Get Rapyd headers for API requests
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {string} body - Request body
 * @returns {Object} Headers object
 */
function getRapydHeaders(method, path, body) {
  const salt = generateSalt();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(method, path, body, salt);
  
  return {
    'access_key': RAPYD_CONFIG.ACCESS_KEY,
    'salt': salt,
    'timestamp': timestamp,
    'signature': signature,
    'Content-Type': 'application/json'
  };
}

/**
 * Validate Rapyd webhook signature
 * @param {string} signature - Webhook signature (BASE64 encoded)
 * @param {string} body - Webhook body
 * @param {string} salt - Webhook salt
 * @param {string} timestamp - Webhook timestamp
 * @param {string} urlPath - Webhook URL path
 * @returns {boolean} Valid signature
 */
function validateWebhookSignature(signature, body, salt, timestamp, urlPath = '/api/payments/webhook') {
  // Rapyd signature format: BASE64(HASH(url_path + salt + timestamp + access_key + secret_key + body_string))
  const toSign = urlPath + salt + timestamp + RAPYD_CONFIG.ACCESS_KEY + RAPYD_CONFIG.SECRET_KEY + body;
  const expectedSignature = crypto.createHmac('sha256', RAPYD_CONFIG.SECRET_KEY).update(toSign).digest('base64');
  return signature === expectedSignature;
}

module.exports = {
  RAPYD_CONFIG,
  generateSignature,
  generateSalt,
  getRapydHeaders,
  validateWebhookSignature
};
