// API Configuration for ZapPay Vite
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zappayapp-ie9d2.ondigitalocean.app';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  
  // User Management
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update',
    CHANGE_PASSWORD: '/api/user/change-password',
    DELETE_ACCOUNT: '/api/user/delete',
  },
  
  // Payments
  PAYMENTS: {
    CREATE: '/api/payments/create',
    PROCESS: '/api/payments/process',
    HISTORY: '/api/payments/history',
    REFUND: '/api/payments/refund',
  },
  
  // Transactions
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAILS: '/api/transactions/:id',
    CREATE: '/api/transactions/create',
    UPDATE: '/api/transactions/:id/update',
    DELETE: '/api/transactions/:id/delete',
  },
  
  // WebSocket
  WEBSOCKET: {
    URL: API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://'),
    EVENTS: {
      TRANSACTION_UPDATE: 'transaction_update',
      NOTIFICATION: 'notification',
      BALANCE_UPDATE: 'balance_update',
    },
  },
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: API_ENDPOINTS,
  WEBSOCKET_URL: API_ENDPOINTS.WEBSOCKET.URL,
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
