
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export type ViewState = 'home' | 'faraidh' | 'zakat' | 'hafalan' | 'mushaf' | 'hede';

/**
 * Modern useRouter hook that wraps react-router-dom (v6).
 * Provides clean access to navigation, query params, and current view state.
 */
export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Memoize search params to avoid unnecessary processing on every render
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Derive current view based on path
  const view = useMemo((): ViewState => {
    // Remove leading slash
    const path = location.pathname.substring(1);
    
    if (!path) return 'home';
    
    // Validate known routes to ensure ViewState type safety
    if (['faraidh', 'zakat', 'hafalan', 'mushaf', 'hede'].includes(path)) {
      return path as ViewState;
    }
    return 'home';
  }, [location.pathname]);

  // Safe setter that uses Router navigation
  const setView = (newView: ViewState) => {
    if (newView === 'home') {
      navigate('/');
    } else {
      navigate(`/${newView}`);
    }
  };

  return { view, setView, searchParams };
};
