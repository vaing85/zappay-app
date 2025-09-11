import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Test Page</h1>
        <p className="text-gray-600">This is a test page to verify routing is working</p>
        <p className="text-sm text-gray-500 mt-4">Current URL: {window.location.pathname}</p>
      </div>
    </div>
  );
};

export default TestPage;
