// Generate SSN Encryption Key
// Run this script to generate a secure encryption key for SSN data

const crypto = require('crypto');

console.log('🔐 Generating SSN Encryption Key...\n');

// Generate a 256-bit (32-byte) encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ SSN Encryption Key Generated:');
console.log(`SSN_ENCRYPTION_KEY=${encryptionKey}\n`);

console.log('📋 Next Steps:');
console.log('1. Copy the key above to your .env file');
console.log('2. Keep this key secure and never commit it to version control');
console.log('3. Use the same key across all environments for data consistency');
console.log('4. Store a backup of this key in a secure location\n');

console.log('⚠️  Security Notes:');
console.log('- This key is used to encrypt SSN data in the database');
console.log('- Losing this key means SSN data cannot be decrypted');
console.log('- Rotate this key periodically for enhanced security');
console.log('- Use different keys for different environments (dev/staging/prod)');

// Test the key
try {
  const { encryptSSN, decryptSSN } = require('./services/ssnEncryptionService');
  
  console.log('\n🧪 Testing encryption with generated key...');
  
  // Set the key in environment for testing
  process.env.SSN_ENCRYPTION_KEY = encryptionKey;
  
  const testSSN = '123456789';
  const encrypted = await encryptSSN(testSSN);
  const decrypted = await decryptSSN(encrypted);
  
  if (decrypted === testSSN) {
    console.log('✅ Encryption test passed!');
  } else {
    console.log('❌ Encryption test failed!');
  }
} catch (error) {
  console.log('⚠️  Could not test encryption (this is normal if dependencies are not installed)');
  console.log('   The key is still valid and ready to use');
}
