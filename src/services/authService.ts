import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  error?: string;
}

class AuthService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      return {
        success: true,
        data: {
          token: response.data.data?.token || response.data.token,
          user: response.data.data?.user || response.data.user
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed',
      };
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);

      return {
        success: true,
        data: {
          token: response.data.data?.token || response.data.token,
          user: response.data.data?.user || response.data.user
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Registration failed',
      };
    }
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
        token,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
      };
    }
  }

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        token,
      });

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

export const authService = new AuthService();

