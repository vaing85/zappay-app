import React, { lazy, Suspense } from 'react';
// Force rebuild for Netlify static asset fix - v8 - API URL cache busting
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import store from './store/store';
import AppProviders from './components/AppProviders';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { RealtimeNotificationProvider } from './contexts/RealtimeNotificationContext';
import { RealtimeBalanceProvider } from './contexts/RealtimeBalanceContext';
import { PushNotificationProvider } from './contexts/PushNotificationContext';
import { AIInsightsProvider } from './contexts/AIInsightsContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { GroupProvider } from './contexts/GroupContext';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import UpdateAvailable from './components/UpdateAvailable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ChatbotToggle from './components/ChatbotToggle';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import pages directly
import Home from './pages/Home';
import Login from './pages/Login';
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SendMoney = lazy(() => import('./pages/SendMoney'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const Profile = lazy(() => import('./pages/Profile'));
const QRPayment = lazy(() => import('./pages/QRPayment'));
const AdvancedPayments = lazy(() => import('./pages/AdvancedPayments'));
const SplitBills = lazy(() => import('./pages/SplitBills'));
const PaymentRequests = lazy(() => import('./pages/PaymentRequests'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Groups = lazy(() => import('./pages/Groups'));
const Budget = lazy(() => import('./pages/Budget'));
const Security = lazy(() => import('./pages/Security'));
const TransactionSecurity = lazy(() => import('./pages/TransactionSecurity'));
const DataEncryption = lazy(() => import('./pages/DataEncryption'));
const PaymentSettings = lazy(() => import('./pages/PaymentSettings'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const MerchantDashboard = lazy(() => import('./pages/MerchantDashboard'));
const NotificationAnalytics = lazy(() => import('./pages/NotificationAnalytics'));
const EnhancedSecurity = lazy(() => import('./pages/EnhancedSecurity'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard'));
const ContactSupport = lazy(() => import('./pages/ContactSupport'));
const TestPage = lazy(() => import('./pages/TestPage'));

function App() {
  return (
    <Provider store={store}>
      <AppProviders>
        <WebSocketProvider>
          <RealtimeNotificationProvider>
            <RealtimeBalanceProvider>
              <PushNotificationProvider>
                <AIInsightsProvider>
                  <PaymentProvider>
                    <GroupProvider>
              <Router>
                <ErrorBoundary>
                  <div className="App min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <Suspense fallback={
                          <div className="flex items-center justify-center min-h-96">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                              <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
                            </div>
                          </div>
                        }>
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
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/groups" element={<Groups />} />
                            <Route path="/budget" element={<Budget />} />
                            <Route path="/security" element={<Security />} />
                            <Route path="/transaction-security" element={<TransactionSecurity />} />
                            <Route path="/data-encryption" element={<DataEncryption />} />
                            <Route path="/payment-settings" element={<PaymentSettings />} />
                            <Route path="/merchant" element={<MerchantDashboard />} />
                            <Route path="/notification-analytics" element={<NotificationAnalytics />} />
                            <Route path="/enhanced-security" element={<EnhancedSecurity />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                            <Route path="/api-docs" element={<APIDocumentation />} />
                            <Route path="/developer" element={<DeveloperDashboard />} />
                            <Route path="/contact-support" element={<ContactSupport />} />
                            <Route path="/test" element={<TestPage />} />
                          </Routes>
                        </Suspense>
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
                    
                    {/* AI Chatbot */}
                    <ChatbotToggle />
                  </div>
                </ErrorBoundary>
              </Router>
                    </GroupProvider>
                  </PaymentProvider>
                </AIInsightsProvider>
              </PushNotificationProvider>
            </RealtimeBalanceProvider>
          </RealtimeNotificationProvider>
        </WebSocketProvider>
      </AppProviders>
    </Provider>
  );
}

export default App;
