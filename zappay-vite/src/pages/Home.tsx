import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ZapPay
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fast, secure, and reliable digital payments
          </p>
          
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="btn-primary"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn-secondary"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
