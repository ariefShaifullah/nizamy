import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Modal } from "./Modal.tsx";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "info" | "success";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
    confirmText: "Ya",
    cancelText: "Batal",
    variant: "info",
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions({
      confirmText: "Ya",
      cancelText: "Batal",
      variant: "info",
      ...opts,
    });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    if (resolveRef.current) resolveRef.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolveRef.current) resolveRef.current(false);
    setIsOpen(false);
  };

  // Determine colors based on variant
  const getColors = () => {
    switch (options.variant) {
      case "danger":
        return {
          iconBg: "bg-red-100 dark:bg-red-900/30",
          iconText: "text-red-600 dark:text-red-400",
          btnBg: "bg-red-600 hover:bg-red-700",
          btnText: "text-white",
        };
      case "success":
        return {
          iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
          iconText: "text-emerald-600 dark:text-emerald-400",
          btnBg: "bg-emerald-600 hover:bg-emerald-700",
          btnText: "text-white",
        };
      default: // info
        return {
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          iconText: "text-blue-600 dark:text-blue-400",
          btnBg: "bg-blue-600 hover:bg-blue-700",
          btnText: "text-white",
        };
    }
  };

  const colors = getColors();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleCancel} maxWidth="max-w-sm">
          <div className="p-6 text-center">
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${colors.iconBg} mb-4`}
            >
              {options.variant === "danger" ? (
                <svg
                  className={`h-6 w-6 ${colors.iconText}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className={`h-6 w-6 ${colors.iconText}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-white mb-2">
              {options.title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {options.message}
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                onClick={handleCancel}
              >
                {options.cancelText}
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 border border-transparent rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.btnBg} ${colors.btnText}`}
                onClick={handleConfirm}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};
