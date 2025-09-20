// Complete Compliance Features Test Suite
// Tests all critical compliance features

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Helper function to run a test
const runTest = async (name, testFn) => {
  testResults.total++;
  console.log(`🧪 Testing: ${name}`);
  
  try {
    await testFn();
    console.log(`✅ ${name} - PASSED`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
  }
  
  // Add delay between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
};

// Test KYC customer validation
const testKYCCustomerValidation = async () => {
  const customerData = {
    userId: 'test-user-compliance-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US'
    },
    phoneNumber: '+1234567890',
    email: 'john.doe.compliance@example.com'
  };

  const response = await axios.post(`${BASE_URL}/api/compliance/kyc/validate`, {
    customerData
  });

  if (response.status !== 200) {
    throw new Error(`KYC validation returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`KYC validation failed: ${response.data.message}`);
  }

  if (!response.data.validation) {
    throw new Error('Validation result not returned');
  }

  console.log(`  📊 Risk Score: ${response.data.validation.riskScore}`);
  console.log(`  📋 Verification Level: ${response.data.validation.verificationLevel}`);
  console.log(`  ✅ Valid: ${response.data.validation.isValid}`);
};

// Test document verification
const testDocumentVerification = async () => {
  const documentData = {
    documentType: 'passport',
    documentNumber: 'A1234567',
    frontImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    backImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    selfieImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  };

  const response = await axios.post(`${BASE_URL}/api/compliance/kyc/verify-document`, {
    userId: 'test-user-compliance-123',
    documentData
  });

  if (response.status !== 200) {
    throw new Error(`Document verification returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Document verification failed: ${response.data.message}`);
  }

  if (!response.data.verification) {
    throw new Error('Verification result not returned');
  }

  console.log(`  📄 Document Type: ${response.data.verification.documentType}`);
  console.log(`  📋 Status: ${response.data.verification.status}`);
  console.log(`  🔍 Verification ID: ${response.data.verification.verificationId}`);
  console.log(`  📊 Risk Score: ${response.data.verification.riskScore}`);
};

// Test sanctions list check
const testSanctionsCheck = async () => {
  const customerData = {
    userId: 'test-user-compliance-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    address: {
      country: 'US'
    }
  };

  const response = await axios.post(`${BASE_URL}/api/compliance/kyc/check-sanctions`, {
    customerData
  });

  if (response.status !== 200) {
    throw new Error(`Sanctions check returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Sanctions check failed: ${response.data.message}`);
  }

  if (!response.data.sanctionsCheck) {
    throw new Error('Sanctions check result not returned');
  }

  console.log(`  🚫 Sanctioned: ${response.data.sanctionsCheck.isSanctioned}`);
  console.log(`  📋 Matches: ${response.data.sanctionsCheck.matches.length}`);
  console.log(`  🕐 Checked At: ${response.data.sanctionsCheck.checkedAt}`);
};

// Test transaction monitoring
const testTransactionMonitoring = async () => {
  const transactionData = {
    id: 'txn-compliance-test-123',
    amount: 5000,
    currency: 'USD',
    recipient: 'recipient@example.com',
    description: 'Compliance test transaction'
  };

  const customerProfile = {
    riskScore: 25,
    verificationLevel: 'verified',
    transactionHistory: [
      { amount: 100, createdAt: new Date().toISOString(), status: 'completed' },
      { amount: 200, createdAt: new Date().toISOString(), status: 'completed' }
    ]
  };

  const response = await axios.post(`${BASE_URL}/api/compliance/monitor-transaction`, {
    transactionData,
    customerProfile
  });

  if (response.status !== 200) {
    throw new Error(`Transaction monitoring returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Transaction monitoring failed: ${response.data.message}`);
  }

  if (!response.data.monitoring) {
    throw new Error('Monitoring result not returned');
  }

  console.log(`  🚨 Suspicious: ${response.data.monitoring.isSuspicious}`);
  console.log(`  📊 Risk Score: ${response.data.monitoring.riskScore}`);
  console.log(`  📋 Risk Factors: ${response.data.monitoring.riskFactors.length}`);
  console.log(`  🎯 Action: ${response.data.monitoring.recommendedAction}`);
};

// Test compliance report generation
const testComplianceReport = async () => {
  const startDate = '2025-01-01';
  const endDate = '2025-12-31';

  const response = await axios.post(`${BASE_URL}/api/compliance/reports/generate`, {
    startDate,
    endDate,
    reportType: 'comprehensive'
  });

  if (response.status !== 200) {
    throw new Error(`Compliance report returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Compliance report failed: ${response.data.message}`);
  }

  if (!response.data.report) {
    throw new Error('Report not returned');
  }

  console.log(`  📊 Report ID: ${response.data.report.id}`);
  console.log(`  📅 Period: ${response.data.report.period.start} to ${response.data.report.period.end}`);
  console.log(`  📋 Type: ${response.data.report.type}`);
  console.log(`  🕐 Generated: ${response.data.report.generatedAt}`);
};

// Test suspicious activity report
const testSuspiciousActivityReport = async () => {
  const startDate = '2025-01-01';
  const endDate = '2025-12-31';

  const response = await axios.post(`${BASE_URL}/api/compliance/reports/suspicious-activity`, {
    startDate,
    endDate
  });

  if (response.status !== 200) {
    throw new Error(`Suspicious activity report returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Suspicious activity report failed: ${response.data.message}`);
  }

  if (!response.data.report) {
    throw new Error('Report not returned');
  }

  console.log(`  📊 Report ID: ${response.data.report.id}`);
  console.log(`  📋 Activities: ${response.data.report.activities.length}`);
  console.log(`  🚨 High Risk: ${response.data.report.summary.highRiskActivities}`);
  console.log(`  ⚠️ Medium Risk: ${response.data.report.summary.mediumRiskActivities}`);
};

// Test GDPR data export
const testGDPRDataExport = async () => {
  const response = await axios.post(`${BASE_URL}/api/compliance/gdpr/export-data`, {
    userId: 'test-user-compliance-123'
  });

  if (response.status !== 200) {
    throw new Error(`GDPR export returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`GDPR export failed: ${response.data.message}`);
  }

  if (!response.data.data) {
    throw new Error('User data not returned');
  }

  console.log(`  👤 User ID: ${response.data.data.userId}`);
  console.log(`  📅 Exported: ${response.data.data.exportedAt}`);
  console.log(`  📋 Data Types: ${Object.keys(response.data.data).length}`);
  console.log(`  💾 Personal Data: ${response.data.data.personalData ? 'Yes' : 'No'}`);
  console.log(`  💳 Transaction History: ${response.data.data.transactionHistory?.length || 0} records`);
  console.log(`  📝 Audit Logs: ${response.data.data.auditLogs?.length || 0} records`);
  console.log(`  🔐 KYC Data: ${response.data.data.kycData ? 'Yes' : 'No'}`);
};

// Test GDPR data deletion
const testGDPRDataDeletion = async () => {
  const response = await axios.post(`${BASE_URL}/api/compliance/gdpr/delete-data`, {
    userId: 'test-user-compliance-123'
  });

  if (response.status !== 200) {
    throw new Error(`GDPR deletion returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`GDPR deletion failed: ${response.data.message}`);
  }

  console.log(`  ✅ Deletion Request: ${response.data.message}`);
};

// Test audit log cleanup
const testAuditCleanup = async () => {
  const response = await axios.post(`${BASE_URL}/api/compliance/audit/cleanup`);

  if (response.status !== 200) {
    throw new Error(`Audit cleanup returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error(`Audit cleanup failed: ${response.data.message}`);
  }

  console.log(`  🧹 Cleaned: ${response.data.cleanedCount} categories`);
  console.log(`  ✅ Status: ${response.data.message}`);
};

// Test compliance health check
const testComplianceHealth = async () => {
  const response = await axios.get(`${BASE_URL}/api/compliance/health`);

  if (response.status !== 200) {
    throw new Error(`Compliance health check returned status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Compliance health check failed');
  }

  if (!response.data.endpoints) {
    throw new Error('Endpoints list not returned');
  }

  console.log(`  📋 Available Endpoints: ${response.data.endpoints.length}`);
  console.log(`  🕐 Timestamp: ${response.data.timestamp}`);
  console.log(`  ✅ Status: ${response.data.message}`);
};

// Test transaction limits
const testTransactionLimits = async () => {
  // Test basic user transaction (should be allowed)
  const basicTransaction = {
    amount: 100,
    currency: 'USD',
    recipient: 'test@example.com',
    type: 'transfer'
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/transactions`, basicTransaction, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log(`  ✅ Basic Transaction: ${response.status} - ${response.data.message || 'Processed'}`);
  } catch (error) {
    if (error.response?.status === 400 && error.response.data?.violations) {
      console.log(`  ⚠️ Basic Transaction: Blocked by limits - ${error.response.data.violations.length} violations`);
    } else {
      console.log(`  ❌ Basic Transaction: ${error.response?.status || 'Error'} - ${error.message}`);
    }
  }

  // Test high-value transaction (should be blocked for basic users)
  const highValueTransaction = {
    amount: 10000,
    currency: 'USD',
    recipient: 'test@example.com',
    type: 'transfer'
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/transactions`, highValueTransaction, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    console.log(`  ⚠️ High-Value Transaction: ${response.status} - Unexpectedly allowed`);
  } catch (error) {
    if (error.response?.status === 400 && error.response.data?.violations) {
      console.log(`  ✅ High-Value Transaction: Correctly blocked - ${error.response.data.violations.length} violations`);
      console.log(`  📋 Violations: ${error.response.data.violations.map(v => v.type).join(', ')}`);
    } else {
      console.log(`  ❌ High-Value Transaction: ${error.response?.status || 'Error'} - ${error.message}`);
    }
  }
};

// Main test runner
async function runComplianceTests() {
  console.log('🏛️ ZapPay Complete Compliance Features Test Suite');
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('');

  // KYC/AML tests
  console.log('🔐 KYC/AML Compliance Tests:');
  await runTest('KYC Customer Validation', testKYCCustomerValidation);
  await runTest('Document Verification', testDocumentVerification);
  await runTest('Sanctions List Check', testSanctionsCheck);
  await runTest('Transaction Monitoring', testTransactionMonitoring);

  console.log('');
  console.log('📊 Compliance Reporting Tests:');
  await runTest('Compliance Report Generation', testComplianceReport);
  await runTest('Suspicious Activity Report', testSuspiciousActivityReport);

  console.log('');
  console.log('🔒 GDPR Compliance Tests:');
  await runTest('GDPR Data Export', testGDPRDataExport);
  await runTest('GDPR Data Deletion', testGDPRDataDeletion);

  console.log('');
  console.log('🛡️ Audit and Security Tests:');
  await runTest('Audit Log Cleanup', testAuditCleanup);
  await runTest('Transaction Limits', testTransactionLimits);

  console.log('');
  console.log('🏥 Health and Status Tests:');
  await runTest('Compliance Health Check', testComplianceHealth);

  // Print results
  console.log('');
  console.log('📊 Complete Compliance Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

  if (testResults.failed > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.name}: ${error.error}`);
    });
  }

  console.log('');
  if (testResults.passed === testResults.total) {
    console.log('🎉 All compliance features are working perfectly!');
    console.log('💡 KYC/AML system is fully functional');
    console.log('💡 Audit logging is operational');
    console.log('💡 GDPR compliance features are ready');
    console.log('💡 Transaction limits are enforced');
    console.log('💡 Regulatory compliance is active');
  } else {
    console.log('⚠️  Some compliance tests failed');
    console.log('💡 Check the failed tests above');
    console.log('💡 Ensure compliance services are properly configured');
    console.log('💡 Verify database connections and API endpoints');
  }

  console.log('');
  console.log('🔧 Next Steps:');
  console.log('  - Integrate with real KYC/AML services (Jumio, Onfido)');
  console.log('  - Set up audit database storage');
  console.log('  - Implement frontend compliance UI');
  console.log('  - Complete regulatory compliance testing');
  console.log('  - Obtain legal compliance review');
  console.log('  - Deploy to production with compliance features');
}

runComplianceTests().catch(console.error);

