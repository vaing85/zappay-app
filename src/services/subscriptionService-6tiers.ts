// Subscription Service - 6 Tier System
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
          limit: 25
        },
        {
          id: 'mobile_app',
          name: 'Mobile App',
          description: 'Access via mobile app',
          icon: '📱',
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
          id: 'standard_security',
          name: 'Standard Security',
          description: 'Basic security features',
          icon: '🔒',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 25,
        dailyWithdrawal: 1000,
        monthlyWithdrawal: 1000,
        dailyDeposit: 1000,
        monthlyDeposit: 1000
      },
      benefits: [
        'Up to 25 transactions per month',
        'Basic payment features',
        'Email support',
        'Standard security features'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 4.99,
      billingCycle: 'monthly',
      description: 'Essential features for individuals',
      color: 'blue',
      features: [
        {
          id: 'basic_payments',
          name: 'Basic Payments',
          description: 'Send and receive money',
          icon: '💳',
          included: true,
          limit: 250
        },
        {
          id: 'mobile_app',
          name: 'Mobile App',
          description: 'Access via mobile app',
          icon: '📱',
          included: true
        },
        {
          id: 'transaction_history',
          name: 'Transaction History',
          description: 'View past transactions',
          icon: '📋',
          included: true
        },
        {
          id: 'email_support',
          name: 'Email Support',
          description: 'Email support within 48 hours',
          icon: '📧',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 250,
        dailyWithdrawal: 2500,
        monthlyWithdrawal: 2500,
        dailyDeposit: 2500,
        monthlyDeposit: 2500
      },
      benefits: [
        'Up to 250 transactions per month',
        'Transaction history',
        'Email support',
        'Standard security features'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      billingCycle: 'monthly',
      description: 'Great for small businesses and freelancers',
      color: 'green',
      features: [
        {
          id: 'advanced_payments',
          name: 'Advanced Payments',
          description: 'Send and receive money with enhanced features',
          icon: '💳',
          included: true,
          limit: 500
        },
        {
          id: 'mobile_app',
          name: 'Mobile App',
          description: 'Access via mobile app',
          icon: '📱',
          included: true
        },
        {
          id: 'transaction_history',
          name: 'Transaction History',
          description: 'View past transactions',
          icon: '📋',
          included: true
        },
        {
          id: 'basic_analytics',
          name: 'Basic Analytics',
          description: 'Transaction insights and reports',
          icon: '📊',
          included: true
        },
        {
          id: 'email_support',
          name: 'Email Support',
          description: 'Email support within 48 hours',
          icon: '📧',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 500,
        dailyWithdrawal: 5000,
        monthlyWithdrawal: 5000,
        dailyDeposit: 5000,
        monthlyDeposit: 5000
      },
      benefits: [
        'Up to 500 transactions per month',
        'Basic analytics',
        'Enhanced security',
        'Email support'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      billingCycle: 'monthly',
      description: 'Advanced features for growing businesses',
      color: 'purple',
      features: [
        {
          id: 'advanced_payments',
          name: 'Advanced Payments',
          description: 'Send and receive money with advanced features',
          icon: '💳',
          included: true,
          limit: 1000
        },
        {
          id: 'qr_payments',
          name: 'QR Code Payments',
          description: 'Generate and scan QR codes',
          icon: '📱',
          included: true
        },
        {
          id: 'advanced_analytics',
          name: 'Advanced Analytics',
          description: 'Detailed insights and reports',
          icon: '📊',
          included: true
        },
        {
          id: 'priority_support',
          name: 'Priority Support',
          description: 'Priority support within 24 hours',
          icon: '⚡',
          included: true
        },
        {
          id: 'api_access',
          name: 'API Access',
          description: 'Full API access for integrations',
          icon: '🔌',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 1000,
        dailyWithdrawal: 15000,
        monthlyWithdrawal: 15000,
        dailyDeposit: 15000,
        monthlyDeposit: 15000,
        apiCalls: 10000
      },
      benefits: [
        'Up to 1000 transactions per month',
        'Advanced analytics',
        'Priority support',
        'API access',
        'QR code payments'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 49.99,
      billingCycle: 'monthly',
      description: 'Comprehensive features for established businesses',
      color: 'indigo',
      features: [
        {
          id: 'premium_payments',
          name: 'Premium Payments',
          description: 'Send and receive money with premium features',
          icon: '💳',
          included: true,
          limit: 2500
        },
        {
          id: 'qr_payments',
          name: 'QR Code Payments',
          description: 'Generate and scan QR codes',
          icon: '📱',
          included: true
        },
        {
          id: 'group_payments',
          name: 'Group Payments',
          description: 'Split bills and manage group transactions',
          icon: '👥',
          included: true
        },
        {
          id: 'team_management',
          name: 'Team Management',
          description: 'Manage team members and permissions',
          icon: '👥',
          included: true
        },
        {
          id: 'custom_branding',
          name: 'Custom Branding',
          description: 'Customize your payment experience',
          icon: '🎨',
          included: true
        },
        {
          id: 'advanced_analytics',
          name: 'Advanced Analytics',
          description: 'Detailed insights and reports',
          icon: '📊',
          included: true
        },
        {
          id: 'priority_support',
          name: 'Priority Support',
          description: 'Priority support within 24 hours',
          icon: '⚡',
          included: true
        },
        {
          id: 'api_access',
          name: 'Full API Access',
          description: 'Complete API access for integrations',
          icon: '🔌',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: 2500,
        dailyWithdrawal: 75000,
        monthlyWithdrawal: 75000,
        dailyDeposit: 75000,
        monthlyDeposit: 75000,
        teamMembers: 10,
        apiCalls: 50000
      },
      benefits: [
        'Up to 2500 transactions per month',
        'Group payments',
        'Team management',
        'Custom branding',
        'Advanced analytics',
        'Priority support',
        'Full API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      billingCycle: 'monthly',
      description: 'Full features for large organizations',
      color: 'red',
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
          id: 'qr_payments',
          name: 'QR Code Payments',
          description: 'Generate and scan QR codes',
          icon: '📱',
          included: true
        },
        {
          id: 'group_payments',
          name: 'Group Payments',
          description: 'Split bills and manage group transactions',
          icon: '👥',
          included: true
        },
        {
          id: 'team_management',
          name: 'Team Management',
          description: 'Manage team members and permissions',
          icon: '👥',
          included: true
        },
        {
          id: 'custom_branding',
          name: 'Custom Branding',
          description: 'Customize your payment experience',
          icon: '🎨',
          included: true
        },
        {
          id: 'white_label',
          name: 'White Label',
          description: 'Fully branded payment solution',
          icon: '🏷️',
          included: true
        },
        {
          id: 'custom_integrations',
          name: 'Custom Integrations',
          description: 'Custom integrations and workflows',
          icon: '🔧',
          included: true
        },
        {
          id: 'dedicated_support',
          name: 'Dedicated Support',
          description: '24/7 dedicated account manager',
          icon: '👨‍💼',
          included: true
        },
        {
          id: 'advanced_analytics',
          name: 'Advanced Analytics',
          description: 'Detailed insights and reports',
          icon: '📊',
          included: true
        },
        {
          id: 'api_access',
          name: 'Full API Access',
          description: 'Complete API access for integrations',
          icon: '🔌',
          included: true
        }
      ],
      limits: {
        monthlyTransactions: -1, // Unlimited
        dailyWithdrawal: 150000,
        monthlyWithdrawal: 150000,
        dailyDeposit: 150000,
        monthlyDeposit: 150000,
        teamMembers: -1, // Unlimited
        apiCalls: -1 // Unlimited
      },
      benefits: [
        'Unlimited transactions',
        'Group payments',
        'Team management',
        'Custom branding',
        'White-label options',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'Full API access'
      ]
    }
  ];

  /**
   * Get all available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: SubscriptionTier): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  /**
   * Get the most popular plan
   */
  getPopularPlan(): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.popular);
  }

  /**
   * Check if a user can access a feature
   */
  canAccessFeature(userSubscription: UserSubscription, featureId: string): boolean {
    const plan = this.getPlan(userSubscription.planId);
    if (!plan) return false;

    const feature = plan.features.find(f => f.id === featureId);
    return feature ? feature.included : false;
  }

  /**
   * Check if a user has reached their transaction limit
   */
  hasReachedTransactionLimit(userSubscription: UserSubscription, currentMonthTransactions: number): boolean {
    const plan = this.getPlan(userSubscription.planId);
    if (!plan) return true;

    const limit = plan.limits.monthlyTransactions;
    return limit !== -1 && currentMonthTransactions >= limit;
  }

  /**
   * Get feature comparison across all plans
   */
  getFeatureComparison() {
    const allFeatures = new Set<string>();
    this.plans.forEach(plan => {
      plan.features.forEach(feature => {
        allFeatures.add(feature.id);
      });
    });

    return Array.from(allFeatures).map(featureId => {
      const comparison: any = { feature: featureId };
      
      this.plans.forEach(plan => {
        const feature = plan.features.find(f => f.id === featureId);
        comparison[plan.id] = feature ? feature.included : false;
      });

      return comparison;
    });
  }

  /**
   * Calculate upgrade cost
   */
  calculateUpgradeCost(currentPlan: SubscriptionTier, targetPlan: SubscriptionTier): number {
    const current = this.getPlan(currentPlan);
    const target = this.getPlan(targetPlan);
    
    if (!current || !target) return 0;
    
    return Math.max(0, target.price - current.price);
  }

  /**
   * Get recommended plan based on usage
   */
  getRecommendedPlan(monthlyTransactions: number, teamSize: number = 1): SubscriptionTier {
    if (monthlyTransactions <= 3) return 'free';
    if (monthlyTransactions <= 10) return 'starter';
    if (monthlyTransactions <= 25) return 'basic';
    if (monthlyTransactions <= 100) return 'pro';
    if (monthlyTransactions <= 500) return 'business';
    return 'enterprise';
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
