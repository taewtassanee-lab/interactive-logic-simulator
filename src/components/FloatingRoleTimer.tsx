import { useEffect, useState } from 'react';
import { Bell, ChevronUp, Pause, Play, RefreshCw, Repeat2, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRoleTimer } from '../context/RoleTimerContext';
import { formatClock } from '../utils/format';
import { Button } from './Ui';

/**
 * นาฬิกาสลับบทบาทแบบลอย ติดมุมบนขวาทุกหน้า
 *
 * วางมุมบนขวาเพราะเป็นจุดที่สายตาเหลือบไปโดยไม่ต้องละมือจากงาน
 * และไม่ชนกับข้อความแจ้งเตือนที่อยู่มุมขวาล่าง
 *
 * ตำแหน่งแนวตั้งคำนวณจากขอบล่างจริงของแถบเมนู ไม่ได้ตั้งค่าคงที่ไว้
 * เพราะแถบเมนูสูงไม่เท่ากันในแต่ละขนาดจอ (จอกว้าง 1 แถว ไอแพด 2 แถว มือถือ 3 แถว)
 * ถ้าใช้ค่าคงที่จะไปทับแถบเมนูบนจอบางขนาด
 */
export const FloatingRoleTimer = () => {
  const { state } = useApp();
  const { seconds, running, timeUp, switchCount, start, pause, reset, markSwitched } =
    useRoleTimer();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(120);

  useEffect(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    /**
     * หัวเว็บและแถบเมนูเป็น sticky ทั้งคู่ วางซ้อนกันอยู่บนสุดเสมอ
     * นาฬิกาจึงต้องอยู่ต่ำกว่าความสูงรวมของสองส่วนนี้
     *
     * ใช้ "ความสูง" ไม่ใช่ "ตำแหน่ง" เพราะความสูงคงที่ไม่ว่าจะเลื่อนหน้าไปแค่ไหน
     * ต่างจาก getBoundingClientRect().bottom ที่ขยับตามการเลื่อน
     * และแถบเมนูสูงไม่เท่ากันในแต่ละขนาดจอ (จอกว้าง 1 แถว ไอแพด 2 แถว มือถือ 3 แถว)
     * จึงต้องวัดใหม่เมื่อขนาดเปลี่ยน ไม่ใช้ค่าคงที่
     */
    const measure = () => {
      const h = header?.getBoundingClientRect().height ?? 0;
      const n = nav?.getBoundingClientRect().height ?? 0;
      if (h + n > 0) setTop(Math.round(h + n) + 10);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    if (nav) observer.observe(nav);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  if (!state.session.activityStarted) return null;

  /** ใกล้หมดเวลาเหลือไม่ถึง 2 นาที ให้เปลี่ยนสีเตือนก่อน จะได้เตรียมตัวทัน */
  const warning = seconds > 0 && seconds <= 120;

  /* สีสดตัดกับพื้นหลังขาวของหน้าเว็บ อ่านออกแม้เหลือบมองเร็ว ๆ */
  const tone = timeUp
    ? 'from-rose-500 to-pink-600 border-rose-300'
    : warning
      ? 'from-amber-400 to-orange-500 border-amber-300'
      : running
        ? 'from-indigo-500 to-violet-600 border-indigo-300'
        : 'from-slate-400 to-slate-500 border-slate-300';

  const edge = timeUp ? '#9f1239' : warning ? '#b45309' : running ? '#3730a3' : '#334155';

  /* ---------- แบบย่อ ---------- */
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`เปิดตัวจับเวลาสลับบทบาท เหลือเวลา ${formatClock(seconds)}`}
        className={`fixed right-3 z-40 flex items-center gap-2.5 rounded-3xl border-4 bg-gradient-to-b px-4 py-2.5 text-white transition-all duration-150 active:translate-y-[2px] sm:right-5 sm:gap-3 sm:px-5 sm:py-3 ${tone} ${
          timeUp ? 'animate-wiggle' : ''
        }`}
        style={{ top, boxShadow: `0 6px 0 -1px ${edge}, 0 16px 26px -14px rgba(15,23,42,0.6)` }}
      >
        {timeUp ? (
          <Bell className="h-7 w-7 shrink-0 animate-wiggle sm:h-8 sm:w-8" aria-hidden="true" />
        ) : (
          <Timer className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" aria-hidden="true" />
        )}
        <span className="text-left leading-none">
          <span className="block font-mono text-3xl font-bold tabular-nums sm:text-4xl">
            {formatClock(seconds)}
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-white/85 sm:text-[11px]">
            {timeUp ? 'ต้องสลับบทบาท' : running ? 'ก่อนสลับบทบาท' : 'หยุดพักอยู่'}
          </span>
        </span>
      </button>
    );
  }

  /* ---------- แบบเปิด ---------- */
  return (
    <div
      className="clay-card fixed right-3 z-40 w-[min(92vw,21rem)] animate-pop overflow-hidden p-0 sm:right-5"
      style={{ top }}
      role="region"
      aria-label="ตัวจับเวลาสลับบทบาท"
    >
      <div className={`flex items-center gap-2 bg-gradient-to-r px-4 py-2 text-white ${tone}`}>
        <Timer className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 font-display text-sm font-bold">นาฬิกาสลับบทบาท</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="ย่อตัวจับเวลา"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        <p
          className={`mb-1 rounded-2xl bg-gradient-to-b py-2 text-center font-mono text-5xl font-bold tabular-nums text-white ${tone} ${
            timeUp ? 'animate-wiggle' : ''
          }`}
          style={{ boxShadow: `0 5px 0 -1px ${edge}` }}
          aria-live="polite"
        >
          {formatClock(seconds)}
        </p>
        <p className="mb-2.5 text-center text-[11px] text-slate-500">
          สลับบทบาทแล้ว {switchCount} ครั้ง
        </p>

        {timeUp && (
          <p
            className="mb-2.5 flex items-start gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold leading-relaxed text-rose-900"
            role="alert"
          >
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ถึงเวลาสลับบทบาทแล้ว เมื่อสลับเสร็จให้กดปุ่มด้านล่าง
          </p>
        )}

        {warning && !timeUp && (
          <p className="mb-2.5 flex items-start gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            เหลือไม่ถึง 2 นาที เตรียมสลับที่นั่งได้แล้ว
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {running ? (
            <Button variant="secondary" onClick={pause}>
              <Pause className="h-4 w-4" aria-hidden="true" />
              พัก
            </Button>
          ) : (
            <Button variant="primary" onClick={start}>
              <Play className="h-4 w-4" aria-hidden="true" />
              เริ่ม
            </Button>
          )}
          <Button variant="secondary" onClick={reset}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            ตั้งใหม่
          </Button>
          <Button variant="purple" onClick={markSwitched} className="col-span-2">
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            สลับบทบาทแล้ว
          </Button>
        </div>
      </div>
    </div>
  );
};
