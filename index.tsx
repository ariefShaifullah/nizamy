
import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './components/ThemeContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ConfirmProvider } from './components/ui/ConfirmContext.tsx';

// Polyfill/Type definition for import.meta.env to prevent runtime crashes in non-Vite environments
const isProduction = (() => {
  try {
    // @ts-ignore: Vite specific
    return import.meta.env && import.meta.env.PROD;
  } catch (e) {
    return false;
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered scope:', registration.scope);
      },
      (error) => {
        console.error('SW registration failed:', error);
      }
    );
  });
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Use React.Component explicitly to avoid type inference issues
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  props: any;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center font-sans bg-white dark:bg-slate-900 min-h-screen flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
            Terjadi Kesalahan Aplikasi
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
            Mohon maaf, terjadi masalah teknis saat memuat aplikasi. Cobalah memuat ulang halaman.
          </p>
          <div className="w-full max-w-lg mx-auto mb-6">
             <pre className="bg-slate-100 dark:bg-slate-800 dark:text-slate-400 p-4 rounded-xl text-left overflow-auto text-xs border border-slate-200 dark:border-slate-700 max-h-40">
                {this.state.error?.message}
             </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToastProvider>
        <ConfirmProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
