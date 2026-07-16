/**
 * Toast Context
 * Lightweight success toasts and undo snackbars, rendered in a single fixed
 * container so any component can trigger one via useToast().
 */

'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { TOAST_DURATION, UNDO_TOAST_DURATION } from '@/constants';

interface UndoOptions {
  duration?: number;
  onUndo: () => void;
  onExpire: () => void;
}

interface ToastItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showSuccess: (message: string) => void;
  showUndo: (message: string, options: UndoOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_DURATION)
      );
    },
    [dismiss]
  );

  const showUndo = useCallback((message: string, options: UndoOptions) => {
    const id = generateId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        actionLabel: 'Undo',
        onAction: () => {
          const timer = timers.current.get(id);
          if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
          }
          setToasts((current) => current.filter((toast) => toast.id !== id));
          options.onUndo();
        },
      },
    ]);

    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
        options.onExpire();
      }, options.duration ?? UNDO_TOAST_DURATION)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showUndo }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="flex-1 text-foreground">{toast.message}</span>
            {toast.onAction && (
              <button
                type="button"
                onClick={toast.onAction}
                className="shrink-0 font-medium text-primary hover:underline"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
