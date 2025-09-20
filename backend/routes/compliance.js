// Compliance Routes for Financial Regulations
// Handles KYC, AML, audit logging, and regulatory compliance

const express = require('express');
const router = express.Router();
const kycService = require('../services/kycService');
const auditService = require('../services/auditService');
const { paymentLimiter } = require('../middleware/rateLimiting');
const logger = require('../middleware/logger');

// Apply rate limiting to all compliance routes
router.use(paymentLimiter);

/**
 * KYC Customer Validation
 * POST /api/compliance/kyc/validate
 */
router.post('/kyc/validate', async (req, res) => {
  try {
    const { customerData, customerId, firstName, lastName, email } = req.body;
    
    // Support both formats: customerData object or individual fields
    const data = customerData || { customerId, firstName, lastName, email };
    
    if (!data.customerId && !data.firstName) {
      return res.status(400).json({
        success: false,
        message: 'Customer data is required (customerId, firstName, lastName, email)'
      });
    }

    const validation = await kycService.validateCustomerInfo(data);
    
    // Log validation attempt
    await auditService.logKYC(customerData.userId || 'unknown', 'customer_validation', {
      validationResult: validation.isValid,
      riskScore: validation.riskScore,
      verificationLevel: validation.verificationLevel
    });

    res.json({
      success: true,
      validation,
      message: 'Customer validation completed'
    });

  } catch (error) {
    logger.error('KYC validation error', {
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Customer validation failed',
      error: error.message
    });
  }
});

/**
 * Document Verification
 * POST /api/compliance/kyc/verify-document
 */
router.post('/kyc/verify-document', async (req, res) => {
  try {
    const { userId, documentData } = req.body;
    
    if (!userId || !documentData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and document data are required'
      });
    }

    const result = await kycService.processDocumentVerification(userId, documentData);
    
    // Log document verification
    await auditService.logKYC(userId, 'document_verification', {
      documentType: documentData.documentType,
      status: result.verification?.status,
      verificationId: result.verification?.verificationId
    });

    res.json(result);

  } catch (error) {
    logger.error('Document verification error', {
      error: error.message,
      userId: req.body.userId
    });

    res.status(500).json({
      success: false,
      message: 'Document verification failed',
      error: error.message
    });
  }
});

/**
 * Sanctions List Check
 * POST /api/compliance/kyc/check-sanctions
 */
router.post('/kyc/check-sanctions', async (req, res) => {
  try {
    const { customerData } = req.body;
    
    if (!customerData) {
      return res.status(400).json({
        success: false,
        message: 'Customer data is required'
      });
    }

    const sanctionsCheck = await kycService.checkSanctionsList(customerData);
    
    // Log sanctions check
    await auditService.logKYC(customerData.userId || 'unknown', 'sanctions_check', {
      isSanctioned: sanctionsCheck.isSanctioned,
      matches: sanctionsCheck.matches.length
    });

    res.json({
      success: true,
      sanctionsCheck,
      message: 'Sanctions check completed'
    });

  } catch (error) {
    logger.error('Sanctions check error', {
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Sanctions check failed',
      error: error.message
    });
  }
});

/**
 * Transaction Monitoring
 * POST /api/compliance/monitor-transaction
 */
router.post('/monitor-transaction', async (req, res) => {
  try {
    const { transactionData, customerProfile } = req.body;
    
    if (!transactionData || !customerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Transaction data and customer profile are required'
      });
    }

    const monitoring = await kycService.monitorTransaction(transactionData, customerProfile);
    
    // Log transaction monitoring
    await auditService.logTransaction(transactionData.id || 'unknown', 'transaction_monitoring', {
      isSuspicious: monitoring.isSuspicious,
      riskScore: monitoring.riskScore,
      riskFactors: monitoring.riskFactors,
      recommendedAction: monitoring.recommendedAction
    });

    res.json({
      success: true,
      monitoring,
      message: 'Transaction monitoring completed'
    });

  } catch (error) {
    logger.error('Transaction monitoring error', {
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Transaction monitoring failed',
      error: error.message
    });
  }
});

/**
 * Generate Compliance Report
 * POST /api/compliance/reports/generate
 * GET /api/compliance/reports/generate
 */
router.post('/reports/generate', async (req, res) => {
  try {
    const { startDate, endDate, reportType = 'comprehensive' } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const result = await auditService.generateComplianceReport(startDate, endDate, reportType);
    
    // Log report generation
    await auditService.logCompliance('report_generated', {
      reportId: result.report?.id,
      reportType,
      startDate,
      endDate
    });

    res.json(result);

  } catch (error) {
    logger.error('Compliance report generation error', {
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Compliance report generation failed',
      error: error.message
    });
  }
});

// GET route for reports with query parameters
router.get('/reports/generate', async (req, res) => {
  try {
    const { startDate, endDate, reportType = 'comprehensive' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required as query parameters'
      });
    }

    const result = await auditService.generateComplianceReport(startDate, endDate, reportType);
    
    // Log report generation
    await auditService.logCompliance('report_generated', {
      reportId: result.report?.id,
      reportType,
      startDate,
      endDate
    });

    res.json(result);

  } catch (error) {
    logger.error('Compliance report generation error (GET)', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Compliance report generation failed',
      error: error.message
    });
  }
});

/**
 * Generate Suspicious Activity Report
 * POST /api/compliance/reports/suspicious-activity
 */
router.post('/reports/suspicious-activity', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const result = await auditService.generateSuspiciousActivityReport(startDate, endDate);
    
    // Log suspicious activity report
    await auditService.logCompliance('suspicious_activity_report', {
      reportId: result.report?.id,
      startDate,
      endDate,
      activityCount: result.report?.summary?.totalActivities || 0
    });

    res.json(result);

  } catch (error) {
    logger.error('Suspicious activity report error', {
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Suspicious activity report generation failed',
      error: error.message
    });
  }
});

/**
 * GDPR Data Export
 * POST /api/compliance/gdpr/export-data
 */
router.post('/gdpr/export-data', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await auditService.exportUserData(userId);
    
    res.json(result);

  } catch (error) {
    logger.error('GDPR data export error', {
      error: error.message,
      userId: req.body.userId
    });

    res.status(500).json({
      success: false,
      message: 'GDPR data export failed',
      error: error.message
    });
  }
});

/**
 * GDPR Data Deletion
 * POST /api/compliance/gdpr/delete-data
 */
router.post('/gdpr/delete-data', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await auditService.deleteUserData(userId);
    
    res.json(result);

  } catch (error) {
    logger.error('GDPR data deletion error', {
      error: error.message,
      userId: req.body.userId
    });

    res.status(500).json({
      success: false,
      message: 'GDPR data deletion failed',
      error: error.message
    });
  }
});

/**
 * Audit Log Cleanup
 * POST /api/compliance/audit/cleanup
 */
router.post('/audit/cleanup', async (req, res) => {
  try {
    const result = await auditService.cleanupExpiredAuditLogs();
    
    res.json(result);

  } catch (error) {
    logger.error('Audit cleanup error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Audit cleanup failed',
      error: error.message
    });
  }
});

/**
 * Compliance Health Check
 * GET /api/compliance/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Compliance endpoints are healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /kyc/validate',
      'POST /kyc/verify-document',
      'POST /kyc/check-sanctions',
      'POST /monitor-transaction',
      'POST /reports/generate',
      'POST /reports/suspicious-activity',
      'POST /gdpr/export-data',
      'POST /gdpr/delete-data',
      'POST /audit/cleanup'
    ]
  });
});

module.exports = router;
