import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Check, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      counter += 1;
      const id = counter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 2600);
    },
    [remove]
  );

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, 'success'),
    error: (m) => toast(m, 'error'),
    info: (m) => toast(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-[26px] left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => {
          const Icon = t.type === 'error' ? XCircle : t.type === 'info' ? Info : Check;
          const iconColor = t.type === 'error' ? '#e0a98f' : t.type === 'info' ? '#c8d8a0' : '#9ccb8a';
          return (
            <div
              key={t.id}
              role="alert"
              className="pointer-events-auto flex animate-toastin items-center gap-2.5 rounded-xl bg-ink px-[22px] py-3 text-sm font-semibold text-[#f4f0e3] shadow-pop"
            >
              <Icon className="h-[17px] w-[17px]" style={{ color: iconColor }} strokeWidth={2.4} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
