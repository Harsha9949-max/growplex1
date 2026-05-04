import { AlertCircle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirebaseError = false;

      try {
        const errorData = JSON.parse(this.state.error?.message || '{}');
        if (errorData.error) {
          errorMessage = errorData.error;
          isFirebaseError = true;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mb-6 text-left">
              <p className="text-slate-400 text-sm font-mono break-words">
                {errorMessage}
              </p>
            </div>
            {isFirebaseError && (
              <p className="text-brand-gold text-sm mb-6">
                This appears to be a database permission error. Please contact support if this persists.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-[#0A0A0A] font-black italic uppercase tracking-widest py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
