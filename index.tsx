
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ConfirmProvider } from './components/ui/ConfirmContext.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

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
