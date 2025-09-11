import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { PWAProvider } from '../contexts/PWAContext';
import { BudgetProvider } from '../contexts/BudgetContext';
import { SecurityProvider } from '../contexts/SecurityContext';
import { TransactionSecurityProvider } from '../contexts/TransactionSecurityContext';
import { DataEncryptionProvider } from '../contexts/DataEncryptionContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <PWAProvider>
          <AuthProvider>
            <SecurityProvider>
              <BudgetProvider>
                <TransactionSecurityProvider>
                  <DataEncryptionProvider>
                    <SubscriptionProvider>
                      {children}
                    </SubscriptionProvider>
                  </DataEncryptionProvider>
                </TransactionSecurityProvider>
              </BudgetProvider>
            </SecurityProvider>
          </AuthProvider>
        </PWAProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
