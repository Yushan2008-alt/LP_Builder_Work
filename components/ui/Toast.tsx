"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Toast as ToastType, ToastType as TType } from "@/lib/types";

interface ToastContextValue {
  showToast: (message: string, type?: TType) => void;
}
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((message: string, type: TType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const icons: Record<TType, string> = {
    success: "✓", error: "✕", warning: "⚠", info: "ℹ",
  };
  const colors: Record<TType, string> = {
    success: "bg-green-600", error: "bg-red-600", warning: "bg-yellow-500", info: "bg-blue-600",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg max-w-sm pointer-events-auto animate-in slide-in-from-right", colors[toast.type])}>
            <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
              {icons[toast.type]}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
