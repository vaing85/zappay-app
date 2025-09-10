import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions interface
interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Combined auth store type
type AuthStore = AuthState & AuthActions;

// Create auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call - replace with real API
          const response = await fetch('https://your-api.com/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }
          
          set({ error: 'Login failed', isLoading: false });
          return false;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call - replace with real API
          const response = await fetch('https://your-api.com/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }
          
          set({ error: 'Registration failed', isLoading: false });
          return false;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          // Mock API call - replace with real API
          await fetch('https://your-api.com/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call - replace with real API
          const response = await fetch('https://your-api.com/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          if (response.ok) {
            const updatedUser = await response.json();
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock API call - replace with real API
          const response = await fetch('https://your-api.com/api/auth/me');
          
          if (response.ok) {
            const user = await response.json();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          // If refresh fails, user might need to login again
          set({ isAuthenticated: false, user: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  updateUser: state.updateUser,
  refreshUser: state.refreshUser,
  clearError: state.clearError,
  setLoading: state.setLoading,
  isLoading: state.isLoading,
}));
