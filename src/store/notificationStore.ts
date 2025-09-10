import { create } from 'zustand';
import { notificationApi, Notification, NotificationSettings } from '../services/notificationApi';

// Notification state interface
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

// Notification actions interface
interface NotificationActions {
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }) => Promise<void>;
  getSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Combined notification store type
type NotificationStore = NotificationState & NotificationActions;

// Create notification store
export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  settings: null,
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Actions
  getNotifications: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await notificationApi.getNotifications({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params,
      });
      
      if (response.success) {
        const { notifications, unreadCount } = response.data;
        
        set((state) => ({
          notifications: params.page === 1 ? notifications : [...state.notifications, ...notifications],
          unreadCount,
          hasMore: notifications.length === (params.limit || 20),
          currentPage: params.page || 1,
          isLoading: false,
          error: null,
        }));
      } else {
        set({ error: 'Failed to load notifications', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const settings = await notificationApi.getSettings();
      
      set({ settings, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateSettings: async (settings) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedSettings = await notificationApi.updateSettings(settings);
      
      set({ settings: updatedSettings, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  archiveNotification: async (notificationId: string) => {
    try {
      await notificationApi.archiveNotification(notificationId);
      
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== notificationId
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== notificationId
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getUnreadCount: async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  removeNotification: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== notificationId
      ),
    }));
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      hasMore: true,
      currentPage: 1,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Selectors
export const useNotifications = () => useNotificationStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  settings: state.settings,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  archiveNotification: state.archiveNotification,
  deleteNotification: state.deleteNotification,
  updateSettings: state.updateSettings,
  addNotification: state.addNotification,
  playNotificationSound: () => {
    // Mock implementation - in real app, this would play a sound
    console.log('Playing notification sound');
  },
}));

export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);

export const useNotificationSettings = () => useNotificationStore((state) => state.settings);

export const useNotificationLoading = () => useNotificationStore((state) => state.isLoading);

export const useNotificationError = () => useNotificationStore((state) => state.error);

export const useNotificationActions = () => useNotificationStore((state) => ({
  getNotifications: state.getNotifications,
  getSettings: state.getSettings,
  updateSettings: state.updateSettings,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  archiveNotification: state.archiveNotification,
  deleteNotification: state.deleteNotification,
  getUnreadCount: state.getUnreadCount,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}));

