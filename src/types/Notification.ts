export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'security' | 'general' | 'promotion' | 'payment_received' | 'payment_sent' | 'payment_request' | 'split_bill' | 'qr_scan' | 'system' | 'reminder';
  timestamp: Date;
  read: boolean;
  data?: any;
}