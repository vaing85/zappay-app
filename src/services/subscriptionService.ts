// Subscription Service
// Handles subscription management, billing, and feature access

import { SubscriptionTier, SubscriptionPlan, UserSubscription, SubscriptionFeature, BillingHistory } from '../types/Subscription';

class SubscriptionService {
  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingCycle: 'monthly',
      description: 'Perfect for personal use and small transactions',
      color: 'gray',
      features: [
        {
          id: 'basic_payments',
          name: 'Basic Payments',
          description: 'Send and receive money',
          icon: '💳',
          included: true,
          limit: 10
        },
        {
          id: 'qr_payments',
          name: 'QR Code Payments',
          description: 'Generate and scan QR codes',
          icon: '📱',
          included: true,
          limit: 5
        },
        {
          id: 'basic_analytics',
          name: 'Basic Analytics',
          description: 'Transaction history and basic insights',
          icon: '📊',
          included: true
        },
        {
          id: 'email_support',
          name: 'Email Support',
          description: 'Email support within 48 hours',
          icon: '📧',
          included: true
        },
        {
          id: 'withdrawal_fees',
          name: 'Withdrawal Fees',
          description: 'Standard withdrawal fees apply',
          icon: '💰',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 50,
        dailyWithdrawal: 500,
        monthlyWithdrawal: 2000,
        dailyDeposit: 1000,
        monthlyDeposit: 5000
      },
      benefits: [
        'Up to 50 transactions per month',
        'Basic payment features',
        'Email support',
        'Standard security features'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      billingCycle: 'monthly',
      description: 'Enhanced features for power users',
      color: 'blue',
      popular: true,
      features: [
        {
          id: 'unlimited_payments',
          name: 'Unlimited Payments',
          description: 'Send and receive unlimited money',
          icon: '💳',
          included: true,
          unlimited: true
        },
        {
          id: 'advanced_analytics',
          name: 'Advanced Analytics',
          description: 'Detailed spending insights and reports',
          icon: '📊',
          included: true
        },
        {
          id: 'priority_support',
          name: 'Priority Support',
          description: '24/7 chat support',
          icon: '💬',
          included: true
        },
        {
          id: 'free_withdrawals',
          name: 'Free Withdrawals',
          description: 'No fees on ACH and debit card withdrawals',
          icon: '💰',
          included: true
        },
        {
          id: 'budget_tools',
          name: 'Budget Tools',
          description: 'Advanced budgeting and goal tracking',
          icon: '🎯',
          included: true
        },
        {
          id: 'export_data',
          name: 'Data Export',
          description: 'Export transaction data to CSV/PDF',
          icon: '📤',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 1000,
        dailyWithdrawal: 5000,
        monthlyWithdrawal: 25000,
        dailyDeposit: 10000,
        monthlyDeposit: 50000
      },
      benefits: [
        'Unlimited transactions',
        'Free withdrawals',
        'Advanced analytics',
        'Priority support',
        'Budget tools',
        'Data export'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 29.99,
      billingCycle: 'monthly',
      description: 'Perfect for small businesses and teams',
      color: 'green',
      features: [
        {
          id: 'team_management',
          name: 'Team Management',
          description: 'Manage up to 10 team members',
          icon: '👥',
          included: true,
          limit: 10
        },
        {
          id: 'api_access',
          name: 'API Access',
          description: 'Integrate with your business tools',
          icon: '🔌',
          included: true,
          limit: 10000
        },
        {
          id: 'custom_branding',
          name: 'Custom Branding',
          description: 'White-label payment pages',
          icon: '🎨',
          included: true
        },
        {
          id: 'advanced_reporting',
          name: 'Advanced Reporting',
          description: 'Detailed business reports and insights',
          icon: '📈',
          included: true
        },
        {
          id: 'dedicated_support',
          name: 'Dedicated Support',
          description: 'Dedicated account manager',
          icon: '👨‍💼',
          included: true
        },
        {
          id: 'merchant_tools',
          name: 'Merchant Tools',
          description: 'Accept payments from customers',
          icon: '🏪',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 5000,
        dailyWithdrawal: 25000,
        monthlyWithdrawal: 100000,
        dailyDeposit: 50000,
        monthlyDeposit: 250000,
        teamMembers: 10,
        apiCalls: 10000
      },
      benefits: [
        'Team management (up to 10 members)',
        'API access (10,000 calls/month)',
        'Custom branding',
        'Advanced reporting',
        'Dedicated support',
        'Merchant tools'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      billingCycle: 'monthly',
      description: 'Full-featured solution for large organizations',
      color: 'purple',
      features: [
        {
          id: 'unlimited_team',
          name: 'Unlimited Team',
          description: 'Unlimited team members',
          icon: '👥',
          included: true,
          unlimited: true
        },
        {
          id: 'unlimited_api',
          name: 'Unlimited API',
          description: 'Unlimited API calls',
          icon: '🔌',
          included: true,
          unlimited: true
        },
        {
          id: 'white_label',
          name: 'White Label',
          description: 'Complete white-label solution',
          icon: '🏷️',
          included: true
        },
        {
          id: 'custom_integrations',
          name: 'Custom Integrations',
          description: 'Custom integrations and workflows',
          icon: '⚙️',
          included: true
        },
        {
          id: 'sla_guarantee',
          name: 'SLA Guarantee',
          description: '99.9% uptime guarantee',
          icon: '🛡️',
          included: true
        },
        {
          id: 'phone_support',
          name: 'Phone Support',
          description: '24/7 phone support',
          icon: '📞',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 50000,
        dailyWithdrawal: 100000,
        monthlyWithdrawal: 500000,
        dailyDeposit: 200000,
        monthlyDeposit: 1000000,
        teamMembers: 999999,
        apiCalls: 999999
      },
      benefits: [
        'Unlimited everything',
        'White-label solution',
        'Custom integrations',
        'SLA guarantee',
        '24/7 phone support',
        'Dedicated success manager'
      ]
    }
  ];

  // Get all available plans
  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  // Get a specific plan by ID
  getPlan(planId: SubscriptionTier): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // In a real app, this would fetch from the database
    // For now, return a mock subscription
    return {
      id: 'sub_123',
      userId,
      planId: 'free',
      status: 'active',
      startDate: new Date().toISOString(),
      autoRenew: true,
      usage: {
        monthlyTransactions: 15,
        dailyWithdrawal: 0,
        monthlyWithdrawal: 500,
        dailyDeposit: 0,
        monthlyDeposit: 2000
      }
    };
  }

  // Check if user has access to a specific feature
  async hasFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    const plan = this.getPlan(subscription.planId);
    if (!plan) return false;

    const feature = plan.features.find(f => f.id === featureId);
    return feature?.included || false;
  }

  // Check if user is within limits for a specific action
  async checkLimit(userId: string, limitType: keyof UserSubscription['usage']): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    const currentUsage = subscription.usage[limitType] || 0;
    const limit = plan.limits[limitType] || 0;
    const remaining = Math.max(0, limit - currentUsage);

    return {
      allowed: currentUsage < limit,
      remaining,
      limit
    };
  }

  // Upgrade user subscription
  async upgradeSubscription(userId: string, newPlanId: SubscriptionTier, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, this would:
      // 1. Validate the upgrade
      // 2. Process payment
      // 3. Update subscription in database
      // 4. Send confirmation email

      console.log(`Upgrading user ${userId} to plan ${newPlanId}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upgrade failed' 
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, this would:
      // 1. Update subscription status
      // 2. Process any refunds
      // 3. Send confirmation email

      console.log(`Cancelling subscription for user ${userId}`);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cancellation failed' 
      };
    }
  }

  // Get billing history
  async getBillingHistory(userId: string): Promise<BillingHistory[]> {
    // Mock billing history
    return [
      {
        id: 'bill_1',
        userId,
        amount: 9.99,
        currency: 'USD',
        status: 'paid',
        description: 'Pro Plan - Monthly',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: '**** 4242'
      },
      {
        id: 'bill_2',
        userId,
        amount: 9.99,
        currency: 'USD',
        status: 'paid',
        description: 'Pro Plan - Monthly',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: '**** 4242'
      }
    ];
  }

  // Calculate upgrade cost
  calculateUpgradeCost(currentPlanId: SubscriptionTier, newPlanId: SubscriptionTier): number {
    const currentPlan = this.getPlan(currentPlanId);
    const newPlan = this.getPlan(newPlanId);
    
    if (!currentPlan || !newPlan) return 0;
    
    return newPlan.price - currentPlan.price;
  }

  // Get feature comparison between plans
  getFeatureComparison(): { feature: string; free: boolean; pro: boolean; business: boolean; enterprise: boolean }[] {
    const allFeatures = [
      'Basic Payments',
      'QR Code Payments', 
      'Basic Analytics',
      'Email Support',
      'Withdrawal Fees',
      'Advanced Analytics',
      'Priority Support',
      'Free Withdrawals',
      'Budget Tools',
      'Data Export',
      'Team Management',
      'API Access',
      'Custom Branding',
      'Advanced Reporting',
      'Dedicated Support',
      'Merchant Tools',
      'White Label',
      'Custom Integrations',
      'SLA Guarantee'
    ];

    return allFeatures.map(feature => ({
      feature,
      free: this.plans[0].features.some(f => f.name === feature && f.included) || false,
      pro: this.plans[1].features.some(f => f.name === feature && f.included) || 
           this.plans[0].features.some(f => f.name === feature && f.included) || false,
      business: this.plans[2].features.some(f => f.name === feature && f.included) || 
                this.plans[1].features.some(f => f.name === feature && f.included) ||
                this.plans[0].features.some(f => f.name === feature && f.included) || false,
      enterprise: this.plans[3].features.some(f => f.name === feature && f.included) || 
                  this.plans[2].features.some(f => f.name === feature && f.included) ||
                  this.plans[1].features.some(f => f.name === feature && f.included) ||
                  this.plans[0].features.some(f => f.name === feature && f.included) || false
    }));
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
