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