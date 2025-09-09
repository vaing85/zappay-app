// Subscription Context
// Manages subscription state and provides subscription-related functions

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SubscriptionTier, SubscriptionPlan, UserSubscription, BillingHistory } from '../types/Subscription';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  // State
  currentSubscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  billingHistory: BillingHistory[];
  loading: boolean;
  error: string | null;

  // Actions
  upgradeSubscription: (planId: SubscriptionTier, paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  hasFeatureAccess: (featureId: string) => Promise<boolean>;
  checkLimit: (limitType: keyof UserSubscription['usage']) => Promise<{ allowed: boolean; remaining: number; limit: number }>;
  refreshSubscription: () => Promise<void>;
  loadBillingHistory: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [subscription, plansData, billingData] = await Promise.all([
        subscriptionService.getUserSubscription(user.id),
        Promise.resolve(subscriptionService.getPlans()),
        subscriptionService.getBillingHistory(user.id)
      ]);

      setCurrentSubscription(subscription);
      setPlans(plansData);
      setBillingHistory(billingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load subscription data on mount and when user changes
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (
    planId: SubscriptionTier, 
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await subscriptionService.upgradeSubscription(user.id, planId, paymentMethodId);
      
      if (result.success) {
        // Refresh subscription data
        await loadSubscriptionData();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upgrade failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, loadSubscriptionData]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await subscriptionService.cancelSubscription(user.id);
      
      if (result.success) {
        // Refresh subscription data
        await loadSubscriptionData();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cancellation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, loadSubscriptionData]);

  // Check feature access
  const hasFeatureAccess = useCallback(async (featureId: string): Promise<boolean> => {
    if (!user) return false;
    return await subscriptionService.hasFeatureAccess(user.id, featureId);
  }, [user]);

  // Check limits
  const checkLimit = useCallback(async (
    limitType: keyof UserSubscription['usage']
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> => {
    if (!user) {
      return { allowed: false, remaining: 0, limit: 0 };
    }
    return await subscriptionService.checkLimit(user.id, limitType);
  }, [user]);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    await loadSubscriptionData();
  }, [loadSubscriptionData]);

  // Load billing history
  const loadBillingHistory = useCallback(async () => {
    if (!user) return;

    try {
      const billingData = await subscriptionService.getBillingHistory(user.id);
      setBillingHistory(billingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing history');
    }
  }, [user]);

  const value: SubscriptionContextType = {
    currentSubscription,
    plans,
    billingHistory,
    loading,
    error,
    upgradeSubscription,
    cancelSubscription,
    hasFeatureAccess,
    checkLimit,
    refreshSubscription,
    loadBillingHistory
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
