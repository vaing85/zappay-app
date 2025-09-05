import { 
  Budget, 
  BudgetCategory, 
  BudgetAlert, 
  BudgetGoal, 
  BudgetReport, 
  BudgetSettings, 
  Expense, 
  BudgetInsight 
} from '../types/Budget';
import { Transaction } from '../types/User';

// Default budget categories
export const defaultCategories: BudgetCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍽️',
    color: '#FF6B6B',
    description: 'Restaurants, groceries, and food delivery',
    isActive: true
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚗',
    color: '#4ECDC4',
    description: 'Gas, public transport, rideshare, parking',
    isActive: true
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#45B7D1',
    description: 'Movies, games, subscriptions, hobbies',
    isActive: true
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#96CEB4',
    description: 'Clothing, electronics, general shopping',
    isActive: true
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '⚡',
    color: '#FFEAA7',
    description: 'Electricity, water, internet, phone bills',
    isActive: true
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    color: '#DDA0DD',
    description: 'Medical expenses, pharmacy, insurance',
    isActive: true
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#98D8C8',
    description: 'Courses, books, training, school fees',
    isActive: true
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    color: '#F7DC6F',
    description: 'Vacations, hotels, flights, travel expenses',
    isActive: true
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📦',
    color: '#BB8FCE',
    description: 'Miscellaneous expenses',
    isActive: true
  }
];

// Mock budget data
export const mockBudgets: Budget[] = [
  {
    id: 'budget_1',
    userId: 'user_1',
    categoryId: 'food',
    category: defaultCategories[0],
    amount: 500,
    spent: 320,
    period: 'monthly',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'budget_2',
    userId: 'user_1',
    categoryId: 'transportation',
    category: defaultCategories[1],
    amount: 200,
    spent: 150,
    period: 'monthly',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'budget_3',
    userId: 'user_1',
    categoryId: 'entertainment',
    category: defaultCategories[2],
    amount: 300,
    spent: 280,
    period: 'monthly',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'budget_4',
    userId: 'user_2',
    categoryId: 'food',
    category: defaultCategories[0],
    amount: 400,
    spent: 180,
    period: 'monthly',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

// Mock budget goals
export const mockBudgetGoals: BudgetGoal[] = [
  {
    id: 'goal_1',
    userId: 'user_1',
    name: 'Emergency Fund',
    description: 'Build a 6-month emergency fund',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: '2024-12-31T23:59:59Z',
    category: 'savings',
    isCompleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'goal_2',
    userId: 'user_1',
    name: 'New Laptop',
    description: 'Save for a new MacBook Pro',
    targetAmount: 2500,
    currentAmount: 1200,
    deadline: '2024-06-30T23:59:59Z',
    category: 'purchase',
    isCompleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'goal_3',
    userId: 'user_2',
    name: 'Vacation Fund',
    description: 'Save for summer vacation to Europe',
    targetAmount: 5000,
    currentAmount: 2200,
    deadline: '2024-07-15T23:59:59Z',
    category: 'savings',
    isCompleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

// Mock budget alerts
export const mockBudgetAlerts: BudgetAlert[] = [
  {
    id: 'alert_1',
    budgetId: 'budget_3',
    userId: 'user_1',
    type: 'warning',
    message: 'You\'ve spent 93% of your Entertainment budget for this month',
    threshold: 80,
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'alert_2',
    budgetId: 'budget_1',
    userId: 'user_1',
    type: 'critical',
    message: 'You\'ve spent 95% of your Food & Dining budget for this month',
    threshold: 95,
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z'
  }
];

// Mock budget settings
export const mockBudgetSettings: BudgetSettings = {
  userId: 'user_1',
  defaultPeriod: 'monthly',
  alertThresholds: {
    warning: 80,
    critical: 95
  },
  autoCategorization: true,
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: true,
    monthlyReports: true
  },
  currency: 'USD',
  startOfWeek: 'monday'
};

// Service functions
export const getBudgetsForUser = (userId: string): Budget[] => {
  return mockBudgets.filter(budget => budget.userId === userId && budget.isActive);
};

export const getBudgetGoalsForUser = (userId: string): BudgetGoal[] => {
  return mockBudgetGoals.filter(goal => goal.userId === userId);
};

export const getBudgetAlertsForUser = (userId: string): BudgetAlert[] => {
  return mockBudgetAlerts.filter(alert => alert.userId === userId);
};

export const getBudgetSettingsForUser = (userId: string): BudgetSettings => {
  return mockBudgetSettings;
};

export const getBudgetCategories = (): BudgetCategory[] => {
  return defaultCategories.filter(category => category.isActive);
};

export const calculateBudgetProgress = (budget: Budget): number => {
  return Math.min((budget.spent / budget.amount) * 100, 100);
};

export const getBudgetStatus = (budget: Budget): 'safe' | 'warning' | 'critical' | 'exceeded' => {
  const progress = calculateBudgetProgress(budget);
  if (progress >= 100) return 'exceeded';
  if (progress >= 95) return 'critical';
  if (progress >= 80) return 'warning';
  return 'safe';
};

export const generateBudgetReport = (userId: string, period: string): BudgetReport => {
  const budgets = getBudgetsForUser(userId);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const categories = budgets.map(budget => ({
    categoryId: budget.categoryId,
    categoryName: budget.category.name,
    budgeted: budget.amount,
    spent: budget.spent,
    remaining: budget.amount - budget.spent,
    percentage: calculateBudgetProgress(budget)
  }));

  const overspentCategories = categories
    .filter(cat => cat.spent > cat.budgeted)
    .map(cat => cat.categoryName);

  const underspentCategories = categories
    .filter(cat => cat.spent < cat.budgeted * 0.5)
    .map(cat => cat.categoryName);

  const topSpendingCategory = categories
    .sort((a, b) => b.spent - a.spent)[0]?.categoryName || '';

  const averageDailySpending = totalSpent / 15; // Assuming 15 days into the month
  const projectedMonthlySpending = averageDailySpending * 30;

  return {
    period,
    totalBudget,
    totalSpent,
    totalRemaining,
    categories,
    insights: {
      overspentCategories,
      underspentCategories,
      topSpendingCategory,
      averageDailySpending,
      projectedMonthlySpending
    }
  };
};

export const categorizeTransaction = (transaction: Transaction): string => {
  // Simple categorization logic based on transaction description
  const description = (transaction.note || '').toLowerCase();
  
  if (description.includes('food') || description.includes('restaurant') || description.includes('grocery')) {
    return 'food';
  }
  if (description.includes('gas') || description.includes('uber') || description.includes('lyft') || description.includes('transport')) {
    return 'transportation';
  }
  if (description.includes('movie') || description.includes('netflix') || description.includes('entertainment')) {
    return 'entertainment';
  }
  if (description.includes('shopping') || description.includes('store') || description.includes('amazon')) {
    return 'shopping';
  }
  if (description.includes('electric') || description.includes('water') || description.includes('internet')) {
    return 'utilities';
  }
  if (description.includes('doctor') || description.includes('pharmacy') || description.includes('medical')) {
    return 'healthcare';
  }
  if (description.includes('course') || description.includes('book') || description.includes('education')) {
    return 'education';
  }
  if (description.includes('travel') || description.includes('hotel') || description.includes('flight')) {
    return 'travel';
  }
  
  return 'other';
};

export const createBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget => {
  const newBudget: Budget = {
    ...budget,
    id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockBudgets.push(newBudget);
  return newBudget;
};

export const updateBudget = (budgetId: string, updates: Partial<Budget>): Budget | null => {
  const index = mockBudgets.findIndex(budget => budget.id === budgetId);
  if (index === -1) return null;
  
  mockBudgets[index] = {
    ...mockBudgets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return mockBudgets[index];
};

export const deleteBudget = (budgetId: string): boolean => {
  const index = mockBudgets.findIndex(budget => budget.id === budgetId);
  if (index === -1) return false;
  
  mockBudgets.splice(index, 1);
  return true;
};
