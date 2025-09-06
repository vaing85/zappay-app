// Fraud Detection Service
// This service provides ML-powered fraud detection and risk assessment

export interface FraudRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  confidence: number; // 0-1
}

export interface FraudAlert {
  id: string;
  type: 'suspicious_transaction' | 'unusual_pattern' | 'location_anomaly' | 'device_anomaly' | 'velocity_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  transactionId?: string;
  riskScore: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  recommendedAction: string;
  autoResolved: boolean;
}

export interface TransactionRisk {
  transactionId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  confidence: number;
  recommendedAction: 'approve' | 'review' | 'block' | 'require_verification';
  verificationRequired: boolean;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  lastDetected: Date;
  falsePositiveRate: number;
}

export interface DeviceFingerprint {
  id: string;
  deviceId: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  plugins: string[];
  isTrusted: boolean;
  lastSeen: Date;
  riskScore: number;
}

export interface LocationData {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  isVpn: boolean;
  isProxy: boolean;
  riskScore: number;
}

class FraudDetectionService {
  private alerts: FraudAlert[] = [];
  private patterns: FraudPattern[] = [];
  private deviceFingerprints: Map<string, DeviceFingerprint> = new Map();
  private locationData: Map<string, LocationData> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    this.patterns = [
      {
        id: 'high-amount',
        name: 'High Amount Transaction',
        description: 'Transaction amount significantly higher than user average',
        pattern: 'amount > user_average * 3',
        riskLevel: 'medium',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.15
      },
      {
        id: 'unusual-time',
        name: 'Unusual Time Transaction',
        description: 'Transaction made at unusual hours (2-6 AM)',
        pattern: 'hour < 6 OR hour > 22',
        riskLevel: 'low',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.25
      },
      {
        id: 'rapid-transactions',
        name: 'Rapid Successive Transactions',
        description: 'Multiple transactions within short time period',
        pattern: 'transactions_count > 5 AND time_window < 300',
        riskLevel: 'high',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.10
      },
      {
        id: 'new-device',
        name: 'New Device Transaction',
        description: 'Transaction from previously unseen device',
        pattern: 'device_id NOT IN known_devices',
        riskLevel: 'medium',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.20
      },
      {
        id: 'location-anomaly',
        name: 'Location Anomaly',
        description: 'Transaction from unusual geographic location',
        pattern: 'location_distance > 1000km AND time_since_last < 24h',
        riskLevel: 'high',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.05
      },
      {
        id: 'velocity-anomaly',
        name: 'Velocity Anomaly',
        description: 'Transaction velocity exceeds normal patterns',
        pattern: 'transaction_velocity > user_velocity * 2',
        riskLevel: 'medium',
        frequency: 0,
        lastDetected: new Date(),
        falsePositiveRate: 0.15
      }
    ];
  }

  // Analyze transaction for fraud risk
  async analyzeTransaction(transaction: any, userProfile: any): Promise<TransactionRisk> {
    const riskFactors: string[] = [];
    let riskScore = 0;
    let confidence = 0.8;

    // Amount-based risk
    if (transaction.amount > userProfile.averageTransaction * 3) {
      riskFactors.push('High amount transaction');
      riskScore += 30;
    }

    // Time-based risk
    const hour = new Date(transaction.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      riskFactors.push('Unusual time transaction');
      riskScore += 15;
    }

    // Velocity-based risk
    const recentTransactions = await this.getRecentTransactions(transaction.userId, 24);
    if (recentTransactions.length > 5) {
      riskFactors.push('High transaction velocity');
      riskScore += 25;
    }

    // Device-based risk
    const deviceRisk = await this.analyzeDeviceRisk(transaction.deviceId, transaction.userId);
    if (deviceRisk.score > 50) {
      riskFactors.push('Suspicious device');
      riskScore += deviceRisk.score * 0.3;
    }

    // Location-based risk
    const locationRisk = await this.analyzeLocationRisk(transaction.location, transaction.userId);
    if (locationRisk.score > 50) {
      riskFactors.push('Suspicious location');
      riskScore += locationRisk.score * 0.2;
    }

    // Pattern-based risk
    const patternRisk = await this.analyzePatterns(transaction, userProfile);
    riskScore += patternRisk.score;
    riskFactors.push(...patternRisk.factors);

    // Normalize risk score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'medium';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    // Determine recommended action
    let recommendedAction: 'approve' | 'review' | 'block' | 'require_verification';
    if (riskLevel === 'low') recommendedAction = 'approve';
    else if (riskLevel === 'medium') recommendedAction = 'review';
    else if (riskLevel === 'high') recommendedAction = 'require_verification';
    else recommendedAction = 'block';

    return {
      transactionId: transaction.id,
      riskScore,
      riskLevel,
      factors: riskFactors,
      confidence,
      recommendedAction,
      verificationRequired: riskLevel === 'high' || riskLevel === 'critical'
    };
  }

  // Analyze device risk
  private async analyzeDeviceRisk(deviceId: string, userId: string): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Check if device is known
    const device = this.deviceFingerprints.get(deviceId);
    if (!device) {
      factors.push('Unknown device');
      score += 40;
    } else {
      // Check device trust level
      if (!device.isTrusted) {
        factors.push('Untrusted device');
        score += 20;
      }

      // Check if device is new
      const daysSinceLastSeen = (Date.now() - device.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastSeen > 30) {
        factors.push('Device not seen recently');
        score += 15;
      }

      // Check device risk score
      if (device.riskScore > 50) {
        factors.push('High-risk device');
        score += device.riskScore * 0.3;
      }
    }

    return { score, factors };
  }

  // Analyze location risk
  private async analyzeLocationRisk(location: any, userId: string): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Check if location is known
    const locationData = this.locationData.get(location.id);
    if (!locationData) {
      factors.push('Unknown location');
      score += 30;
    } else {
      // Check for VPN/Proxy
      if (locationData.isVpn || locationData.isProxy) {
        factors.push('VPN/Proxy detected');
        score += 25;
      }

      // Check location risk score
      if (locationData.riskScore > 50) {
        factors.push('High-risk location');
        score += locationData.riskScore * 0.2;
      }
    }

    // Check for location anomalies
    const recentLocations = await this.getRecentLocations(userId, 7);
    if (recentLocations.length > 0) {
      const lastLocation = recentLocations[0];
      const distance = this.calculateDistance(location, lastLocation);
      const timeDiff = Date.now() - new Date(lastLocation.timestamp).getTime();
      
      // If location changed significantly in short time
      if (distance > 1000 && timeDiff < 24 * 60 * 60 * 1000) {
        factors.push('Rapid location change');
        score += 35;
      }
    }

    return { score, factors };
  }

  // Analyze patterns
  private async analyzePatterns(transaction: any, userProfile: any): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Check against known fraud patterns
    for (const pattern of this.patterns) {
      if (this.matchesPattern(transaction, pattern)) {
        factors.push(pattern.name);
        score += this.getPatternRiskScore(pattern);
        pattern.frequency++;
        pattern.lastDetected = new Date();
      }
    }

    return { score, factors };
  }

  // Check if transaction matches a pattern
  private matchesPattern(transaction: any, pattern: FraudPattern): boolean {
    switch (pattern.id) {
      case 'high-amount':
        return transaction.amount > transaction.userAverage * 3;
      case 'unusual-time':
        const hour = new Date(transaction.timestamp).getHours();
        return hour < 6 || hour > 22;
      case 'rapid-transactions':
        return transaction.recentCount > 5;
      case 'new-device':
        return !transaction.deviceKnown;
      case 'location-anomaly':
        return transaction.locationDistance > 1000 && transaction.timeSinceLast < 24;
      case 'velocity-anomaly':
        return transaction.velocity > transaction.userVelocity * 2;
      default:
        return false;
    }
  }

  // Get pattern risk score
  private getPatternRiskScore(pattern: FraudPattern): number {
    const baseScores = { low: 10, medium: 25, high: 50, critical: 75 };
    return baseScores[pattern.riskLevel] * (1 - pattern.falsePositiveRate);
  }

  // Generate fraud alert
  async generateAlert(transaction: any, risk: TransactionRisk): Promise<FraudAlert> {
    const alert: FraudAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.getAlertType(risk.factors),
      severity: risk.riskLevel,
      title: this.getAlertTitle(risk.riskLevel, risk.factors),
      description: this.getAlertDescription(risk.factors, transaction),
      timestamp: new Date(),
      transactionId: transaction.id,
      riskScore: risk.riskScore,
      status: 'active',
      recommendedAction: this.getRecommendedAction(risk.riskLevel),
      autoResolved: false
    };

    this.alerts.push(alert);
    return alert;
  }

  // Get alert type based on risk factors
  private getAlertType(factors: string[]): FraudAlert['type'] {
    if (factors.some(f => f.includes('amount'))) return 'suspicious_transaction';
    if (factors.some(f => f.includes('location'))) return 'location_anomaly';
    if (factors.some(f => f.includes('device'))) return 'device_anomaly';
    if (factors.some(f => f.includes('velocity'))) return 'velocity_anomaly';
    return 'unusual_pattern';
  }

  // Get alert title
  private getAlertTitle(riskLevel: string, factors: string[]): string {
    const titles = {
      low: 'Low Risk Transaction',
      medium: 'Medium Risk Transaction',
      high: 'High Risk Transaction',
      critical: 'Critical Risk Transaction'
    };
    return titles[riskLevel as keyof typeof titles] || 'Transaction Alert';
  }

  // Get alert description
  private getAlertDescription(factors: string[], transaction: any): string {
    return `Transaction of $${transaction.amount} flagged due to: ${factors.join(', ')}`;
  }

  // Get recommended action
  private getRecommendedAction(riskLevel: string): string {
    const actions = {
      low: 'Monitor transaction',
      medium: 'Review transaction details',
      high: 'Require additional verification',
      critical: 'Block transaction immediately'
    };
    return actions[riskLevel as keyof typeof actions] || 'Review transaction';
  }

  // Get recent transactions
  private async getRecentTransactions(userId: string, hours: number): Promise<any[]> {
    // Simulate getting recent transactions
    return [];
  }

  // Get recent locations
  private async getRecentLocations(userId: string, days: number): Promise<any[]> {
    // Simulate getting recent locations
    return [];
  }

  // Calculate distance between two locations
  private calculateDistance(loc1: any, loc2: any): number {
    // Simplified distance calculation
    return Math.random() * 2000; // Mock distance
  }

  // Get all fraud alerts
  getAlerts(): FraudAlert[] {
    return this.alerts;
  }

  // Get fraud patterns
  getPatterns(): FraudPattern[] {
    return this.patterns;
  }

  // Update alert status
  updateAlertStatus(alertId: string, status: FraudAlert['status']): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      return true;
    }
    return false;
  }

  // Clear resolved alerts
  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(alert => alert.status !== 'resolved');
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();
export default fraudDetectionService;
