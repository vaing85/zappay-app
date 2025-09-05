export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  sessionTimeout: number; // minutes
  autoLogout: boolean;
  securityAlerts: boolean;
  locationTracking: boolean;
  deviceTrust: boolean;
  passwordExpiry: number; // days
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorMethod {
  id: string;
  userId: string;
  type: 'sms' | 'email' | 'authenticator' | 'backup_codes';
  value: string; // phone number, email, or secret key
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'transaction' | 'password_change' | '2fa_enabled' | 'device_added' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deviceInfo?: {
    deviceId: string;
    deviceName: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  isResolved: boolean;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
  };
  lastSeen: string;
  isActive: boolean;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'unusual_spending' | 'new_device' | 'failed_login' | 'password_breach' | 'suspicious_transaction' | 'location_change';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isResolved: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  resolvedAt?: string;
}

export interface TransactionSecurity {
  id: string;
  transactionId: string;
  userId: string;
  requiresPin: boolean;
  requires2FA: boolean;
  requiresBiometric: boolean;
  pinVerified: boolean;
  twoFactorVerified: boolean;
  biometricVerified: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  isApproved: boolean;
  securityChecks: {
    locationCheck: boolean;
    deviceCheck: boolean;
    patternCheck: boolean;
    amountCheck: boolean;
  };
  createdAt: string;
  verifiedAt?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords
  lockoutAttempts: number;
  lockoutDuration: number; // minutes
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string; // hashed
  createdAt: string;
}

export interface BiometricData {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice';
  isEnabled: boolean;
  lastUsed: string;
  createdAt: string;
}

export interface SecurityReport {
  userId: string;
  period: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  topDevices: Array<{
    device: string;
    count: number;
  }>;
  riskScore: number;
  recommendations: string[];
  generatedAt: string;
}

export interface FraudDetectionRule {
  id: string;
  name: string;
  description: string;
  type: 'amount' | 'frequency' | 'location' | 'time' | 'pattern';
  conditions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
}

export interface SecurityIncident {
  id: string;
  userId: string;
  type: 'breach_attempt' | 'fraud_detected' | 'unauthorized_access' | 'data_leak' | 'system_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  affectedData: string[];
  actions: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
  }>;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
