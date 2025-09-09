// Withdrawal Service
// Handles ACH and debit card withdrawals with fee calculation

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  method: 'ach' | 'debit_card';
  bankAccountId?: string;
  debitCardId?: string;
  description?: string;
}

export interface WithdrawalResult {
  success: boolean;
  transactionId?: string;
  fee?: number;
  netAmount?: number;
  error?: string;
  estimatedArrival?: string;
}

export interface WithdrawalFee {
  method: 'ach' | 'debit_card';
  fee: number;
  description: string;
  processingTime: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  isVerified: boolean;
  lastVerified?: string;
  createdAt: string;
}

class WithdrawalService {
  private withdrawalFees: WithdrawalFee[] = [
    {
      method: 'ach',
      fee: 1.99,
      description: 'ACH Bank Transfer',
      processingTime: '1-3 business days'
    },
    {
      method: 'debit_card',
      fee: 2.99,
      description: 'Instant Debit Card Withdrawal',
      processingTime: 'Instant'
    }
  ];

  // Calculate withdrawal fee based on method and user tier
  calculateWithdrawalFee(amount: number, method: 'ach' | 'debit_card', userTier: 'basic' | 'verified' | 'premium' = 'basic'): number {
    const feeInfo = this.withdrawalFees.find(f => f.method === method);
    if (!feeInfo) return 0;

    // Premium users get free withdrawals
    if (userTier === 'premium') {
      return 0;
    }

    // Verified users get 50% off fees
    if (userTier === 'verified') {
      return feeInfo.fee * 0.5;
    }

    return feeInfo.fee;
  }

  // Process withdrawal request
  async processWithdrawal(request: WithdrawalRequest, userTier: 'basic' | 'verified' | 'premium' = 'basic'): Promise<WithdrawalResult> {
    try {
      const fee = this.calculateWithdrawalFee(request.amount, request.method, userTier);
      const netAmount = request.amount - fee;

      if (netAmount <= 0) {
        return {
          success: false,
          error: 'Withdrawal amount must be greater than the fee'
        };
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      const transactionId = `with_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Determine estimated arrival time
      const estimatedArrival = request.method === 'ach' 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        : new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      return {
        success: true,
        transactionId,
        fee,
        netAmount,
        estimatedArrival
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal processing failed'
      };
    }
  }

  // Get withdrawal fees for display
  getWithdrawalFees(): WithdrawalFee[] {
    return this.withdrawalFees;
  }

  // Add bank account
  async addBankAccount(userId: string, bankAccount: Omit<BankAccount, 'id' | 'userId' | 'createdAt'>): Promise<BankAccount> {
    const newBankAccount: BankAccount = {
      id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...bankAccount,
      createdAt: new Date().toISOString()
    };

    // In a real app, this would save to the database
    return newBankAccount;
  }

  // Verify bank account (simulate micro-deposits)
  async verifyBankAccount(bankAccountId: string, verificationAmounts: number[]): Promise<boolean> {
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real app, this would verify the micro-deposits
    return true;
  }

  // Get user's bank accounts
  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    // In a real app, this would fetch from database
    return [];
  }

  // Remove bank account
  async removeBankAccount(bankAccountId: string): Promise<boolean> {
    // In a real app, this would remove from database
    return true;
  }
}

export const withdrawalService = new WithdrawalService();
export default withdrawalService;
