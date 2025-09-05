// Data Encryption Types
export interface EncryptionKey {
  id: string;
  userId: string;
  publicKey: string;
  privateKey: string; // This would be encrypted with user's master password
  algorithm: 'RSA' | 'AES' | 'ChaCha20';
  keySize: number;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface EncryptedData {
  id: string;
  data: string; // Base64 encoded encrypted data
  iv: string; // Initialization vector
  keyId: string;
  algorithm: string;
  metadata: {
    originalSize: number;
    encryptedAt: Date;
    version: string;
  };
  checksum: string; // Data integrity check
}

export interface EncryptionSettings {
  defaultAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305' | 'RSA-OAEP';
  keyRotationInterval: number; // in days
  enableAtRestEncryption: boolean;
  enableInTransitEncryption: boolean;
  enableEndToEndEncryption: boolean;
  masterPasswordRequired: boolean;
  biometricUnlock: boolean;
  autoLockTimeout: number; // in minutes
  secureStorage: boolean;
  keyDerivation: {
    algorithm: 'PBKDF2' | 'Argon2' | 'Scrypt';
    iterations: number;
    saltLength: number;
  };
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  categories: string[];
  retentionPeriod: number; // in days
  encryptionRequired: boolean;
  accessControls: {
    roles: string[];
    permissions: string[];
  };
}

export interface EncryptedField {
  fieldName: string;
  originalValue: string;
  encryptedValue: string;
  keyId: string;
  algorithm: string;
  iv: string;
  classification: DataClassification;
}

export interface EncryptionContext {
  // Current encryption state
  isEncrypted: boolean;
  encryptionKey: EncryptionKey | null;
  masterPasswordHash: string | null;
  
  // Encryption settings
  settings: EncryptionSettings;
  
  // Data classification
  dataClassifications: DataClassification[];
  
  // Encryption operations
  encryptData: (data: any, classification: DataClassification) => Promise<EncryptedData>;
  decryptData: (encryptedData: EncryptedData) => Promise<any>;
  encryptField: (fieldName: string, value: string, classification: DataClassification) => Promise<EncryptedField>;
  decryptField: (encryptedField: EncryptedField) => Promise<string>;
  
  // Key management
  generateKeyPair: () => Promise<EncryptionKey>;
  rotateKeys: () => Promise<void>;
  revokeKey: (keyId: string) => Promise<void>;
  
  // Settings management
  updateEncryptionSettings: (settings: Partial<EncryptionSettings>) => Promise<void>;
  updateDataClassification: (classification: DataClassification) => Promise<void>;
  
  // Security operations
  verifyDataIntegrity: (encryptedData: EncryptedData) => Promise<boolean>;
  secureWipe: (data: any) => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  encrypting: boolean;
  decrypting: boolean;
}

export interface SecureStorage {
  setItem: (key: string, value: string, classification: DataClassification) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
}

export interface EncryptionAuditLog {
  id: string;
  userId: string;
  operation: 'encrypt' | 'decrypt' | 'key_generate' | 'key_rotate' | 'key_revoke';
  dataType: string;
  classification: DataClassification;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata: {
    keyId?: string;
    algorithm?: string;
    dataSize?: number;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface BiometricAuth {
  enabled: boolean;
  supportedTypes: ('fingerprint' | 'face' | 'voice' | 'iris')[];
  enrolledTypes: string[];
  fallbackMethod: 'password' | 'pin' | 'pattern';
  maxAttempts: number;
  lockoutDuration: number; // in minutes
}

export interface DataProtectionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  classification: DataClassification;
  encryptionRequired: boolean;
  retentionPeriod: number;
  accessControls: {
    roles: string[];
    permissions: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      timezone: string;
    };
    locationRestrictions?: {
      allowedCountries: string[];
      blockedCountries: string[];
    };
  };
  auditRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
