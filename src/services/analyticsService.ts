import { Transaction } from '../types/User';
import { 
  SpendingCategory, 
  SpendingTrend, 
  MonthlyReport, 
  SpendingForecast, 
  SpendingGoal, 
  ComparisonData 
} from '../types/Analytics';

class AnalyticsService {
  private getTransactionsByUser(userId: string): Transaction[] {
    // Mock transaction data for analytics
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        userId,
        amount: 150.00,
        currency: 'USD',
        type: 'send',
        recipient: 'Coffee Shop',
        note: 'Morning coffee',
        timestamp: '2024-01-15T08:30:00Z',
        category: 'Food & Dining',
        status: 'completed',
        createdAt: '2024-01-15T08:30:00Z',
        updatedAt: '2024-01-15T08:30:00Z'
      },
      {
        id: '2',
        userId,
        amount: 75.50,
        currency: 'USD',
        type: 'send',
        recipient: 'Gas Station',
        note: 'Fuel',
        timestamp: '2024-01-14T16:45:00Z',
        category: 'Transportation',
        status: 'completed',
        createdAt: '2024-01-14T16:45:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
      },
      {
        id: '3',
        userId,
        amount: 299.99,
        currency: 'USD',
        type: 'send',
        recipient: 'Online Store',
        note: 'Electronics',
        timestamp: '2024-01-13T20:15:00Z',
        category: 'Shopping',
        status: 'completed',
        createdAt: '2024-01-13T20:15:00Z',
        updatedAt: '2024-01-13T20:15:00Z'
      },
      {
        id: '4',
        userId,
        amount: 1200.00,
        currency: 'USD',
        type: 'receive',
        sender: 'Employer',
        note: 'Salary',
        timestamp: '2024-01-01T09:00:00Z',
        category: 'Income',
        status: 'completed',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '5',
        userId,
        amount: 89.99,
        currency: 'USD',
        type: 'send',
        recipient: 'Streaming Service',
        note: 'Monthly subscription',
        timestamp: '2024-01-10T12:00:00Z',
        category: 'Entertainment',
        status: 'completed',
        createdAt: '2024-01-10T12:00:00Z',
        updatedAt: '2024-01-10T12:00:00Z'
      },
      {
        id: '6',
        userId,
        amount: 45.00,
        currency: 'USD',
        type: 'send',
        recipient: 'Grocery Store',
        note: 'Weekly groceries',
        timestamp: '2024-01-12T14:30:00Z',
        category: 'Food & Dining',
        status: 'completed',
        createdAt: '2024-01-12T14:30:00Z',
        updatedAt: '2024-01-12T14:30:00Z'
      },
      {
        id: '7',
        userId,
        amount: 200.00,
        currency: 'USD',
        type: 'send',
        recipient: 'Utility Company',
        note: 'Electric bill',
        timestamp: '2024-01-05T10:00:00Z',
        category: 'Utilities',
        status: 'completed',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z'
      },
      {
        id: '8',
        userId,
        amount: 350.00,
        currency: 'USD',
        type: 'send',
        recipient: 'Gym Membership',
        note: 'Monthly membership',
        timestamp: '2024-01-08T18:00:00Z',
        category: 'Health & Fitness',
        status: 'completed',
        createdAt: '2024-01-08T18:00:00Z',
        updatedAt: '2024-01-08T18:00:00Z'
      }
    ];

    return mockTransactions;
  }

  getSpendingCategories(userId: string, startDate: Date, endDate: Date): SpendingCategory[] {
    const transactions = this.getTransactionsByUser(userId)
      .filter(t => {
        if (t.type !== 'send') return false;
        const transactionDate = new Date(t.timestamp || t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });

    const totalAmount = Array.from(categoryMap.values())
      .reduce((sum, cat) => sum + cat.amount, 0);

    const colors = [
      '#F59E0B', '#EF4444', '#10B981', '#3B82F6', 
      '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
    ];

    const icons = [
      '🍔', '🚗', '🛍️', '💰', '🎬', '🏠', '💪', '📱'
    ];

    return Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: colors[index % colors.length],
        icon: icons[index % icons.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getSpendingTrends(userId: string, months: number = 6): SpendingTrend[] {
    const trends: SpendingTrend[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const transactions = this.getTransactionsByUser(userId)
        .filter(t => {
          if (t.type !== 'send') return false;
          const transactionDate = new Date(t.timestamp || t.createdAt);
          return transactionDate >= date && transactionDate < nextMonth;
        });

      const amount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const period = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const previousAmount = i > 0 ? trends[trends.length - 1]?.amount || 0 : 0;
      const change = amount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      trends.push({
        period,
        amount,
        change,
        changePercentage
      });
    }

    return trends;
  }

  getMonthlyReport(userId: string, year: number, month: number): MonthlyReport {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = this.getTransactionsByUser(userId)
      .filter(t => {
        const transactionDate = new Date(t.timestamp || t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

    const income = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = income - expenses;
    const savingsRate = income > 0 ? (netIncome / income) * 100 : 0;

    const categories = this.getSpendingCategories(userId, startDate, endDate);
    
    const topTransactions = transactions
      .filter(t => t.type === 'send')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      month: startDate.toLocaleDateString('en-US', { month: 'long' }),
      year,
      totalIncome: income,
      totalExpenses: expenses,
      netIncome,
      categories,
      topTransactions,
      savingsRate
    };
  }

  getSpendingForecast(userId: string): SpendingForecast {
    const trends = this.getSpendingTrends(userId, 6);
    const recentTrend = trends.slice(-3);
    const avgSpending = recentTrend.reduce((sum, t) => sum + t.amount, 0) / recentTrend.length;
    
    // Simple trend analysis
    const trendSlope = trends.length > 1 ? 
      (trends[trends.length - 1].amount - trends[0].amount) / trends.length : 0;
    
    const nextMonthPrediction = Math.max(0, avgSpending + trendSlope);
    const nextQuarterPrediction = Math.max(0, avgSpending * 3 + trendSlope * 3);
    const nextYearPrediction = Math.max(0, avgSpending * 12 + trendSlope * 12);

    return {
      nextMonth: {
        predicted: nextMonthPrediction,
        confidence: 0.75
      },
      nextQuarter: {
        predicted: nextQuarterPrediction,
        confidence: 0.65
      },
      nextYear: {
        predicted: nextYearPrediction,
        confidence: 0.45
      }
    };
  }

  getSpendingGoals(userId: string): SpendingGoal[] {
    // Mock spending goals
    return [
      {
        id: '1',
        name: 'Monthly Food Budget',
        targetAmount: 500,
        currentAmount: 195.50,
        deadline: new Date('2024-01-31'),
        category: 'Food & Dining',
        progress: 39.1,
        status: 'on-track'
      },
      {
        id: '2',
        name: 'Emergency Fund',
        targetAmount: 5000,
        currentAmount: 3200,
        deadline: new Date('2024-12-31'),
        category: 'Savings',
        progress: 64,
        status: 'ahead'
      },
      {
        id: '3',
        name: 'Entertainment Limit',
        targetAmount: 200,
        currentAmount: 89.99,
        deadline: new Date('2024-01-31'),
        category: 'Entertainment',
        progress: 45,
        status: 'on-track'
      }
    ];
  }

  getComparisonData(userId: string, type: 'monthly' | 'yearly'): ComparisonData {
    const now = new Date();
    
    if (type === 'monthly') {
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousNextMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const currentTransactions = this.getTransactionsByUser(userId)
        .filter(t => {
          if (t.type !== 'send') return false;
          const transactionDate = new Date(t.timestamp || t.createdAt);
          return transactionDate >= currentMonth && transactionDate < nextMonth;
        });
      
      const previousTransactions = this.getTransactionsByUser(userId)
        .filter(t => {
          if (t.type !== 'send') return false;
          const transactionDate = new Date(t.timestamp || t.createdAt);
          return transactionDate >= previousMonth && transactionDate < previousNextMonth;
        });

      const currentAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const previousAmount = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
      const change = currentAmount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      return {
        current: {
          period: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: currentAmount
        },
        previous: {
          period: previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: previousAmount
        },
        change,
        changePercentage
      };
    } else {
      const currentYear = new Date(now.getFullYear(), 0, 1);
      const nextYear = new Date(now.getFullYear() + 1, 0, 1);
      const previousYear = new Date(now.getFullYear() - 1, 0, 1);
      const previousNextYear = new Date(now.getFullYear(), 0, 1);

      const currentTransactions = this.getTransactionsByUser(userId)
        .filter(t => {
          if (t.type !== 'send') return false;
          const transactionDate = new Date(t.timestamp || t.createdAt);
          return transactionDate >= currentYear && transactionDate < nextYear;
        });
      
      const previousTransactions = this.getTransactionsByUser(userId)
        .filter(t => {
          if (t.type !== 'send') return false;
          const transactionDate = new Date(t.timestamp || t.createdAt);
          return transactionDate >= previousYear && transactionDate < previousNextYear;
        });

      const currentAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const previousAmount = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
      const change = currentAmount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      return {
        current: {
          period: currentYear.getFullYear().toString(),
          amount: currentAmount
        },
        previous: {
          period: previousYear.getFullYear().toString(),
          amount: previousAmount
        },
        change,
        changePercentage
      };
    }
  }

  exportReport(userId: string, format: 'csv' | 'pdf' = 'csv'): string {
    const report = this.getMonthlyReport(userId, new Date().getFullYear(), new Date().getMonth() + 1);
    
    if (format === 'csv') {
      const headers = ['Category', 'Amount', 'Percentage'];
      const rows = report.categories.map(cat => [
        cat.name,
        cat.amount.toFixed(2),
        cat.percentage.toFixed(1) + '%'
      ]);
      
      return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    }
    
    // PDF export would require a library like jsPDF
    return JSON.stringify(report, null, 2);
  }

  // Premium Analytics Features (gated behind subscription tiers)
  
  async getAdvancedInsights(userId: string, hasFeatureAccess: (feature: string) => boolean): Promise<any> {
    if (!hasFeatureAccess('AI Recommendations')) {
      return {
        insights: [],
        recommendations: [],
        isPremium: false,
        upgradeMessage: 'Upgrade to Pro or higher to unlock AI-powered financial insights and recommendations.'
      };
    }

    // Simulate AI-powered insights
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactions = this.getTransactionsByUser(userId);
    const recentTransactions = transactions.slice(0, 10);
    
    const insights = [
      {
        id: '1',
        type: 'spending_pattern',
        title: 'Spending Pattern Detected',
        description: 'You spend 40% more on weekends compared to weekdays',
        impact: 'high',
        category: 'Food & Dining',
        confidence: 0.85,
        recommendation: 'Consider meal prepping on weekends to reduce impulse spending'
      },
      {
        id: '2',
        type: 'savings_opportunity',
        title: 'Savings Opportunity Found',
        description: 'You could save $150/month by switching to a different streaming service',
        impact: 'medium',
        category: 'Entertainment',
        confidence: 0.92,
        recommendation: 'Compare streaming services and consider bundling options'
      },
      {
        id: '3',
        type: 'budget_alert',
        title: 'Budget Alert',
        description: 'You\'re approaching 80% of your monthly food budget',
        impact: 'high',
        category: 'Food & Dining',
        confidence: 0.95,
        recommendation: 'Consider cooking at home more often this week'
      }
    ];

    const recommendations = [
      {
        id: '1',
        type: 'budget_optimization',
        title: 'Optimize Your Budget',
        description: 'Based on your spending patterns, we recommend allocating 20% more to savings',
        priority: 'high',
        estimatedSavings: 200,
        actionItems: [
          'Set up automatic transfers to savings',
          'Review and cancel unused subscriptions',
          'Negotiate better rates on recurring bills'
        ]
      },
      {
        id: '2',
        type: 'investment_opportunity',
        title: 'Investment Opportunity',
        description: 'With your current savings rate, you could start investing $100/month',
        priority: 'medium',
        estimatedReturns: 1200,
        actionItems: [
          'Open a high-yield savings account',
          'Consider a robo-advisor for automated investing',
          'Set up a 401(k) if not already enrolled'
        ]
      }
    ];

    return {
      insights,
      recommendations,
      isPremium: true,
      lastUpdated: new Date().toISOString()
    };
  }

  async getPredictiveAnalytics(userId: string, hasFeatureAccess: (feature: string) => boolean): Promise<any> {
    if (!hasFeatureAccess('Advanced Analytics')) {
      return {
        predictions: [],
        isPremium: false,
        upgradeMessage: 'Upgrade to Business or higher to unlock predictive analytics and forecasting.'
      };
    }

    // Simulate advanced predictive analytics
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const trends = this.getSpendingTrends(userId, 12);
    const forecast = this.getSpendingForecast(userId);
    
    const predictions = [
      {
        id: '1',
        type: 'spending_forecast',
        title: 'Next Month Spending Forecast',
        predictedAmount: forecast.nextMonth.predicted,
        confidence: forecast.nextMonth.confidence,
        factors: [
          'Historical spending patterns',
          'Seasonal trends',
          'Recent transaction frequency'
        ],
        riskLevel: forecast.nextMonth.predicted > 2000 ? 'high' : 'medium'
      },
      {
        id: '2',
        type: 'category_trend',
        title: 'Food & Dining Trend',
        predictedAmount: 450,
        confidence: 0.78,
        factors: [
          'Increasing weekend spending',
          'Rising restaurant costs',
          'Recent dining frequency'
        ],
        riskLevel: 'low'
      },
      {
        id: '3',
        type: 'savings_forecast',
        title: 'Savings Potential',
        predictedAmount: 800,
        confidence: 0.85,
        factors: [
          'Current income stability',
          'Reduced entertainment spending',
          'Optimized budget allocation'
        ],
        riskLevel: 'low'
      }
    ];

    return {
      predictions,
      isPremium: true,
      lastUpdated: new Date().toISOString(),
      modelVersion: 'v2.1'
    };
  }

  async getCustomReports(userId: string, hasFeatureAccess: (feature: string) => boolean): Promise<any> {
    if (!hasFeatureAccess('Custom Branding')) {
      return {
        reports: [],
        isPremium: false,
        upgradeMessage: 'Upgrade to Business or higher to unlock custom reporting and white-label features.'
      };
    }

    // Simulate custom reporting features
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const customReports = [
      {
        id: '1',
        name: 'Executive Summary',
        description: 'High-level financial overview for stakeholders',
        type: 'executive',
        frequency: 'monthly',
        includes: [
          'Key financial metrics',
          'Spending trends',
          'ROI analysis',
          'Risk assessment'
        ],
        customization: {
          branding: true,
          logo: true,
          colorScheme: 'custom',
          layout: 'professional'
        }
      },
      {
        id: '2',
        name: 'Departmental Breakdown',
        description: 'Detailed spending analysis by department/category',
        type: 'departmental',
        frequency: 'weekly',
        includes: [
          'Category-wise spending',
          'Variance analysis',
          'Budget vs actual',
          'Performance metrics'
        ],
        customization: {
          branding: true,
          logo: true,
          colorScheme: 'corporate',
          layout: 'detailed'
        }
      },
      {
        id: '3',
        name: 'Compliance Report',
        description: 'Regulatory compliance and audit trail',
        type: 'compliance',
        frequency: 'quarterly',
        includes: [
          'Transaction audit trail',
          'Compliance metrics',
          'Risk indicators',
          'Regulatory requirements'
        ],
        customization: {
          branding: false,
          logo: false,
          colorScheme: 'standard',
          layout: 'formal'
        }
      }
    ];

    return {
      reports: customReports,
      isPremium: true,
      lastUpdated: new Date().toISOString()
    };
  }

  async getRealTimeAlerts(userId: string, hasFeatureAccess: (feature: string) => boolean): Promise<any> {
    if (!hasFeatureAccess('Real-time Notifications')) {
      return {
        alerts: [],
        isPremium: false,
        upgradeMessage: 'Upgrade to Pro or higher to unlock real-time alerts and notifications.'
      };
    }

    // Simulate real-time alert system
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const alerts = [
      {
        id: '1',
        type: 'budget_alert',
        severity: 'warning',
        title: 'Budget Threshold Reached',
        message: 'You\'ve spent 75% of your monthly food budget',
        timestamp: new Date().toISOString(),
        category: 'Food & Dining',
        actionRequired: true,
        actions: [
          'Review recent transactions',
          'Adjust budget if needed',
          'Set up spending alerts'
        ]
      },
      {
        id: '2',
        type: 'unusual_activity',
        severity: 'info',
        title: 'Unusual Spending Pattern',
        message: 'Higher than usual spending detected in Entertainment category',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        category: 'Entertainment',
        actionRequired: false,
        actions: [
          'Verify transactions',
          'Review budget allocation'
        ]
      },
      {
        id: '3',
        type: 'savings_milestone',
        severity: 'success',
        title: 'Savings Milestone Achieved',
        message: 'Congratulations! You\'ve reached your emergency fund goal',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        category: 'Savings',
        actionRequired: false,
        actions: [
          'Set new savings goal',
          'Consider investment options'
        ]
      }
    ];

    return {
      alerts,
      isPremium: true,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const analyticsService = new AnalyticsService();