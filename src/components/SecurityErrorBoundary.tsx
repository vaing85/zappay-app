import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class SecurityErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Security Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg shadow-lg">
          <ExclamationTriangleIcon className="w-20 h-20 mb-6 text-red-600 dark:text-red-400" />
          <h1 className="text-3xl font-bold mb-4">Security Module Error</h1>
          <p className="text-lg text-center mb-6">
            There was an error loading the security features. This might be due to a configuration issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 p-4 bg-red-100 dark:bg-red-800 rounded-md text-sm text-left w-full max-w-md">
              <summary className="font-semibold cursor-pointer">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;
