import { 
  SecuritySettings, 
  TwoFactorMethod, 
  SecurityEvent, 
  TrustedDevice, 
  SecurityAlert, 
  TransactionSecurity,
  PasswordPolicy,
  SecurityQuestion,
  BiometricData,
  SecurityReport,
  FraudDetectionRule,
  SecurityIncident
} from '../types/Security';

// Mock security data
export const mockSecuritySettings: SecuritySettings = {
  userId: 'user_1',
  twoFactorEnabled: true,
  biometricEnabled: true,
  pinEnabled: true,
  sessionTimeout: 30,
  autoLogout: true,
  securityAlerts: true,
  locationTracking: true,
  deviceTrust: true,
  passwordExpiry: 90,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export const mockTwoFactorMethods: TwoFactorMethod[] = [
  {
    id: '2fa_1',
    userId: 'user_1',
    type: 'sms',
    value: '+1234567890',
    isPrimary: true,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T10:30:00Z'
  },
  {
    id: '2fa_2',
    userId: 'user_1',
    type: 'email',
    value: 'user@example.com',
    isPrimary: false,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2fa_3',
    userId: 'user_1',
    type: 'authenticator',
    value: 'JBSWY3DPEHPK3PXP',
    isPrimary: false,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'event_1',
    userId: 'user_1',
    type: 'login',
    severity: 'low',
    description: 'Successful login from Chrome on Windows',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: {
      country: 'United States',
      city: 'New York',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    deviceInfo: {
      deviceId: 'device_1',
      deviceName: 'John\'s Laptop',
      deviceType: 'desktop',
      os: 'Windows 10',
      browser: 'Chrome 120.0'
    },
    createdAt: '2024-01-15T10:30:00Z',
    isResolved: true
  },
  {
    id: 'event_2',
    userId: 'user_1',
    type: 'transaction',
    severity: 'medium',
    description: 'Large transaction: $500.00 to recipient@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { amount: 500, recipient: 'recipient@example.com' },
    createdAt: '2024-01-15T09:15:00Z',
    isResolved: true
  },
  {
    id: 'event_3',
    userId: 'user_1',
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Multiple failed login attempts from unknown IP',
    ipAddress: '203.0.113.1',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    location: {
      country: 'Unknown',
      city: 'Unknown',
      coordinates: { lat: 0, lng: 0 }
    },
    createdAt: '2024-01-14T22:45:00Z',
    isResolved: false
  }
];

export const mockTrustedDevices: TrustedDevice[] = [
  {
    id: 'device_1',
    userId: 'user_1',
    deviceId: 'device_1',
    deviceName: 'John\'s Laptop',
    deviceType: 'desktop',
    os: 'Windows 10',
    browser: 'Chrome 120.0',
    ipAddress: '192.168.1.100',
    location: {
      country: 'United States',
      city: 'New York'
    },
    lastSeen: '2024-01-15T10:30:00Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'device_2',
    userId: 'user_1',
    deviceId: 'device_2',
    deviceName: 'John\'s iPhone',
    deviceType: 'mobile',
    os: 'iOS 17.2',
    browser: 'Safari 17.2',
    ipAddress: '192.168.1.101',
    location: {
      country: 'United States',
      city: 'New York'
    },
    lastSeen: '2024-01-15T08:15:00Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'alert_1',
    userId: 'user_1',
    type: 'unusual_spending',
    title: 'Unusual Spending Pattern Detected',
    message: 'You\'ve spent $800 in the last 24 hours, which is 200% above your average daily spending.',
    severity: 'medium',
    isRead: false,
    isResolved: false,
    actionRequired: true,
    actionUrl: '/security/alerts/alert_1',
    metadata: { amount: 800, average: 400, percentage: 200 },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'alert_2',
    userId: 'user_1',
    type: 'new_device',
    title: 'New Device Detected',
    message: 'A new device (Chrome on Windows) has accessed your account from New York, NY.',
    severity: 'low',
    isRead: true,
    isResolved: true,
    actionRequired: false,
    createdAt: '2024-01-14T15:20:00Z',
    resolvedAt: '2024-01-14T15:25:00Z'
  },
  {
    id: 'alert_3',
    userId: 'user_1',
    type: 'failed_login',
    title: 'Multiple Failed Login Attempts',
    message: '5 failed login attempts detected from IP 203.0.113.1. Your account has been temporarily locked.',
    severity: 'high',
    isRead: false,
    isResolved: false,
    actionRequired: true,
    actionUrl: '/security/incidents/alert_3',
    createdAt: '2024-01-14T22:45:00Z'
  }
];

export const mockPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90,
  preventReuse: 5,
  lockoutAttempts: 5,
  lockoutDuration: 15
};

export const mockSecurityQuestions: SecurityQuestion[] = [
  {
    id: 'q1',
    question: 'What was the name of your first pet?',
    answer: 'hashed_answer_1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'q2',
    question: 'What city were you born in?',
    answer: 'hashed_answer_2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'q3',
    question: 'What was your mother\'s maiden name?',
    answer: 'hashed_answer_3',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockBiometricData: BiometricData[] = [
  {
    id: 'bio_1',
    userId: 'user_1',
    type: 'fingerprint',
    isEnabled: true,
    lastUsed: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bio_2',
    userId: 'user_1',
    type: 'face',
    isEnabled: true,
    lastUsed: '2024-01-15T08:15:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Service functions
export const getSecuritySettings = (userId: string): SecuritySettings => {
  return mockSecuritySettings;
};

export const updateSecuritySettings = (userId: string, settings: Partial<SecuritySettings>): SecuritySettings => {
  const updatedSettings = { ...mockSecuritySettings, ...settings, updatedAt: new Date().toISOString() };
  return updatedSettings;
};

export const getTwoFactorMethods = (userId: string): TwoFactorMethod[] => {
  return mockTwoFactorMethods.filter(method => method.userId === userId);
};

export const addTwoFactorMethod = (method: Omit<TwoFactorMethod, 'id' | 'createdAt'>): TwoFactorMethod => {
  const newMethod: TwoFactorMethod = {
    ...method,
    id: `2fa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  mockTwoFactorMethods.push(newMethod);
  return newMethod;
};

export const getSecurityEvents = (userId: string, limit: number = 50): SecurityEvent[] => {
  return mockSecurityEvents
    .filter(event => event.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getTrustedDevices = (userId: string): TrustedDevice[] => {
  return mockTrustedDevices.filter(device => device.userId === userId);
};

export const addTrustedDevice = (device: Omit<TrustedDevice, 'id' | 'createdAt'>): TrustedDevice => {
  const newDevice: TrustedDevice = {
    ...device,
    id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  mockTrustedDevices.push(newDevice);
  return newDevice;
};

export const getSecurityAlerts = (userId: string): SecurityAlert[] => {
  return mockSecurityAlerts.filter(alert => alert.userId === userId);
};

export const markAlertAsRead = (alertId: string): void => {
  const alert = mockSecurityAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.isRead = true;
  }
};

export const resolveAlert = (alertId: string): void => {
  const alert = mockSecurityAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.isResolved = true;
    alert.resolvedAt = new Date().toISOString();
  }
};

export const getPasswordPolicy = (): PasswordPolicy => {
  return mockPasswordPolicy;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const policy = getPasswordPolicy();
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const checkPasswordBreach = async (password: string): Promise<boolean> => {
  // In a real app, this would check against a breach database
  // For demo purposes, we'll simulate some common passwords as breached
  const breachedPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  return breachedPasswords.includes(password.toLowerCase());
};

export const generateSecurityReport = (userId: string, period: string): SecurityReport => {
  const events = getSecurityEvents(userId);
  const alerts = getSecurityAlerts(userId);
  
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsBySeverity = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = events
    .filter(event => event.location)
    .reduce((acc, event) => {
      const location = `${event.location!.city}, ${event.location!.country}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topDevices = events
    .filter(event => event.deviceInfo)
    .reduce((acc, event) => {
      const device = `${event.deviceInfo!.deviceName} (${event.deviceInfo!.os})`;
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const riskScore = Math.min(100, events.filter(e => e.severity === 'high' || e.severity === 'critical').length * 20);

  const recommendations = [];
  if (riskScore > 50) {
    recommendations.push('Enable two-factor authentication');
  }
  if (events.filter(e => e.type === 'suspicious_activity').length > 0) {
    recommendations.push('Review recent security events');
  }
  if (alerts.filter(a => !a.isRead).length > 0) {
    recommendations.push('Review pending security alerts');
  }

  return {
    userId,
    period,
    totalEvents: events.length,
    eventsByType,
    eventsBySeverity,
    topLocations: Object.entries(topLocations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topDevices: Object.entries(topDevices)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    riskScore,
    recommendations,
    generatedAt: new Date().toISOString()
  };
};

export const createTransactionSecurity = (transactionId: string, userId: string, amount: number): TransactionSecurity => {
  const riskScore = calculateRiskScore(amount, userId);
  const requiresPin = amount > 100;
  const requires2FA = amount > 500;
  const requiresBiometric = amount > 1000;

  return {
    id: `tx_security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transactionId,
    userId,
    requiresPin,
    requires2FA,
    requiresBiometric,
    pinVerified: false,
    twoFactorVerified: false,
    biometricVerified: false,
    riskScore,
    riskFactors: getRiskFactors(amount, riskScore),
    isApproved: false,
    securityChecks: {
      locationCheck: true,
      deviceCheck: true,
      patternCheck: true,
      amountCheck: amount < 10000
    },
    createdAt: new Date().toISOString()
  };
};

const calculateRiskScore = (amount: number, userId: string): number => {
  let score = 0;
  
  if (amount > 1000) score += 30;
  if (amount > 5000) score += 20;
  if (amount > 10000) score += 30;
  
  // Add more risk factors based on user history, location, etc.
  return Math.min(100, score);
};

const getRiskFactors = (amount: number, riskScore: number): string[] => {
  const factors = [];
  
  if (amount > 1000) factors.push('High transaction amount');
  if (riskScore > 50) factors.push('Unusual spending pattern');
  if (riskScore > 80) factors.push('Very high risk transaction');
  
  return factors;
};
