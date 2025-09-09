export interface AppNotification {
  id: string;
  type: 'payment_received' | 'payment_sent' | 'payment_request' | 'split_bill' | 'qr_scan' | 'system' | 'reminder';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'payment' | 'request' | 'system' | 'reminder';
  metadata?: {
    amount?: number;
    senderName?: string;
    recipientName?: string;
    transactionId?: string;
    splitBillId?: string;
    requestId?: string;
    test?: boolean;
    [key: string]: any; // Allow additional properties
  };
}

export interface AppNotificationSettings {
  userId: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categories: {
    payment: boolean;
    request: boolean;
    system: boolean;
    reminder: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  frequency: 'instant' | 'batched' | 'daily';
}

export interface AppNotificationSound {
  id: string;
  name: string;
  file: string;
  description: string;
}
