
import React, { type ReactNode, type ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './components/ThemeContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ConfirmProvider } from './components/ui/ConfirmContext.tsx';

// Polyfill/Type definition for import.meta.env to prevent runtime crashes in non-Vite environments
// safely check if import.meta.env exists before accessing it.
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
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Terjadi Kesalahan Aplikasi
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Mohon maaf, terjadi masalah saat memuat aplikasi.
          </p>
          <pre className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 p-4 rounded text-left overflow-auto text-xs mb-4 max-w-2xl mx-auto border border-slate-200 dark:border-slate-700">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg"
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
