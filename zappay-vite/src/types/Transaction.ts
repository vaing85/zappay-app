export interface Transaction {
  id: string;
  amount: number;
  type: 'send' | 'receive' | 'request' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  createdAt: string;
  updatedAt: string;
  fee?: number;
  currency: string;
  reference?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  qrCodeId?: string;
  groupId?: string;
  splitBillId?: string;
  paymentMethod?: string;
  riskScore?: number;
  isRecurring?: boolean;
  recurringId?: string;
  parentTransactionId?: string;
  attachments?: TransactionAttachment[];
  // Additional properties for backward compatibility
  userId?: string;
  sender?: string;
  recipient?: string;
  note?: string;
  timestamp?: string;
}

export interface TransactionAttachment {
  id: string;
  type: 'image' | 'document' | 'receipt';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface TransactionSummary {
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  topCategories: {
    category: string;
    amount: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
    count: number;
  }[];
}

export interface TransactionFilters {
  type?: Transaction['type'];
  status?: Transaction['status'];
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  totalFees: number;
  pendingAmount: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
}
