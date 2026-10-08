"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
type ToastType = "success" | "error" | "warning" | "info";
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}
const ToastContext = createContext<ToastContextType>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  warning: <AlertCircle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-blue-500" />,
};
const bgColors: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800",
  error: "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800",
  info: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
};
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: ToastType = "success", duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[320px] max-w-[420px] ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <span className="flex-1 text-sm font-medium text-foreground dark:text-gray-200">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-muted-foreground hover:text-gray-600 hover:bg-primary text-primary-foreground/5 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
