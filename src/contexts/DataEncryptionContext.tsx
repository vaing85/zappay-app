import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  EncryptionKey,
  EncryptedData,
  EncryptionSettings,
  DataClassification,
  EncryptedField,
  EncryptionContext as EncryptionContextType,
  EncryptionAuditLog
} from '../types/DataEncryption';
import {
  generateKeyPair,
  encryptData,
  decryptData,
  encryptField,
  decryptField,
  verifyDataIntegrity,
  rotateKeys,
  revokeKey,
  secureWipe,
  getAuditLogs,
  getUserKeys,
  defaultEncryptionSettings,
  defaultDataClassifications
} from '../services/encryptionService';
import { useAuth } from './AuthContext';

const DataEncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const useDataEncryption = () => {
  const context = useContext(DataEncryptionContext);
  if (!context) {
    throw new Error('useDataEncryption must be used within a DataEncryptionProvider');
  }
  return context;
};

interface DataEncryptionProviderProps {
  children: React.ReactNode;
}

export const DataEncryptionProvider: React.FC<DataEncryptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<EncryptionKey | null>(null);
  const [masterPasswordHash] = useState<string | null>(null);
  const [settings, setSettings] = useState<EncryptionSettings>(defaultEncryptionSettings);
  const [dataClassifications, setDataClassifications] = useState<DataClassification[]>(defaultDataClassifications);
  const [, setAuditLogs] = useState<EncryptionAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const loadEncryptionData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userKeys, auditLogsData] = await Promise.all([
        getUserKeys(user.id),
        getAuditLogs(user.id, 50)
      ]);

      const activeKey = userKeys.find(key => key.isActive);
      if (activeKey) {
        setEncryptionKey(activeKey);
        setIsEncrypted(true);
      }

      setAuditLogs(auditLogsData);
    } catch (error) {
      console.error('Failed to load encryption data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadEncryptionData();
    }
  }, [user, loadEncryptionData]);

  const encryptDataAction = useCallback(async (
    data: any,
    classification: DataClassification
  ): Promise<EncryptedData> => {
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    setEncrypting(true);
    try {
      const encrypted = await encryptData(data, encryptionKey.id, classification);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    } finally {
      setEncrypting(false);
    }
  }, [encryptionKey]);

  const decryptDataAction = useCallback(async (encryptedData: EncryptedData): Promise<any> => {
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    setDecrypting(true);
    try {
      const decrypted = await decryptData(encryptedData);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    } finally {
      setDecrypting(false);
    }
  }, [encryptionKey]);

  const encryptFieldAction = useCallback(async (
    fieldName: string,
    value: string,
    classification: DataClassification
  ): Promise<EncryptedField> => {
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    try {
      return await encryptField(fieldName, value, encryptionKey.id, classification);
    } catch (error) {
      console.error('Field encryption failed:', error);
      throw error;
    }
  }, [encryptionKey]);

  const decryptFieldAction = useCallback(async (encryptedField: EncryptedField): Promise<string> => {
    try {
      return await decryptField(encryptedField);
    } catch (error) {
      console.error('Field decryption failed:', error);
      throw error;
    }
  }, []);

  const generateKeyPairAction = useCallback(async (): Promise<EncryptionKey> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newKey = await generateKeyPair(user.id, 'AES');
      setEncryptionKey(newKey);
      setIsEncrypted(true);
      return newKey;
    } catch (error) {
      console.error('Key generation failed:', error);
      throw error;
    }
  }, [user]);

  const rotateKeysAction = useCallback(async () => {
    if (!user) return;
    
    try {
      await rotateKeys(user.id);
      await loadEncryptionData(); // Reload keys
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw error;
    }
  }, [user, loadEncryptionData]);

  const revokeKeyAction = useCallback(async (keyId: string) => {
    try {
      await revokeKey(keyId);
      if (encryptionKey?.id === keyId) {
        setEncryptionKey(null);
        setIsEncrypted(false);
      }
      await loadEncryptionData(); // Reload keys
    } catch (error) {
      console.error('Key revocation failed:', error);
      throw error;
    }
  }, [encryptionKey, loadEncryptionData]);

  const updateEncryptionSettingsAction = useCallback(async (newSettings: Partial<EncryptionSettings>) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      // In a real app, this would save to backend
    } catch (error) {
      console.error('Failed to update encryption settings:', error);
      throw error;
    }
  }, []);

  const updateDataClassificationAction = useCallback(async (classification: DataClassification) => {
    try {
      setDataClassifications(prev => {
        const existing = prev.find(c => c.level === classification.level);
        if (existing) {
          return prev.map(c => c.level === classification.level ? classification : c);
        } else {
          return [...prev, classification];
        }
      });
      // In a real app, this would save to backend
    } catch (error) {
      console.error('Failed to update data classification:', error);
      throw error;
    }
  }, []);

  const verifyDataIntegrityAction = useCallback(async (encryptedData: EncryptedData): Promise<boolean> => {
    try {
      return await verifyDataIntegrity(encryptedData);
    } catch (error) {
      console.error('Data integrity verification failed:', error);
      return false;
    }
  }, []);

  const secureWipeAction = useCallback(async (data: any) => {
    try {
      await secureWipe(data);
    } catch (error) {
      console.error('Secure wipe failed:', error);
      throw error;
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    if (!user) return;
    
    try {
      const logs = await getAuditLogs(user.id, 100);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to refresh audit logs:', error);
    }
  }, [user]);

  const value: EncryptionContextType = {
    isEncrypted,
    encryptionKey,
    masterPasswordHash,
    settings,
    dataClassifications,
    encryptData: encryptDataAction,
    decryptData: decryptDataAction,
    encryptField: encryptFieldAction,
    decryptField: decryptFieldAction,
    generateKeyPair: generateKeyPairAction,
    rotateKeys: rotateKeysAction,
    revokeKey: revokeKeyAction,
    updateEncryptionSettings: updateEncryptionSettingsAction,
    updateDataClassification: updateDataClassificationAction,
    verifyDataIntegrity: verifyDataIntegrityAction,
    secureWipe: secureWipeAction,
    refreshAuditLogs,
    loading,
    encrypting,
    decrypting
  };

  return (
    <DataEncryptionContext.Provider value={value}>
      {children}
    </DataEncryptionContext.Provider>
  );
};
