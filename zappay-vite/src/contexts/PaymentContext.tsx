import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PaymentContextType {
  balance: number;
  updateBalance: (amount: number) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);

  const updateBalance = (amount: number) => {
    setBalance(amount);
  };

  const value = {
    balance,
    updateBalance,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};