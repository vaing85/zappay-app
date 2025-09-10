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
}

// Re-export Transaction type for backward compatibility
export type { Transaction } from './Transaction';