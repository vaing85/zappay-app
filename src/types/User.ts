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
  };
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  recipient?: string;
  sender?: string;
  note?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}
