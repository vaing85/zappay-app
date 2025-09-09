// Enhanced Notification Service with Email, SMS, and Real-time capabilities
import { AppNotification, AppNotificationSettings } from '../types/Notification';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms' | 'in_app';
  enabled: boolean;
  priority: number;
  deliveryTime: 'instant' | 'batched' | 'scheduled';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channels: NotificationChannel[];
  subject?: string;
  body: string;
  htmlBody?: string;
  smsBody?: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  deliveryRate: number;
  channelBreakdown: {
    push: { sent: number; delivered: number; rate: number };
    email: { sent: number; delivered: number; rate: number };
    sms: { sent: number; delivered: number; rate: number };
    in_app: { sent: number; delivered: number; rate: number };
  };
  topTemplates: Array<{ templateId: string; count: number }>;
  averageDeliveryTime: number;
}

class EnhancedNotificationService {
  private channels: NotificationChannel[] = [
    { id: 'push', name: 'Push Notifications', type: 'push', enabled: true, priority: 1, deliveryTime: 'instant' },
    { id: 'email', name: 'Email', type: 'email', enabled: true, priority: 2, deliveryTime: 'instant' },
    { id: 'sms', name: 'SMS', type: 'sms', enabled: false, priority: 3, deliveryTime: 'instant' },
    { id: 'in_app', name: 'In-App', type: 'in_app', enabled: true, priority: 4, deliveryTime: 'instant' }
  ];

  private templates: NotificationTemplate[] = [
    {
      id: 'payment_received',
      name: 'Payment Received',
      type: 'payment_received',
      channels: this.channels.filter(c => c.type === 'push' || c.type === 'email' || c.type === 'in_app'),
      subject: '💰 Payment Received - ${amount} from ${senderName}',
      body: 'You received ${amount} from ${senderName}. Transaction ID: ${transactionId}',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payment Received</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              You received <strong style="color: #059669; font-size: 18px;">$\${amount}</strong> from <strong>\${senderName}</strong>
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Transaction ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">\${transactionId}</code>
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="\${actionUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View Transaction
              </a>
            </div>
          </div>
        </div>
      `,
      smsBody: '💰 ZapPay: You received $${amount} from ${senderName}. ID: ${transactionId}',
      variables: ['amount', 'senderName', 'transactionId', 'actionUrl'],
      isActive: true
    },
    {
      id: 'security_alert',
      name: 'Security Alert',
      type: 'security_alert',
      channels: this.channels,
      subject: '🚨 Security Alert - ${alertType}',
      body: 'Security alert: ${message}. Please review your account immediately.',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Security Alert</h1>
          </div>
          <div style="padding: 30px; background: #fef2f2;">
            <h2 style="color: #dc2626; margin-bottom: 20px;">Security Notice</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              \${message}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Alert Type: <strong>\${alertType}</strong><br>
                Time: \${timestamp}
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="\${actionUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Review Account
              </a>
            </div>
          </div>
        </div>
      `,
      smsBody: '🚨 ZapPay Security Alert: ${message}. Review account now.',
      variables: ['alertType', 'message', 'timestamp', 'actionUrl'],
      isActive: true
    },
    {
      id: 'budget_alert',
      name: 'Budget Alert',
      type: 'budget_alert',
      channels: this.channels.filter(c => c.type === 'push' || c.type === 'email' || c.type === 'in_app'),
      subject: '📊 Budget Alert - ${category}',
      body: 'You\'ve spent ${percentage}% of your ${category} budget ($${spent} of $${budget}).',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Budget Alert</h1>
          </div>
          <div style="padding: 30px; background: #fffbeb;">
            <h2 style="color: #92400e; margin-bottom: 20px;">Budget Update</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              You've spent <strong style="color: #d97706;">\${percentage}%</strong> of your <strong>\${category}</strong> budget
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Spent:</span>
                <span style="font-weight: 600; color: #d97706;">$\${spent}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Budget:</span>
                <span style="font-weight: 600; color: #059669;">$\${budget}</span>
              </div>
              <div style="background: #f3f4f6; height: 8px; border-radius: 4px; margin-top: 10px;">
                <div style="background: \${percentage >= 90 ? '#dc2626' : percentage >= 75 ? '#f59e0b' : '#10b981'}; height: 100%; width: \${percentage}%; border-radius: 4px;"></div>
              </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="\${actionUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View Budget
              </a>
            </div>
          </div>
        </div>
      `,
      smsBody: '📊 ZapPay Budget Alert: ${percentage}% of ${category} budget used ($${spent}/$${budget})',
      variables: ['category', 'percentage', 'spent', 'budget', 'actionUrl'],
      isActive: true
    }
  ];

  private deliveries: NotificationDelivery[] = [];
  private analytics: NotificationAnalytics = {
    totalSent: 0,
    totalDelivered: 0,
    deliveryRate: 0,
    channelBreakdown: {
      push: { sent: 0, delivered: 0, rate: 0 },
      email: { sent: 0, delivered: 0, rate: 0 },
      sms: { sent: 0, delivered: 0, rate: 0 },
      in_app: { sent: 0, delivered: 0, rate: 0 }
    },
    topTemplates: [],
    averageDeliveryTime: 0
  };

  // Send notification through multiple channels
  async sendNotification(
    notification: AppNotification,
    settings: AppNotificationSettings,
    channels?: string[]
  ): Promise<NotificationDelivery[]> {
    const selectedChannels = channels || this.getEnabledChannels(settings);
    const deliveries: NotificationDelivery[] = [];

    for (const channelId of selectedChannels) {
      const channel = this.channels.find(c => c.id === channelId);
      if (!channel || !channel.enabled) continue;

      const delivery = await this.sendThroughChannel(notification, channel, settings);
      deliveries.push(delivery);
    }

    this.updateAnalytics(deliveries);
    return deliveries;
  }

  private async sendThroughChannel(
    notification: AppNotification,
    channel: NotificationChannel,
    settings: AppNotificationSettings
  ): Promise<NotificationDelivery> {
    const delivery: NotificationDelivery = {
      id: this.generateId(),
      notificationId: notification.id,
      channel: channel.id,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3
    };

    try {
      switch (channel.type) {
        case 'push':
          await this.sendPushNotification(notification, settings);
          break;
        case 'email':
          await this.sendEmailNotification(notification, settings);
          break;
        case 'sms':
          await this.sendSMSNotification(notification, settings);
          break;
        case 'in_app':
          await this.sendInAppNotification(notification, settings);
          break;
      }

      delivery.status = 'sent';
      delivery.sentAt = new Date().toISOString();
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.deliveries.push(delivery);
    return delivery;
  }

  private async sendPushNotification(notification: AppNotification, settings: AppNotificationSettings): Promise<void> {
    if (!settings.pushNotifications) return;

    // Check quiet hours
    if (this.isInQuietHours(settings)) {
      // Schedule for later
      this.scheduleNotification(notification, settings);
      return;
    }

    // Send push notification
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        data: {
          url: notification.actionUrl,
          notificationId: notification.id
        },
        actions: notification.actionText ? [
          {
            action: 'view',
            title: notification.actionText,
            icon: '/logo192.png'
          }
        ] : undefined
      });
    }
  }

  private async sendEmailNotification(notification: AppNotification, settings: AppNotificationSettings): Promise<void> {
    if (!settings.emailNotifications) return;

    const template = this.templates.find(t => t.type === notification.type);
    if (!template) return;

    // In a real implementation, this would call an email service API
    console.log('Sending email notification:', {
      to: settings.userId, // In real app, this would be the user's email
      subject: this.replaceVariables(template.subject || notification.title, notification.metadata || {}),
      htmlBody: this.replaceVariables(template.htmlBody || template.body, notification.metadata || {}),
      textBody: this.replaceVariables(template.body, notification.metadata || {})
    });
  }

  private async sendSMSNotification(notification: AppNotification, settings: AppNotificationSettings): Promise<void> {
    if (!settings.emailNotifications) return; // Using email setting as proxy for SMS

    const template = this.templates.find(t => t.type === notification.type);
    if (!template) return;

    // In a real implementation, this would call an SMS service API
    console.log('Sending SMS notification:', {
      to: settings.userId, // In real app, this would be the user's phone number
      message: this.replaceVariables(template.smsBody || template.body, notification.metadata || {})
    });
  }

  private async sendInAppNotification(notification: AppNotification, settings: AppNotificationSettings): Promise<void> {
    // In-app notifications are handled by the NotificationContext
    // This is just a placeholder for consistency
    console.log('In-app notification:', notification);
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\$\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  private isInQuietHours(settings: AppNotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(settings.quietHours.start);
    const endTime = this.parseTime(settings.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private scheduleNotification(notification: AppNotification, settings: AppNotificationSettings): void {
    // In a real implementation, this would schedule the notification for later
    console.log('Scheduling notification for after quiet hours:', notification);
  }

  private getEnabledChannels(settings: AppNotificationSettings): string[] {
    return this.channels
      .filter(channel => {
        switch (channel.type) {
          case 'push': return settings.pushNotifications;
          case 'email': return settings.emailNotifications;
          case 'sms': return settings.emailNotifications; // Using email setting as proxy
          case 'in_app': return true; // Always enabled
          default: return false;
        }
      })
      .map(channel => channel.id);
  }

  private updateAnalytics(deliveries: NotificationDelivery[]): void {
    deliveries.forEach(delivery => {
      this.analytics.totalSent++;
      if (delivery.status === 'delivered') {
        this.analytics.totalDelivered++;
      }

      const channelBreakdown = this.analytics.channelBreakdown[delivery.channel as keyof typeof this.analytics.channelBreakdown];
      if (channelBreakdown) {
        channelBreakdown.sent++;
        if (delivery.status === 'delivered') {
          channelBreakdown.delivered++;
        }
        channelBreakdown.rate = channelBreakdown.delivered / channelBreakdown.sent;
      }
    });

    this.analytics.deliveryRate = this.analytics.totalDelivered / this.analytics.totalSent;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public methods
  getChannels(): NotificationChannel[] {
    return [...this.channels];
  }

  getTemplates(): NotificationTemplate[] {
    return [...this.templates];
  }

  getDeliveries(): NotificationDelivery[] {
    return [...this.deliveries];
  }

  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  updateChannel(channelId: string, updates: Partial<NotificationChannel>): void {
    const channel = this.channels.find(c => c.id === channelId);
    if (channel) {
      Object.assign(channel, updates);
    }
  }

  createTemplate(template: Omit<NotificationTemplate, 'id'>): NotificationTemplate {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: this.generateId()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): void {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      Object.assign(template, updates);
    }
  }

  deleteTemplate(templateId: string): void {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index > -1) {
      this.templates.splice(index, 1);
    }
  }
}

// Export singleton instance
export const enhancedNotificationService = new EnhancedNotificationService();
export default enhancedNotificationService;
