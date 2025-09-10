import { Alert } from 'react-native';
import { useState, useEffect } from 'react';

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Loading service class
export class LoadingService {
  private static loadingStates: Map<string, LoadingState> = new Map();
  private static listeners: Set<(key: string, state: LoadingState) => void> = new Set();

  // Subscribe to loading state changes
  static subscribe(listener: (key: string, state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners of state change
  private static notify(key: string, state: LoadingState): void {
    this.listeners.forEach(listener => listener(key, state));
  }

  // Set loading state
  static setLoading(key: string, isLoading: boolean, message?: string, progress?: number): void {
    const state: LoadingState = {
      isLoading,
      message,
      progress,
    };
    
    this.loadingStates.set(key, state);
    this.notify(key, state);
  }

  // Get loading state
  static getLoading(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  // Check if any loading is active
  static isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(state => state.isLoading);
  }

  // Get all loading states
  static getAllLoadingStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  // Clear loading state
  static clearLoading(key: string): void {
    this.loadingStates.delete(key);
    this.notify(key, { isLoading: false });
  }

  // Clear all loading states
  static clearAllLoading(): void {
    this.loadingStates.clear();
    this.listeners.forEach(listener => {
      this.loadingStates.forEach((state, key) => {
        listener(key, { isLoading: false });
      });
    });
  }
}

// Common loading keys
export const LOADING_KEYS = {
  AUTH_LOGIN: 'auth_login',
  AUTH_REGISTER: 'auth_register',
  AUTH_LOGOUT: 'auth_logout',
  PAYMENT_SEND: 'payment_send',
  PAYMENT_RECEIVE: 'payment_receive',
  TRANSACTION_HISTORY: 'transaction_history',
  USER_PROFILE: 'user_profile',
  NOTIFICATIONS: 'notifications',
  QR_CODE: 'qr_code',
  QR_SCAN: 'qr_scan',
} as const;

// Utility functions
export const showLoading = (key: string, message?: string): void => {
  LoadingService.setLoading(key, true, message);
};

export const hideLoading = (key: string): void => {
  LoadingService.setLoading(key, false);
};

export const updateLoadingProgress = (key: string, progress: number, message?: string): void => {
  const currentState = LoadingService.getLoading(key);
  if (currentState?.isLoading) {
    LoadingService.setLoading(key, true, message, progress);
  }
};

// Loading hook helper
export const useLoading = (key: string) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingService.getLoading(key) || { isLoading: false }
  );

  useEffect(() => {
    const unsubscribe = LoadingService.subscribe((loadingKey, state) => {
      if (loadingKey === key) {
        setLoadingState(state);
      }
    });

    return unsubscribe;
  }, [key]);

  return loadingState;
};

// Async operation wrapper
export const withLoading = async <T>(
  key: string,
  operation: () => Promise<T>,
  message?: string
): Promise<T> => {
  try {
    showLoading(key, message);
    const result = await operation();
    return result;
  } finally {
    hideLoading(key);
  }
};

// Error handling with loading
export const withLoadingAndError = async <T>(
  key: string,
  operation: () => Promise<T>,
  message?: string,
  errorTitle?: string
): Promise<T | null> => {
  try {
    return await withLoading(key, operation, message);
  } catch (error) {
    hideLoading(key);
    
    if (errorTitle) {
      Alert.alert(errorTitle, error instanceof Error ? error.message : 'An error occurred');
    }
    
    return null;
  }
};

