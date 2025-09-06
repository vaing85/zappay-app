import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';

interface BalanceUpdate {
  userId: string;
  balance: number;
  previousBalance: number;
  change: number;
  timestamp: Date;
  transactionId?: string;
  reason: 'transaction' | 'deposit' | 'withdrawal' | 'adjustment' | 'refund';
}

interface RealtimeBalanceContextType {
  currentBalance: number;
  previousBalance: number;
  balanceChange: number;
  isUpdating: boolean;
  lastUpdate: Date | null;
  balanceHistory: BalanceUpdate[];
  subscribeToBalanceUpdates: (userId: string) => void;
  unsubscribeFromBalanceUpdates: () => void;
  requestBalanceUpdate: () => void;
}

const RealtimeBalanceContext = createContext<RealtimeBalanceContextType | undefined>(undefined);

interface RealtimeBalanceProviderProps {
  children: React.ReactNode;
}

export const RealtimeBalanceProvider: React.FC<RealtimeBalanceProviderProps> = ({ children }) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [balanceChange, setBalanceChange] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceUpdate[]>([]);
  const { socket, isConnected, on, off, emit } = useWebSocket();
  const { user } = useAuth();

  const subscribeToBalanceUpdates = useCallback((userId: string) => {
    if (!socket || !isConnected) return;

    // Listen for balance updates
    on('balance_updated', (data: BalanceUpdate) => {
      if (data.userId === userId) {
        setPreviousBalance(currentBalance);
        setCurrentBalance(data.balance);
        setBalanceChange(data.change);
        setLastUpdate(new Date(data.timestamp));
        setIsUpdating(false);

        // Add to history
        setBalanceHistory(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 updates
      }
    });

    // Listen for balance update requests
    on('balance_update_requested', (data) => {
      if (data.userId === userId) {
        setIsUpdating(true);
      }
    });

    // Request initial balance
    emit('request_balance', { userId });
  }, [socket, isConnected, on, emit, currentBalance]);

  const unsubscribeFromBalanceUpdates = useCallback(() => {
    if (!socket) return;

    off('balance_updated');
    off('balance_update_requested');
  }, [socket, off]);

  const requestBalanceUpdate = useCallback(() => {
    if (user && isConnected) {
      setIsUpdating(true);
      emit('request_balance', { userId: user.id });
    }
  }, [user, isConnected, emit]);

  // Subscribe to balance updates when user is logged in
  useEffect(() => {
    if (user && isConnected) {
      subscribeToBalanceUpdates(user.id);
    }

    return () => {
      unsubscribeFromBalanceUpdates();
    };
  }, [user, isConnected, subscribeToBalanceUpdates, unsubscribeFromBalanceUpdates]);

  // Initialize balance from user data
  useEffect(() => {
    if (user) {
      setCurrentBalance(user.balance || 0);
      setPreviousBalance(user.balance || 0);
      setBalanceChange(0);
    }
  }, [user]);

  const value: RealtimeBalanceContextType = {
    currentBalance,
    previousBalance,
    balanceChange,
    isUpdating,
    lastUpdate,
    balanceHistory,
    subscribeToBalanceUpdates,
    unsubscribeFromBalanceUpdates,
    requestBalanceUpdate,
  };

  return (
    <RealtimeBalanceContext.Provider value={value}>
      {children}
    </RealtimeBalanceContext.Provider>
  );
};

export const useRealtimeBalance = (): RealtimeBalanceContextType => {
  const context = useContext(RealtimeBalanceContext);
  if (context === undefined) {
    throw new Error('useRealtimeBalance must be used within a RealtimeBalanceProvider');
  }
  return context;
};
