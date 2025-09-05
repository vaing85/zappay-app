// Transaction Security Types
export interface TransactionValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'amount' | 'frequency' | 'location' | 'pattern' | 'device' | 'time';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold?: number;
  timeWindow?: number; // in minutes
  maxAttempts?: number;
  cooldownPeriod?: number; // in minutes
}

export interface TransactionRiskScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendation: 'allow' | 'review' | 'block' | 'require_2fa';
}

export interface RiskFactor {
  type: string;
  description: string;
  impact: number; // 0-100
  weight: number; // 0-1
}

export interface TransactionAlert {
  id: string;
  transactionId: string;
  type: 'suspicious_amount' | 'unusual_location' | 'high_frequency' | 'pattern_anomaly' | 'device_mismatch' | 'time_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

export interface FraudDetectionConfig {
  enabled: boolean;
  rules: TransactionValidationRule[];
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  autoBlockThreshold: number;
  require2FAThreshold: number;
  reviewThreshold: number;
}

export interface TransactionSecuritySettings {
  fraudDetection: FraudDetectionConfig;
  twoFactorRequired: boolean;
  maxDailyAmount: number;
  maxSingleTransaction: number;
  allowedCountries: string[];
  blockedCountries: string[];
  deviceVerification: boolean;
  locationVerification: boolean;
  timeRestrictions: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'transaction_blocked' | 'fraud_detected' | 'suspicious_activity' | 'security_breach' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  userId: string;
  transactionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

export interface DeviceFingerprint {
  id: string;
  userId: string;
  deviceId: string;
  browser: string;
  os: string;
  screenResolution: string;
  timezone: string;
  language: string;
  plugins: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  createdAt: Date;
  lastSeen: Date;
  trusted: boolean;
  location: {
    country: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface TransactionSecurityContext {
  // Current transaction being processed
  currentTransaction: {
    amount: number;
    recipient: string;
    type: string;
    location?: {
      country: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    deviceFingerprint?: DeviceFingerprint;
    timestamp: Date;
  } | null;
  
  // Security settings
  settings: TransactionSecuritySettings;
  
  // Risk assessment
  riskScore: TransactionRiskScore | null;
  
  // Alerts and events
  alerts: TransactionAlert[];
  securityEvents: SecurityEvent[];
  
  // Device management
  trustedDevices: DeviceFingerprint[];
  
  // Validation rules
  validationRules: TransactionValidationRule[];
  
  // Loading states
  loading: boolean;
  validating: boolean;
  
  // Actions
  validateTransaction: (transaction: any) => Promise<TransactionRiskScore>;
  createSecurityAlert: (alert: Omit<TransactionAlert, 'id' | 'timestamp'>) => void;
  resolveAlert: (alertId: string, resolution: string) => void;
  createSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  updateSecuritySettings: (settings: Partial<TransactionSecuritySettings>) => void;
  addTrustedDevice: (device: Omit<DeviceFingerprint, 'id' | 'createdAt' | 'lastSeen'>) => void;
  removeTrustedDevice: (deviceId: string) => void;
  refreshAlerts: () => void;
  refreshSecurityEvents: () => void;
}
