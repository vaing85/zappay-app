export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  settings: GroupSettings;
  totalExpenses: number;
  totalTransactions: number;
  isActive: boolean;
  avatar?: string;
  color: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: 'admin' | 'member';
  joinedAt: string;
  isActive: boolean;
  totalContributed: number;
  totalOwed: number;
  balance: number; // positive = owed money, negative = owes money
}

export interface GroupSettings {
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  defaultSplitMethod: 'equal' | 'percentage' | 'custom';
  currency: string;
  notifications: {
    newExpenses: boolean;
    paymentsReceived: boolean;
    groupUpdates: boolean;
    reminders: boolean;
  };
  privacy: 'public' | 'private' | 'invite-only';
}

export interface GroupExpense {
  id: string;
  groupId: string;
  createdBy: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  splitMethod: 'equal' | 'percentage' | 'custom';
  splits: ExpenseSplit[];
  status: 'pending' | 'partial' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  receipt?: string;
  tags: string[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
  isPaid: boolean;
  paidAt?: string;
  paidAmount: number;
  remainingAmount: number;
}

export interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId?: string;
  toGroupId?: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  paymentMethod?: string;
  isRecurring: boolean;
  recurringSettings?: RecurringSettings;
  attachments?: string[];
}

export interface RecurringSettings {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  endDate?: string;
  maxOccurrences?: number;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  token: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  type: 'expense_created' | 'expense_paid' | 'member_joined' | 'member_left' | 'group_updated' | 'payment_requested';
  title: string;
  description: string;
  metadata?: any;
  createdAt: string;
  isRead: boolean;
}

export interface GroupAnalytics {
  groupId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  totalExpenses: number;
  totalTransactions: number;
  averageExpense: number;
  topCategories: CategorySpending[];
  topSpenders: MemberSpending[];
  expenseTrends: ExpenseTrend[];
  memberBalances: MemberBalance[];
  savings: number;
  insights: string[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MemberSpending {
  userId: string;
  name: string;
  totalSpent: number;
  totalPaid: number;
  balance: number;
  transactionCount: number;
}

export interface ExpenseTrend {
  period: string;
  amount: number;
  transactionCount: number;
  change: number;
  changePercentage: number;
}

export interface MemberBalance {
  userId: string;
  name: string;
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
}

export interface SocialShare {
  id: string;
  userId: string;
  type: 'payment' | 'achievement' | 'group_activity' | 'expense';
  content: string;
  metadata: any;
  visibility: 'public' | 'friends' | 'group' | 'private';
  createdAt: string;
  likes: number;
  comments: SocialComment[];
  shares: number;
}

export interface SocialComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: SocialComment[];
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  acceptedAt?: string;
  lastInteraction?: string;
  mutualGroups: number;
  totalTransactions: number;
}

export interface GroupNotification {
  id: string;
  groupId: string;
  userId: string;
  type: 'expense_created' | 'payment_received' | 'member_joined' | 'group_updated' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}
