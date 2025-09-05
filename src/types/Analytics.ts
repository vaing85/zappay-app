export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface MonthlySpending {
  month: string;
  year: number;
  totalSpent: number;
  totalReceived: number;
  netAmount: number;
  transactionCount: number;
}

export interface WeeklySpending {
  week: string;
  totalSpent: number;
  totalReceived: number;
  netAmount: number;
  transactionCount: number;
}

export interface DailySpending {
  date: string;
  totalSpent: number;
  totalReceived: number;
  netAmount: number;
  transactionCount: number;
}

export interface SpendingTrend {
  period: string;
  amount: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TopRecipient {
  name: string;
  amount: number;
  transactionCount: number;
  lastTransaction: string;
  avatar?: string;
}

export interface TopSender {
  name: string;
  amount: number;
  transactionCount: number;
  lastTransaction: string;
  avatar?: string;
}

export interface SpendingInsight {
  id: string;
  type: 'spending_increase' | 'spending_decrease' | 'unusual_activity' | 'saving_opportunity' | 'budget_alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  value?: number;
  period?: string;
}

export interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface AnalyticsSummary {
  totalSpent: number;
  totalReceived: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  topRecipient: string;
  spendingTrend: SpendingTrend;
  monthlyData: MonthlySpending[];
  weeklyData: WeeklySpending[];
  dailyData: DailySpending[];
  categoryBreakdown: SpendingCategory[];
  topRecipients: TopRecipient[];
  topSenders: TopSender[];
  insights: SpendingInsight[];
  budgetAlerts: BudgetAlert[];
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  dateRange: DateRange;
  includeCharts: boolean;
  includeInsights: boolean;
}
