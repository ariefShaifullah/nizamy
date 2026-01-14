import React, { ReactNode } from 'react';
import { ThemeProvider } from '../../context/ThemeContext.tsx';
import { ToastProvider } from '../ui/Toast.tsx';
import { ConfirmProvider } from '../ui/ConfirmContext.tsx';
import { ErrorBoundary } from '../ui/ErrorBoundary.tsx';
import { SurahDataProvider } from './SurahDataProvider.tsx';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToastProvider>
        <ConfirmProvider>
          <SurahDataProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </SurahDataProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};