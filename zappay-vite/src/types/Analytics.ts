import { Transaction } from './User';

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface SpendingTrend {
  period: string;
  amount: number;
  change: number;
  changePercentage: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categories: SpendingCategory[];
  topTransactions: Transaction[];
  savingsRate: number;
}

export interface SpendingForecast {
  nextMonth: {
    predicted: number;
    confidence: number;
  };
  nextQuarter: {
    predicted: number;
    confidence: number;
  };
  nextYear: {
    predicted: number;
    confidence: number;
  };
}

export interface SpendingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
}

export interface ComparisonData {
  current: {
    period: string;
    amount: number;
  };
  previous: {
    period: string;
    amount: number;
  };
  change: number;
  changePercentage: number;
}