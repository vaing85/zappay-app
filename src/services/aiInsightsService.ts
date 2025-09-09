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
  financialHealth: FinancialHealthScore;
  spendingPatterns: SpendingPattern[];
  anomalyDetection: AnomalyDetection[];
  budgetOptimization: BudgetOptimization[];
}

export interface FinancialHealthScore {
  overall: number; // 0-100
  spending: number; // 0-100
  savings: number; // 0-100
  debt: number; // 0-100
  income: number; // 0-100
  recommendations: string[];
}

export interface SpendingPattern {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  amount: number;
  confidence: number; // 0-1
  category: string;
  merchant?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
}

export interface AnomalyDetection {
  id: string;
  type: 'unusual_amount' | 'unusual_frequency' | 'unusual_merchant' | 'unusual_time' | 'unusual_location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  transactionId?: string;
  expectedValue?: number;
  actualValue?: number;
  confidence: number;
  recommendation: string;
}

export interface BudgetOptimization {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  actionItems: string[];
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

    // Advanced analytics
    const financialHealth = this.calculateFinancialHealth(periodTransactions, totalSpent);
    const spendingPatterns = this.detectSpendingPatterns(periodTransactions);
    const anomalyDetection = this.detectAnomalies(periodTransactions);
    const budgetOptimization = this.optimizeBudget(topCategories, totalSpent);

    return {
      totalSpent,
      averageDailySpent,
      topCategories,
      insights,
      trends,
      predictions,
      recommendations,
      financialHealth,
      spendingPatterns,
      anomalyDetection,
      budgetOptimization
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

  // Advanced Analytics Methods

  private calculateFinancialHealth(transactions: Transaction[], totalSpent: number): FinancialHealthScore {
    const incomeTransactions = this.transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate spending score (lower spending = higher score)
    const spendingRatio = totalSpent / totalIncome;
    const spendingScore = Math.max(0, 100 - (spendingRatio * 100));
    
    // Calculate savings score (mock calculation)
    const savingsScore = Math.max(0, 100 - (spendingRatio * 50));
    
    // Calculate debt score (mock calculation)
    const debtScore = 85; // Assume good debt management
    
    // Calculate income score
    const incomeScore = totalIncome > 3000 ? 90 : totalIncome > 2000 ? 70 : 50;
    
    // Calculate overall score
    const overall = Math.round((spendingScore + savingsScore + debtScore + incomeScore) / 4);
    
    const recommendations: string[] = [];
    if (spendingRatio > 0.8) {
      recommendations.push('Consider reducing discretionary spending to improve financial health');
    }
    if (savingsScore < 60) {
      recommendations.push('Set up automatic savings to build your emergency fund');
    }
    if (incomeScore < 70) {
      recommendations.push('Consider ways to increase your income or find additional revenue streams');
    }
    
    return {
      overall,
      spending: Math.round(spendingScore),
      savings: Math.round(savingsScore),
      debt: Math.round(debtScore),
      income: Math.round(incomeScore),
      recommendations
    };
  }

  private detectSpendingPatterns(transactions: Transaction[]): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];
    
    // Group transactions by merchant and category
    const merchantMap = new Map<string, Transaction[]>();
    const categoryMap = new Map<string, Transaction[]>();
    
    transactions.forEach(t => {
      if (t.merchant) {
        if (!merchantMap.has(t.merchant)) {
          merchantMap.set(t.merchant, []);
        }
        merchantMap.get(t.merchant)!.push(t);
      }
      
      if (!categoryMap.has(t.category)) {
        categoryMap.set(t.category, []);
      }
      categoryMap.get(t.category)!.push(t);
    });
    
    // Detect recurring merchant patterns
    merchantMap.forEach((merchantTransactions, merchant) => {
      if (merchantTransactions.length >= 3) {
        const avgAmount = merchantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / merchantTransactions.length;
        const frequency = this.calculateFrequency(merchantTransactions);
        
        patterns.push({
          id: `merchant-${merchant.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Regular ${merchant} visits`,
          description: `You visit ${merchant} ${frequency} with an average spend of $${avgAmount.toFixed(2)}`,
          frequency: this.getFrequencyType(merchantTransactions.length),
          amount: avgAmount,
          confidence: Math.min(0.9, merchantTransactions.length / 10),
          category: merchantTransactions[0].category,
          merchant,
          timeOfDay: this.getMostCommonTime(merchantTransactions),
          dayOfWeek: this.getMostCommonDay(merchantTransactions)
        });
      }
    });
    
    // Detect category patterns
    categoryMap.forEach((categoryTransactions, category) => {
      if (categoryTransactions.length >= 5) {
        const avgAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / categoryTransactions.length;
        
        patterns.push({
          id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Regular ${category} spending`,
          description: `You spend on ${category} ${this.getFrequencyType(categoryTransactions.length)} with an average of $${avgAmount.toFixed(2)}`,
          frequency: this.getFrequencyType(categoryTransactions.length),
          amount: avgAmount,
          confidence: Math.min(0.8, categoryTransactions.length / 15),
          category
        });
      }
    });
    
    return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  private detectAnomalies(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Detect unusual amounts
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    transactions.forEach(t => {
      const amount = Math.abs(t.amount);
      const zScore = (amount - mean) / stdDev;
      
      if (zScore > 2) { // More than 2 standard deviations
        anomalies.push({
          id: `unusual-amount-${t.id}`,
          type: 'unusual_amount',
          severity: zScore > 3 ? 'high' : 'medium',
          description: `Unusual spending of $${amount.toFixed(2)} at ${t.merchant || 'unknown merchant'}`,
          transactionId: t.id,
          expectedValue: mean,
          actualValue: amount,
          confidence: Math.min(0.95, zScore / 4),
          recommendation: 'Review this transaction to ensure it\'s legitimate'
        });
      }
    });
    
    // Detect unusual frequency
    const merchantFrequency = new Map<string, number>();
    transactions.forEach(t => {
      if (t.merchant) {
        merchantFrequency.set(t.merchant, (merchantFrequency.get(t.merchant) || 0) + 1);
      }
    });
    
    merchantFrequency.forEach((count, merchant) => {
      if (count > 10) { // More than 10 transactions
        anomalies.push({
          id: `unusual-frequency-${merchant}`,
          type: 'unusual_frequency',
          severity: count > 20 ? 'high' : 'medium',
          description: `Unusual frequency: ${count} transactions at ${merchant}`,
          confidence: Math.min(0.9, count / 30),
          recommendation: 'Consider if this spending pattern is intentional'
        });
      }
    });
    
    return anomalies.sort((a, b) => b.confidence - a.confidence);
  }

  private optimizeBudget(categories: SpendingCategory[], totalSpent: number): BudgetOptimization[] {
    const optimizations: BudgetOptimization[] = [];
    
    // Recommended budget percentages based on financial best practices
    const recommendedPercentages: { [key: string]: number } = {
      'Food & Dining': 15,
      'Transportation': 10,
      'Shopping': 5,
      'Entertainment': 5,
      'Healthcare': 10,
      'Utilities': 10,
      'Housing': 30,
      'Savings': 20
    };
    
    categories.forEach(category => {
      const recommendedPercentage = recommendedPercentages[category.name] || 10;
      const recommendedAmount = (totalSpent * recommendedPercentage) / 100;
      const currentAmount = category.amount;
      const potentialSavings = Math.max(0, currentAmount - recommendedAmount);
      
      if (potentialSavings > 50) { // Only suggest if savings > $50
        optimizations.push({
          category: category.name,
          currentSpending: currentAmount,
          recommendedBudget: recommendedAmount,
          potentialSavings,
          priority: potentialSavings > 200 ? 'high' : potentialSavings > 100 ? 'medium' : 'low',
          reasoning: `Current spending (${category.percentage.toFixed(1)}%) exceeds recommended (${recommendedPercentage}%)`,
          actionItems: [
            `Set a budget of $${recommendedAmount.toFixed(2)} for ${category.name}`,
            `Track daily spending in this category`,
            `Look for ways to reduce costs by ${((potentialSavings / currentAmount) * 100).toFixed(1)}%`
          ]
        });
      }
    });
    
    return optimizations.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  private calculateFrequency(transactions: Transaction[]): string {
    const days = new Set(transactions.map(t => t.date.toDateString())).size;
    if (days <= 7) return 'daily';
    if (days <= 14) return 'every other day';
    if (days <= 30) return 'weekly';
    return 'monthly';
  }

  private getFrequencyType(transactionCount: number): 'daily' | 'weekly' | 'monthly' | 'irregular' {
    if (transactionCount >= 20) return 'daily';
    if (transactionCount >= 10) return 'weekly';
    if (transactionCount >= 5) return 'monthly';
    return 'irregular';
  }

  private getMostCommonTime(transactions: Transaction[]): string {
    const timeMap = new Map<string, number>();
    transactions.forEach(t => {
      const hour = t.date.getHours();
      const timeSlot = hour < 6 ? 'Early Morning' : 
                      hour < 12 ? 'Morning' : 
                      hour < 18 ? 'Afternoon' : 'Evening';
      timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon = 'Morning';
    timeMap.forEach((count, time) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = time;
      }
    });
    
    return mostCommon;
  }

  private getMostCommonDay(transactions: Transaction[]): string {
    const dayMap = new Map<string, number>();
    transactions.forEach(t => {
      const day = t.date.toLocaleDateString('en-US', { weekday: 'long' });
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon = 'Monday';
    dayMap.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = day;
      }
    });
    
    return mostCommon;
  }

  // Clear cache
  clearCache(): void {
    this.analysisCache.clear();
  }
}

// Export singleton instance
export const aiInsightsService = new AIInsightsService();
export default aiInsightsService;
