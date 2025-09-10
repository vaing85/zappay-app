export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'security' | 'general' | 'promotion';
  timestamp: Date;
  read: boolean;
  data?: any;
}