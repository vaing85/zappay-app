import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'security' | 'general' | 'promotion' | 'payment_received' | 'payment_sent' | 'payment_request' | 'split_bill' | 'qr_scan' | 'system' | 'reminder';
  timestamp: Date;
  read: boolean;
  data?: any;
  userId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt?: string;
  isRead?: boolean;
  isArchived?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    configurePushNotifications();
  }, []);

  useEffect(() => {
    saveNotifications();
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await storage.getItem('notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async () => {
    try {
      await storage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const configurePushNotifications = () => {
    // Mock push notification setup
    console.log('Push notifications configured (mock)');
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Keep last 100 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    requestPermissions,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};