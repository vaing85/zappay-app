import { 
  Group, 
  GroupMember, 
  GroupExpense, 
  PaymentRequest, 
  GroupInvite, 
  GroupActivity,
  GroupAnalytics,
  GroupNotification,
  ExpenseSplit
} from '../types/Social';

class GroupService {
  private groups: Map<string, Group> = new Map();
  private expenses: Map<string, GroupExpense> = new Map();
  private paymentRequests: Map<string, PaymentRequest> = new Map();
  private invites: Map<string, GroupInvite> = new Map();
  private activities: Map<string, GroupActivity> = new Map();
  private notifications: Map<string, GroupNotification> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock groups
    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Roommates',
        description: 'Apartment expenses and utilities',
        createdBy: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        members: [
          {
            id: '1',
            userId: '1',
            email: 'john@zapcash.com',
            firstName: 'John',
            lastName: 'Doe',
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            role: 'admin',
            joinedAt: '2024-01-01T00:00:00Z',
            isActive: true,
            totalContributed: 1200.00,
            totalOwed: 800.00,
            balance: 400.00
          },
          {
            id: '2',
            userId: '2',
            email: 'sarah@zapcash.com',
            firstName: 'Sarah',
            lastName: 'Wilson',
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            role: 'member',
            joinedAt: '2024-01-02T00:00:00Z',
            isActive: true,
            totalContributed: 900.00,
            totalOwed: 1100.00,
            balance: -200.00
          }
        ],
        settings: {
          allowMemberInvites: true,
          requireApprovalForExpenses: false,
          defaultSplitMethod: 'equal',
          currency: 'USD',
          notifications: {
            newExpenses: true,
            paymentsReceived: true,
            groupUpdates: true,
            reminders: true
          },
          privacy: 'private'
        },
        totalExpenses: 2100.00,
        totalTransactions: 15,
        isActive: true,
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'Vacation Fund',
        description: 'Saving for our summer trip to Europe',
        createdBy: '1',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        members: [
          {
            id: '3',
            userId: '1',
            email: 'john@zapcash.com',
            firstName: 'John',
            lastName: 'Doe',
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            role: 'admin',
            joinedAt: '2024-01-10T00:00:00Z',
            isActive: true,
            totalContributed: 500.00,
            totalOwed: 0.00,
            balance: 500.00
          },
          {
            id: '4',
            userId: '3',
            email: 'mike@zapcash.com',
            firstName: 'Mike',
            lastName: 'Johnson',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            role: 'member',
            joinedAt: '2024-01-11T00:00:00Z',
            isActive: true,
            totalContributed: 300.00,
            totalOwed: 0.00,
            balance: 300.00
          }
        ],
        settings: {
          allowMemberInvites: true,
          requireApprovalForExpenses: true,
          defaultSplitMethod: 'equal',
          currency: 'USD',
          notifications: {
            newExpenses: true,
            paymentsReceived: true,
            groupUpdates: true,
            reminders: true
          },
          privacy: 'invite-only'
        },
        totalExpenses: 800.00,
        totalTransactions: 8,
        isActive: true,
        color: '#10B981'
      }
    ];

    mockGroups.forEach(group => this.groups.set(group.id, group));

    // Mock expenses
    const mockExpenses: GroupExpense[] = [
      {
        id: '1',
        groupId: '1',
        createdBy: '1',
        title: 'Electric Bill',
        description: 'Monthly electricity bill for apartment',
        amount: 120.00,
        currency: 'USD',
        category: 'Utilities',
        splitMethod: 'equal',
        splits: [
          {
            userId: '1',
            amount: 60.00,
            isPaid: true,
            paidAt: '2024-01-15T10:00:00Z',
            paidAmount: 60.00,
            remainingAmount: 0.00
          },
          {
            userId: '2',
            amount: 60.00,
            isPaid: false,
            paidAmount: 0.00,
            remainingAmount: 60.00
          }
        ],
        status: 'partial',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-01-25T00:00:00Z',
        tags: ['utilities', 'monthly']
      },
      {
        id: '2',
        groupId: '1',
        createdBy: '2',
        title: 'Groceries',
        description: 'Weekly grocery shopping',
        amount: 85.50,
        currency: 'USD',
        category: 'Food',
        splitMethod: 'equal',
        splits: [
          {
            userId: '1',
            amount: 42.75,
            isPaid: false,
            paidAmount: 0.00,
            remainingAmount: 42.75
          },
          {
            userId: '2',
            amount: 42.75,
            isPaid: true,
            paidAt: '2024-01-14T15:30:00Z',
            paidAmount: 42.75,
            remainingAmount: 0.00
          }
        ],
        status: 'partial',
        createdAt: '2024-01-14T14:00:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
        tags: ['food', 'weekly']
      }
    ];

    mockExpenses.forEach(expense => this.expenses.set(expense.id, expense));
  }

  // Group Management
  async createGroup(groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalTransactions'>): Promise<Group> {
    const group: Group = {
      ...groupData,
      id: (this.groups.size + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalExpenses: 0,
      totalTransactions: 0
    };

    this.groups.set(group.id, group);
    return group;
  }

  async getGroup(groupId: string): Promise<Group | null> {
    return this.groups.get(groupId) || null;
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(group =>
      group.members.some(member => member.userId === userId && member.isActive)
    );
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group | null> {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const updatedGroup = {
      ...group,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.groups.set(groupId, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(groupId: string, userId: string): Promise<boolean> {
    const group = this.groups.get(groupId);
    if (!group || group.createdBy !== userId) return false;

    this.groups.delete(groupId);
    return true;
  }

  // Member Management
  async addMember(groupId: string, memberData: Omit<GroupMember, 'id' | 'joinedAt' | 'totalContributed' | 'totalOwed' | 'balance'>): Promise<GroupMember | null> {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const member: GroupMember = {
      ...memberData,
      id: (group.members.length + 1).toString(),
      joinedAt: new Date().toISOString(),
      totalContributed: 0,
      totalOwed: 0,
      balance: 0
    };

    group.members.push(member);
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);

    return member;
  }

  async removeMember(groupId: string, userId: string): Promise<boolean> {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const memberIndex = group.members.findIndex(member => member.userId === userId);
    if (memberIndex === -1) return false;

    group.members[memberIndex].isActive = false;
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);

    return true;
  }

  async updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<boolean> {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const member = group.members.find(member => member.userId === userId);
    if (!member) return false;

    member.role = role;
    group.updatedAt = new Date().toISOString();
    this.groups.set(groupId, group);

    return true;
  }

  // Expense Management
  async createExpense(expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<GroupExpense> {
    const expense: GroupExpense = {
      ...expenseData,
      id: (this.expenses.size + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.expenses.set(expense.id, expense);

    // Update group totals
    const group = this.groups.get(expense.groupId);
    if (group) {
      group.totalExpenses += expense.amount;
      group.totalTransactions += 1;
      group.updatedAt = new Date().toISOString();
      this.groups.set(expense.groupId, group);
    }

    return expense;
  }

  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.groupId === groupId);
  }

  async updateExpense(expenseId: string, updates: Partial<GroupExpense>): Promise<GroupExpense | null> {
    const expense = this.expenses.get(expenseId);
    if (!expense) return null;

    const updatedExpense = {
      ...expense,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.expenses.set(expenseId, updatedExpense);
    return updatedExpense;
  }

  async payExpenseSplit(expenseId: string, userId: string, amount: number): Promise<boolean> {
    const expense = this.expenses.get(expenseId);
    if (!expense) return false;

    const split = expense.splits.find(s => s.userId === userId);
    if (!split) return false;

    split.paidAmount += amount;
    split.remainingAmount = split.amount - split.paidAmount;
    split.isPaid = split.remainingAmount <= 0;
    
    if (split.isPaid) {
      split.paidAt = new Date().toISOString();
    }

    // Update expense status
    const allPaid = expense.splits.every(s => s.isPaid);
    expense.status = allPaid ? 'completed' : 'partial';
    expense.updatedAt = new Date().toISOString();

    this.expenses.set(expenseId, expense);
    return true;
  }

  // Payment Requests
  async createPaymentRequest(requestData: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>): Promise<PaymentRequest> {
    const request: PaymentRequest = {
      ...requestData,
      id: (this.paymentRequests.size + 1).toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.paymentRequests.set(request.id, request);
    return request;
  }

  async getUserPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return Array.from(this.paymentRequests.values()).filter(request => 
      request.fromUserId === userId || request.toUserId === userId
    );
  }

  async updatePaymentRequest(requestId: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest | null> {
    const request = this.paymentRequests.get(requestId);
    if (!request) return null;

    const updatedRequest = {
      ...request,
      ...updates
    };

    this.paymentRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }

  // Group Analytics
  async getGroupAnalytics(groupId: string, period: 'week' | 'month' | 'quarter' | 'year'): Promise<GroupAnalytics> {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');

    const expenses = await this.getGroupExpenses(groupId);
    const now = new Date();
    const startDate = this.getPeriodStartDate(now, period);

    const periodExpenses = expenses.filter(expense => 
      new Date(expense.createdAt) >= startDate
    );

    const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalTransactions = periodExpenses.length;
    const averageExpense = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

    // Calculate category spending
    const categoryMap = new Map<string, { amount: number; count: number }>();
    periodExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate member spending
    const memberSpending = group.members.map(member => ({
      userId: member.userId,
      name: `${member.firstName} ${member.lastName}`,
      totalSpent: member.totalContributed,
      totalPaid: member.totalOwed,
      balance: member.balance,
      transactionCount: 0 // This would be calculated from actual transactions
    }));

    return {
      groupId,
      period,
      totalExpenses,
      totalTransactions,
      averageExpense,
      topCategories,
      topSpenders: memberSpending.sort((a, b) => b.totalSpent - a.totalSpent),
      expenseTrends: [], // This would be calculated from historical data
      memberBalances: memberSpending.map(member => ({
        userId: member.userId,
        name: member.name,
        totalOwed: Math.max(0, member.balance),
        totalOwing: Math.max(0, -member.balance),
        netBalance: member.balance
      })),
      savings: 0, // This would be calculated based on goals
      insights: [
        `Total group spending: $${totalExpenses.toFixed(2)}`,
        `Average expense: $${averageExpense.toFixed(2)}`,
        `Most active category: ${topCategories[0]?.category || 'None'}`
      ]
    };
  }

  private getPeriodStartDate(now: Date, period: string): Date {
    const start = new Date(now);
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return start;
  }

  // Notifications
  async getGroupNotifications(groupId: string, userId: string): Promise<GroupNotification[]> {
    return Array.from(this.notifications.values()).filter(notification =>
      notification.groupId === groupId && notification.userId === userId
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.isRead = true;
    this.notifications.set(notificationId, notification);
    return true;
  }
}

export const groupService = new GroupService();
