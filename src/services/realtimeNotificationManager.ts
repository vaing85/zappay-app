// Real-time Notification Manager for WebSocket-based instant notifications
import { AppNotification } from '../types/Notification';
import { enhancedNotificationService } from './enhancedNotificationService';

export interface RealtimeNotificationEvent {
  id: string;
  type: 'notification' | 'typing' | 'presence' | 'system';
  userId: string;
  data: any;
  timestamp: string;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  eventTypes: string[];
  callback: (event: RealtimeNotificationEvent) => void;
  isActive: boolean;
}

class RealtimeNotificationManager {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, NotificationSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // Disable WebSocket connection for now to prevent errors
    const enableWebSocket = false;
    
    if (!enableWebSocket) {
      console.log('WebSocket disabled - running in offline mode');
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleMessage(data: RealtimeNotificationEvent): void {
    switch (data.type) {
      case 'notification':
        this.handleNotificationEvent(data);
        break;
      case 'typing':
        this.handleTypingEvent(data);
        break;
      case 'presence':
        this.handlePresenceEvent(data);
        break;
      case 'system':
        this.handleSystemEvent(data);
        break;
      default:
        console.warn('Unknown event type:', data.type);
    }
  }

  private handleNotificationEvent(event: RealtimeNotificationEvent): void {
    const notification: AppNotification = event.data;
    
    // Notify all subscribers
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive && 
          subscription.userId === event.userId && 
          subscription.eventTypes.includes('notification')) {
        subscription.callback(event);
      }
    });

    // Send through enhanced notification service
    this.sendNotification(notification);
  }

  private handleTypingEvent(event: RealtimeNotificationEvent): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive && 
          subscription.eventTypes.includes('typing')) {
        subscription.callback(event);
      }
    });
  }

  private handlePresenceEvent(event: RealtimeNotificationEvent): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive && 
          subscription.eventTypes.includes('presence')) {
        subscription.callback(event);
      }
    });
  }

  private handleSystemEvent(event: RealtimeNotificationEvent): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive && 
          subscription.eventTypes.includes('system')) {
        subscription.callback(event);
      }
    });
  }

  private async sendNotification(notification: AppNotification): Promise<void> {
    // This would integrate with the enhanced notification service
    // For now, we'll just log it
    console.log('Sending real-time notification:', notification);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive) {
        this.subscribe(subscription.userId, subscription.eventTypes, subscription.callback);
      }
    });
  }

  // Public methods
  subscribe(
    userId: string, 
    eventTypes: string[], 
    callback: (event: RealtimeNotificationEvent) => void
  ): string {
    const subscriptionId = this.generateId();
    const subscription: NotificationSubscription = {
      id: subscriptionId,
      userId,
      eventTypes,
      callback,
      isActive: true
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        userId,
        eventTypes,
        subscriptionId
      }));
    }

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);

      // Notify server
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'unsubscribe',
          subscriptionId
        }));
      }
    }
  }

  sendNotificationToUser(userId: string, notification: AppNotification): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_notification',
        userId,
        notification
      }));
    }
  }

  sendTypingIndicator(userId: string, isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      }));
    }
  }

  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'presence',
        status,
        timestamp: new Date().toISOString()
      }));
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const realtimeNotificationManager = new RealtimeNotificationManager();
export default realtimeNotificationManager;
