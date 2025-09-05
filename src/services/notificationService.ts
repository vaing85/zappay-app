import { AppNotification } from '../types/Notification';

export const createPaymentReceivedNotification = (
  userId: string,
  amount: number,
  senderName: string,
  transactionId: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'payment_received',
  title: '💰 Payment Received',
  message: `You received $${amount.toFixed(2)} from ${senderName}`,
  userId,
  priority: 'high',
  category: 'payment',
  actionUrl: `/history`,
  actionText: 'View Transaction',
  icon: '💰',
  metadata: {
    amount,
    senderName,
    transactionId,
  },
});

export const createPaymentSentNotification = (
  userId: string,
  amount: number,
  recipientName: string,
  transactionId: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'payment_sent',
  title: '⚡ Payment Sent',
  message: `You sent $${amount.toFixed(2)} to ${recipientName}`,
  userId,
  priority: 'medium',
  category: 'payment',
  actionUrl: `/history`,
  actionText: 'View Transaction',
  icon: '⚡',
  metadata: {
    amount,
    recipientName,
    transactionId,
  },
});

export const createPaymentRequestNotification = (
  userId: string,
  amount: number,
  requesterName: string,
  requestId: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'payment_request',
  title: '💳 Payment Request',
  message: `${requesterName} requested $${amount.toFixed(2)} from you`,
  userId,
  priority: 'high',
  category: 'request',
  actionUrl: `/payment-requests`,
  actionText: 'Respond',
  icon: '💳',
  metadata: {
    amount,
    senderName: requesterName,
    requestId,
  },
});

export const createSplitBillNotification = (
  userId: string,
  billTitle: string,
  amount: number,
  creatorName: string,
  splitBillId: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'split_bill',
  title: '🧾 Split Bill Created',
  message: `${creatorName} created a split bill: ${billTitle} ($${amount.toFixed(2)})`,
  userId,
  priority: 'medium',
  category: 'request',
  actionUrl: `/split-bills`,
  actionText: 'View Bill',
  icon: '🧾',
  metadata: {
    amount,
    senderName: creatorName,
    splitBillId,
  },
});

export const createQRScanNotification = (
  userId: string,
  amount: number,
  recipientName: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'qr_scan',
  title: '📱 QR Code Scanned',
  message: `QR code scanned for $${amount.toFixed(2)} payment to ${recipientName}`,
  userId,
  priority: 'medium',
  category: 'payment',
  actionUrl: `/qr`,
  actionText: 'View QR',
  icon: '📱',
  metadata: {
    amount,
    recipientName,
  },
});

export const createSystemNotification = (
  userId: string,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'system',
  title,
  message,
  userId,
  priority,
  category: 'system',
  icon: '🔔',
});

export const createReminderNotification = (
  userId: string,
  title: string,
  message: string,
  expiresAt?: string
): Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'isArchived'> => ({
  type: 'reminder',
  title,
  message,
  userId,
  priority: 'low',
  category: 'reminder',
  icon: '⏰',
  expiresAt,
});

// Simulate real-time notifications
export const simulateRealTimeNotifications = (userId: string, addNotification: (notification: any) => void) => {
  const notifications = [
    createPaymentReceivedNotification(userId, 25.50, 'Sarah Wilson', 'txn_123'),
    createPaymentRequestNotification(userId, 15.00, 'Mike Johnson', 'req_456'),
    createSplitBillNotification(userId, 'Dinner at Restaurant', 120.00, 'Emma Davis', 'bill_789'),
    createQRScanNotification(userId, 10.00, 'Alex Brown'),
    createSystemNotification(userId, 'Welcome to ZapCash!', 'Your account is now fully set up and ready to use.'),
  ];

  // Add notifications with delays to simulate real-time
  notifications.forEach((notification, index) => {
    setTimeout(() => {
      addNotification(notification);
    }, (index + 1) * 3000); // 3 seconds apart
  });
};
