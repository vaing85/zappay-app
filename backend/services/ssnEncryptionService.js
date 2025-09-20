const crypto = require('crypto');

// SSN Encryption Service
// This service handles secure encryption and decryption of SSNs
// Uses AES-256-GCM encryption for maximum security

class SSNEncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    
    // Get encryption key from environment
    this.encryptionKey = this.getEncryptionKey();
  }

  getEncryptionKey() {
    const key = process.env.SSN_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('SSN_ENCRYPTION_KEY environment variable is required');
    }
    
    // Ensure key is exactly 32 bytes (256 bits)
    if (key.length !== 64) { // 64 hex characters = 32 bytes
      throw new Error('SSN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    
    return Buffer.from(key, 'hex');
  }

  // Format SSN for consistent storage (remove dashes, ensure 9 digits)
  formatSSN(ssn) {
    if (!ssn) return null;
    
    // Remove all non-digit characters
    const digits = ssn.replace(/\D/g, '');
    
    // Validate length
    if (digits.length !== 9) {
      throw new Error('SSN must contain exactly 9 digits');
    }
    
    // Validate SSN format (basic checks)
    if (digits === '000000000' || 
        digits === '111111111' || 
        digits === '222222222' || 
        digits === '333333333' || 
        digits === '444444444' || 
        digits === '555555555' || 
        digits === '666666666' || 
        digits === '777777777' || 
        digits === '888888888' || 
        digits === '999999999') {
      throw new Error('Invalid SSN format');
    }
    
    // Check for invalid area numbers (000, 666, 900-999)
    const areaNumber = digits.substring(0, 3);
    if (areaNumber === '000' || areaNumber === '666' || parseInt(areaNumber) >= 900) {
      throw new Error('Invalid SSN area number');
    }
    
    return digits;
  }

  // Encrypt SSN
  async encryptSSN(ssn) {
    try {
      const formattedSSN = this.formatSSN(ssn);
      if (!formattedSSN) return null;

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('zappay-ssn-encryption', 'utf8')); // Additional authenticated data
      
      // Encrypt
      let encrypted = cipher.update(formattedSSN, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine IV, tag, and encrypted data
      const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return result;
    } catch (error) {
      console.error('SSN encryption error:', error);
      throw new Error('Failed to encrypt SSN');
    }
  }

  // Decrypt SSN
  async decryptSSN(encryptedSSN) {
    try {
      if (!encryptedSSN) return null;

      // Split the encrypted data
      const parts = encryptedSSN.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted SSN format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('zappay-ssn-encryption', 'utf8'));
      decipher.setAuthTag(tag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('SSN decryption error:', error);
      throw new Error('Failed to decrypt SSN');
    }
  }

  // Mask SSN for display (shows only last 4 digits)
  maskSSN(ssn) {
    if (!ssn) return null;
    
    const formattedSSN = this.formatSSN(ssn);
    if (!formattedSSN) return null;
    
    return '***-**-' + formattedSSN.substring(5);
  }

  // Validate SSN format
  validateSSN(ssn) {
    try {
      this.formatSSN(ssn);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Generate a secure encryption key (for setup)
  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Create singleton instance
const ssnEncryptionService = new SSNEncryptionService();

// Export functions for use in models
module.exports = {
  encryptSSN: (ssn) => ssnEncryptionService.encryptSSN(ssn),
  decryptSSN: (encryptedSSN) => ssnEncryptionService.decryptSSN(encryptedSSN),
  maskSSN: (ssn) => ssnEncryptionService.maskSSN(ssn),
  validateSSN: (ssn) => ssnEncryptionService.validateSSN(ssn),
  formatSSN: (ssn) => ssnEncryptionService.formatSSN(ssn),
  generateEncryptionKey: SSNEncryptionService.generateEncryptionKey
};
