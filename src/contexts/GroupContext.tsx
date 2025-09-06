import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { groupService } from '../services/groupService';
import { 
  Group, 
  GroupMember, 
  GroupExpense, 
  PaymentRequest, 
  GroupAnalytics,
  GroupNotification 
} from '../types/Social';

interface GroupContextType {
  // Groups
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  
  // Group Management
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalTransactions'>) => Promise<Group>;
  getGroup: (groupId: string) => Promise<Group | null>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<Group | null>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  setCurrentGroup: (group: Group | null) => void;
  
  // Member Management
  addMember: (groupId: string, memberData: Omit<GroupMember, 'id' | 'joinedAt' | 'totalContributed' | 'totalOwed' | 'balance'>) => Promise<GroupMember | null>;
  removeMember: (groupId: string, userId: string) => Promise<boolean>;
  updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member') => Promise<boolean>;
  
  // Expense Management
  expenses: GroupExpense[];
  createExpense: (expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<GroupExpense>;
  updateExpense: (expenseId: string, updates: Partial<GroupExpense>) => Promise<GroupExpense | null>;
  payExpenseSplit: (expenseId: string, userId: string, amount: number) => Promise<boolean>;
  
  // Payment Requests
  paymentRequests: PaymentRequest[];
  createPaymentRequest: (requestData: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => Promise<PaymentRequest>;
  updatePaymentRequest: (requestId: string, updates: Partial<PaymentRequest>) => Promise<PaymentRequest | null>;
  
  // Analytics
  getGroupAnalytics: (groupId: string, period: 'week' | 'month' | 'quarter' | 'year') => Promise<GroupAnalytics>;
  
  // Notifications
  notifications: GroupNotification[];
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  
  // Actions
  loadGroups: () => Promise<void>;
  loadExpenses: (groupId: string) => Promise<void>;
  loadPaymentRequests: () => Promise<void>;
  loadNotifications: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

interface GroupProviderProps {
  children: React.ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's groups
  const loadGroups = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userGroups = await groupService.getUserGroups(user.id);
      setGroups(userGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load group expenses
  const loadExpenses = useCallback(async (groupId: string) => {
    if (!groupId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const groupExpenses = await groupService.getGroupExpenses(groupId);
      setExpenses(groupExpenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load payment requests
  const loadPaymentRequests = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const requests = await groupService.getUserPaymentRequests(user.id);
      setPaymentRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment requests');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load group notifications
  const loadNotifications = useCallback(async (groupId: string) => {
    if (!user || !groupId) return;
    
    try {
      const groupNotifications = await groupService.getGroupNotifications(groupId, user.id);
      setNotifications(groupNotifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  // Group Management
  const createGroup = useCallback(async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalTransactions'>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newGroup = await groupService.createGroup(groupData);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const group = await groupService.getGroup(groupId);
      if (group) {
        setCurrentGroup(group);
        await loadExpenses(groupId);
        await loadNotifications(groupId);
      }
      return group;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get group');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadExpenses, loadNotifications]);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedGroup = await groupService.updateGroup(groupId, updates);
      if (updatedGroup) {
        setGroups(prev => prev.map(group => 
          group.id === groupId ? updatedGroup : group
        ));
        if (currentGroup?.id === groupId) {
          setCurrentGroup(updatedGroup);
        }
      }
      return updatedGroup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  const deleteGroup = useCallback(async (groupId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await groupService.deleteGroup(groupId, user.id);
      if (success) {
        setGroups(prev => prev.filter(group => group.id !== groupId));
        if (currentGroup?.id === groupId) {
          setCurrentGroup(null);
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentGroup]);

  // Member Management
  const addMember = useCallback(async (groupId: string, memberData: Omit<GroupMember, 'id' | 'joinedAt' | 'totalContributed' | 'totalOwed' | 'balance'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const member = await groupService.addMember(groupId, memberData);
      if (member) {
        await loadGroups(); // Reload groups to get updated member list
      }
      return member;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  const removeMember = useCallback(async (groupId: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await groupService.removeMember(groupId, userId);
      if (success) {
        await loadGroups(); // Reload groups to get updated member list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  const updateMemberRole = useCallback(async (groupId: string, userId: string, role: 'admin' | 'member') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await groupService.updateMemberRole(groupId, userId, role);
      if (success) {
        await loadGroups(); // Reload groups to get updated member list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  // Expense Management
  const createExpense = useCallback(async (expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const expense = await groupService.createExpense(expenseData);
      setExpenses(prev => [...prev, expense]);
      await loadGroups(); // Reload groups to update totals
      return expense;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<GroupExpense>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const expense = await groupService.updateExpense(expenseId, updates);
      if (expense) {
        setExpenses(prev => prev.map(e => e.id === expenseId ? expense : e));
      }
      return expense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const payExpenseSplit = useCallback(async (expenseId: string, userId: string, amount: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await groupService.payExpenseSplit(expenseId, userId, amount);
      if (success) {
        await loadExpenses(currentGroup?.id || '');
        await loadGroups(); // Reload groups to update member balances
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pay expense split');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, currentGroup, loadExpenses, loadGroups]);

  // Payment Requests
  const createPaymentRequest = useCallback(async (requestData: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const request = await groupService.createPaymentRequest(requestData);
      setPaymentRequests(prev => [...prev, request]);
      return request;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePaymentRequest = useCallback(async (requestId: string, updates: Partial<PaymentRequest>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const request = await groupService.updatePaymentRequest(requestId, updates);
      if (request) {
        setPaymentRequests(prev => prev.map(r => r.id === requestId ? request : r));
      }
      return request;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment request');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analytics
  const getGroupAnalytics = useCallback(async (groupId: string, period: 'week' | 'month' | 'quarter' | 'year') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const analytics = await groupService.getGroupAnalytics(groupId, period);
      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get group analytics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await groupService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
      return success;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadGroups();
      loadPaymentRequests();
    }
  }, [user, loadGroups, loadPaymentRequests]);

  const value: GroupContextType = {
    groups,
    currentGroup,
    isLoading,
    error,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    setCurrentGroup,
    addMember,
    removeMember,
    updateMemberRole,
    expenses,
    createExpense,
    updateExpense,
    payExpenseSplit,
    paymentRequests,
    createPaymentRequest,
    updatePaymentRequest,
    getGroupAnalytics,
    notifications,
    markNotificationAsRead,
    loadGroups,
    loadExpenses,
    loadPaymentRequests,
    loadNotifications
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
