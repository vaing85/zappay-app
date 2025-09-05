import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification, AppNotificationSettings } from '../types/Notification';
import { toast } from 'react-toastify';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: AppNotificationSettings | null;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  updateSettings: (settings: Partial<AppNotificationSettings>) => void;
  playNotificationSound: (type: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppNotificationSettings | null>(null);

  // Load notifications and settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('zapcash_notifications');
    const savedSettings = localStorage.getItem('zapcash_notification_settings');
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // Default settings
      setSettings({
        userId: '1', // Will be updated when user logs in
        pushNotifications: true,
        emailNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
        categories: {
          payment: true,
          request: true,
          system: true,
          reminder: true,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        frequency: 'instant',
      });
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('zapcash_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    if (settings) {
      localStorage.setItem('zapcash_notification_settings', JSON.stringify(settings));
    }
  }, [settings]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const playNotificationSound = useCallback((type: string) => {
    if (!settings?.soundEnabled) return;

    const soundMap: { [key: string]: string } = {
      payment_received: '/sounds/payment-received.mp3',
      payment_sent: '/sounds/payment-sent.mp3',
      payment_request: '/sounds/payment-request.mp3',
      split_bill: '/sounds/split-bill.mp3',
      qr_scan: '/sounds/qr-scan.mp3',
      system: '/sounds/system.mp3',
      reminder: '/sounds/reminder.mp3',
    };

    const soundFile = soundMap[type] || '/sounds/notification.mp3';
    
    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error creating audio for notification:', error);
    }
  }, [settings?.soundEnabled]);

  const addNotification = useCallback((notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      isArchived: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    if (settings?.pushNotifications) {
      const toastType = notificationData.priority === 'urgent' ? 'error' : 
                       notificationData.priority === 'high' ? 'warning' : 'info';
      
      toast[toastType](notificationData.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Play sound
    if (settings?.soundEnabled) {
      playNotificationSound(notificationData.type);
    }

    // Browser notification
    if (settings?.pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notificationData.title, {
          body: notificationData.message,
          icon: '/favicon.ico',
          tag: newNotification.id,
        });
      }
    }
  }, [settings, playNotificationSound]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  const archiveNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isArchived: true }
          : notif
      )
    );
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppNotificationSettings>) => {
    setSettings(prev => prev ? { ...prev, ...newSettings } : null);
  }, []);


  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      settings,
      addNotification,
      markAsRead,
      markAllAsRead,
      archiveNotification,
      deleteNotification,
      updateSettings,
      playNotificationSound,
      requestNotificationPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
