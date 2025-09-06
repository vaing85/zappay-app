// Smart Budget Recommendations Service
// This service provides AI-powered budget recommendations based on spending patterns

export interface BudgetRecommendation {
  id: string;
  category: string;
  currentSpending: number;
  recommendedAmount: number;
  savings: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  actionable: boolean;
  actionSteps: string[];
}

export interface BudgetGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
  progress: number;
  recommendedMonthlyContribution: number;
}

export interface SmartBudgetAnalysis {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  recommendations: BudgetRecommendation[];
  goals: BudgetGoal[];
  insights: {
    overspendingCategories: string[];
    underspendingCategories: string[];
    potentialSavings: number;
    riskFactors: string[];
  };
}

export interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: 'high' | 'medium' | 'low';
  seasonality: boolean;
}

class SmartBudgetService {
  private analysisCache: Map<string, SmartBudgetAnalysis> = new Map();

  // Analyze spending patterns and generate budget recommendations
  async analyzeBudget(userId: string): Promise<SmartBudgetAnalysis> {
    const cacheKey = `budget_${userId}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    // Simulate analysis (in a real app, this would analyze actual transaction data)
    const analysis = this.performBudgetAnalysis();
    this.analysisCache.set(cacheKey, analysis);
    
    return analysis;
  }

  private performBudgetAnalysis(): SmartBudgetAnalysis {
    // Simulate user data
    const totalIncome = 5000; // Monthly income
    const totalExpenses = 4200; // Monthly expenses
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = (netIncome / totalIncome) * 100;

    // Generate spending patterns
    const spendingPatterns: SpendingPattern[] = [
      { category: 'Food & Dining', averageMonthly: 800, trend: 'increasing', volatility: 'medium', seasonality: false },
      { category: 'Transportation', averageMonthly: 600, trend: 'stable', volatility: 'low', seasonality: false },
      { category: 'Housing', averageMonthly: 1500, trend: 'stable', volatility: 'low', seasonality: false },
      { category: 'Entertainment', averageMonthly: 400, trend: 'increasing', volatility: 'high', seasonality: true },
      { category: 'Shopping', averageMonthly: 500, trend: 'decreasing', volatility: 'high', seasonality: true },
      { category: 'Utilities', averageMonthly: 200, trend: 'stable', volatility: 'low', seasonality: false },
      { category: 'Healthcare', averageMonthly: 200, trend: 'stable', volatility: 'low', seasonality: false }
    ];

    // Generate recommendations
    const recommendations = this.generateBudgetRecommendations(spendingPatterns, totalIncome);

    // Generate goals
    const goals = this.generateBudgetGoals(totalIncome, netIncome);

    // Generate insights
    const insights = this.generateInsights(spendingPatterns, totalIncome, totalExpenses);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      recommendations,
      goals,
      insights
    };
  }

  private generateBudgetRecommendations(patterns: SpendingPattern[], totalIncome: number): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    // 50/30/20 rule: 50% needs, 30% wants, 20% savings
    const needsBudget = totalIncome * 0.5;
    const wantsBudget = totalIncome * 0.3;
    const savingsBudget = totalIncome * 0.2;
    
    // Calculate total expenses
    const totalExpenses = patterns.reduce((sum, pattern) => sum + pattern.averageMonthly, 0);
    const netIncome = totalIncome - totalExpenses;

    // Categorize spending
    const needsCategories = ['Housing', 'Utilities', 'Healthcare', 'Transportation'];
    const wantsCategories = ['Food & Dining', 'Entertainment', 'Shopping'];

    let needsSpending = 0;
    let wantsSpending = 0;

    patterns.forEach(pattern => {
      if (needsCategories.includes(pattern.category)) {
        needsSpending += pattern.averageMonthly;
      } else if (wantsCategories.includes(pattern.category)) {
        wantsSpending += pattern.averageMonthly;
      }
    });

    // Needs category recommendations
    if (needsSpending > needsBudget) {
      recommendations.push({
        id: 'needs-over-budget',
        category: 'Essential Needs',
        currentSpending: needsSpending,
        recommendedAmount: needsBudget,
        savings: needsSpending - needsBudget,
        priority: 'high',
        reasoning: 'Your essential needs spending exceeds the recommended 50% of income. Consider reducing non-essential expenses within these categories.',
        actionable: true,
        actionSteps: [
          'Review housing costs and consider downsizing or finding roommates',
          'Optimize transportation costs by using public transit or carpooling',
          'Shop around for better utility rates and insurance',
          'Look for ways to reduce healthcare costs'
        ]
      });
    }

    // Wants category recommendations
    if (wantsSpending > wantsBudget) {
      recommendations.push({
        id: 'wants-over-budget',
        category: 'Discretionary Spending',
        currentSpending: wantsSpending,
        recommendedAmount: wantsBudget,
        savings: wantsSpending - wantsBudget,
        priority: 'medium',
        reasoning: 'Your discretionary spending exceeds the recommended 30% of income. This is the easiest area to cut back.',
        actionable: true,
        actionSteps: [
          'Set a monthly dining out budget and stick to it',
          'Cancel unused subscriptions and memberships',
          'Shop with a list and avoid impulse purchases',
          'Find free or low-cost entertainment alternatives'
        ]
      });
    }

    // Individual category recommendations
    patterns.forEach(pattern => {
      if (pattern.trend === 'increasing' && pattern.volatility === 'high') {
        const recommendedAmount = pattern.averageMonthly * 0.8; // 20% reduction
        recommendations.push({
          id: `reduce-${pattern.category.toLowerCase().replace(/\s+/g, '-')}`,
          category: pattern.category,
          currentSpending: pattern.averageMonthly,
          recommendedAmount,
          savings: pattern.averageMonthly - recommendedAmount,
          priority: 'medium',
          reasoning: `${pattern.category} spending is increasing and highly variable. A 20% reduction would help stabilize your budget.`,
          actionable: true,
          actionSteps: [
            `Set a monthly budget of $${recommendedAmount.toFixed(0)} for ${pattern.category}`,
            'Track spending weekly to stay within budget',
            'Look for ways to reduce costs in this category',
            'Consider if all expenses in this category are necessary'
          ]
        });
      }
    });

    // Savings recommendation
    if (netIncome < savingsBudget) {
      recommendations.push({
        id: 'increase-savings',
        category: 'Savings',
        currentSpending: netIncome,
        recommendedAmount: savingsBudget,
        savings: savingsBudget - netIncome,
        priority: 'high',
        reasoning: 'You should aim to save at least 20% of your income for emergencies and future goals.',
        actionable: true,
        actionSteps: [
          'Set up automatic transfers to savings account',
          'Reduce discretionary spending to free up money for savings',
          'Look for ways to increase income',
          'Start with small amounts and gradually increase'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateBudgetGoals(totalIncome: number, netIncome: number): BudgetGoal[] {
    const goals: BudgetGoal[] = [];

    // Emergency fund goal
    const emergencyFundTarget = totalIncome * 3; // 3 months of income
    goals.push({
      id: 'emergency-fund',
      name: 'Emergency Fund',
      targetAmount: emergencyFundTarget,
      currentAmount: Math.random() * emergencyFundTarget * 0.5, // Simulate current amount
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      priority: 'high',
      category: 'Emergency',
      progress: 0,
      recommendedMonthlyContribution: emergencyFundTarget / 12
    });

    // Retirement savings goal
    const retirementTarget = totalIncome * 12 * 0.1; // 10% of annual income
    goals.push({
      id: 'retirement-savings',
      name: 'Retirement Savings',
      targetAmount: retirementTarget,
      currentAmount: Math.random() * retirementTarget * 0.3,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'Retirement',
      progress: 0,
      recommendedMonthlyContribution: retirementTarget / 12
    });

    // Vacation goal
    const vacationTarget = 3000;
    goals.push({
      id: 'vacation-fund',
      name: 'Vacation Fund',
      targetAmount: vacationTarget,
      currentAmount: Math.random() * vacationTarget * 0.2,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      priority: 'medium',
      category: 'Travel',
      progress: 0,
      recommendedMonthlyContribution: vacationTarget / 6
    });

    // Calculate progress for each goal
    goals.forEach(goal => {
      goal.progress = (goal.currentAmount / goal.targetAmount) * 100;
    });

    return goals;
  }

  private generateInsights(patterns: SpendingPattern[], totalIncome: number, totalExpenses: number): any {
    const overspendingCategories: string[] = [];
    const underspendingCategories: string[] = [];
    let potentialSavings = 0;

    patterns.forEach(pattern => {
      if (pattern.trend === 'increasing' && pattern.volatility === 'high') {
        overspendingCategories.push(pattern.category);
        potentialSavings += pattern.averageMonthly * 0.2; // 20% reduction potential
      } else if (pattern.trend === 'decreasing' && pattern.averageMonthly < totalIncome * 0.05) {
        underspendingCategories.push(pattern.category);
      }
    });

    const riskFactors: string[] = [];
    if (totalExpenses > totalIncome * 0.9) {
      riskFactors.push('High expense-to-income ratio');
    }
    if (patterns.some(p => p.volatility === 'high' && p.averageMonthly > totalIncome * 0.1)) {
      riskFactors.push('High volatility in major spending categories');
    }
    if (patterns.some(p => p.trend === 'increasing' && p.averageMonthly > totalIncome * 0.15)) {
      riskFactors.push('Rapidly increasing spending in major categories');
    }

    return {
      overspendingCategories,
      underspendingCategories,
      potentialSavings,
      riskFactors
    };
  }

  // Get specific category recommendations
  async getCategoryRecommendations(userId: string, category: string): Promise<BudgetRecommendation[]> {
    const analysis = await this.analyzeBudget(userId);
    return analysis.recommendations.filter(rec => rec.category === category);
  }

  // Get budget goals
  async getBudgetGoals(userId: string): Promise<BudgetGoal[]> {
    const analysis = await this.analyzeBudget(userId);
    return analysis.goals;
  }

  // Clear cache
  clearCache(): void {
    this.analysisCache.clear();
  }
}

// Export singleton instance
export const smartBudgetService = new SmartBudgetService();
export default smartBudgetService;
