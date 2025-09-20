// Transaction Limits Middleware for Regulatory Compliance
// Implements transaction limits based on user verification level and regulations

const logger = require('./logger');

class TransactionLimitsService {
  constructor() {
    this.limits = {
      // Basic verification limits (unverified users)
      basic: {
        daily: 1000,        // $1,000 per day
        weekly: 5000,       // $5,000 per week
        monthly: 10000,     // $10,000 per month
        single: 500,        // $500 per transaction
        velocity: 5,        // 5 transactions per hour
        annual: 50000       // $50,000 per year
      },
      
      // Verified user limits
      verified: {
        daily: 5000,        // $5,000 per day
        weekly: 25000,      // $25,000 per week
        monthly: 50000,     // $50,000 per month
        single: 2500,       // $2,500 per transaction
        velocity: 10,       // 10 transactions per hour
        annual: 250000      // $250,000 per year
      },
      
      // Premium user limits
      premium: {
        daily: 25000,       // $25,000 per day
        weekly: 100000,     // $100,000 per week
        monthly: 250000,    // $250,000 per month
        single: 10000,      // $10,000 per transaction
        velocity: 20,       // 20 transactions per hour
        annual: 1000000     // $1,000,000 per year
      }
    };

    this.regulatoryLimits = {
      // CTR (Currency Transaction Report) threshold
      ctrThreshold: 10000,  // $10,000 - requires CTR filing
      
      // SAR (Suspicious Activity Report) threshold
      sarThreshold: 5000,   // $5,000 - requires SAR review
      
      // High-risk transaction threshold
      highRiskThreshold: 2500, // $2,500 - enhanced monitoring
      
      // International transfer limits
      international: {
        daily: 10000,
        monthly: 50000
      }
    };
  }

  // Check if transaction is within limits
  async checkTransactionLimits(userId, transactionData, userProfile) {
    const { amount, currency, type, recipient } = transactionData;
    const { verificationLevel, transactionHistory, riskScore } = userProfile;

    const limits = this.limits[verificationLevel] || this.limits.basic;
    const violations = [];
    const warnings = [];

    // Convert amount to USD for comparison (simplified)
    const usdAmount = await this.convertToUSD(amount, currency);

    // Check single transaction limit
    if (usdAmount > limits.single) {
      violations.push({
        type: 'single_transaction_limit',
        limit: limits.single,
        actual: usdAmount,
        message: `Transaction amount exceeds single transaction limit of $${limits.single}`
      });
    }

    // Check daily limit
    const dailyTotal = await this.calculateDailyTotal(userId, transactionHistory);
    if (dailyTotal + usdAmount > limits.daily) {
      violations.push({
        type: 'daily_limit',
        limit: limits.daily,
        actual: dailyTotal + usdAmount,
        message: `Transaction would exceed daily limit of $${limits.daily}`
      });
    }

    // Check weekly limit
    const weeklyTotal = await this.calculateWeeklyTotal(userId, transactionHistory);
    if (weeklyTotal + usdAmount > limits.weekly) {
      violations.push({
        type: 'weekly_limit',
        limit: limits.weekly,
        actual: weeklyTotal + usdAmount,
        message: `Transaction would exceed weekly limit of $${limits.weekly}`
      });
    }

    // Check monthly limit
    const monthlyTotal = await this.calculateMonthlyTotal(userId, transactionHistory);
    if (monthlyTotal + usdAmount > limits.monthly) {
      violations.push({
        type: 'monthly_limit',
        limit: limits.monthly,
        actual: monthlyTotal + usdAmount,
        message: `Transaction would exceed monthly limit of $${limits.monthly}`
      });
    }

    // Check velocity limit
    const recentTransactions = await this.getRecentTransactions(userId, transactionHistory, 60); // Last hour
    if (recentTransactions.length >= limits.velocity) {
      violations.push({
        type: 'velocity_limit',
        limit: limits.velocity,
        actual: recentTransactions.length,
        message: `Transaction velocity limit exceeded: ${limits.velocity} transactions per hour`
      });
    }

    // Check regulatory thresholds
    if (usdAmount >= this.regulatoryLimits.ctrThreshold) {
      warnings.push({
        type: 'ctr_threshold',
        threshold: this.regulatoryLimits.ctrThreshold,
        actual: usdAmount,
        message: 'Transaction requires Currency Transaction Report (CTR) filing'
      });
    }

    if (usdAmount >= this.regulatoryLimits.sarThreshold) {
      warnings.push({
        type: 'sar_threshold',
        threshold: this.regulatoryLimits.sarThreshold,
        actual: usdAmount,
        message: 'Transaction requires Suspicious Activity Report (SAR) review'
      });
    }

    if (usdAmount >= this.regulatoryLimits.highRiskThreshold) {
      warnings.push({
        type: 'high_risk_threshold',
        threshold: this.regulatoryLimits.highRiskThreshold,
        actual: usdAmount,
        message: 'High-value transaction requires enhanced monitoring'
      });
    }

    // Check international transfer limits
    if (this.isInternationalTransfer(recipient)) {
      const internationalDaily = await this.calculateInternationalDaily(userId, transactionHistory);
      if (internationalDaily + usdAmount > this.regulatoryLimits.international.daily) {
        violations.push({
          type: 'international_daily_limit',
          limit: this.regulatoryLimits.international.daily,
          actual: internationalDaily + usdAmount,
          message: `International transfer would exceed daily limit of $${this.regulatoryLimits.international.daily}`
        });
      }
    }

    // Risk-based adjustments
    if (riskScore > 70) {
      // Reduce limits for high-risk users
      const riskMultiplier = 0.5;
      const adjustedLimits = {
        single: limits.single * riskMultiplier,
        daily: limits.daily * riskMultiplier
      };

      if (usdAmount > adjustedLimits.single) {
        violations.push({
          type: 'risk_adjusted_single_limit',
          limit: adjustedLimits.single,
          actual: usdAmount,
          message: `High-risk user: Transaction exceeds adjusted single limit of $${adjustedLimits.single}`
        });
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
      warnings,
      limits: {
        current: limits,
        regulatory: this.regulatoryLimits
      },
      recommendations: this.generateRecommendations(violations, warnings, verificationLevel)
    };
  }

  // Generate recommendations for limit violations
  generateRecommendations(violations, warnings, verificationLevel) {
    const recommendations = [];

    if (violations.length > 0) {
      if (verificationLevel === 'basic') {
        recommendations.push({
          type: 'verification_upgrade',
          message: 'Consider upgrading your verification level to increase transaction limits',
          action: 'upgrade_verification'
        });
      }

      if (violations.some(v => v.type === 'velocity_limit')) {
        recommendations.push({
          type: 'reduce_frequency',
          message: 'Reduce transaction frequency to stay within velocity limits',
          action: 'wait_before_next_transaction'
        });
      }

      if (violations.some(v => v.type.includes('limit'))) {
        recommendations.push({
          type: 'reduce_amount',
          message: 'Reduce transaction amount to stay within limits',
          action: 'split_transaction'
        });
      }
    }

    if (warnings.some(w => w.type === 'ctr_threshold')) {
      recommendations.push({
        type: 'ctr_filing',
        message: 'Transaction will trigger CTR filing requirement',
        action: 'prepare_ctr_documentation'
      });
    }

    return recommendations;
  }

  // Calculate daily total for user
  async calculateDailyTotal(userId, transactionHistory) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactionHistory.filter(t => 
      new Date(t.createdAt) >= today && t.status === 'completed'
    );
    
    return todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  // Calculate weekly total for user
  async calculateWeeklyTotal(userId, transactionHistory) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekTransactions = transactionHistory.filter(t => 
      new Date(t.createdAt) >= weekAgo && t.status === 'completed'
    );
    
    return weekTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  // Calculate monthly total for user
  async calculateMonthlyTotal(userId, transactionHistory) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthTransactions = transactionHistory.filter(t => 
      new Date(t.createdAt) >= monthAgo && t.status === 'completed'
    );
    
    return monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  // Get recent transactions within time window
  async getRecentTransactions(userId, transactionHistory, minutes) {
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - minutes);
    
    return transactionHistory.filter(t => 
      new Date(t.createdAt) >= timeWindow && t.status === 'completed'
    );
  }

  // Calculate international transfer daily total
  async calculateInternationalDaily(userId, transactionHistory) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInternational = transactionHistory.filter(t => 
      new Date(t.createdAt) >= today && 
      t.status === 'completed' && 
      this.isInternationalTransfer(t.recipient)
    );
    
    return todayInternational.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  // Check if transfer is international
  isInternationalTransfer(recipient) {
    // Simplified check - in production, this would use a proper country detection service
    const internationalDomains = ['.uk', '.ca', '.au', '.de', '.fr', '.jp', '.cn'];
    return internationalDomains.some(domain => recipient.includes(domain));
  }

  // Convert amount to USD (simplified)
  async convertToUSD(amount, currency) {
    // In production, this would use a real currency conversion service
    const rates = {
      'USD': 1,
      'EUR': 1.1,
      'GBP': 1.3,
      'CAD': 0.75,
      'AUD': 0.65
    };
    
    return amount * (rates[currency] || 1);
  }

  // Get user's current limits
  getUserLimits(verificationLevel) {
    return this.limits[verificationLevel] || this.limits.basic;
  }

  // Update limits for special circumstances
  updateLimits(userId, newLimits) {
    // In production, this would update limits in database
    logger.info('Transaction limits updated', {
      userId,
      newLimits
    });
  }
}

// Middleware function
const transactionLimitsMiddleware = async (req, res, next) => {
  try {
    const { amount, currency, recipient } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId || !amount) {
      return next();
    }

    const transactionLimitsService = new TransactionLimitsService();
    
    // Get user profile (in production, this would come from database)
    const userProfile = {
      verificationLevel: req.user?.verificationLevel || 'basic',
      transactionHistory: req.user?.transactionHistory || [],
      riskScore: req.user?.riskScore || 0
    };

    const transactionData = {
      amount: parseFloat(amount),
      currency: currency || 'USD',
      type: req.body.type || 'transfer',
      recipient: recipient || req.body.to
    };

    const limitCheck = await transactionLimitsService.checkTransactionLimits(
      userId,
      transactionData,
      userProfile
    );

    // Add limit check results to request
    req.transactionLimits = limitCheck;

    // If transaction is not allowed, return error
    if (!limitCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: 'Transaction exceeds limits',
        violations: limitCheck.violations,
        warnings: limitCheck.warnings,
        recommendations: limitCheck.recommendations,
        limits: limitCheck.limits
      });
    }

    // Log warnings for monitoring
    if (limitCheck.warnings.length > 0) {
      logger.warn('Transaction limit warnings', {
        userId,
        transactionData,
        warnings: limitCheck.warnings
      });
    }

    next();
  } catch (error) {
    logger.error('Transaction limits check error', {
      error: error.message,
      userId: req.user?.id
    });
    
    // Don't block transaction on middleware error, but log it
    next();
  }
};

module.exports = {
  TransactionLimitsService,
  transactionLimitsMiddleware
};


