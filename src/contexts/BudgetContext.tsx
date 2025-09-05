import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Budget as BudgetType, 
  BudgetCategory, 
  BudgetAlert, 
  BudgetGoal, 
  BudgetReport, 
  BudgetSettings, 
  BudgetInsight 
} from '../types/Budget';
import { 
  getBudgetsForUser, 
  getBudgetGoalsForUser, 
  getBudgetAlertsForUser, 
  getBudgetSettingsForUser,
  getBudgetCategories,
  generateBudgetReport,
  createBudget,
  updateBudget,
  deleteBudget
} from '../services/budgetService';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  // Data
  budgets: BudgetType[];
  budgetGoals: BudgetGoal[];
  budgetAlerts: BudgetAlert[];
  budgetSettings: BudgetSettings | null;
  budgetCategories: BudgetCategory[];
  budgetReport: BudgetReport | null;
  budgetInsights: BudgetInsight[];
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshBudgets: () => void;
  refreshBudgetGoals: () => void;
  refreshBudgetAlerts: () => void;
  refreshBudgetReport: () => void;
  
  // Budget management
  addBudget: (budget: Omit<BudgetType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editBudget: (budgetId: string, updates: Partial<BudgetType>) => void;
  removeBudget: (budgetId: string) => void;
  
  // Goal management
  addBudgetGoal: (goal: Omit<BudgetGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudgetGoal: (goalId: string, updates: Partial<BudgetGoal>) => void;
  deleteBudgetGoal: (goalId: string) => void;
  
  // Settings
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;
  
  // Alerts
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  deleteAlert: (alertId: string) => void;
  
  // Insights
  refreshBudgetInsights: () => void;
  markInsightAsRead: (insightId: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [budgetReport, setBudgetReport] = useState<BudgetReport | null>(null);
  const [budgetInsights, setBudgetInsights] = useState<BudgetInsight[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadBudgetData();
    }
  }, [user]);

  const loadBudgetData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        budgetsData,
        goalsData,
        alertsData,
        settingsData,
        categoriesData,
        reportData
      ] = await Promise.all([
        Promise.resolve(getBudgetsForUser(user.id)),
        Promise.resolve(getBudgetGoalsForUser(user.id)),
        Promise.resolve(getBudgetAlertsForUser(user.id)),
        Promise.resolve(getBudgetSettingsForUser(user.id)),
        Promise.resolve(getBudgetCategories()),
        Promise.resolve(generateBudgetReport(user.id, 'monthly'))
      ]);

      setBudgets(budgetsData || []);
      setBudgetGoals(goalsData || []);
      setBudgetAlerts(alertsData || []);
      setBudgetSettings(settingsData || null);
      setBudgetCategories(categoriesData || []);
      setBudgetReport(reportData || null);
    } catch (error) {
      console.error('Error loading budget data:', error);
      // Set empty arrays to prevent undefined errors
      setBudgets([]);
      setBudgetGoals([]);
      setBudgetAlerts([]);
      setBudgetSettings(null);
      setBudgetCategories([]);
      setBudgetReport(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshBudgets = useCallback(() => {
    if (user) {
      setBudgets(getBudgetsForUser(user.id));
    }
  }, [user]);

  const refreshBudgetGoals = useCallback(() => {
    if (user) {
      setBudgetGoals(getBudgetGoalsForUser(user.id));
    }
  }, [user]);

  const refreshBudgetAlerts = useCallback(() => {
    if (user) {
      setBudgetAlerts(getBudgetAlertsForUser(user.id));
    }
  }, [user]);

  const refreshBudgetReport = useCallback(() => {
    if (user) {
      setBudgetReport(generateBudgetReport(user.id, 'monthly'));
    }
  }, [user]);

  const addBudget = useCallback((budgetData: Omit<BudgetType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget = createBudget(budgetData);
    setBudgets(prev => [...prev, newBudget]);
    refreshBudgetReport();
  }, [refreshBudgetReport]);

  const editBudget = useCallback((budgetId: string, updates: Partial<BudgetType>) => {
    const updatedBudget = updateBudget(budgetId, updates);
    if (updatedBudget) {
      setBudgets(prev => prev.map(budget => 
        budget.id === budgetId ? updatedBudget : budget
      ));
      refreshBudgetReport();
    }
  }, [refreshBudgetReport]);

  const removeBudget = useCallback((budgetId: string) => {
    const success = deleteBudget(budgetId);
    if (success) {
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      refreshBudgetReport();
    }
  }, [refreshBudgetReport]);

  const addBudgetGoal = useCallback((goalData: Omit<BudgetGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    // In a real app, this would make an API call
    const newGoal: BudgetGoal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBudgetGoals(prev => [...prev, newGoal]);
  }, []);

  const updateBudgetGoal = useCallback((goalId: string, updates: Partial<BudgetGoal>) => {
    setBudgetGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    ));
  }, []);

  const deleteBudgetGoal = useCallback((goalId: string) => {
    setBudgetGoals(prev => prev.filter(goal => goal.id !== goalId));
  }, []);

  const updateBudgetSettings = useCallback((settings: Partial<BudgetSettings>) => {
    if (budgetSettings) {
      const updatedSettings = { ...budgetSettings, ...settings };
      setBudgetSettings(updatedSettings);
      // In a real app, this would save to the server
      localStorage.setItem('zapcash_budget_settings', JSON.stringify(updatedSettings));
    }
  }, [budgetSettings]);

  const markAlertAsRead = useCallback((alertId: string) => {
    setBudgetAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setBudgetAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  }, []);

  const deleteAlert = useCallback((alertId: string) => {
    setBudgetAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const refreshBudgetInsights = useCallback(() => {
    // In a real app, this would generate insights based on spending patterns
    const mockInsights: BudgetInsight[] = [
      {
        id: 'insight_1',
        userId: user?.id || '',
        type: 'spending_trend',
        title: 'Spending Trend Analysis',
        description: 'Your entertainment spending has increased by 25% this month',
        data: { trend: 'up', percentage: 25, category: 'entertainment' },
        priority: 'medium',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'insight_2',
        userId: user?.id || '',
        type: 'category_analysis',
        title: 'Category Analysis',
        description: 'You\'re spending 40% more on food than your budget allows',
        data: { category: 'food', overspend: 40 },
        priority: 'high',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
    setBudgetInsights(mockInsights);
  }, [user]);

  // Load insights when user changes
  useEffect(() => {
    if (user) {
      refreshBudgetInsights();
    }
  }, [user, refreshBudgetInsights]);

  return (
    <BudgetContext.Provider value={{
      budgets,
      budgetGoals,
      budgetAlerts,
      budgetSettings,
      budgetCategories,
      budgetReport,
      budgetInsights,
      loading,
      refreshBudgets,
      refreshBudgetGoals,
      refreshBudgetAlerts,
      refreshBudgetReport,
      addBudget,
      editBudget,
      removeBudget,
      addBudgetGoal,
      updateBudgetGoal,
      deleteBudgetGoal,
      updateBudgetSettings,
      markAlertAsRead,
      markAllAlertsAsRead,
      deleteAlert,
      refreshBudgetInsights,
      markInsightAsRead: (insightId: string) => {
        setBudgetInsights(prev => prev.map(insight => 
          insight.id === insightId ? { ...insight, isRead: true } : insight
        ));
      }
    }}>
      {children}
    </BudgetContext.Provider>
  );
};
