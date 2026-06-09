import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Global CSS (Z-Index Registry, etc.)
import { AppProviders } from './components/providers/AppProviders.tsx';
import { HelmetProvider } from 'react-helmet-async';

// Polyfill/Type definition for import.meta.env
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

// --- DEFERRED SERVICE WORKER REGISTRATION ---
// Only register SW after the window has fully loaded to avoid blocking critical initial requests.
if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    // Small delay to ensure React hydration is prioritized
    setTimeout(() => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered');
          },
          (error) => {
            console.error('SW registration failed:', error);
          }
        );
    }, 1000); 
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
 <React.StrictMode>
 <HelmetProvider>
 <AppProviders>
 <App />
 </AppProviders>
 </HelmetProvider>
 </React.StrictMode>
);