
import { useState, useEffect, useCallback } from 'react';
import type { ViewState } from '../components/Layout.tsx';

export const useRouter = () => {
  // Helper to determine view from URL Query Params (Safe for all environments)
  const getInitialView = (): ViewState => {
    if (typeof window === 'undefined') return 'home';
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'faraidh' || viewParam === 'zakat' || viewParam === 'hafalan' || viewParam === 'mushaf') {
        return viewParam as ViewState;
    }
    return 'home';
  };

  const [view, setViewInternal] = useState<ViewState>(getInitialView);

  // --- NAVIGATION HANDLER (History API) ---
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setViewInternal(event.state.view);
      } else {
        setViewInternal(getInitialView());
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize History State if empty
    try {
        if (!window.history.state) {
            const currentView = getInitialView();
            const url = currentView === 'home' ? window.location.pathname : `?view=${currentView}`;
            window.history.replaceState({ view: currentView }, '', url);
        }
    } catch (e) {
        console.warn("History API initialization restricted:", e);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const setView = useCallback((newView: ViewState) => {
    setViewInternal((prev) => {
        if (prev === newView) return prev;
        
        try {
            const url = newView === 'home' ? window.location.pathname : `?view=${newView}`;
            window.history.pushState({ view: newView }, '', url);
        } catch (e) {
            console.warn("History API push failed:", e);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return newView;
    });
  }, []);

  return { view, setView };
};
