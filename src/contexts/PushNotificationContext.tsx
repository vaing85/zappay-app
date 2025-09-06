import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

interface PushNotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isInitialized: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showLocalNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize push notification service
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        const initialized = await pushNotificationService.initialize();
        setIsInitialized(initialized);
        setIsSupported(pushNotificationService['isSupported']);
        
        if (initialized) {
          // Check current permission status
          setPermission(Notification.permission);
          
          // Check if already subscribed
          const subscribed = await pushNotificationService.isSubscribed();
          setIsSubscribed(subscribed);
          
          // Setup push event listeners
          pushNotificationService.setupPushEventListener();
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializePushNotifications();
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          console.warn('Notification permission not granted');
          return false;
        }
      }

      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [permission, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const result = await pushNotificationService.unsubscribe();
      if (result) {
        setIsSubscribed(false);
      }
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, []);

  const showLocalNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<void> => {
    try {
      await pushNotificationService.showLocalNotification(title, options);
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }, []);

  const value: PushNotificationContextType = {
    isSupported,
    permission,
    isSubscribed,
    isInitialized,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): PushNotificationContextType => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
};
