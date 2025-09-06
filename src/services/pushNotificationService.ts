// Push Notification Service for PWA
class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Check if we already have a subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration || !this.isSupported) {
      console.warn('Cannot subscribe: service worker not registered or push not supported');
      return null;
    }

    try {
      // Check if already subscribed
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return this.subscription;
      }

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || 
          'BEl62iUYgUivxIkv69yViEuiBIa40HI0F0Qz4Qw8gWc'
        )
      });

      console.log('Successfully subscribed to push notifications');
      
      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      console.log('No subscription to unsubscribe from');
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      if (result) {
        this.subscription = null;
        console.log('Successfully unsubscribed from push notifications');
        
        // Notify server about unsubscription
        await this.sendUnsubscriptionToServer();
      }
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.registration || !this.isSupported) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration || !this.isSupported) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  private async sendUnsubscriptionToServer(): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send unsubscription to server');
      }

      console.log('Unsubscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send unsubscription to server:', error);
    }
  }

  // Show local notification (for testing)
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      console.warn('Cannot show notification: service worker not registered');
      return;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        ...options
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  // Handle push events
  setupPushEventListener(): void {
    if (!this.registration) {
      console.warn('Cannot setup push listener: service worker not registered');
      return;
    }

    this.registration.addEventListener('push', (event: any) => {
      console.log('Push event received:', event);

      if (event.data) {
        try {
          const data = event.data.json();
          this.handlePushData(data);
        } catch (error) {
          console.error('Failed to parse push data:', error);
          this.showDefaultNotification();
        }
      } else {
        this.showDefaultNotification();
      }
    });

    // Handle notification clicks
    this.registration.addEventListener('notificationclick', (event: any) => {
      console.log('Notification clicked:', event);
      
      event.notification.close();
      
      // Focus or open the app
      event.waitUntil(
        // eslint-disable-next-line no-restricted-globals
        (self as any).clients.matchAll({ type: 'window' }).then((clientList: any[]) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          // eslint-disable-next-line no-restricted-globals
          return (self as any).clients.openWindow('/');
        })
      );
    });
  }

  private handlePushData(data: any): void {
    const { title, body, icon, badge, data: notificationData } = data;
    
    this.registration?.showNotification(title || 'ZapCash Notification', {
      body: body || 'You have a new notification',
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      data: notificationData,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ]
    });
  }

  private showDefaultNotification(): void {
    this.registration?.showNotification('ZapCash', {
      body: 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200]
    });
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
