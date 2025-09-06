// AI Spending Insights Service
// This service provides AI-powered analysis of spending patterns and insights

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface SpendingInsight {
  id: string;
  type: 'spending_pattern' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  amount?: number;
  percentage?: number;
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
}

export interface SpendingAnalysis {
  totalSpent: number;
  averageDailySpent: number;
  topCategories: SpendingCategory[];
  insights: SpendingInsight[];
  trends: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  predictions: {
    nextWeek: number;
    nextMonth: number;
    nextYear: number;
  };
  recommendations: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  merchant?: string;
  location?: string;
}

class AIInsightsService {
  private transactions: Transaction[] = [];
  private analysisCache: Map<string, SpendingAnalysis> = new Map();

  // Load transactions (in a real app, this would come from an API)
  async loadTransactions(userId: string): Promise<Transaction[]> {
    // Simulate loading transactions
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        amount: -25.50,
        category: 'Food & Dining',
        description: 'Coffee Shop',
        date: new Date('2024-01-15'),
        type: 'expense',
        merchant: 'Starbucks',
        location: 'New York, NY'
      },
      {
        id: '2',
        amount: -120.00,
        category: 'Transportation',
        description: 'Gas Station',
        date: new Date('2024-01-14'),
        type: 'expense',
        merchant: 'Shell',
        location: 'New York, NY'
      },
      {
        id: '3',
        amount: -89.99,
        category: 'Shopping',
        description: 'Online Purchase',
        date: new Date('2024-01-13'),
        type: 'expense',
        merchant: 'Amazon',
        location: 'Online'
      },
      {
        id: '4',
        amount: -45.00,
        category: 'Entertainment',
        description: 'Movie Theater',
        date: new Date('2024-01-12'),
        type: 'expense',
        merchant: 'AMC',
        location: 'New York, NY'
      },
      {
        id: '5',
        amount: 3000.00,
        category: 'Income',
        description: 'Salary',
        date: new Date('2024-01-01'),
        type: 'income',
        merchant: 'Company Inc',
        location: 'New York, NY'
      }
    ];

    this.transactions = mockTransactions;
    return mockTransactions;
  }

  // Analyze spending patterns
  async analyzeSpending(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<SpendingAnalysis> {
    const cacheKey = `${userId}_${period}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    await this.loadTransactions(userId);
    
    const analysis = this.performAnalysis(period);
    this.analysisCache.set(cacheKey, analysis);
    
    return analysis;
  }

  private performAnalysis(period: 'week' | 'month' | 'year'): SpendingAnalysis {
    const now = new Date();
    const startDate = this.getStartDate(now, period);
    
    const periodTransactions = this.transactions.filter(t => 
      t.date >= startDate && t.date <= now && t.type === 'expense'
    );

    const totalSpent = periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const daysInPeriod = this.getDaysInPeriod(period);
    const averageDailySpent = totalSpent / daysInPeriod;

    // Categorize spending
    const categoryMap = new Map<string, number>();
    periodTransactions.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    const topCategories: SpendingCategory[] = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        amount,
        percentage: (amount / totalSpent) * 100,
        trend: this.calculateTrend(name, period),
        color: this.getCategoryColor(name)
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Generate insights
    const insights = this.generateInsights(periodTransactions, totalSpent, topCategories);

    // Calculate trends
    const trends = this.calculateTrends(period);

    // Generate predictions
    const predictions = this.generatePredictions(totalSpent, trends);

    // Generate recommendations
    const recommendations = this.generateRecommendations(insights, topCategories);

    return {
      totalSpent,
      averageDailySpent,
      topCategories,
      insights,
      trends,
      predictions,
      recommendations
    };
  }

  private getStartDate(now: Date, period: 'week' | 'month' | 'year'): Date {
    const start = new Date(now);
    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    return start;
  }

  private getDaysInPeriod(period: 'week' | 'month' | 'year'): number {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
    }
  }

  private calculateTrend(category: string, period: 'week' | 'month' | 'year'): 'up' | 'down' | 'stable' {
    // Simplified trend calculation
    const random = Math.random();
    if (random < 0.33) return 'up';
    if (random < 0.66) return 'down';
    return 'stable';
  }

  private getCategoryColor(category: string): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];
    const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private generateInsights(transactions: Transaction[], totalSpent: number, categories: SpendingCategory[]): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    // High spending insight
    if (totalSpent > 1000) {
      insights.push({
        id: 'high-spending',
        type: 'spending_pattern',
        title: 'High Spending Alert',
        description: `You've spent $${totalSpent.toFixed(2)} this period, which is above average.`,
        severity: 'medium',
        category: 'Overall',
        amount: totalSpent,
        actionable: true,
        actionText: 'Review Budget',
        actionUrl: '/budget'
      });
    }

    // Top category insight
    if (categories.length > 0) {
      const topCategory = categories[0];
      insights.push({
        id: 'top-category',
        type: 'spending_pattern',
        title: 'Top Spending Category',
        description: `${topCategory.name} accounts for ${topCategory.percentage.toFixed(1)}% of your spending.`,
        severity: 'low',
        category: topCategory.name,
        percentage: topCategory.percentage,
        actionable: false
      });
    }

    // Unusual spending insight
    const unusualTransactions = transactions.filter(t => Math.abs(t.amount) > 200);
    if (unusualTransactions.length > 0) {
      insights.push({
        id: 'unusual-spending',
        type: 'anomaly',
        title: 'Unusual Spending Detected',
        description: `You have ${unusualTransactions.length} transaction(s) over $200.`,
        severity: 'medium',
        category: 'Anomaly',
        actionable: true,
        actionText: 'Review Transactions',
        actionUrl: '/history'
      });
    }

    // Daily average insight
    const dailyAverage = totalSpent / 30;
    if (dailyAverage > 50) {
      insights.push({
        id: 'daily-average',
        type: 'recommendation',
        title: 'Daily Spending Recommendation',
        description: `Your daily average is $${dailyAverage.toFixed(2)}. Consider setting a daily budget.`,
        severity: 'low',
        category: 'Budget',
        amount: dailyAverage,
        actionable: true,
        actionText: 'Set Daily Budget',
        actionUrl: '/budget'
      });
    }

    return insights;
  }

  private calculateTrends(period: 'week' | 'month' | 'year') {
    // Simplified trend calculation
    return {
      weekly: Math.random() * 20 - 10, // -10% to +10%
      monthly: Math.random() * 30 - 15, // -15% to +15%
      yearly: Math.random() * 50 - 25 // -25% to +25%
    };
  }

  private generatePredictions(totalSpent: number, trends: any) {
    return {
      nextWeek: totalSpent * (1 + trends.weekly / 100),
      nextMonth: totalSpent * (1 + trends.monthly / 100),
      nextYear: totalSpent * (1 + trends.yearly / 100)
    };
  }

  private generateRecommendations(insights: SpendingInsight[], categories: SpendingCategory[]): string[] {
    const recommendations: string[] = [];

    // Budget recommendations
    if (categories.length > 0) {
      const topCategory = categories[0];
      recommendations.push(`Consider setting a budget for ${topCategory.name} to control spending.`);
    }

    // General recommendations
    recommendations.push('Track your daily expenses to identify spending patterns.');
    recommendations.push('Set up automatic savings to build your emergency fund.');
    recommendations.push('Review your subscriptions and cancel unused services.');

    return recommendations;
  }

  // Get spending insights for a specific category
  async getCategoryInsights(userId: string, category: string): Promise<SpendingInsight[]> {
    const analysis = await this.analyzeSpending(userId);
    return analysis.insights.filter(insight => insight.category === category);
  }

  // Get spending forecast
  async getSpendingForecast(userId: string, days: number): Promise<number> {
    const analysis = await this.analyzeSpending(userId);
    return analysis.averageDailySpent * days;
  }

  // Clear cache
  clearCache(): void {
    this.analysisCache.clear();
  }
}

// Export singleton instance
export const aiInsightsService = new AIInsightsService();
export default aiInsightsService;
