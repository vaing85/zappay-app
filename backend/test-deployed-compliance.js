const axios = require('axios');

const BASE_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testDeployedCompliance() {
    console.log('🏛️ ZapPay Deployed Compliance Features Test Suite');
    console.log(`📡 Testing against: ${BASE_URL}`);
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log('');

    const results = {
        passed: 0,
        failed: 0,
        total: 0,
        failures: []
    };

    // Test 1: Basic Health Check
    await runTest('Basic Health Check', async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        return response.status === 200 && response.data.status === 'healthy';
    }, results);

    // Test 2: Compliance Health Check
    await runTest('Compliance Health Check', async () => {
        const response = await axios.get(`${BASE_URL}/api/compliance/health`);
        return response.status === 200 && response.data.success === true;
    }, results);

    // Test 3: KYC Validation Endpoint
    await runTest('KYC Validation Endpoint', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/kyc/validate`, {
            customerId: 'test-customer',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
        });
        return response.status === 200;
    }, results);

    // Test 4: Document Verification Endpoint
    await runTest('Document Verification Endpoint', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/kyc/verify-document`, {
            customerId: 'test-customer',
            documentType: 'passport',
            documentNumber: 'A1234567'
        });
        return response.status === 200;
    }, results);

    // Test 5: Sanctions Check Endpoint
    await runTest('Sanctions Check Endpoint', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/kyc/check-sanctions`, {
            customerId: 'test-customer',
            firstName: 'John',
            lastName: 'Doe'
        });
        return response.status === 200;
    }, results);

    // Test 6: Transaction Monitoring Endpoint
    await runTest('Transaction Monitoring Endpoint', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/kyc/monitor-transaction`, {
            customerId: 'test-customer',
            amount: 1000,
            currency: 'USD',
            type: 'payment'
        });
        return response.status === 200;
    }, results);

    // Test 7: Compliance Report Generation
    await runTest('Compliance Report Generation', async () => {
        const response = await axios.get(`${BASE_URL}/api/compliance/reports/generate`, {
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                reportType: 'monthly'
            }
        });
        return response.status === 200;
    }, results);

    // Test 8: GDPR Data Export
    await runTest('GDPR Data Export', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/gdpr/export-data`, {
            userId: 'test-user',
            dataTypes: ['personal', 'transaction', 'audit']
        });
        return response.status === 200;
    }, results);

    // Test 9: GDPR Data Deletion
    await runTest('GDPR Data Deletion', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/gdpr/delete-data`, {
            userId: 'test-user',
            dataTypes: ['personal']
        });
        return response.status === 200;
    }, results);

    // Test 10: Audit Log Cleanup
    await runTest('Audit Log Cleanup', async () => {
        const response = await axios.post(`${BASE_URL}/api/compliance/audit/cleanup`, {
            olderThan: '2023-01-01'
        });
        return response.status === 200;
    }, results);

    // Test 11: Transaction Limits
    await runTest('Transaction Limits', async () => {
        const response = await axios.post(`${BASE_URL}/api/transactions/process`, {
            amount: 100,
            currency: 'USD',
            userId: 'test-user'
        });
        return response.status === 200 || response.status === 429; // 429 is expected for limits
    }, results);

    // Print Results
    console.log('');
    console.log('📊 Deployed Compliance Test Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Total: ${results.total}`);
    console.log(`📊 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    console.log('');

    if (results.failures.length > 0) {
        console.log('❌ Failed Tests:');
        results.failures.forEach(failure => {
            console.log(`  - ${failure.name}: ${failure.error}`);
        });
        console.log('');
    }

    if (results.failed === 0) {
        console.log('🎉 All compliance features are working on the deployed backend!');
    } else if (results.passed > 0) {
        console.log('⚠️  Some compliance features are working, but some need attention');
    } else {
        console.log('❌ Compliance features are not yet deployed or need configuration');
    }

    console.log('');
    console.log('🔧 Next Steps:');
    console.log('  - Check DigitalOcean deployment logs');
    console.log('  - Verify environment variables are set');
    console.log('  - Test frontend integration');
    console.log('  - Complete end-to-end testing');
}

async function runTest(name, testFn, results) {
    results.total++;
    try {
        console.log(`🧪 Testing: ${name}`);
        const result = await testFn();
        if (result) {
            console.log(`✅ ${name} - PASSED`);
            results.passed++;
        } else {
            console.log(`❌ ${name} - FAILED`);
            results.failed++;
            results.failures.push({ name, error: 'Test returned false' });
        }
    } catch (error) {
        console.log(`❌ ${name} - FAILED: ${error.message}`);
        results.failed++;
        results.failures.push({ name, error: error.message });
    }
    console.log('');
}

// Run the tests
testDeployedCompliance().catch(console.error);
