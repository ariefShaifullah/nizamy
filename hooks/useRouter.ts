
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export type ViewState = 'home' | 'faraidh' | 'zakat' | 'hafalan' | 'mushaf';

/**
 * Modern useRouter hook that wraps react-router-dom.
 * Replaces the old manual History API implementation to prevent state desync.
 */
export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Derive current view based on path
  const view = useMemo((): ViewState => {
    const path = location.pathname.replace('/', '');
    if (!path) return 'home';
    
    // Validate known routes
    if (['faraidh', 'zakat', 'hafalan', 'mushaf'].includes(path)) {
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
