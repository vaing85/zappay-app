// Script to help find the correct backend URL
console.log('🔍 Let\'s find your DigitalOcean backend URL...\n');

console.log('Please check your DigitalOcean dashboard and look for:');
console.log('1. Go to Apps & Functions');
console.log('2. Find your backend app (probably named "zappay-api" or similar)');
console.log('3. Look for the URL - it should be something like:');
console.log('   - zappay-api-xxxxx.ondigitalocean.app');
console.log('   - zappay-backend-xxxxx.ondigitalocean.app');
console.log('   - Or similar pattern\n');

console.log('Once you have the URL, we can test it directly!');
console.log('The URL should be accessible at: https://YOUR-BACKEND-URL/health');
console.log('And it should return JSON, not HTML.\n');

console.log('Common issues:');
console.log('- Backend app not running');
console.log('- Backend app not healthy');
console.log('- Wrong URL being used');
console.log('- CORS configuration issues');
console.log('- Frontend routing all requests to itself');
