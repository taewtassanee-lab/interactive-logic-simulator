import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'warn' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastKind, { box: string; icon: ReactNode; label: string }> = {
  success: {
    box: 'border-mint-300 bg-mint-50 text-mint-900',
    icon: <CheckCircle2 className="h-5 w-5 text-mint-600" aria-hidden="true" />,
    label: 'สำเร็จ',
  },
  error: {
    box: 'border-bubble-300 bg-bubble-50 text-bubble-900',
    icon: <XCircle className="h-5 w-5 text-bubble-600" aria-hidden="true" />,
    label: 'ข้อผิดพลาด',
  },
  warn: {
    box: 'border-lemon-300 bg-lemon-50 text-peach-900',
    icon: <TriangleAlert className="h-5 w-5 text-lemon-600" aria-hidden="true" />,
    label: 'คำเตือน',
  },
  info: {
    box: 'border-brand-300 bg-brand-50 text-brand-900',
    icon: <Info className="h-5 w-5 text-brand-600" aria-hidden="true" />,
    label: 'ข้อมูล',
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = Date.now() + Math.random();
      // เก็บไว้สูงสุด 4 ข้อความ กันการซ้อนกันจนบังหน้าจอเมื่อมีเหตุการณ์ถี่ ๆ
      setItems((prev) => [...prev, { id, kind, message }].slice(-4));
      window.setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,26rem)] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const style = STYLES[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex animate-pop items-start gap-3 rounded-2xl border-2 px-4 py-3 shadow-clay ${style.box}`}
            >
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1 text-sm leading-relaxed">
                <span className="sr-only">{style.label}: </span>
                {t.message}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                aria-label="ปิดข้อความแจ้งเตือน"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ต้องใช้ภายใน <ToastProvider> เท่านั้น');
  return ctx;
};
