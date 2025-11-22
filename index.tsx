
import React, { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeContext.tsx";
import { ToastProvider } from "./components/ui/Toast.tsx";
import { ConfirmProvider } from "./components/ui/ConfirmContext.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- SERVICE WORKER REGISTRATION ---
// Cast import.meta to any to bypass TypeScript error when vite types are not fully recognized in certain contexts
if ("serviceWorker" in navigator && (import.meta as any).env?.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("SW registered: ", registration);
      },
      (registrationError) => {
        console.log("SW registration failed: ", registrationError);
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

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  props: any;

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
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
          <pre className="bg-slate-100 dark:bg-slate-800 dark:text-slate-200 p-4 rounded text-left overflow-auto text-xs mb-4 max-w-2xl mx-auto">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
