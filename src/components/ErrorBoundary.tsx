
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Something went wrong</h1>
          <p className="text-gray-500 font-medium max-w-md mb-8">
            The application encountered an unexpected error. This might be due to a storage issue or a connection problem.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Reload Application
          </button>
          {this.state.error && (
            <div className="mt-12 p-4 bg-gray-100 rounded-2xl text-left max-w-2xl overflow-auto">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Error Details</p>
              <code className="text-xs text-red-500 font-mono break-all">{this.state.error.toString()}</code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
