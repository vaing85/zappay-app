// SSN Validation and Formatting Utilities
// Comprehensive validation for Social Security Numbers

class SSNValidation {
  // Format SSN for display (XXX-XX-XXXX)
  static formatSSN(ssn) {
    if (!ssn) return null;
    
    // Remove all non-digit characters
    const digits = ssn.replace(/\D/g, '');
    
    // Must be exactly 9 digits
    if (digits.length !== 9) return null;
    
    // Format as XXX-XX-XXXX
    return digits.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
  }

  // Format SSN for input (remove dashes, spaces, etc.)
  static cleanSSN(ssn) {
    if (!ssn) return null;
    return ssn.replace(/\D/g, '');
  }

  // Validate SSN format and rules
  static validateSSN(ssn) {
    if (!ssn) {
      return { valid: true, error: '' }; // SSN is optional
    }

    // Clean the SSN
    const cleaned = this.cleanSSN(ssn);
    
    // Check length
    if (cleaned.length !== 9) {
      return { valid: false, error: 'SSN must contain exactly 9 digits' };
    }

    // Check for all zeros
    if (cleaned === '000000000') {
      return { valid: false, error: 'Invalid SSN format' };
    }

    // Check for all same digits
    if (/^(\d)\1{8}$/.test(cleaned)) {
      return { valid: false, error: 'Invalid SSN format' };
    }

    // Extract parts
    const areaNumber = cleaned.substring(0, 3);
    const groupNumber = cleaned.substring(3, 5);
    const serialNumber = cleaned.substring(5, 9);

    // Validate area number (000, 666, 900-999 are invalid)
    if (areaNumber === '000' || areaNumber === '666' || parseInt(areaNumber) >= 900) {
      return { valid: false, error: 'Invalid SSN area number' };
    }

    // Validate group number (00 is invalid)
    if (groupNumber === '00') {
      return { valid: false, error: 'Invalid SSN group number' };
    }

    // Validate serial number (0000 is invalid)
    if (serialNumber === '0000') {
      return { valid: false, error: 'Invalid SSN serial number' };
    }

    // Additional validation for known invalid ranges
    const invalidRanges = [
      { start: '000', end: '000' },
      { start: '666', end: '666' },
      { start: '900', end: '999' }
    ];

    for (const range of invalidRanges) {
      if (areaNumber >= range.start && areaNumber <= range.end) {
        return { valid: false, error: 'Invalid SSN area number' };
      }
    }

    return { valid: true, cleaned, formatted: this.formatSSN(cleaned) };
  }

  // Mask SSN for display (shows only last 4 digits)
  static maskSSN(ssn) {
    if (!ssn) return null;
    
    const cleaned = this.cleanSSN(ssn);
    if (cleaned.length !== 9) return null;
    
    return '***-**-' + cleaned.substring(5);
  }

  // Check if SSN is already masked
  static isMasked(ssn) {
    return ssn && ssn.includes('***');
  }

  // Validate SSN for Stripe (they have specific requirements)
  static validateForStripe(ssn) {
    const validation = this.validateSSN(ssn);
    
    if (!validation.valid) {
      return validation;
    }

    // Stripe requires SSN to be exactly 9 digits, no dashes
    return {
      valid: true,
      cleaned: validation.cleaned,
      formatted: validation.cleaned // Stripe wants no formatting
    };
  }

  // Generate a test SSN (for development only)
  static generateTestSSN() {
    // Generate a valid but fake SSN for testing
    const areaNumber = Math.floor(Math.random() * 899) + 1; // 001-899
    const groupNumber = Math.floor(Math.random() * 99) + 1;  // 01-99
    const serialNumber = Math.floor(Math.random() * 9999) + 1; // 0001-9999
    
    return String(areaNumber).padStart(3, '0') + 
           String(groupNumber).padStart(2, '0') + 
           String(serialNumber).padStart(4, '0');
  }

  // Check if SSN is a test SSN (starts with 000, 111, 222, etc.)
  static isTestSSN(ssn) {
    const cleaned = this.cleanSSN(ssn);
    if (!cleaned || cleaned.length !== 9) return false;
    
    const areaNumber = cleaned.substring(0, 3);
    return areaNumber.startsWith('000') || 
           areaNumber.startsWith('111') || 
           areaNumber.startsWith('222') ||
           areaNumber.startsWith('333') ||
           areaNumber.startsWith('444') ||
           areaNumber.startsWith('555') ||
           areaNumber.startsWith('666') ||
           areaNumber.startsWith('777') ||
           areaNumber.startsWith('888') ||
           areaNumber.startsWith('999');
  }
}

module.exports = SSNValidation;
