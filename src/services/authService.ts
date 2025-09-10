import axios from 'axios';

const API_BASE_URL = 'https://api.zappay.site/v1';

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
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
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
      const response = await this.api.post('/auth/register', userData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/refresh', {
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
      await this.api.post('/auth/logout', {
        token,
      });

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

export const authService = new AuthService();

