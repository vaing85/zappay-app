import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { aiInsightsService, SpendingAnalysis, SpendingInsight } from '../services/aiInsightsService';

interface AIInsightsContextType {
  analysis: SpendingAnalysis | null;
  insights: SpendingInsight[];
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => Promise<void>;
  getCategoryInsights: (category: string) => Promise<SpendingInsight[]>;
  getSpendingForecast: (days: number) => Promise<number>;
  clearCache: () => void;
}

const AIInsightsContext = createContext<AIInsightsContextType | undefined>(undefined);

interface AIInsightsProviderProps {
  children: React.ReactNode;
}

export const AIInsightsProvider: React.FC<AIInsightsProviderProps> = ({ children }) => {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshAnalysis = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const newAnalysis = await aiInsightsService.analyzeSpending(user.id);
      setAnalysis(newAnalysis);
      setInsights(newAnalysis.insights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load AI insights';
      setError(errorMessage);
      console.error('Failed to load AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getCategoryInsights = useCallback(async (category: string): Promise<SpendingInsight[]> => {
    if (!user) return [];

    try {
      return await aiInsightsService.getCategoryInsights(user.id, category);
    } catch (err) {
      console.error('Failed to get category insights:', err);
      return [];
    }
  }, [user]);

  const getSpendingForecast = useCallback(async (days: number): Promise<number> => {
    if (!user) return 0;

    try {
      return await aiInsightsService.getSpendingForecast(user.id, days);
    } catch (err) {
      console.error('Failed to get spending forecast:', err);
      return 0;
    }
  }, [user]);

  const clearCache = useCallback(() => {
    aiInsightsService.clearCache();
    setAnalysis(null);
    setInsights([]);
  }, []);

  // Load analysis when user changes
  useEffect(() => {
    if (user) {
      refreshAnalysis();
    } else {
      setAnalysis(null);
      setInsights([]);
    }
  }, [user, refreshAnalysis]);

  const value: AIInsightsContextType = {
    analysis,
    insights,
    isLoading,
    error,
    refreshAnalysis,
    getCategoryInsights,
    getSpendingForecast,
    clearCache,
  };

  return (
    <AIInsightsContext.Provider value={value}>
      {children}
    </AIInsightsContext.Provider>
  );
};

export const useAIInsights = (): AIInsightsContextType => {
  const context = useContext(AIInsightsContext);
  if (context === undefined) {
    throw new Error('useAIInsights must be used within an AIInsightsProvider');
  }
  return context;
};
