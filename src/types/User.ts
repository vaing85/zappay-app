export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  balance: number;
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
  // Additional properties for Profile page
  occupation?: string;
  company?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website?: string;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    currency: string;
    language: string;
    timezone: string;
    notifications: boolean;
  };
  bankAccount?: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    routingNumber?: string;
    isVerified: boolean;
    lastVerified?: string;
  };
  withdrawalPreferences?: {
    defaultMethod: string;
    achEnabled: boolean;
    debitCardEnabled: boolean;
  };
  limits?: {
    dailyDeposit: number;
    monthlyDeposit: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
  };
  verificationLevel?: 'basic' | 'verified' | 'premium';
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    address: boolean;
    bankAccount: boolean;
  };
}

// Re-export Transaction type for backward compatibility
export type { Transaction } from './Transaction';