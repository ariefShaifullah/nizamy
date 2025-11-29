import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  toggleTheme: () => null,
  isDark: false,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  // 1. Load Initial Preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [isDark, setIsDark] = useState(false);

  // 2. Direct DOM Manipulation Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const effectiveTheme = theme === 'system' ? systemTheme : theme;
        
        // Clean slate
        root.classList.remove('light', 'dark');
        
        // Force specific class
        root.classList.add(effectiveTheme);
        
        // Helper for browser UI (scrollbars, etc)
        root.style.colorScheme = effectiveTheme;
        
        setIsDark(effectiveTheme === 'dark');
    };

    applyTheme();

    // Listen for system changes ONLY if mode is 'system'
    const listener = () => {
        if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  // 3. Simplified Toggle Logic
  const toggleTheme = () => {
      // Determine what to switch TO based on what is currently ACTIVE
      // If currently dark (via system OR manual), switch to Light manual.
      // If currently light, switch to Dark manual.
      const currentEffective = isDark ? 'dark' : 'light';
      const nextTheme = currentEffective === 'dark' ? 'light' : 'dark';
      
      setTheme(nextTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};