import { Alert } from 'react-native';

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error handler class
export class ErrorHandler {
  static handle(error: any): ApiError {
    // Network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request timed out. Please check your connection and try again.',
          code: ERROR_CODES.TIMEOUT_ERROR,
        };
      }
      
      return {
        message: 'Network error. Please check your internet connection.',
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    // HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          code: ERROR_CODES.VALIDATION_ERROR,
          status,
          details: data?.errors,
        };
      
      case 401:
        return {
          message: 'Authentication failed. Please log in again.',
          code: ERROR_CODES.AUTH_ERROR,
          status,
        };
      
      case 403:
        return {
          message: 'Access denied. You don\'t have permission to perform this action.',
          code: ERROR_CODES.AUTH_ERROR,
          status,
        };
      
      case 404:
        return {
          message: 'Resource not found.',
          code: ERROR_CODES.SERVER_ERROR,
          status,
        };
      
      case 422:
        return {
          message: data?.message || 'Validation failed. Please check your input.',
          code: ERROR_CODES.VALIDATION_ERROR,
          status,
          details: data?.errors,
        };
      
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: ERROR_CODES.SERVER_ERROR,
          status,
        };
      
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: ERROR_CODES.SERVER_ERROR,
          status,
        };
      
      default:
        return {
          message: data?.message || 'An unexpected error occurred.',
          code: ERROR_CODES.UNKNOWN_ERROR,
          status,
        };
    }
  }

  // Show error alert
  static showError(error: ApiError, title: string = 'Error'): void {
    Alert.alert(
      title,
      error.message,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }

  // Show error with retry option
  static showErrorWithRetry(
    error: ApiError,
    title: string = 'Error',
    onRetry: () => void
  ): void {
    Alert.alert(
      title,
      error.message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Retry',
          onPress: onRetry,
        },
      ]
    );
  }

  // Show validation errors
  static showValidationErrors(errors: any): void {
    const errorMessages = Object.values(errors).flat();
    const message = errorMessages.join('\n');
    
    Alert.alert(
      'Validation Error',
      message,
      [{ text: 'OK' }]
    );
  }

  // Log error for debugging
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandler${context ? ` - ${context}` : ''}]:`, error);
    }
  }
}

// Utility functions
export const handleApiError = (error: any, context?: string): ApiError => {
  ErrorHandler.logError(error, context);
  return ErrorHandler.handle(error);
};

export const showApiError = (error: any, title?: string, context?: string): void => {
  const apiError = handleApiError(error, context);
  ErrorHandler.showError(apiError, title);
};

export const showApiErrorWithRetry = (
  error: any,
  onRetry: () => void,
  title?: string,
  context?: string
): void => {
  const apiError = handleApiError(error, context);
  ErrorHandler.showErrorWithRetry(apiError, title, onRetry);
};

// Error boundary helper
export const getErrorMessage = (error: any): string => {
  const apiError = ErrorHandler.handle(error);
  return apiError.message;
};

// Network status helper
export const isNetworkError = (error: any): boolean => {
  return !error.response && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'));
};

// Retry helper
export const shouldRetry = (error: any): boolean => {
  const apiError = ErrorHandler.handle(error);
  return apiError.code === ERROR_CODES.NETWORK_ERROR || 
         apiError.code === ERROR_CODES.TIMEOUT_ERROR ||
         apiError.status === 500;
};

