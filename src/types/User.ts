export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  balance: number;
  createdAt: string;
  // Additional profile information
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePicture?: string;
  bio?: string;
  occupation?: string;
  company?: string;
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
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    address: boolean;
    bankAccount: boolean;
  };
  verificationLevel?: 'basic' | 'verified' | 'premium';
  bankAccount?: {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
    bankName: string;
    isVerified: boolean;
    lastVerified?: string;
  };
  withdrawalPreferences?: {
    defaultMethod: 'ach' | 'debit_card';
    achEnabled: boolean;
    debitCardEnabled: boolean;
  };
  limits?: {
    dailyDeposit: number;
    monthlyDeposit: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  amount: number;
  recipient?: string;
  sender?: string;
  note?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  category?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}
