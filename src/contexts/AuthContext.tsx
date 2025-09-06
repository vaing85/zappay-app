import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData } from '../types/User';
import { getUserByEmail, mockUsers, testCredentials } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  switchUser: (email: string) => void;
  availableUsers: typeof testCredentials;
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
    const savedUser = localStorage.getItem('zapcash_user');
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
    // Check if it's a test user
    const testUser = testCredentials.find(cred => cred.email === email);
    if (testUser && password === 'password123') {
      const mockUser = getUserByEmail(email);
      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem('zapcash_user', JSON.stringify(mockUser));
        return;
      }
    }
    
    // For any other email/password combination, use John Doe as default
    const defaultUser = getUserByEmail('john@zapcash.com');
    if (defaultUser) {
      setUser(defaultUser);
      localStorage.setItem('zapcash_user', JSON.stringify(defaultUser));
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
    localStorage.setItem('zapcash_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zapcash_user');
  };

  const switchUser = (email: string) => {
    const mockUser = getUserByEmail(email);
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('zapcash_user', JSON.stringify(mockUser));
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('zapcash_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      switchUser,
      availableUsers: testCredentials,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
