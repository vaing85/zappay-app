export interface SplitBill {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  createdBy: string;
  createdByName: string;
  participants: SplitParticipant[];
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'utilities' | 'other';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  dueDate?: string;
  imageUrl?: string;
}

export interface SplitParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'pending' | 'paid' | 'declined';
  paidAt?: string;
  note?: string;
}

export interface PaymentRequest {
  id: string;
  title: string;
  description?: string;
  amount: number;
  requestedBy: string;
  requestedByName: string;
  requestedFrom: string;
  requestedFromName: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'utilities' | 'other';
  createdAt: string;
  dueDate?: string;
  expiresAt?: string;
  note?: string;
  imageUrl?: string;
}

export interface PaymentGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'admin' | 'member';
  joinedAt: string;
}
