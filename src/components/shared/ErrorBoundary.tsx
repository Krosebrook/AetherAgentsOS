/**
 * @fileoverview Error Boundary component for catching React errors
 * @module components/shared/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

/**
 * Error Boundary component that catches JavaScript errors in child components
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, info) => logError(error, info)}
 *   showDetails={process.env.NODE_ENV === 'development'}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-rose-500/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold text-slate-100">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-400">
                An unexpected error occurred in the application.
                This has been logged for investigation.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {showDetails && error && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto max-h-40">
                <p className="text-xs font-mono text-rose-400 mb-2">
                  {error.name}: {error.message}
                </p>
                {errorInfo && (
                  <pre className="text-xs font-mono text-slate-500 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
            </div>

            {/* Support Link */}
            <p className="text-center text-xs text-slate-600">
              If this issue persists, please{' '}
              <a
                href="https://github.com/Krosebrook/AetherAgentsOS/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                report it on GitHub
              </a>
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

// =============================================================================
// FALLBACK COMPONENTS
// =============================================================================

/**
 * Simple inline error fallback for non-critical errors
 */
export const InlineErrorFallback: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Failed to load content', onRetry }) => (
  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-rose-400" />
      <span className="text-sm text-rose-400">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    )}
  </div>
);

// =============================================================================
// EXPORTS
// =============================================================================

export default ErrorBoundary;
