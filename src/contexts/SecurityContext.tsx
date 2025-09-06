import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SecuritySettings, 
  TwoFactorMethod, 
  SecurityEvent, 
  TrustedDevice, 
  SecurityAlert, 
  TransactionSecurity,
  PasswordPolicy,
  SecurityReport
} from '../types/Security';
import { 
  getSecuritySettings, 
  updateSecuritySettings,
  getTwoFactorMethods,
  addTwoFactorMethod as addTwoFactorMethodService,
  getSecurityEvents,
  getTrustedDevices,
  addTrustedDevice,
  getSecurityAlerts,
  markAlertAsRead as markAlertAsReadService,
  resolveAlert as resolveAlertService,
  getPasswordPolicy,
  validatePassword as validatePasswordService,
  checkPasswordBreach as checkPasswordBreachService,
  generateSecurityReport,
  createTransactionSecurity as createTransactionSecurityService
} from '../services/securityService';
import { useAuth } from './AuthContext';

interface SecurityContextType {
  // Data
  securitySettings: SecuritySettings | null;
  twoFactorMethods: TwoFactorMethod[];
  securityEvents: SecurityEvent[];
  trustedDevices: TrustedDevice[];
  securityAlerts: SecurityAlert[];
  passwordPolicy: PasswordPolicy | null;
  securityReport: SecurityReport | null;
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshSecurityData: () => void;
  updateSettings: (settings: Partial<SecuritySettings>) => void;
  
  // Two-Factor Authentication
  addTwoFactorMethod: (method: Omit<TwoFactorMethod, 'id' | 'createdAt'>) => void;
  removeTwoFactorMethod: (methodId: string) => void;
  verifyTwoFactorCode: (methodId: string, code: string) => Promise<boolean>;
  
  // Security Events
  loadSecurityEvents: (limit?: number) => void;
  
  // Trusted Devices
  addDevice: (device: Omit<TrustedDevice, 'id' | 'createdAt'>) => void;
  removeDevice: (deviceId: string) => void;
  
  // Security Alerts
  markAlertAsRead: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  
  // Password Security
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  checkPasswordBreach: (password: string) => Promise<boolean>;
  
  // Security Reports
  generateReport: (period: string) => void;
  
  // Transaction Security
  createTransactionSecurity: (transactionId: string, amount: number) => TransactionSecurity;
  verifyTransactionSecurity: (securityId: string, verification: any) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [twoFactorMethods, setTwoFactorMethods] = useState<TwoFactorMethod[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);


  const loadSecurityData = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const [
        settings,
        methods,
        events,
        devices,
        alerts,
        policy
      ] = await Promise.all([
        Promise.resolve(getSecuritySettings(user.id)),
        Promise.resolve(getTwoFactorMethods(user.id)),
        Promise.resolve(getSecurityEvents(user.id, 50)),
        Promise.resolve(getTrustedDevices(user.id)),
        Promise.resolve(getSecurityAlerts(user.id)),
        Promise.resolve(getPasswordPolicy())
      ]);

      setSecuritySettings(settings || null);
      setTwoFactorMethods(methods || []);
      setSecurityEvents(events || []);
      setTrustedDevices(devices || []);
      setSecurityAlerts(alerts || []);
      setPasswordPolicy(policy || null);
    } catch (error) {
      console.error('Error loading security data:', error);
      // Set default values on error
      setSecuritySettings(null);
      setTwoFactorMethods([]);
      setSecurityEvents([]);
      setTrustedDevices([]);
      setSecurityAlerts([]);
      setPasswordPolicy(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user, loadSecurityData]);

  const refreshSecurityData = useCallback(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user, loadSecurityData]);

  const updateSettings = useCallback((settings: Partial<SecuritySettings>) => {
    if (user) {
      const updatedSettings = updateSecuritySettings(user.id, settings);
      setSecuritySettings(updatedSettings);
    }
  }, [user]);

  const addTwoFactorMethod = useCallback((method: Omit<TwoFactorMethod, 'id' | 'createdAt'>) => {
    const newMethod = addTwoFactorMethodService(method);
    if (newMethod) {
      setTwoFactorMethods(prev => [...prev, newMethod]);
    }
  }, []);

  const removeTwoFactorMethod = useCallback((methodId: string) => {
    setTwoFactorMethods(prev => prev.filter(method => method.id !== methodId));
  }, []);

  const verifyTwoFactorCode = useCallback(async (methodId: string, code: string): Promise<boolean> => {
    // In a real app, this would verify the code with the 2FA service
    // For demo purposes, we'll accept any 6-digit code
    return /^\d{6}$/.test(code);
  }, []);

  const loadSecurityEvents = useCallback((limit: number = 50) => {
    if (user) {
      const events = getSecurityEvents(user.id, limit);
      setSecurityEvents(events || []);
    }
  }, [user]);

  const addDevice = useCallback((device: Omit<TrustedDevice, 'id' | 'createdAt'>) => {
    const newDevice = addTrustedDevice(device);
    setTrustedDevices(prev => [...prev, newDevice]);
  }, []);

  const removeDevice = useCallback((deviceId: string) => {
    setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    markAlertAsReadService(alertId);
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    resolveAlertService(alertId);
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isResolved: true, resolvedAt: new Date().toISOString() }
        : alert
    ));
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setSecurityAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  }, []);

  const validatePassword = useCallback((password: string): { isValid: boolean; errors: string[] } => {
    return validatePasswordService(password);
  }, []);

  const checkPasswordBreach = useCallback(async (password: string): Promise<boolean> => {
    return await checkPasswordBreachService(password);
  }, []);

  const generateReport = useCallback((period: string) => {
    if (user) {
      const report = generateSecurityReport(user.id, period);
      setSecurityReport(report);
    }
  }, [user]);

  const createTransactionSecurity = useCallback((transactionId: string, amount: number): TransactionSecurity => {
    if (!user) throw new Error('User not authenticated');
    return createTransactionSecurityService(transactionId, user.id, amount);
  }, [user]);

  const verifyTransactionSecurity = useCallback(async (securityId: string, verification: any): Promise<boolean> => {
    // In a real app, this would verify PIN, 2FA, biometric, etc.
    // For demo purposes, we'll return true
    return true;
  }, []);

  return (
    <SecurityContext.Provider value={{
      securitySettings,
      twoFactorMethods,
      securityEvents,
      trustedDevices,
      securityAlerts,
      passwordPolicy,
      securityReport,
      loading,
      refreshSecurityData,
      updateSettings,
      addTwoFactorMethod,
      removeTwoFactorMethod,
      verifyTwoFactorCode,
      loadSecurityEvents,
      addDevice,
      removeDevice,
      markAlertAsRead,
      resolveAlert,
      markAllAlertsAsRead,
      validatePassword,
      checkPasswordBreach,
      generateReport,
      createTransactionSecurity,
      verifyTransactionSecurity
    }}>
      {children}
    </SecurityContext.Provider>
  );
};
