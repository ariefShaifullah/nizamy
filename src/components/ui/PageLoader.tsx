
import React from 'react';

interface PageLoaderProps {
  message?: string;
  isFullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = "Memuat Modul...", 
  isFullScreen = false 
}) => {
  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-loading bg-white dark:bg-slate-950 flex flex-col items-center justify-center animate-fade-in"
    : "min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in";

  return (
    <div className={containerClasses}>
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Spinner Rings */}
        <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        
        {/* Logo in the center */}
        <img
          src="/images/logo_nizamy.png?v=6"
          alt="NIZAMY Logo"
          className="w-12 h-12 object-contain animate-pulse"
        />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-4 animate-pulse">
        {message}
      </p>
    </div>
  );
};
