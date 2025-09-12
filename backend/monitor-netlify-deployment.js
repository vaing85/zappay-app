// Monitor Netlify deployment and test API routing
const https = require('https');

console.log('🔄 Monitoring Netlify Deployment...\n');
console.log('Testing API routing every 30 seconds...\n');
console.log('Press Ctrl+C to stop monitoring\n');

let testCount = 0;
const maxTests = 20; // Test for up to 10 minutes (20 * 30 seconds)

const testApiRouting = () => {
  testCount++;
  console.log(`\n📊 Test #${testCount} - ${new Date().toLocaleTimeString()}`);
  
  const testEndpoints = [
    { url: 'https://zappay.site/health', name: 'Health Endpoint' },
    { url: 'https://zappay.site/api/health', name: 'API Health Endpoint' },
    { url: 'https://zappay.site/rapyd-health', name: 'Rapyd Health' }
  ];
  
  let allWorking = true;
  
  const testEndpoint = (endpoint) => {
    return new Promise((resolve) => {
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'ZapPay-Monitor/1.0',
          'Accept': 'application/json'
        },
        timeout: 10000
      };

      const req = https.request(endpoint.url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const isJson = data.trim().startsWith('{') || data.trim().startsWith('[');
          const isHtml = data.includes('<!doctype html>') || data.includes('<html');
          
          if (res.statusCode === 200 && isJson) {
            console.log(`  ✅ ${endpoint.name}: Working (JSON response)`);
            resolve(true);
          } else if (res.statusCode === 200 && isHtml) {
            console.log(`  ⏳ ${endpoint.name}: Still serving HTML (deployment pending)`);
            allWorking = false;
            resolve(false);
          } else {
            console.log(`  ❌ ${endpoint.name}: Error (Status: ${res.statusCode})`);
            allWorking = false;
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log(`  ❌ ${endpoint.name}: Connection error - ${error.message}`);
        allWorking = false;
        resolve(false);
      });

      req.on('timeout', () => {
        console.log(`  ⏰ ${endpoint.name}: Timeout`);
        allWorking = false;
        req.destroy();
        resolve(false);
      });

      req.setTimeout(10000);
      req.end();
    });
  };

  // Test all endpoints
  Promise.all(testEndpoints.map(testEndpoint)).then((results) => {
    const workingCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Summary: ${workingCount}/${totalCount} endpoints working`);
    
    if (allWorking) {
      console.log('\n🎉 SUCCESS! All API endpoints are working!');
      console.log('✅ Netlify deployment is complete');
      console.log('✅ API routing is working correctly');
      console.log('✅ Frontend and backend are connected');
      process.exit(0);
    } else if (testCount >= maxTests) {
      console.log('\n⏰ Timeout reached. Deployment may still be in progress.');
      console.log('💡 You can check the Netlify dashboard for deployment status.');
      process.exit(1);
    } else {
      console.log('⏳ Waiting 30 seconds before next test...');
    }
  });
};

// Start monitoring
testApiRouting();

// Test every 30 seconds
const interval = setInterval(() => {
  testApiRouting();
}, 30000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Monitoring stopped by user');
  clearInterval(interval);
  process.exit(0);
});
