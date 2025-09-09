// Enhanced Biometric Authentication Service
// Provides comprehensive biometric authentication including fingerprint, face, and voice recognition

export interface BiometricCapability {
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  available: boolean;
  enrolled: boolean;
  confidence: number; // 0-1
  lastUsed?: Date;
  errorRate: number; // 0-1
}

export interface BiometricEnrollment {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  template: string; // Encrypted biometric template
  quality: number; // 0-1
  enrolledAt: Date;
  lastUsed?: Date;
  isActive: boolean;
  metadata: {
    deviceId: string;
    os: string;
    browser?: string;
    location?: string;
  };
}

export interface BiometricChallenge {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  challenge: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
}

export interface BiometricSettings {
  userId: string;
  enabled: boolean;
  fallbackToPassword: boolean;
  requireBiometricForPayments: boolean;
  requireBiometricForSensitiveActions: boolean;
  allowedTypes: ('fingerprint' | 'face' | 'voice' | 'iris' | 'palm')[];
  qualityThreshold: number; // 0-1
  maxRetries: number;
  sessionTimeout: number; // minutes
  autoLock: boolean;
  autoLockTimeout: number; // minutes
}

export interface BiometricAnalytics {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  averageResponseTime: number; // milliseconds
  typeBreakdown: {
    fingerprint: { attempts: number; successRate: number };
    face: { attempts: number; successRate: number };
    voice: { attempts: number; successRate: number };
    iris: { attempts: number; successRate: number };
    palm: { attempts: number; successRate: number };
  };
  deviceBreakdown: Array<{
    deviceId: string;
    attempts: number;
    successRate: number;
  }>;
  timeBreakdown: Array<{
    hour: number;
    attempts: number;
    successRate: number;
  }>;
}

class BiometricAuthService {
  private capabilities: BiometricCapability[] = [];
  private enrollments: BiometricEnrollment[] = [];
  private challenges: BiometricChallenge[] = [];
  private settings: BiometricSettings | null = null;
  private analytics: BiometricAnalytics = {
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    successRate: 0,
    averageResponseTime: 0,
    typeBreakdown: {
      fingerprint: { attempts: 0, successRate: 0 },
      face: { attempts: 0, successRate: 0 },
      voice: { attempts: 0, successRate: 0 },
      iris: { attempts: 0, successRate: 0 },
      palm: { attempts: 0, successRate: 0 }
    },
    deviceBreakdown: [],
    timeBreakdown: []
  };

  constructor() {
    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    // Check browser/device capabilities
    this.capabilities = [
      {
        type: 'fingerprint',
        available: this.isFingerprintAvailable(),
        enrolled: false,
        confidence: 0,
        errorRate: 0.01
      },
      {
        type: 'face',
        available: this.isFaceRecognitionAvailable(),
        enrolled: false,
        confidence: 0,
        errorRate: 0.02
      },
      {
        type: 'voice',
        available: this.isVoiceRecognitionAvailable(),
        enrolled: false,
        confidence: 0,
        errorRate: 0.03
      },
      {
        type: 'iris',
        available: false, // Not commonly available in web browsers
        enrolled: false,
        confidence: 0,
        errorRate: 0.01
      },
      {
        type: 'palm',
        available: false, // Not commonly available in web browsers
        enrolled: false,
        confidence: 0,
        errorRate: 0.01
      }
    ];
  }

  private isFingerprintAvailable(): boolean {
    // Check for WebAuthn support
    return !!(navigator.credentials && window.PublicKeyCredential);
  }

  private isFaceRecognitionAvailable(): boolean {
    // Check for camera access and face detection capabilities
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private isVoiceRecognitionAvailable(): boolean {
    // Check for speech recognition capabilities
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Initialize biometric authentication for a user
  async initializeUser(userId: string): Promise<BiometricSettings> {
    const defaultSettings: BiometricSettings = {
      userId,
      enabled: false,
      fallbackToPassword: true,
      requireBiometricForPayments: false,
      requireBiometricForSensitiveActions: false,
      allowedTypes: ['fingerprint', 'face', 'voice'],
      qualityThreshold: 0.7,
      maxRetries: 3,
      sessionTimeout: 30,
      autoLock: true,
      autoLockTimeout: 5
    };

    this.settings = defaultSettings;
    return defaultSettings;
  }

  // Get available biometric capabilities
  getCapabilities(): BiometricCapability[] {
    return this.capabilities.filter(cap => cap.available);
  }

  // Enroll a new biometric
  async enrollBiometric(
    userId: string,
    type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm',
    biometricData: string
  ): Promise<BiometricEnrollment> {
    if (!this.settings || this.settings.userId !== userId) {
      throw new Error('User not initialized');
    }

    const capability = this.capabilities.find(cap => cap.type === type);
    if (!capability || !capability.available) {
      throw new Error(`Biometric type ${type} not available`);
    }

    if (!this.settings.allowedTypes.includes(type)) {
      throw new Error(`Biometric type ${type} not allowed`);
    }

    // Simulate biometric template creation
    const template = await this.createBiometricTemplate(biometricData, type);
    const quality = await this.assessBiometricQuality(biometricData, type);

    if (quality < this.settings.qualityThreshold) {
      throw new Error(`Biometric quality too low: ${quality.toFixed(2)} < ${this.settings.qualityThreshold}`);
    }

    const enrollment: BiometricEnrollment = {
      id: this.generateId(),
      userId,
      type,
      template,
      quality,
      enrolledAt: new Date(),
      isActive: true,
      metadata: {
        deviceId: this.getDeviceId(),
        os: this.getOS(),
        browser: this.getBrowser(),
        location: await this.getLocation()
      }
    };

    this.enrollments.push(enrollment);
    capability.enrolled = true;
    capability.confidence = quality;

    return enrollment;
  }

  // Authenticate using biometric
  async authenticateBiometric(
    userId: string,
    type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm',
    biometricData: string
  ): Promise<{ success: boolean; confidence: number; challengeId?: string }> {
    const startTime = Date.now();

    if (!this.settings || this.settings.userId !== userId) {
      throw new Error('User not initialized');
    }

    const enrollment = this.enrollments.find(
      e => e.userId === userId && e.type === type && e.isActive
    );

    if (!enrollment) {
      throw new Error(`No ${type} enrollment found for user`);
    }

    // Simulate biometric matching
    const confidence = await this.matchBiometric(biometricData, enrollment.template, type);
    const success = confidence >= this.settings.qualityThreshold;

    // Update analytics
    this.updateAnalytics(type, success, Date.now() - startTime);

    if (success) {
      enrollment.lastUsed = new Date();
      const capability = this.capabilities.find(cap => cap.type === type);
      if (capability) {
        capability.confidence = confidence;
      }
    }

    return { success, confidence };
  }

  // Create a biometric challenge for multi-factor authentication
  async createBiometricChallenge(
    userId: string,
    type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm'
  ): Promise<BiometricChallenge> {
    const challenge: BiometricChallenge = {
      id: this.generateId(),
      userId,
      type,
      challenge: this.generateChallenge(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
      createdAt: new Date()
    };

    this.challenges.push(challenge);
    return challenge;
  }

  // Verify a biometric challenge
  async verifyBiometricChallenge(
    challengeId: string,
    biometricData: string
  ): Promise<{ success: boolean; confidence: number }> {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'pending') {
      throw new Error('Challenge not pending');
    }

    if (challenge.expiresAt < new Date()) {
      challenge.status = 'expired';
      throw new Error('Challenge expired');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      challenge.status = 'failed';
      throw new Error('Max attempts exceeded');
    }

    challenge.attempts++;

    const result = await this.authenticateBiometric(challenge.userId, challenge.type, biometricData);
    
    if (result.success) {
      challenge.status = 'completed';
    } else if (challenge.attempts >= challenge.maxAttempts) {
      challenge.status = 'failed';
    }

    return result;
  }

  // Get user's biometric enrollments
  getUserEnrollments(userId: string): BiometricEnrollment[] {
    return this.enrollments.filter(e => e.userId === userId && e.isActive);
  }

  // Update biometric settings
  async updateSettings(settings: Partial<BiometricSettings>): Promise<void> {
    if (!this.settings) {
      throw new Error('User not initialized');
    }

    this.settings = { ...this.settings, ...settings };
  }

  // Get biometric analytics
  getAnalytics(): BiometricAnalytics {
    return { ...this.analytics };
  }

  // Delete a biometric enrollment
  async deleteEnrollment(enrollmentId: string): Promise<void> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      enrollment.isActive = false;
      
      // Update capability status
      const capability = this.capabilities.find(cap => cap.type === enrollment.type);
      if (capability) {
        const hasOtherEnrollments = this.enrollments.some(
          e => e.userId === enrollment.userId && e.type === enrollment.type && e.isActive
        );
        capability.enrolled = hasOtherEnrollments;
      }
    }
  }

  // Private helper methods
  private async createBiometricTemplate(data: string, type: string): Promise<string> {
    // Simulate biometric template creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `template_${type}_${this.generateId()}`;
  }

  private async assessBiometricQuality(data: string, type: string): Promise<number> {
    // Simulate quality assessment
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() * 0.3 + 0.7; // 0.7-1.0
  }

  private async matchBiometric(data: string, template: string, type: string): Promise<number> {
    // Simulate biometric matching
    await new Promise(resolve => setTimeout(resolve, 800));
    return Math.random() * 0.4 + 0.6; // 0.6-1.0
  }

  private generateChallenge(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDeviceId(): string {
    return localStorage.getItem('deviceId') || this.generateId();
  }

  private getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private async getLocation(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.region}, ${data.country}`;
    } catch {
      return 'Unknown';
    }
  }

  private updateAnalytics(type: string, success: boolean, responseTime: number): void {
    this.analytics.totalAttempts++;
    
    if (success) {
      this.analytics.successfulAttempts++;
    } else {
      this.analytics.failedAttempts++;
    }

    this.analytics.successRate = this.analytics.successfulAttempts / this.analytics.totalAttempts;
    this.analytics.averageResponseTime = 
      (this.analytics.averageResponseTime * (this.analytics.totalAttempts - 1) + responseTime) / 
      this.analytics.totalAttempts;

    // Update type breakdown
    const typeBreakdown = this.analytics.typeBreakdown[type as keyof typeof this.analytics.typeBreakdown];
    if (typeBreakdown) {
      typeBreakdown.attempts++;
      const currentSuccessRate = typeBreakdown.successRate * (typeBreakdown.attempts - 1);
      typeBreakdown.successRate = (currentSuccessRate + (success ? 1 : 0)) / typeBreakdown.attempts;
    }
  }
}

// Export singleton instance
export const biometricAuthService = new BiometricAuthService();
export default biometricAuthService;
