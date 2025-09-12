// Test script to identify which module is causing the await error
console.log('Testing server module loading...');

try {
  console.log('1. Loading server.js...');
  require('./server.js');
  console.log('✅ Server loaded successfully');
} catch (error) {
  console.error('❌ Error loading server:', error.message);
  console.error('Stack:', error.stack);
}
