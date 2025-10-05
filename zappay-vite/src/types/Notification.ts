export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'security' | 'general' | 'promotion' | 'payment_received' | 'payment_sent' | 'payment_request' | 'split_bill' | 'qr_scan' | 'system' | 'reminder';
  timestamp: Date;
  read: boolean;
  data?: any;
  // Additional properties for notification service
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

export interface AppNotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  paymentUpdates: boolean;
  systemUpdates: boolean;
  userId: string;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}