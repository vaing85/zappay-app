export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isActive: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category: BudgetCategory;
  amount: number; // Budget limit
  spent: number; // Amount already spent
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO date
  endDate: string; // ISO date
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  threshold: number; // Percentage (e.g., 80 for 80%)
  isRead: boolean;
  createdAt: string;
}

export interface BudgetGoal {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date
  category: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'other';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetReport {
  period: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  categories: {
    categoryId: string;
    categoryName: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
  insights: {
    overspentCategories: string[];
    underspentCategories: string[];
    topSpendingCategory: string;
    averageDailySpending: number;
    projectedMonthlySpending: number;
  };
}

export interface BudgetSettings {
  userId: string;
  defaultPeriod: 'weekly' | 'monthly' | 'yearly';
  alertThresholds: {
    warning: number; // Default 80%
    critical: number; // Default 95%
  };
  autoCategorization: boolean;
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  currency: string;
  startOfWeek: 'monday' | 'sunday';
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  categoryId: string;
  category: BudgetCategory;
  date: string; // ISO date
  transactionId?: string; // Link to transaction if applicable
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  createdAt: string;
}

export interface BudgetInsight {
  id: string;
  userId: string;
  type: 'spending_trend' | 'category_analysis' | 'goal_progress' | 'budget_efficiency';
  title: string;
  description: string;
  data: any; // Flexible data structure
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}
