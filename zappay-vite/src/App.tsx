import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import Home from './pages/Home';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PaymentProvider } from './contexts/PaymentContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PaymentProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<div className="min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow-lg"><h2 className="text-2xl font-bold text-center mb-6">Login to ZapPay</h2><p className="text-gray-600">Login functionality coming soon!</p></div></div>} />
                <Route path="/register" element={<div className="min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow-lg"><h2 className="text-2xl font-bold text-center mb-6">Register for ZapPay</h2><p className="text-gray-600">Registration functionality coming soon!</p></div></div>} />
                <Route path="/dashboard" element={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1><div className="bg-white rounded-lg shadow-lg p-6"><p className="text-gray-600">Welcome to your ZapPay dashboard!</p></div></div></div>} />
                <Route path="/payment-settings" element={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Settings</h1><div className="bg-white rounded-lg shadow-lg p-6"><p className="text-gray-600">Payment settings coming soon!</p></div></div></div>} />
                <Route path="/privacy-policy" element={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1><div className="bg-white rounded-lg shadow-lg p-6"><p className="text-gray-600">Privacy policy coming soon!</p></div></div></div>} />
                <Route path="/terms-of-service" element={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1><div className="bg-white rounded-lg shadow-lg p-6"><p className="text-gray-600">Terms of service coming soon!</p></div></div></div>} />
              </Routes>
              
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;