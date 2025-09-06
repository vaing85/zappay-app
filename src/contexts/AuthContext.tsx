import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData } from '../types/User';
import { getUserByEmail, mockUsers } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('zappay_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing saved user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would validate against a backend API
    // For demo purposes, we'll allow any email/password combination
    // and create a basic user profile
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('zappay_user', JSON.stringify(existingUser));
    } else {
      // Create a new user for demo purposes
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        firstName: email.split('@')[0],
        lastName: 'User',
        email: email,
        phoneNumber: '+1 (555) 000-0000',
        balance: 100.00,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('zappay_user', JSON.stringify(newUser));
    }
  };

  const register = async (userData: RegisterData) => {
    // Create new user with next available ID
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      ...userData,
      balance: 100.00, // Give new users $100 to start
      createdAt: new Date().toISOString(),
    };
    
    // Add to mock users array
    mockUsers.push(newUser);
    
    setUser(newUser);
    localStorage.setItem('zappay_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zappay_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('zappay_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
