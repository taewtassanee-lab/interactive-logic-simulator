import { useState } from 'react';
import { Bell, ChevronDown, Pause, Play, RefreshCw, Repeat2, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRoleTimer } from '../context/RoleTimerContext';
import { formatClock } from '../utils/format';
import { Button } from './Ui';

/**
 * นาฬิกาสลับบทบาทแบบลอย ติดอยู่มุมซ้ายล่างทุกหน้า
 *
 * วางไว้มุมซ้ายเพราะมุมขวาล่างเป็นที่ของข้อความแจ้งเตือน (Toast)
 * ย่อเก็บได้เมื่อบังเนื้อหา และแสดงเฉพาะหลังกดเริ่มกิจกรรมแล้วเท่านั้น
 */
export const FloatingRoleTimer = () => {
  const { state } = useApp();
  const { seconds, running, timeUp, switchCount, start, pause, reset, markSwitched } =
    useRoleTimer();
  const [open, setOpen] = useState(false);

  if (!state.session.activityStarted) return null;

  /* ---------- แบบย่อ ---------- */
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`เปิดตัวจับเวลาสลับบทบาท เหลือเวลา ${formatClock(seconds)}`}
        className={`fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl border-2 px-3 py-2 font-mono text-base font-bold tabular-nums transition-all duration-150 active:translate-y-[2px] ${
          timeUp
            ? 'animate-wiggle border-bubble-300 bg-gradient-to-b from-bubble-100 to-bubble-200 text-bubble-800'
            : running
              ? 'border-brand-200 bg-gradient-to-b from-white to-brand-50 text-brand-800'
              : 'border-slate-200 bg-gradient-to-b from-white to-slate-100 text-slate-600'
        }`}
        style={{ boxShadow: '0 5px 0 -1px rgba(203,213,225,0.8), 0 12px 20px -12px rgba(15,23,42,0.5)' }}
      >
        <Timer
          className={`h-4 w-4 ${running ? 'text-brand-600' : 'text-slate-400'}`}
          aria-hidden="true"
        />
        {formatClock(seconds)}
        {timeUp && <Bell className="h-4 w-4 animate-wiggle" aria-hidden="true" />}
      </button>
    );
  }

  /* ---------- แบบเปิด ---------- */
  return (
    <div
      className="clay-card fixed bottom-4 left-4 z-40 w-[min(92vw,20rem)] animate-pop p-4"
      role="region"
      aria-label="ตัวจับเวลาสลับบทบาท"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-700">
          <Timer className="h-4 w-4 text-think-600" aria-hidden="true" />
          Role Switch Timer
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="ย่อตัวจับเวลา"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <p
        className={`mb-1 rounded-2xl border-4 py-1.5 text-center font-mono text-4xl font-bold tabular-nums ${
          timeUp
            ? 'animate-wiggle border-bubble-200 bg-gradient-to-b from-bubble-50 to-bubble-100 text-bubble-700'
            : 'border-slate-100 bg-gradient-to-b from-white to-slate-100 text-slate-800'
        }`}
        aria-live="polite"
      >
        {formatClock(seconds)}
      </p>
      <p className="mb-2.5 text-center text-[11px] text-slate-500">
        สลับบทบาทแล้ว {switchCount} ครั้ง
      </p>

      {timeUp && (
        <p
          className="mb-2.5 flex items-start gap-2 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-3 py-2 text-xs font-semibold leading-relaxed text-peach-900"
          role="alert"
        >
          <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ถึงเวลาสลับบทบาทแล้ว เมื่อสลับเสร็จให้กดปุ่มด้านล่าง
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {running ? (
          <Button variant="secondary" onClick={pause}>
            <Pause className="h-4 w-4" aria-hidden="true" />
            Pause
          </Button>
        ) : (
          <Button variant="primary" onClick={start}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Start
          </Button>
        )}
        <Button variant="secondary" onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
        <Button variant="purple" onClick={markSwitched} className="col-span-2">
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          สลับบทบาทแล้ว
        </Button>
      </div>
    </div>
  );
};
