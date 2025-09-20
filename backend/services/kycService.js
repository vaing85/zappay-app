// KYC (Know Your Customer) Service
// Handles customer identity verification and compliance

const crypto = require('crypto');
const logger = require('../middleware/logger');

class KYCService {
  constructor() {
    this.verificationLevels = {
      BASIC: 'basic',
      VERIFIED: 'verified', 
      PREMIUM: 'premium'
    };
    
    this.documentTypes = {
      PASSPORT: 'passport',
      DRIVERS_LICENSE: 'drivers_license',
      NATIONAL_ID: 'national_id',
      UTILITY_BILL: 'utility_bill',
      BANK_STATEMENT: 'bank_statement'
    };
  }

  // Validate customer information for KYC
  async validateCustomerInfo(customerData) {
    const { firstName, lastName, dateOfBirth, address, phoneNumber, email } = customerData;
    
    const validation = {
      isValid: true,
      errors: [],
      riskScore: 0,
      verificationLevel: this.verificationLevels.BASIC
    };

    // Basic validation
    if (!firstName || !lastName) {
      validation.errors.push('First and last name are required');
      validation.isValid = false;
    }

    if (!dateOfBirth || !this.isValidDateOfBirth(dateOfBirth)) {
      validation.errors.push('Valid date of birth is required');
      validation.isValid = false;
    }

    if (!address || !this.isValidAddress(address)) {
      validation.errors.push('Complete address is required');
      validation.isValid = false;
    }

    if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
      validation.errors.push('Valid phone number is required');
      validation.isValid = false;
    }

    if (!email || !this.isValidEmail(email)) {
      validation.errors.push('Valid email is required');
      validation.isValid = false;
    }

    // Calculate risk score
    validation.riskScore = this.calculateRiskScore(customerData);

    // Determine verification level
    if (validation.isValid && validation.riskScore < 30) {
      validation.verificationLevel = this.verificationLevels.VERIFIED;
    } else if (validation.isValid && validation.riskScore < 10) {
      validation.verificationLevel = this.verificationLevels.PREMIUM;
    }

    return validation;
  }

  // Process identity document verification
  async processDocumentVerification(userId, documentData) {
    const { documentType, documentNumber, frontImage, backImage, selfieImage } = documentData;
    
    try {
      // Simulate document verification process
      const verification = {
        userId,
        documentType,
        documentNumber: this.maskDocumentNumber(documentNumber),
        status: 'pending',
        verificationId: this.generateVerificationId(),
        submittedAt: new Date().toISOString(),
        riskScore: this.calculateDocumentRisk(documentData)
      };

      // Log verification attempt
      await this.logVerificationAttempt(userId, verification);

      // Simulate verification result (in production, integrate with verification service)
      const result = await this.simulateDocumentVerification(documentData);
      
      verification.status = result.status;
      verification.verifiedAt = result.status === 'approved' ? new Date().toISOString() : null;
      verification.reason = result.reason;

      return {
        success: true,
        verification,
        message: 'Document verification processed'
      };

    } catch (error) {
      logger.error('Document verification error', {
        userId,
        error: error.message
      });
      
      return {
        success: false,
        error: 'Document verification failed',
        details: error.message
      };
    }
  }

  // Check against sanctions lists
  async checkSanctionsList(customerData) {
    const { firstName, lastName, dateOfBirth, address } = customerData;
    
    // Simulate sanctions check (in production, integrate with OFAC/AML services)
    const sanctionsCheck = {
      isSanctioned: false,
      matches: [],
      checkedAt: new Date().toISOString()
    };

    // Basic name matching (simplified)
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const commonSanctionedNames = ['john doe', 'jane smith']; // Example list
    
    if (commonSanctionedNames.includes(fullName)) {
      sanctionsCheck.isSanctioned = true;
      sanctionsCheck.matches.push({
        name: fullName,
        confidence: 0.95,
        list: 'OFAC'
      });
    }

    return sanctionsCheck;
  }

  // Monitor suspicious transactions
  async monitorTransaction(transactionData, customerProfile) {
    const { amount, currency, recipient, description } = transactionData;
    const { riskScore, verificationLevel, transactionHistory } = customerProfile;

    const monitoring = {
      isSuspicious: false,
      riskFactors: [],
      recommendedAction: 'approve',
      riskScore: 0
    };

    // Check for suspicious patterns
    if (amount > 10000) {
      monitoring.riskFactors.push('High transaction amount');
      monitoring.riskScore += 20;
    }

    if (verificationLevel === this.verificationLevels.BASIC && amount > 5000) {
      monitoring.riskFactors.push('High amount for basic verification');
      monitoring.riskScore += 15;
    }

    // Check for rapid transactions
    if (transactionHistory && transactionHistory.length > 10) {
      const recentTransactions = transactionHistory.filter(t => 
        new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentTransactions.length > 5) {
        monitoring.riskFactors.push('High transaction frequency');
        monitoring.riskScore += 10;
      }
    }

    // Determine if suspicious
    if (monitoring.riskScore > 50) {
      monitoring.isSuspicious = true;
      monitoring.recommendedAction = 'review';
    } else if (monitoring.riskScore > 30) {
      monitoring.recommendedAction = 'monitor';
    }

    return monitoring;
  }

  // Generate compliance report
  async generateComplianceReport(startDate, endDate) {
    try {
      // Simulate compliance report generation
      const report = {
        period: {
          start: startDate,
          end: endDate
        },
        generatedAt: new Date().toISOString(),
        summary: {
          totalCustomers: 0,
          verifiedCustomers: 0,
          pendingVerifications: 0,
          suspiciousTransactions: 0,
          totalTransactionVolume: 0
        },
        details: {
          kycCompliance: {
            completionRate: 0,
            averageVerificationTime: 0,
            documentTypes: {}
          },
          amlMonitoring: {
            suspiciousActivityCount: 0,
            falsePositiveRate: 0,
            averageRiskScore: 0
          }
        }
      };

      return {
        success: true,
        report,
        message: 'Compliance report generated'
      };

    } catch (error) {
      logger.error('Compliance report generation error', {
        error: error.message
      });
      
      return {
        success: false,
        error: 'Failed to generate compliance report',
        details: error.message
      };
    }
  }

  // Helper methods
  isValidDateOfBirth(dateOfBirth) {
    const date = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    return age >= 18 && age <= 120;
  }

  isValidAddress(address) {
    return address.street && address.city && address.state && address.zipCode && address.country;
  }

  isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  calculateRiskScore(customerData) {
    let score = 0;
    
    // Age-based risk
    const age = new Date().getFullYear() - new Date(customerData.dateOfBirth).getFullYear();
    if (age < 25 || age > 65) score += 10;
    
    // Address risk (simplified)
    if (customerData.address && customerData.address.country !== 'US') score += 5;
    
    // Phone number risk
    if (customerData.phoneNumber && !customerData.phoneNumber.startsWith('+1')) score += 5;
    
    return Math.min(score, 100);
  }

  calculateDocumentRisk(documentData) {
    let risk = 0;
    
    // Document type risk
    if (documentData.documentType === this.documentTypes.UTILITY_BILL) risk += 10;
    
    // Image quality risk (simplified)
    if (!documentData.frontImage || !documentData.backImage) risk += 20;
    
    return Math.min(risk, 100);
  }

  maskDocumentNumber(documentNumber) {
    if (!documentNumber) return '';
    return documentNumber.replace(/(.{4}).*(.{4})/, '$1****$2');
  }

  generateVerificationId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async logVerificationAttempt(userId, verification) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'document_verification_attempt',
      verificationId: verification.verificationId,
      documentType: verification.documentType,
      riskScore: verification.riskScore
    };
    
    logger.info('KYC_VERIFICATION_ATTEMPT', auditLog);
  }

  async simulateDocumentVerification(documentData) {
    // Simulate verification process with random results
    const random = Math.random();
    
    if (random > 0.8) {
      return {
        status: 'approved',
        reason: 'Document verification successful'
      };
    } else if (random > 0.6) {
      return {
        status: 'rejected',
        reason: 'Document quality insufficient'
      };
    } else {
      return {
        status: 'pending',
        reason: 'Manual review required'
      };
    }
  }
}

module.exports = new KYCService();
