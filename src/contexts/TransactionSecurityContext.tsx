import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TransactionValidationRule,
  TransactionRiskScore,
  TransactionAlert,
  TransactionSecuritySettings,
  SecurityEvent,
  DeviceFingerprint,
  TransactionSecurityContext as TransactionSecurityContextType
} from '../types/TransactionSecurity';
import {
  getTransactionSecuritySettings,
  getValidationRules,
  getSecurityAlerts,
  getSecurityEvents,
  getTrustedDevices,
  validateTransaction as validateTransactionService,
  createSecurityAlert,
  resolveSecurityAlert,
  createSecurityEvent,
  updateSecuritySettings as updateSecuritySettingsService,
  addTrustedDevice,
  removeTrustedDevice,
} from '../services/transactionSecurityService';
import { useAuth } from './AuthContext';

const TransactionSecurityContext = createContext<TransactionSecurityContextType | undefined>(undefined);

export const useTransactionSecurity = () => {
  const context = useContext(TransactionSecurityContext);
  if (!context) {
    throw new Error('useTransactionSecurity must be used within a TransactionSecurityProvider');
  }
  return context;
};

interface TransactionSecurityProviderProps {
  children: React.ReactNode;
}

export const TransactionSecurityProvider: React.FC<TransactionSecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [settings, setSettings] = useState<TransactionSecuritySettings | null>(null);
  const [riskScore, setRiskScore] = useState<TransactionRiskScore | null>(null);
  const [alerts, setAlerts] = useState<TransactionAlert[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<DeviceFingerprint[]>([]);
  const [validationRules, setValidationRules] = useState<TransactionValidationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const loadInitialData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        settingsData,
        rulesData,
        alertsData,
        eventsData,
        devicesData
      ] = await Promise.all([
        getTransactionSecuritySettings(user.id),
        getValidationRules(),
        getSecurityAlerts(user.id),
        getSecurityEvents(user.id),
        getTrustedDevices(user.id)
      ]);

      setSettings(settingsData);
      setValidationRules(rulesData);
      setAlerts(alertsData);
      setSecurityEvents(eventsData);
      setTrustedDevices(devicesData);
    } catch (error) {
      console.error('Failed to load transaction security data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const validateTransaction = useCallback(async (transaction: any): Promise<TransactionRiskScore> => {
    if (!user) throw new Error('User not authenticated');
    
    setValidating(true);
    setCurrentTransaction(transaction);
    
    try {
      const riskScore = await validateTransactionService(transaction, user.id);
      setRiskScore(riskScore);
      
      // Create alert if risk is high
      if (riskScore.level === 'high' || riskScore.level === 'critical') {
        await createSecurityAlert({
          transactionId: transaction.id || 'unknown',
          type: 'pattern_anomaly',
          severity: riskScore.level,
          message: `High risk transaction detected: ${riskScore.factors.map(f => f.description).join(', ')}`,
          resolved: false
        });
      }
      
      return riskScore;
    } catch (error) {
      console.error('Transaction validation failed:', error);
      throw error;
    } finally {
      setValidating(false);
    }
  }, [user]);

  const createSecurityAlertAction = useCallback(async (alert: Omit<TransactionAlert, 'id' | 'timestamp'>) => {
    try {
      const newAlert = await createSecurityAlert(alert);
      setAlerts(prev => [newAlert, ...prev]);
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string, resolution: string) => {
    try {
      await resolveSecurityAlert(alertId, resolution);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, resolved: true, resolution, resolvedAt: new Date() }
            : alert
        )
      );
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }, []);

  const createSecurityEventAction = useCallback(async (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    try {
      const newEvent = await createSecurityEvent(event);
      setSecurityEvents(prev => [newEvent, ...prev]);
    } catch (error) {
      console.error('Failed to create security event:', error);
    }
  }, []);

  const updateSecuritySettingsAction = useCallback(async (newSettings: Partial<TransactionSecuritySettings>) => {
    if (!user) return;
    
    try {
      await updateSecuritySettingsService(user.id, newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (error) {
      console.error('Failed to update security settings:', error);
    }
  }, [user]);

  const addTrustedDeviceAction = useCallback(async (device: Omit<DeviceFingerprint, 'id' | 'createdAt' | 'lastSeen'>) => {
    if (!user) return;
    
    try {
      const newDevice = await addTrustedDevice(user.id, device);
      setTrustedDevices(prev => [...prev, newDevice]);
    } catch (error) {
      console.error('Failed to add trusted device:', error);
    }
  }, [user]);

  const removeTrustedDeviceAction = useCallback(async (deviceId: string) => {
    try {
      await removeTrustedDevice(deviceId);
      setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('Failed to remove trusted device:', error);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    if (!user) return;
    
    try {
      const alertsData = await getSecurityAlerts(user.id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  }, [user]);

  const refreshSecurityEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      const eventsData = await getSecurityEvents(user.id);
      setSecurityEvents(eventsData);
    } catch (error) {
      console.error('Failed to refresh security events:', error);
    }
  }, [user]);


  const value: TransactionSecurityContextType = {
    currentTransaction,
    settings: settings || {
      fraudDetection: {
        enabled: false,
        rules: [],
        riskThresholds: { low: 30, medium: 50, high: 70, critical: 90 },
        autoBlockThreshold: 90,
        require2FAThreshold: 60,
        reviewThreshold: 40
      },
      twoFactorRequired: false,
      maxDailyAmount: 10000,
      maxSingleTransaction: 5000,
      allowedCountries: [],
      blockedCountries: [],
      deviceVerification: false,
      locationVerification: false,
      timeRestrictions: {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        timezone: 'UTC'
      },
      notificationSettings: {
        email: false,
        sms: false,
        push: false
      }
    },
    riskScore,
    alerts,
    securityEvents,
    trustedDevices,
    validationRules,
    loading,
    validating,
    validateTransaction,
    createSecurityAlert: createSecurityAlertAction,
    resolveAlert,
    createSecurityEvent: createSecurityEventAction,
    updateSecuritySettings: updateSecuritySettingsAction,
    addTrustedDevice: addTrustedDeviceAction,
    removeTrustedDevice: removeTrustedDeviceAction,
    refreshAlerts,
    refreshSecurityEvents
  };

  return (
    <TransactionSecurityContext.Provider value={value}>
      {children}
    </TransactionSecurityContext.Provider>
  );
};
