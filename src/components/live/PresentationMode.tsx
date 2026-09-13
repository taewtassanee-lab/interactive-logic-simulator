import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Minimize2, Square, Users } from 'lucide-react';
import { Button, Pill } from '../Ui';
import { LiveResultView } from './TeacherViews';
import { TYPE_LABELS } from '../../data/liveActivities';
import { normalizeRoom } from '../../utils/live';
import type { LiveActivityPreset, LiveResponse, LiveSession } from '../../types/live';

interface Props {
  session: LiveSession;
  preset: LiveActivityPreset;
  responses: LiveResponse[];
  teacherKey: string;
  classroom: string;
  revealed: boolean;
  busy: boolean;
  onToggleReveal: () => void;
  onClose: () => void;
  onExit: () => void;
}

/**
 * โหมดฉายผลลัพธ์เต็มจอสำหรับหน้าชั้นเรียน
 *
 * แยกออกจากแผงควบคุมโดยตั้งใจ เพราะจอโปรเจกเตอร์ต้องอ่านออกจากหลังห้อง
 * ปุ่มจัดการต่าง ๆ อย่างคลังกิจกรรม ดาวน์โหลด CSV และล้างคำตอบ
 * เป็นงานของครูคนเดียว ไม่ควรกินพื้นที่จอที่นักเรียนทั้งห้องกำลังดูอยู่
 *
 * ใช้ zoom แทนการแก้ขนาดตัวอักษรทีละมุมมอง เพราะ zoom จัดวางใหม่ให้จริง
 * ต่างจาก transform: scale ที่ขยายภาพแล้วล้นกรอบ
 */
export const PresentationMode = ({
  session,
  preset,
  responses,
  teacherKey,
  classroom,
  revealed,
  busy,
  onToggleReveal,
  onClose,
  onExit,
}: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.4);

  const leave = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    onExit();
  }, [onExit]);

  // ขอโหมดเต็มจอของเบราว์เซอร์ด้วย เพื่อซ่อนแถบที่อยู่เว็บและแท็บออกจากจอโปรเจกเตอร์
  useEffect(() => {
    const el = rootRef.current;
    if (el?.requestFullscreen) void el.requestFullscreen().catch(() => {});
    return () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  // ล็อกไม่ให้หน้าด้านหลังเลื่อนตาม ระหว่างเปิดจอฉาย
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ปุ่ม Esc ออกจากโหมดฉาย และปุ่มบวกลบปรับขนาดตัวอักษรหน้างานได้
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(2.4, z + 0.1));
      if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(0.8, z - 0.1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leave]);

  /**
   * วางไว้ที่ body โดยตรงผ่าน portal
   * เพื่อไม่ให้ความกว้างสูงสุดและระยะขอบของหน้าแดชบอร์ดมาบีบกรอบจอฉาย
   */
  return createPortal(
    <div
      ref={rootRef}
      className="fixed left-0 top-0 z-50 flex flex-col overflow-hidden bg-white"
      style={{ width: '100vw', height: '100dvh' }}
      role="region"
      aria-label="จอแสดงผลกิจกรรมหน้าชั้นเรียน"
    >
      {/* ---------- หัวจอ ---------- */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-4 border-brand-100 bg-gradient-to-r from-brand-50 to-white px-6 py-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <Pill tone={session.open ? 'mint' : 'slate'}>
              {session.open ? 'กำลังเปิดรับคำตอบ' : 'ปิดรับคำตอบแล้ว'}
            </Pill>
            <Pill tone="think">{TYPE_LABELS[session.type] ?? session.type}</Pill>
          </div>
          <h1 className="truncate font-display text-3xl font-bold text-slate-800">
            {session.title}
          </h1>
        </div>

        {/* รหัสห้องค้างไว้บนจอ นักเรียนที่มาสายเข้าร่วมได้เองโดยไม่ต้องถาม */}
        <div className="rounded-2xl border-2 border-dashed border-mint-300 bg-mint-50 px-4 py-2 text-center">
          <p className="text-xs font-semibold text-mint-800">กรอกห้องเรียนว่า</p>
          <p className="font-mono text-2xl font-bold text-slate-800">{normalizeRoom(classroom)}</p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border-2 border-brand-200 bg-white px-4 py-2">
          <Users className="h-7 w-7 text-brand-600" aria-hidden="true" />
          <span className="font-display text-4xl font-bold tabular-nums text-brand-700">
            {responses.length}
          </span>
          <span className="text-sm font-semibold text-slate-500">คน</span>
        </div>
      </header>

      {/* ---------- โจทย์ ---------- */}
      {session.prompt && (
        <p className="shrink-0 border-b-2 border-slate-100 px-6 py-2.5 text-xl leading-relaxed text-slate-600">
          {session.prompt}
        </p>
      )}

      {/* ---------- ผลลัพธ์ ---------- */}
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
        <div style={{ zoom }}>
          <LiveResultView
            preset={preset}
            responses={responses}
            teacherKey={teacherKey}
            revealed={revealed}
          />
        </div>
      </div>

      {/* ---------- แถบควบคุมเท่าที่จำเป็น ---------- */}
      <footer className="flex flex-wrap items-center gap-2 border-t-2 border-slate-100 bg-slate-50 px-6 py-2.5">
        {session.open ? (
          <Button variant="danger" disabled={busy} onClick={onClose}>
            <Square className="h-4 w-4" aria-hidden="true" />
            ปิดรับคำตอบ
          </Button>
        ) : (
          <Button variant="secondary" onClick={onToggleReveal}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            {revealed ? 'ซ่อนเฉลย' : 'แสดงเฉลย'}
          </Button>
        )}

        <div className="flex items-center gap-1.5" role="group" aria-label="ปรับขนาดตัวอักษร">
          <Button variant="ghost" onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}>
            ก−
          </Button>
          <span className="min-w-[3.5rem] text-center text-sm font-semibold text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" onClick={() => setZoom((z) => Math.min(2.4, z + 0.1))}>
            ก+
          </Button>
        </div>

        <span className="ml-auto text-xs text-slate-400">
          กด Esc เพื่อออก · ปุ่ม + และ − ปรับขนาดตัวอักษร
        </span>

        <Button variant="secondary" onClick={leave}>
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
          ออกจากจอฉาย
        </Button>
      </footer>
    </div>,
    document.body,
  );
};
