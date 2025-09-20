// Test production services after environment variable configuration
const https = require('https');

console.log('🧪 Testing Production Services...\n');
console.log('This will test Rapyd, SendGrid, and Twilio services\n');

const backendUrl = 'https://zappayapp-ie9d2.ondigitalocean.app';

const testService = (endpoint, serviceName) => {
  return new Promise((resolve) => {
    console.log(`Testing: ${serviceName}`);
    console.log(`  Endpoint: ${endpoint}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Service-Test/1.0',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(endpoint, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isJson = data.trim().startsWith('{') || data.trim().startsWith('[');
        
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Content-Type: ${res.headers['content-type'] || 'Not set'}`);
        
        if (res.statusCode === 200 && isJson) {
          console.log(`  ✅ ${serviceName}: Working!`);
          console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          resolve({ success: true, service: serviceName, data });
        } else if (res.statusCode === 400 && isJson) {
          console.log(`  ⚠️ ${serviceName}: Configuration needed`);
          console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          resolve({ success: false, service: serviceName, error: 'Configuration needed', data });
        } else {
          console.log(`  ❌ ${serviceName}: Error (Status: ${res.statusCode})`);
          console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
          resolve({ success: false, service: serviceName, error: `Status ${res.statusCode}`, data });
        }
        
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ ${serviceName}: Connection error - ${error.message}`);
      console.log('');
      resolve({ success: false, service: serviceName, error: error.message });
    });

    req.on('timeout', () => {
      console.log(`  ⏰ ${serviceName}: Timeout`);
      console.log('');
      req.destroy();
      resolve({ success: false, service: serviceName, error: 'Timeout' });
    });

    req.setTimeout(15000);
    req.end();
  });
};

const runServiceTests = async () => {
  const services = [
    { endpoint: `${backendUrl}/rapyd-health`, name: 'Rapyd Payment Service' },
    { endpoint: `${backendUrl}/email-test`, name: 'SendGrid Email Service' },
    { endpoint: `${backendUrl}/sms-test`, name: 'Twilio SMS Service' }
  ];
  
  console.log('🔍 Testing all production services...\n');
  
  const results = [];
  for (const service of services) {
    const result = await testService(service.endpoint, service.name);
    results.push(result);
  }
  
  // Summary
  console.log('📊 SERVICE TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const workingServices = results.filter(r => r.success).length;
  const totalServices = results.length;
  
  console.log(`\n🔧 Services Working: ${workingServices}/${totalServices}`);
  
  results.forEach(result => {
    if (result.success) {
      console.log(`  ✅ ${result.service}: Working`);
    } else if (result.error === 'Configuration needed') {
      console.log(`  ⚠️ ${result.service}: Needs environment variables`);
    } else {
      console.log(`  ❌ ${result.service}: ${result.error}`);
    }
  });
  
  if (workingServices === totalServices) {
    console.log('\n🎉 SUCCESS! All production services are working!');
    console.log('✅ Rapyd payments ready');
    console.log('✅ SendGrid emails ready');
    console.log('✅ Twilio SMS ready');
    console.log('✅ ZapPay is fully production ready!');
  } else if (workingServices > 0) {
    console.log('\n⚠️ Some services need configuration.');
    console.log('💡 Check the DigitalOcean environment variables.');
  } else {
    console.log('\n❌ No services are working.');
    console.log('💡 Please configure the environment variables in DigitalOcean.');
  }
  
  console.log('\n🔗 Service Endpoints:');
  console.log(`  Rapyd: ${backendUrl}/rapyd-health`);
  console.log(`  SendGrid: ${backendUrl}/email-test`);
  console.log(`  Twilio: ${backendUrl}/sms-test`);
};

runServiceTests();
