
// @ts-ignore
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export type ViewState = 'home' | 'faraidh' | 'zakat' | 'hafalan' | 'mushaf' | 'hede';

/**
 * Modern useRouter hook that wraps react-router-dom (v6).
 */
export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Manual URLSearchParams for query parameter compatibility
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Derive current view based on path
  const view = useMemo((): ViewState => {
    const path = location.pathname.replace('/', '');
    if (!path) return 'home';
    
    // Validate known routes
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