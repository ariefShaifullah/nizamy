import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaQuran,
    FaMosque,
    FaCheckCircle,
    FaEllipsisH,
} from 'react-icons/fa';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'Beranda', icon: <FaHome /> },
    { path: '/mushaf', label: 'Al-Quran', icon: <FaQuran /> },
    { path: '/sholat', label: 'Sholat', icon: <FaMosque /> },
    { path: '/amal', label: 'Amal', icon: <FaCheckCircle /> },
];

// Routes where bottom nav should be hidden (fullscreen features)
const HIDDEN_ON_ROUTES = ['/scanner', '/mushaf'];

export const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // Hide on certain fullscreen routes
    if (HIDDEN_ON_ROUTES.some(route => currentPath.startsWith(route))) {
        return null;
    }

    const isActive = (item: NavItem) => {
        if (item.path === '/') return currentPath === '/';
        if (item.matchPaths) return item.matchPaths.some(p => currentPath.startsWith(p));
        return currentPath.startsWith(item.path);
    };

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-header bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors duration-200"
            role="navigation"
            aria-label="Menu Utama"
        >
            <div className="container mx-auto max-w-lg">
                <div className="flex items-center justify-around h-14">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors duration-150 ${active
                                    ? 'text-teal-600 dark:text-teal-400'
                                    : 'text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300'
                                    }`}
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                            >
                                <span className={`icon-wrapper w-5 h-5 flex items-center justify-center transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-medium leading-none ${active ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
