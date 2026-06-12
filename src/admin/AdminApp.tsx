import { useState } from 'react';
import { getToken, setToken, clearToken, apiCall } from './lib/api';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  return (
    <ThemeProvider>
      {!isLoggedIn ? (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => { clearToken(); setIsLoggedIn(false); }} />
      )}
    </ThemeProvider>
  );
}
