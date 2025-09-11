const axios = require('axios');
const { RAPYD_CONFIG, getRapydHeaders } = require('../config/rapyd');
const logger = require('../middleware/logger');

class RapydPaymentService {
  constructor() {
    this.baseURL = RAPYD_CONFIG.BASE_URL;
    this.accessKey = RAPYD_CONFIG.ACCESS_KEY;
    this.secretKey = RAPYD_CONFIG.SECRET_KEY;
  }

  /**
   * Create a payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response
   */
  async createPayment(paymentData) {
    try {
      const {
        amount,
        currency = RAPYD_CONFIG.DEFAULT_CURRENCY,
        paymentMethod,
        customerId,
        description,
        metadata = {},
        redirectUrl,
        cancelUrl
      } = paymentData;

      const paymentPayload = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toUpperCase(),
        payment_method: paymentMethod,
        customer: customerId,
        description: description || 'ZapPay Payment',
        metadata: {
          app: 'zappay',
          ...metadata
        },
        redirect_url: redirectUrl,
        cancel_url: cancelUrl,
        capture: true
      };

      const path = '/v1/payments';
      const body = JSON.stringify(paymentPayload);
      const headers = getRapydHeaders('POST', path, body);

      const response = await axios.post(`${this.baseURL}${path}`, paymentPayload, { headers });

      logger.info('Payment created successfully', {
        paymentId: response.data.data.id,
        amount: paymentData.amount,
        currency: paymentData.currency
      });

      return {
        success: true,
        paymentId: response.data.data.id,
        status: response.data.data.status,
        redirectUrl: response.data.data.redirect_url,
        data: response.data.data
      };

    } catch (error) {
      logger.error('Payment creation failed', {
        error: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Payment creation failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Create a P2P payment (wallet to wallet)
   * @param {Object} p2pData - P2P payment details
   * @returns {Promise<Object>} P2P payment response
   */
  async createP2PPayment(p2pData) {
    try {
      const {
        fromWalletId,
        toWalletId,
        amount,
        currency = RAPYD_CONFIG.DEFAULT_CURRENCY,
        description,
        metadata = {}
      } = p2pData;

      const p2pPayload = {
        source_ewallet: fromWalletId,
        destination_ewallet: toWalletId,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        description: description || 'ZapPay P2P Transfer',
        metadata: {
          app: 'zappay',
          type: 'p2p',
          ...metadata
        }
      };

      const path = '/v1/account/transfer';
      const body = JSON.stringify(p2pPayload);
      const headers = getRapydHeaders('POST', path, body);

      const response = await axios.post(`${this.baseURL}${path}`, p2pPayload, { headers });

      logger.info('P2P payment created successfully', {
        transferId: response.data.data.id,
        amount: p2pData.amount,
        currency: p2pData.currency
      });

      return {
        success: true,
        transferId: response.data.data.id,
        status: response.data.data.status,
        data: response.data.data
      };

    } catch (error) {
      logger.error('P2P payment creation failed', {
        error: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'P2P payment creation failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Create or get customer wallet
   * @param {Object} customerData - Customer details
   * @returns {Promise<Object>} Wallet response
   */
  async createCustomerWallet(customerData) {
    try {
      const {
        customerId,
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        currency = RAPYD_CONFIG.DEFAULT_CURRENCY
      } = customerData;

      // First, create or get customer
      const customerPayload = {
        id: customerId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        ewallet_reference_id: customerId
      };

      const customerPath = '/v1/customers';
      const customerBody = JSON.stringify(customerPayload);
      const customerHeaders = getRapydHeaders('POST', customerPath, customerBody);

      const customerResponse = await axios.post(`${this.baseURL}${customerPath}`, customerPayload, { headers: customerHeaders });

      // Create wallet for customer
      const walletPayload = {
        ewallet_reference_id: customerId,
        type: 'person',
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        contact: {
          phone_number: phoneNumber,
          email: email
        },
        metadata: {
          app: 'zappay',
          customer_id: customerId
        }
      };

      const walletPath = '/v1/user';
      const walletBody = JSON.stringify(walletPayload);
      const walletHeaders = getRapydHeaders('POST', walletPath, walletBody);

      const walletResponse = await axios.post(`${this.baseURL}${walletPath}`, walletPayload, { headers: walletHeaders });

      logger.info('Customer wallet created successfully', {
        customerId: customerId,
        walletId: walletResponse.data.data.id
      });

      return {
        success: true,
        customerId: customerResponse.data.data.id,
        walletId: walletResponse.data.data.id,
        data: walletResponse.data.data
      };

    } catch (error) {
      logger.error('Customer wallet creation failed', {
        error: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Customer wallet creation failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const path = `/v1/payments/${paymentId}`;
      const headers = getRapydHeaders('GET', path, '');

      const response = await axios.get(`${this.baseURL}${path}`, { headers });

      return {
        success: true,
        status: response.data.data.status,
        data: response.data.data
      };

    } catch (error) {
      logger.error('Payment status retrieval failed', {
        error: error.message,
        paymentId: paymentId
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Payment status retrieval failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentId - Payment ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund response
   */
  async refundPayment(paymentId, amount, reason = 'Refund requested') {
    try {
      const refundPayload = {
        payment: paymentId,
        amount: Math.round(amount * 100),
        reason: reason
      };

      const path = '/v1/refunds';
      const body = JSON.stringify(refundPayload);
      const headers = getRapydHeaders('POST', path, body);

      const response = await axios.post(`${this.baseURL}${path}`, refundPayload, { headers });

      logger.info('Payment refunded successfully', {
        paymentId: paymentId,
        refundId: response.data.data.id,
        amount: amount
      });

      return {
        success: true,
        refundId: response.data.data.id,
        status: response.data.data.status,
        data: response.data.data
      };

    } catch (error) {
      logger.error('Payment refund failed', {
        error: error.message,
        paymentId: paymentId
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Payment refund failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Get available payment methods for a country
   * @param {string} country - Country code
   * @returns {Promise<Object>} Available payment methods
   */
  async getPaymentMethods(country) {
    try {
      const path = `/v1/payment_methods/country?country=${country}`;
      const headers = getRapydHeaders('GET', path, '');

      const response = await axios.get(`${this.baseURL}${path}`, { headers });

      return {
        success: true,
        paymentMethods: response.data.data,
        data: response.data.data
      };

    } catch (error) {
      logger.error('Payment methods retrieval failed', {
        error: error.message,
        country: country
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Payment methods retrieval failed',
        details: error.response?.data
      };
    }
  }

  /**
   * Get wallet balance
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} Wallet balance
   */
  async getWalletBalance(walletId) {
    try {
      const path = `/v1/user/${walletId}/accounts`;
      const headers = getRapydHeaders('GET', path, '');

      const response = await axios.get(`${this.baseURL}${path}`, { headers });

      return {
        success: true,
        balance: response.data.data,
        data: response.data.data
      };

    } catch (error) {
      logger.error('Wallet balance retrieval failed', {
        error: error.message,
        walletId: walletId
      });

      return {
        success: false,
        error: error.response?.data?.status?.message || 'Wallet balance retrieval failed',
        details: error.response?.data
      };
    }
  }
}

module.exports = new RapydPaymentService();
