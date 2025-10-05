const logger = require('../middleware/logger');

/**
 * Fee Service
 * Handles fee calculations for ZapPay transactions
 */
class FeeService {
  constructor() {
    // Fee structure for external payments
    this.feeStructure = {
      card: {
        percentage: 2.5,
        fixed: 0.30,
        description: 'Card payment processing'
      },
      bank: {
        percentage: 1.5,
        fixed: 0.25,
        description: 'Bank transfer processing'
      },
      international: {
        percentage: 3.0,
        fixed: 0.50,
        description: 'International transfer processing'
      },
      instant: {
        percentage: 1.0,
        fixed: 0.20,
        description: 'Instant transfer processing'
      }
    };

    // Minimum and maximum fee limits
    this.feeLimits = {
      minimum: 0.50,
      maximum: 50.00
    };
  }

  /**
   * Calculate fee for external payment
   * @param {number} amount - Transaction amount
   * @param {string} paymentType - Type of payment (card, bank, international, instant)
   * @returns {Object} Fee calculation result
   */
  calculateExternalFee(amount, paymentType = 'card') {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const feeConfig = this.feeStructure[paymentType];
      if (!feeConfig) {
        throw new Error(`Invalid payment type: ${paymentType}`);
      }

      // Calculate percentage fee
      const percentageFee = (amount * feeConfig.percentage) / 100;
      
      // Calculate total fee
      const totalFee = percentageFee + feeConfig.fixed;
      
      // Apply minimum and maximum limits
      const finalFee = Math.max(
        this.feeLimits.minimum,
        Math.min(totalFee, this.feeLimits.maximum)
      );

      const result = {
        success: true,
        fee: {
          amount: finalFee,
          percentage: feeConfig.percentage,
          fixed: feeConfig.fixed,
          paymentType: paymentType,
          description: feeConfig.description,
          breakdown: {
            percentageAmount: percentageFee,
            fixedAmount: feeConfig.fixed,
            total: finalFee
          }
        },
        transaction: {
          originalAmount: amount,
          totalAmount: amount + finalFee,
          feePercentage: ((finalFee / amount) * 100).toFixed(2)
        }
      };

      logger.info('Fee calculated successfully', {
        amount: amount,
        paymentType: paymentType,
        fee: finalFee,
        totalAmount: amount + finalFee
      });

      return result;

    } catch (error) {
      logger.error('Fee calculation failed', {
        error: error.message,
        amount: amount,
        paymentType: paymentType
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate fee for internal transfer (always free)
   * @param {number} amount - Transaction amount
   * @returns {Object} Fee calculation result
   */
  calculateInternalFee(amount) {
    return {
      success: true,
      fee: {
        amount: 0.00,
        percentage: 0.00,
        fixed: 0.00,
        paymentType: 'internal',
        description: 'Internal ZapPay transfer (free)',
        breakdown: {
          percentageAmount: 0.00,
          fixedAmount: 0.00,
          total: 0.00
        }
      },
      transaction: {
        originalAmount: amount,
        totalAmount: amount,
        feePercentage: '0.00'
      }
    };
  }

  /**
   * Calculate fee for adding money to ZapPay account (always free)
   * @param {number} amount - Deposit amount
   * @returns {Object} Fee calculation result
   */
  calculateDepositFee(amount) {
    return {
      success: true,
      fee: {
        amount: 0.00,
        percentage: 0.00,
        fixed: 0.00,
        paymentType: 'deposit',
        description: 'Adding money to ZapPay account (free)',
        breakdown: {
          percentageAmount: 0.00,
          fixedAmount: 0.00,
          total: 0.00
        }
      },
      transaction: {
        originalAmount: amount,
        totalAmount: amount,
        feePercentage: '0.00'
      }
    };
  }

  /**
   * Determine if transaction is internal or external
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Recipient user ID
   * @param {string} paymentMethod - Payment method used
   * @param {string} transactionType - Type of transaction (deposit, withdrawal, transfer, payment)
   * @returns {boolean} True if internal, false if external
   */
  isInternalTransaction(fromUserId, toUserId, paymentMethod = null, transactionType = 'transfer') {
    // Deposits to ZapPay accounts are always free (internal)
    if (transactionType === 'deposit' || transactionType === 'add_money') {
      return true;
    }

    // If both users are ZapPay users and no external payment method, it's internal
    if (fromUserId && toUserId && !paymentMethod) {
      return true;
    }

    // Withdrawals and external payments have fees
    if (transactionType === 'withdrawal' || transactionType === 'external_payment') {
      return false;
    }

    // If payment method is specified for transfers, it's external
    if (paymentMethod && ['card', 'bank', 'international', 'instant'].includes(paymentMethod)) {
      return false;
    }

    // Default to internal for ZapPay to ZapPay transfers
    return true;
  }

  /**
   * Get fee structure information
   * @returns {Object} Fee structure details
   */
  getFeeStructure() {
    return {
      success: true,
      feeStructure: this.feeStructure,
      feeLimits: this.feeLimits,
      internal: {
        fee: 0.00,
        description: 'Free internal transfers between ZapPay users'
      },
      deposits: {
        fee: 0.00,
        description: 'Free deposits to ZapPay accounts (encourages adoption)'
      },
      withdrawals: {
        fee: 'Variable',
        description: 'Fees apply when withdrawing money from ZapPay accounts'
      }
    };
  }

  /**
   * Calculate monthly revenue projection
   * @param {number} userCount - Number of users
   * @param {Object} userDistribution - Distribution of users across tiers
   * @param {Object} transactionStats - Average transactions per user
   * @returns {Object} Revenue projection
   */
  calculateRevenueProjection(userCount, userDistribution, transactionStats) {
    try {
      // Subscription revenue calculation
      const subscriptionRevenue = this.calculateSubscriptionRevenue(userCount, userDistribution);
      
      // Transaction fee revenue calculation
      const transactionFeeRevenue = this.calculateTransactionFeeRevenue(userCount, transactionStats);
      
      const totalRevenue = subscriptionRevenue + transactionFeeRevenue;

      return {
        success: true,
        projection: {
          userCount: userCount,
          subscriptionRevenue: subscriptionRevenue,
          transactionFeeRevenue: transactionFeeRevenue,
          totalRevenue: totalRevenue,
          annualRevenue: totalRevenue * 12,
          breakdown: {
            subscriptionPercentage: ((subscriptionRevenue / totalRevenue) * 100).toFixed(1),
            transactionFeePercentage: ((transactionFeeRevenue / totalRevenue) * 100).toFixed(1)
          }
        }
      };

    } catch (error) {
      logger.error('Revenue projection calculation failed', {
        error: error.message,
        userCount: userCount
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate subscription revenue
   * @param {number} userCount - Total number of users
   * @param {Object} distribution - User distribution across tiers
   * @returns {number} Monthly subscription revenue
   */
  calculateSubscriptionRevenue(userCount, distribution) {
    const tierPricing = {
      free: 0.00,
      starter: 4.99,
      basic: 9.99,
      pro: 19.99,
      business: 49.99,
      enterprise: 99.99
    };

    let totalRevenue = 0;
    
    Object.keys(distribution).forEach(tier => {
      const userCountForTier = Math.round(userCount * (distribution[tier] / 100));
      const tierRevenue = userCountForTier * tierPricing[tier];
      totalRevenue += tierRevenue;
    });

    return totalRevenue;
  }

  /**
   * Calculate transaction fee revenue
   * @param {number} userCount - Total number of users
   * @param {Object} stats - Transaction statistics
   * @returns {number} Monthly transaction fee revenue
   */
  calculateTransactionFeeRevenue(userCount, stats) {
    const {
      averageTransactionsPerUser = 20,
      averageTransactionAmount = 75,
      externalTransactionPercentage = 30 // 30% of transactions are external
    } = stats;

    const externalTransactions = userCount * averageTransactionsPerUser * (externalTransactionPercentage / 100);
    const averageFee = this.calculateExternalFee(averageTransactionAmount, 'card').fee.amount;
    
    return externalTransactions * averageFee;
  }
}

module.exports = new FeeService();
