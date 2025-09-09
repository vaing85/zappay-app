// Subscription Types and Interfaces

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: SubscriptionFeature[];
  limits: {
    monthlyTransactions: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
    dailyDeposit: number;
    monthlyDeposit: number;
    teamMembers?: number;
    apiCalls?: number;
  };
  benefits: string[];
  popular?: boolean;
  color: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  trialEndsAt?: string;
  usage: {
    monthlyTransactions: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
    dailyDeposit: number;
    monthlyDeposit: number;
    teamMembers?: number;
    apiCalls?: number;
  };
}

export interface SubscriptionUpgrade {
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  priceDifference: number;
  effectiveDate: string;
  proratedAmount?: number;
}

export interface BillingHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  date: string;
  invoiceUrl?: string;
  paymentMethod: string;
}
