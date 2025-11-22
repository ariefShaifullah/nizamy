import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substr(2, 9);
      setToast({ id, message, type });
    },
    []
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[100] animate-fade-in-up flex items-center gap-3 transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-800 text-white"
          }`}
        >
          <span className="text-lg">
            {toast.type === "success"
              ? "✨"
              : toast.type === "error"
              ? "⚠️"
              : "ℹ️"}
          </span>
          <span className="font-bold text-sm">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};
