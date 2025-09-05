import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PWAProvider } from './contexts/PWAContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { TransactionSecurityProvider } from './contexts/TransactionSecurityContext';
import { DataEncryptionProvider } from './contexts/DataEncryptionContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import QRPayment from './pages/QRPayment';
import AdvancedPayments from './pages/AdvancedPayments';
import SplitBills from './pages/SplitBills';
import PaymentRequests from './pages/PaymentRequests';
import NotificationDemo from './pages/NotificationDemo';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Security from './pages/Security';
import TransactionSecurity from './pages/TransactionSecurity';
import DataEncryption from './pages/DataEncryption';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import UpdateAvailable from './components/UpdateAvailable';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <PWAProvider>
            <AuthProvider>
              <SecurityProvider>
                <BudgetProvider>
                  <TransactionSecurityProvider>
                    <DataEncryptionProvider>
                  <Router>
                    <div className="App min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                      <Navbar />
                      <main className="container mx-auto px-4 py-8">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/send" element={<SendMoney />} />
                          <Route path="/history" element={<TransactionHistory />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/qr" element={<QRPayment />} />
                          <Route path="/advanced" element={<AdvancedPayments />} />
                          <Route path="/split-bills" element={<SplitBills />} />
                          <Route path="/payment-requests" element={<PaymentRequests />} />
                          <Route path="/notifications" element={<NotificationDemo />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/budget" element={<Budget />} />
                          <Route path="/security" element={<Security />} />
                          <Route path="/transaction-security" element={<TransactionSecurity />} />
                          <Route path="/data-encryption" element={<DataEncryption />} />
                        </Routes>
                      </main>
                      <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                      />
                      
                      {/* PWA Components */}
                      <InstallPrompt />
                      <OfflineIndicator />
                      <UpdateAvailable />
                    </div>
                  </Router>
                    </DataEncryptionProvider>
                  </TransactionSecurityProvider>
                </BudgetProvider>
              </SecurityProvider>
            </AuthProvider>
          </PWAProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
