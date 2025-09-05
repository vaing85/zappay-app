import {
  TransactionValidationRule,
  TransactionRiskScore,
  RiskFactor,
  TransactionAlert,
  FraudDetectionConfig,
  TransactionSecuritySettings,
  SecurityEvent,
  DeviceFingerprint,
  TransactionSecurityContext
} from '../types/TransactionSecurity';

// Mock data for demonstration
const mockValidationRules: TransactionValidationRule[] = [
  {
    id: '1',
    name: 'High Amount Transaction',
    description: 'Flag transactions above $10,000',
    type: 'amount',
    enabled: true,
    severity: 'high',
    threshold: 10000
  },
  {
    id: '2',
    name: 'Rapid Successive Transactions',
    description: 'Flag more than 5 transactions in 10 minutes',
    type: 'frequency',
    enabled: true,
    severity: 'medium',
    timeWindow: 10,
    maxAttempts: 5
  },
  {
    id: '3',
    name: 'Unusual Location',
    description: 'Flag transactions from new countries',
    type: 'location',
    enabled: true,
    severity: 'medium'
  },
  {
    id: '4',
    name: 'Late Night Transactions',
    description: 'Flag transactions between 2 AM and 5 AM',
    type: 'time',
    enabled: true,
    severity: 'low',
    timeWindow: 180 // 3 hours
  },
  {
    id: '5',
    name: 'Device Mismatch',
    description: 'Flag transactions from unrecognized devices',
    type: 'device',
    enabled: true,
    severity: 'high'
  }
];

const mockSecuritySettings: TransactionSecuritySettings = {
  fraudDetection: {
    enabled: true,
    rules: mockValidationRules,
    riskThresholds: {
      low: 30,
      medium: 50,
      high: 70,
      critical: 90
    },
    autoBlockThreshold: 90,
    require2FAThreshold: 60,
    reviewThreshold: 40
  },
  twoFactorRequired: true,
  maxDailyAmount: 50000,
  maxSingleTransaction: 25000,
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
  blockedCountries: ['KP', 'IR', 'SY'],
  deviceVerification: true,
  locationVerification: true,
  timeRestrictions: {
    enabled: false,
    startTime: '06:00',
    endTime: '22:00',
    timezone: 'UTC'
  },
  notificationSettings: {
    email: true,
    sms: true,
    push: true
  }
};

const mockAlerts: TransactionAlert[] = [
  {
    id: '1',
    transactionId: 'txn_001',
    type: 'suspicious_amount',
    severity: 'high',
    message: 'Transaction amount $15,000 exceeds normal spending pattern',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    resolved: false
  },
  {
    id: '2',
    transactionId: 'txn_002',
    type: 'unusual_location',
    severity: 'medium',
    message: 'Transaction from new location: Tokyo, Japan',
    timestamp: new Date('2024-01-14T15:45:00Z'),
    resolved: true,
    resolution: 'Verified with user via SMS',
    resolvedAt: new Date('2024-01-14T16:00:00Z')
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'transaction_blocked',
    severity: 'high',
    description: 'Transaction blocked due to high risk score (85)',
    timestamp: new Date('2024-01-15T11:00:00Z'),
    userId: 'user_001',
    transactionId: 'txn_003',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: {
      country: 'US',
      city: 'New York',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    resolved: false
  }
];

const mockTrustedDevices: DeviceFingerprint[] = [
  {
    id: '1',
    userId: 'user_001',
    deviceId: 'device_001',
    browser: 'Chrome 120.0',
    os: 'Windows 10',
    screenResolution: '1920x1080',
    timezone: 'America/New_York',
    language: 'en-US',
    plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer'],
    canvasFingerprint: 'abc123def456',
    webglFingerprint: 'webgl789',
    audioFingerprint: 'audio456',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastSeen: new Date('2024-01-15T10:00:00Z'),
    trusted: true,
    location: {
      country: 'US',
      city: 'New York',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  }
];

// Risk assessment algorithms
export const calculateRiskScore = (
  transaction: any,
  userHistory: any[],
  deviceFingerprint?: DeviceFingerprint,
  location?: any
): TransactionRiskScore => {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // Amount-based risk
  if (transaction.amount > 10000) {
    const amountFactor: RiskFactor = {
      type: 'high_amount',
      description: `Transaction amount $${transaction.amount} is above normal threshold`,
      impact: Math.min(transaction.amount / 1000, 50),
      weight: 0.3
    };
    factors.push(amountFactor);
    totalScore += amountFactor.impact * amountFactor.weight;
  }

  // Frequency-based risk
  const recentTransactions = userHistory.filter(t => 
    new Date(t.timestamp).getTime() > Date.now() - 10 * 60 * 1000 // Last 10 minutes
  );
  if (recentTransactions.length > 5) {
    const frequencyFactor: RiskFactor = {
      type: 'high_frequency',
      description: `${recentTransactions.length} transactions in the last 10 minutes`,
      impact: recentTransactions.length * 10,
      weight: 0.25
    };
    factors.push(frequencyFactor);
    totalScore += frequencyFactor.impact * frequencyFactor.weight;
  }

  // Location-based risk
  if (location && !mockSecuritySettings.allowedCountries.includes(location.country)) {
    const locationFactor: RiskFactor = {
      type: 'unusual_location',
      description: `Transaction from restricted country: ${location.country}`,
      impact: 40,
      weight: 0.2
    };
    factors.push(locationFactor);
    totalScore += locationFactor.impact * locationFactor.weight;
  }

  // Device-based risk
  if (deviceFingerprint && !deviceFingerprint.trusted) {
    const deviceFactor: RiskFactor = {
      type: 'untrusted_device',
      description: 'Transaction from unrecognized device',
      impact: 30,
      weight: 0.15
    };
    factors.push(deviceFactor);
    totalScore += deviceFactor.impact * deviceFactor.weight;
  }

  // Time-based risk
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    const timeFactor: RiskFactor = {
      type: 'unusual_time',
      description: 'Transaction during unusual hours (2 AM - 5 AM)',
      impact: 15,
      weight: 0.1
    };
    factors.push(timeFactor);
    totalScore += timeFactor.impact * timeFactor.weight;
  }

  // Determine risk level
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (totalScore >= 70) level = 'critical';
  else if (totalScore >= 50) level = 'high';
  else if (totalScore >= 30) level = 'medium';
  else level = 'low';

  // Determine recommendation
  let recommendation: 'allow' | 'review' | 'block' | 'require_2fa';
  if (totalScore >= 90) recommendation = 'block';
  else if (totalScore >= 60) recommendation = 'require_2fa';
  else if (totalScore >= 40) recommendation = 'review';
  else recommendation = 'allow';

  return {
    score: Math.min(Math.round(totalScore), 100),
    level,
    factors,
    recommendation
  };
};

// Service functions
export const getTransactionSecuritySettings = async (userId: string): Promise<TransactionSecuritySettings> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSecuritySettings;
};

export const getValidationRules = async (): Promise<TransactionValidationRule[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockValidationRules;
};

export const getSecurityAlerts = async (userId: string): Promise<TransactionAlert[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockAlerts.filter(alert => !alert.resolved);
};

export const getSecurityEvents = async (userId: string): Promise<SecurityEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockSecurityEvents;
};

export const getTrustedDevices = async (userId: string): Promise<DeviceFingerprint[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockTrustedDevices;
};

export const validateTransaction = async (
  transaction: any,
  userId: string
): Promise<TransactionRiskScore> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get user transaction history (mock)
  const userHistory = [
    { amount: 100, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { amount: 250, timestamp: new Date(Date.now() - 3 * 60 * 1000) },
    { amount: 75, timestamp: new Date(Date.now() - 1 * 60 * 1000) }
  ];

  const deviceFingerprint = mockTrustedDevices[0];
  const location = { country: 'US', city: 'New York' };

  return calculateRiskScore(transaction, userHistory, deviceFingerprint, location);
};

export const createSecurityAlert = async (
  alert: Omit<TransactionAlert, 'id' | 'timestamp'>
): Promise<TransactionAlert> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newAlert: TransactionAlert = {
    ...alert,
    id: `alert_${Date.now()}`,
    timestamp: new Date()
  };
  
  mockAlerts.push(newAlert);
  return newAlert;
};

export const resolveSecurityAlert = async (
  alertId: string,
  resolution: string
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const alert = mockAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    alert.resolution = resolution;
    alert.resolvedAt = new Date();
  }
};

export const createSecurityEvent = async (
  event: Omit<SecurityEvent, 'id' | 'timestamp'>
): Promise<SecurityEvent> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newEvent: SecurityEvent = {
    ...event,
    id: `event_${Date.now()}`,
    timestamp: new Date()
  };
  
  mockSecurityEvents.push(newEvent);
  return newEvent;
};

export const updateSecuritySettings = async (
  userId: string,
  settings: Partial<TransactionSecuritySettings>
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would update the backend
  Object.assign(mockSecuritySettings, settings);
};

export const addTrustedDevice = async (
  userId: string,
  device: Omit<DeviceFingerprint, 'id' | 'createdAt' | 'lastSeen'>
): Promise<DeviceFingerprint> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newDevice: DeviceFingerprint = {
    ...device,
    id: `device_${Date.now()}`,
    createdAt: new Date(),
    lastSeen: new Date()
  };
  
  mockTrustedDevices.push(newDevice);
  return newDevice;
};

export const removeTrustedDevice = async (
  deviceId: string
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockTrustedDevices.findIndex(d => d.id === deviceId);
  if (index > -1) {
    mockTrustedDevices.splice(index, 1);
  }
};

export const generateDeviceFingerprint = (): Partial<DeviceFingerprint> => {
  return {
    deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
    browser: navigator.userAgent,
    os: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    plugins: Array.from(navigator.plugins).map(p => p.name),
    canvasFingerprint: 'generated_canvas_fp',
    webglFingerprint: 'generated_webgl_fp',
    audioFingerprint: 'generated_audio_fp',
    trusted: false,
    location: {
      country: 'US',
      city: 'Unknown',
      coordinates: { lat: 0, lng: 0 }
    }
  };
};
