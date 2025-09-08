// API Configuration for ZapPay Frontend
// This file centralizes all API endpoint configurations

// Get the API base URL from environment variables
const getApiBaseUrl = (): string => {
  // In production, use the DigitalOcean backend URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://zappayapp-ie9d2.ondigitalocean.app';
  }
  
  // In development, use localhost backend
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

// Get the WebSocket URL
const getWebSocketUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_WEBSOCKET_URL || 'wss://zappayapp-ie9d2.ondigitalocean.app';
  }
  
  return process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  WEBSOCKET_URL: getWebSocketUrl(),
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  
  // API Endpoints
  ENDPOINTS: {
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
    
    // Users
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE_PROFILE: '/api/users/profile',
      CHANGE_PASSWORD: '/api/users/change-password',
      DELETE_ACCOUNT: '/api/users/delete-account',
    },
    
    // Transactions
    TRANSACTIONS: {
      LIST: '/api/transactions',
      CREATE: '/api/transactions',
      GET_BY_ID: (id: string) => `/api/transactions/${id}`,
      UPDATE: (id: string) => `/api/transactions/${id}`,
      DELETE: (id: string) => `/api/transactions/${id}`,
    },
    
    // Payments
    PAYMENTS: {
      CREATE_INTENT: '/api/payments/create-intent',
      CONFIRM_PAYMENT: '/api/payments/confirm',
      CANCEL_PAYMENT: '/api/payments/cancel',
      GET_PAYMENT_METHODS: '/api/payments/methods',
      ADD_PAYMENT_METHOD: '/api/payments/methods',
      REMOVE_PAYMENT_METHOD: (id: string) => `/api/payments/methods/${id}`,
    },
    
    // Groups
    GROUPS: {
      LIST: '/api/groups',
      CREATE: '/api/groups',
      GET_BY_ID: (id: string) => `/api/groups/${id}`,
      UPDATE: (id: string) => `/api/groups/${id}`,
      DELETE: (id: string) => `/api/groups/${id}`,
      ADD_MEMBER: (id: string) => `/api/groups/${id}/members`,
      REMOVE_MEMBER: (groupId: string, memberId: string) => `/api/groups/${groupId}/members/${memberId}`,
    },
    
    // Budgets
    BUDGETS: {
      LIST: '/api/budgets',
      CREATE: '/api/budgets',
      GET_BY_ID: (id: string) => `/api/budgets/${id}`,
      UPDATE: (id: string) => `/api/budgets/${id}`,
      DELETE: (id: string) => `/api/budgets/${id}`,
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/read-all',
      DELETE: (id: string) => `/api/notifications/${id}`,
    },
    
    // Stripe
    STRIPE: {
      CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
      CREATE_CUSTOMER: '/api/stripe/create-customer',
      ATTACH_PAYMENT_METHOD: '/api/stripe/attach-payment-method',
      DETACH_PAYMENT_METHOD: '/api/stripe/detach-payment-method',
      CREATE_REFUND: '/api/stripe/create-refund',
      GET_PAYMENT_METHODS: (customerId: string) => `/api/stripe/payment-methods/${customerId}`,
      GET_CHARGES: (customerId: string, limit?: number) => 
        `/api/stripe/charges/${customerId}${limit ? `?limit=${limit}` : ''}`,
    },
    
    // Test Endpoints
    TEST: {
      HEALTH: '/health',
      STRIPE_TEST: '/stripe-test',
      EMAIL_TEST: '/email-test',
      SMS_TEST: '/sms-test',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Combine base URL with endpoint
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Helper function for API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    timeout: API_CONFIG.TIMEOUT,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return fetch(url, mergedOptions);
};

// Export the configuration
export default API_CONFIG;
