import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Minimize2 } from 'lucide-react';
import { Button } from '../Ui';

/**
 * กรอบจอฉายเต็มจอสำหรับหน้าชั้นเรียน ใช้ร่วมกันทุกเครื่องมือ
 *
 * วางผ่าน portal ที่ body โดยตรง เพราะถ้าเรนเดอร์อยู่ใต้หน้าแดชบอร์ด
 * ความกว้างสูงสุดและระยะขอบของหน้าจะเลื่อนกรอบลงมาจากมุมจอ ครอบไม่เต็มจริง
 *
 * ขอโหมดเต็มจอของเบราว์เซอร์ด้วย เพื่อซ่อนแถบที่อยู่เว็บและแท็บออกจากจอโปรเจกเตอร์
 * ถ้าเบราว์เซอร์ไม่อนุญาตก็ยังใช้ได้ตามปกติ เพียงแต่เห็นแถบของเบราว์เซอร์อยู่
 */
export const FullscreenStage = ({
  title,
  headerRight,
  children,
  footer,
  onExit,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onExit: () => void;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const leave = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    onExit();
  }, [onExit]);

  useEffect(() => {
    const el = rootRef.current;
    if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  // ล็อกไม่ให้หน้าด้านหลังเลื่อนตามระหว่างเปิดจอฉาย
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leave]);

  return createPortal(
    <div
      ref={rootRef}
      className="fixed left-0 top-0 z-50 flex flex-col overflow-hidden bg-white"
      style={{ width: '100vw', height: '100dvh' }}
      role="region"
      aria-label={title}
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-4 border-brand-100 bg-gradient-to-r from-brand-50 to-white px-6 py-3">
        <h1 className="min-w-0 flex-1 truncate font-display text-3xl font-bold text-slate-800">
          {title}
        </h1>
        {headerRight}
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-6 py-5">
        {children}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t-2 border-slate-100 bg-slate-50 px-6 py-2.5">
        {footer}
        <span className="ml-auto text-xs text-slate-400">กด Esc เพื่อออก</span>
        <Button variant="secondary" onClick={leave}>
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
          ออกจากจอฉาย
        </Button>
      </footer>
    </div>,
    document.body,
  );
};
