import { api } from './apiClient';

// Types
export interface Notification {
  id: string;
  type: 'payment' | 'security' | 'general' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  paymentNotifications: boolean;
  securityNotifications: boolean;
  marketingNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  };
}

// Notification API methods
export const notificationApi = {
  // Get notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<NotificationResponse> => {
    try {
      const response = await api.get<NotificationResponse>('/notifications', {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.post('/notifications/read-all');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Archive notification
  archiveNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.post(`/notifications/${notificationId}/archive`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to archive notification');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  // Get notification settings
  getSettings: async (): Promise<NotificationSettings> => {
    try {
      const response = await api.get<{ success: boolean; data: NotificationSettings }>('/notifications/settings');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get notification settings');
    }
  },

  // Update notification settings
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    try {
      const response = await api.put<{ success: boolean; data: NotificationSettings }>('/notifications/settings', settings);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
      return response.data.data.count;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get unread count');
    }
  },

  // Register for push notifications
  registerPushToken: async (token: string): Promise<void> => {
    try {
      await api.post('/notifications/push/register', { token });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register push token');
    }
  },

  // Unregister push notifications
  unregisterPushToken: async (): Promise<void> => {
    try {
      await api.post('/notifications/push/unregister');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unregister push token');
    }
  },
};

