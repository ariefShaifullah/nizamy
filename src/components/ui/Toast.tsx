
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-toast flex flex-col gap-2 items-center w-full max-w-md px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full shadow-xl transition-all duration-500 animate-fade-in-up
              ${
                toast.type === 'success' ? 'bg-emerald-600 text-white' : 
                toast.type === 'error' ? 'bg-red-600 text-white' : 
                'bg-slate-800 text-white'
              }
            `}
          >
            <span className="text-lg">
              {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="font-bold text-sm">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="ml-2 opacity-70 hover:opacity-100 font-bold icon-wrapper w-4 h-4 flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};