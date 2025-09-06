import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';

interface RealtimeNotification {
  id: string;
  type: 'transaction' | 'balance' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
}

interface RealtimeNotificationContextType {
  notifications: RealtimeNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  subscribeToUserEvents: (userId: string) => void;
  unsubscribeFromUserEvents: () => void;
}

const RealtimeNotificationContext = createContext<RealtimeNotificationContextType | undefined>(undefined);

interface RealtimeNotificationProviderProps {
  children: React.ReactNode;
}

export const RealtimeNotificationProvider: React.FC<RealtimeNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const { socket, isConnected, on, off } = useWebSocket();
  const { user } = useAuth();

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Keep last 100 notifications

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const subscribeToUserEvents = useCallback((userId: string) => {
    if (!socket || !isConnected) return;

    // Subscribe to user-specific events
    on('transaction_update', (data) => {
      if (data.userId === userId) {
        addNotification({
          type: 'transaction',
          title: 'Transaction Update',
          message: data.message || 'Your transaction has been processed',
          priority: 'medium',
          data: data.transaction,
        });
      }
    });

    on('balance_update', (data) => {
      if (data.userId === userId) {
        addNotification({
          type: 'balance',
          title: 'Balance Updated',
          message: `Your balance is now $${data.balance.toFixed(2)}`,
          priority: 'low',
          data: { balance: data.balance },
        });
      }
    });

    on('security_alert', (data) => {
      if (data.userId === userId) {
        addNotification({
          type: 'security',
          title: 'Security Alert',
          message: data.message,
          priority: data.severity === 'high' ? 'urgent' : 'high',
          data: data.alert,
        });
      }
    });

    on('system_notification', (data) => {
      if (data.userId === userId || data.broadcast) {
        addNotification({
          type: 'system',
          title: data.title || 'System Notification',
          message: data.message,
          priority: data.priority || 'medium',
          data: data.data,
        });
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [socket, isConnected, on, addNotification]);

  const unsubscribeFromUserEvents = useCallback(() => {
    if (!socket) return;

    off('transaction_update');
    off('balance_update');
    off('security_alert');
    off('system_notification');
  }, [socket, off]);

  // Subscribe to user events when user is logged in
  useEffect(() => {
    if (user && isConnected) {
      subscribeToUserEvents(user.id);
    }

    return () => {
      unsubscribeFromUserEvents();
    };
  }, [user, isConnected, subscribeToUserEvents, unsubscribeFromUserEvents]);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const value: RealtimeNotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    subscribeToUserEvents,
    unsubscribeFromUserEvents,
  };

  return (
    <RealtimeNotificationContext.Provider value={value}>
      {children}
    </RealtimeNotificationContext.Provider>
  );
};

export const useRealtimeNotifications = (): RealtimeNotificationContextType => {
  const context = useContext(RealtimeNotificationContext);
  if (context === undefined) {
    throw new Error('useRealtimeNotifications must be used within a RealtimeNotificationProvider');
  }
  return context;
};
