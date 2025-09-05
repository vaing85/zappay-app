import { Transaction } from '../types/User';
import { 
  AnalyticsSummary, 
  SpendingCategory, 
  MonthlySpending, 
  WeeklySpending, 
  DailySpending,
  SpendingTrend,
  TopRecipient,
  TopSender,
  SpendingInsight,
  DateRange
} from '../types/Analytics';

export const calculateSpendingByCategory = (transactions: Transaction[]): SpendingCategory[] => {
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    if (transaction.type === 'send') {
      const category = transaction.note?.toLowerCase().includes('food') ? 'Food & Dining' :
                     transaction.note?.toLowerCase().includes('transport') ? 'Transportation' :
                     transaction.note?.toLowerCase().includes('shopping') ? 'Shopping' :
                     transaction.note?.toLowerCase().includes('entertainment') ? 'Entertainment' :
                     transaction.note?.toLowerCase().includes('bills') ? 'Bills & Utilities' :
                     transaction.note?.toLowerCase().includes('health') ? 'Healthcare' :
                     'Other';
      
      categoryMap.set(category, (categoryMap.get(category) || 0) + transaction.amount);
    }
  });

  const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
  
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
  const icons = ['🍔', '🚗', '🛍️', '🎬', '💡', '🏥', '📱', '💰'];

  return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
    color: colors[index % colors.length],
    icon: icons[index % icons.length]
  })).sort((a, b) => b.amount - a.amount);
};

export const calculateMonthlySpending = (transactions: Transaction[]): MonthlySpending[] => {
  const monthlyMap = new Map<string, MonthlySpending>();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthName,
        year: date.getFullYear(),
        totalSpent: 0,
        totalReceived: 0,
        netAmount: 0,
        transactionCount: 0
      });
    }
    
    const monthly = monthlyMap.get(monthKey)!;
    monthly.transactionCount++;
    
    if (transaction.type === 'send') {
      monthly.totalSpent += transaction.amount;
    } else {
      monthly.totalReceived += transaction.amount;
    }
    
    monthly.netAmount = monthly.totalReceived - monthly.totalSpent;
  });
  
  return Array.from(monthlyMap.values()).sort((a, b) => a.year - b.year || a.month.localeCompare(b.month));
};

export const calculateWeeklySpending = (transactions: Transaction[]): WeeklySpending[] => {
  const weeklyMap = new Map<string, WeeklySpending>();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const weekKey = startOfWeek.toISOString().split('T')[0];
    const weekName = `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        week: weekName,
        totalSpent: 0,
        totalReceived: 0,
        netAmount: 0,
        transactionCount: 0
      });
    }
    
    const weekly = weeklyMap.get(weekKey)!;
    weekly.transactionCount++;
    
    if (transaction.type === 'send') {
      weekly.totalSpent += transaction.amount;
    } else {
      weekly.totalReceived += transaction.amount;
    }
    
    weekly.netAmount = weekly.totalReceived - weekly.totalSpent;
  });
  
  return Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week));
};

export const calculateDailySpending = (transactions: Transaction[], days: number = 30): DailySpending[] => {
  const dailyMap = new Map<string, DailySpending>();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Initialize all days in range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    dailyMap.set(dateKey, {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalSpent: 0,
      totalReceived: 0,
      netAmount: 0,
      transactionCount: 0
    });
  }
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    
    if (dailyMap.has(dateKey)) {
      const daily = dailyMap.get(dateKey)!;
      daily.transactionCount++;
      
      if (transaction.type === 'send') {
        daily.totalSpent += transaction.amount;
      } else {
        daily.totalReceived += transaction.amount;
      }
      
      daily.netAmount = daily.totalReceived - daily.totalSpent;
    }
  });
  
  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateSpendingTrend = (monthlyData: MonthlySpending[]): SpendingTrend => {
  if (monthlyData.length < 2) {
    return {
      period: 'This month',
      amount: monthlyData[0]?.totalSpent || 0,
      change: 0,
      changePercentage: 0,
      trend: 'stable'
    };
  }
  
  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  
  const change = current.totalSpent - previous.totalSpent;
  const changePercentage = previous.totalSpent > 0 ? (change / previous.totalSpent) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(changePercentage) > 5) {
    trend = changePercentage > 0 ? 'up' : 'down';
  }
  
  return {
    period: 'This month',
    amount: current.totalSpent,
    change,
    changePercentage: Math.abs(changePercentage),
    trend
  };
};

export const calculateTopRecipients = (transactions: Transaction[]): TopRecipient[] => {
  const recipientMap = new Map<string, { amount: number; count: number; lastTransaction: string }>();
  
  transactions
    .filter(t => t.type === 'send' && t.recipient)
    .forEach(transaction => {
      const recipient = transaction.recipient!;
      if (!recipientMap.has(recipient)) {
        recipientMap.set(recipient, { amount: 0, count: 0, lastTransaction: transaction.timestamp });
      }
      
      const data = recipientMap.get(recipient)!;
      data.amount += transaction.amount;
      data.count++;
      if (new Date(transaction.timestamp) > new Date(data.lastTransaction)) {
        data.lastTransaction = transaction.timestamp;
      }
    });
  
  return Array.from(recipientMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      transactionCount: data.count,
      lastTransaction: data.lastTransaction
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

export const calculateTopSenders = (transactions: Transaction[]): TopSender[] => {
  const senderMap = new Map<string, { amount: number; count: number; lastTransaction: string }>();
  
  transactions
    .filter(t => t.type === 'receive' && t.sender)
    .forEach(transaction => {
      const sender = transaction.sender!;
      if (!senderMap.has(sender)) {
        senderMap.set(sender, { amount: 0, count: 0, lastTransaction: transaction.timestamp });
      }
      
      const data = senderMap.get(sender)!;
      data.amount += transaction.amount;
      data.count++;
      if (new Date(transaction.timestamp) > new Date(data.lastTransaction)) {
        data.lastTransaction = transaction.timestamp;
      }
    });
  
  return Array.from(senderMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      transactionCount: data.count,
      lastTransaction: data.lastTransaction
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

export const generateSpendingInsights = (transactions: Transaction[]): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  // Filter transactions for this month
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });
  
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
  });
  
  // Calculate spending for both months
  const thisMonthSpending = thisMonthTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthSpending = lastMonthTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Spending increase insight
  if (thisMonthSpending > lastMonthSpending * 1.2) {
    insights.push({
      id: 'spending_increase',
      type: 'spending_increase',
      title: 'Spending Increased',
      description: `Your spending increased by ${Math.round(((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)}% this month.`,
      severity: 'medium',
      actionable: true,
      actionText: 'Review Transactions',
      actionUrl: '/history',
      value: thisMonthSpending - lastMonthSpending,
      period: 'This month'
    });
  }
  
  // Spending decrease insight
  if (thisMonthSpending < lastMonthSpending * 0.8) {
    insights.push({
      id: 'spending_decrease',
      type: 'spending_decrease',
      title: 'Great Savings!',
      description: `You saved ${Math.round(((lastMonthSpending - thisMonthSpending) / lastMonthSpending) * 100)}% compared to last month.`,
      severity: 'low',
      actionable: false,
      value: lastMonthSpending - thisMonthSpending,
      period: 'This month'
    });
  }
  
  // High spending day insight
  const dailySpending = calculateDailySpending(transactions, 7);
  const maxDailySpending = Math.max(...dailySpending.map(d => d.totalSpent));
  if (maxDailySpending > 100) {
    insights.push({
      id: 'high_spending_day',
      type: 'unusual_activity',
      title: 'High Spending Day',
      description: `You spent $${maxDailySpending.toFixed(2)} in a single day this week.`,
      severity: 'medium',
      actionable: true,
      actionText: 'View Details',
      actionUrl: '/history',
      value: maxDailySpending,
      period: 'This week'
    });
  }
  
  return insights;
};

export const generateAnalyticsSummary = (transactions: Transaction[]): AnalyticsSummary => {
  const totalSpent = transactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceived = transactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalReceived - totalSpent;
  const transactionCount = transactions.length;
  const averageTransaction = transactionCount > 0 ? (totalSpent + totalReceived) / transactionCount : 0;
  
  const categoryBreakdown = calculateSpendingByCategory(transactions);
  const monthlyData = calculateMonthlySpending(transactions);
  const weeklyData = calculateWeeklySpending(transactions);
  const dailyData = calculateDailySpending(transactions, 30);
  const spendingTrend = calculateSpendingTrend(monthlyData);
  const topRecipients = calculateTopRecipients(transactions);
  const topSenders = calculateTopSenders(transactions);
  const insights = generateSpendingInsights(transactions);
  
  return {
    totalSpent,
    totalReceived,
    netAmount,
    transactionCount,
    averageTransaction,
    topCategory: categoryBreakdown[0]?.category || 'None',
    topRecipient: topRecipients[0]?.name || 'None',
    spendingTrend,
    monthlyData,
    weeklyData,
    dailyData,
    categoryBreakdown,
    topRecipients,
    topSenders,
    insights,
    budgetAlerts: [] // Will be implemented later
  };
};

export const getDateRangeOptions = (): DateRange[] => {
  const now = new Date();
  
  return [
    {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      label: 'This Month'
    },
    {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
      label: 'Last Month'
    },
    {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31),
      label: 'This Year'
    },
    {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
      label: 'Last 7 Days'
    },
    {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
      label: 'Last 30 Days'
    }
  ];
};
