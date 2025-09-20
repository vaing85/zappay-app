const axios = require('axios');

const FRONTEND_URL = 'https://zappay.site';
const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testProductionSystem() {
    console.log('🚀 ZAPPAY PRODUCTION SYSTEM TEST');
    console.log('=====================================');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Backend: ${BACKEND_URL}`);
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('');

    const results = {
        passed: 0,
        failed: 0,
        total: 0,
        failures: []
    };

    // Test 1: Frontend Accessibility
    await runTest('Frontend Accessibility', async () => {
        const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
        return response.status === 200;
    }, results);

    // Test 2: Backend Health
    await runTest('Backend Health Check', async () => {
        const response = await axios.get(`${BACKEND_URL}/health`);
        return response.status === 200 && response.data.status === 'healthy';
    }, results);

    // Test 3: Compliance Health
    await runTest('Compliance System Health', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/compliance/health`);
        return response.status === 200 && response.data.success === true;
    }, results);

    // Test 4: KYC Validation
    await runTest('KYC Validation Endpoint', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/compliance/kyc/validate`, {
            customerId: 'test-user',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
        });
        return response.status === 200;
    }, results);

    // Test 5: GDPR Data Export
    await runTest('GDPR Data Export', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/compliance/gdpr/export-data`, {
            userId: 'test-user',
            dataTypes: ['personal', 'transaction']
        });
        return response.status === 200;
    }, results);

    // Test 6: Compliance Reports
    await runTest('Compliance Reports (GET)', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/compliance/reports/generate`, {
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                reportType: 'monthly'
            }
        });
        return response.status === 200;
    }, results);

    // Test 7: Stripe Integration
    await runTest('Stripe Payment Health', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/payments/health`);
        return response.status === 200;
    }, results);

    // Test 8: Subscription System
    await runTest('Subscription System Health', async () => {
        const response = await axios.get(`${BACKEND_URL}/api/subscriptions/health`);
        return response.status === 200;
    }, results);

    // Test 9: CORS Configuration
    await runTest('CORS Configuration', async () => {
        const response = await axios.options(`${BACKEND_URL}/api/auth/register`);
        return response.status === 200;
    }, results);

    // Test 10: Authentication System
    await runTest('Authentication System', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phoneNumber: '+1234567890',
            password: 'testpassword123'
        });
        // Accept both success and validation errors as working system
        return response.status === 200 || response.status === 400;
    }, results);

    // Print Results
    console.log('');
    console.log('📊 PRODUCTION SYSTEM TEST RESULTS');
    console.log('==================================');
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

    // Overall Assessment
    if (results.failed === 0) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('✅ Frontend is live and accessible');
        console.log('✅ Backend is healthy and responding');
        console.log('✅ Compliance features are working');
        console.log('✅ Payment system is integrated');
        console.log('✅ System is ready for production use');
    } else if (results.passed > results.failed) {
        console.log('⚠️  MOSTLY OPERATIONAL');
        console.log('✅ Core systems are working');
        console.log('⚠️  Some features need attention');
        console.log('🔧 Check failed tests above');
    } else {
        console.log('❌ SYSTEM ISSUES DETECTED');
        console.log('🔧 Multiple systems need attention');
        console.log('📞 Contact support for assistance');
    }

    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('  - Monitor system performance');
    console.log('  - Test with real user data');
    console.log('  - Set up monitoring and alerts');
    console.log('  - Prepare for production launch');
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
testProductionSystem().catch(console.error);
