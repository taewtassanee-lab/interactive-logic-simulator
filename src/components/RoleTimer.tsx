import { Bell, Pause, Play, RefreshCw, Repeat2, Timer } from 'lucide-react';
import { useRoleTimer } from '../context/RoleTimerContext';
import { formatClock } from '../utils/format';
import { Button, Card } from './Ui';

/**
 * การ์ดนาฬิกาสลับบทบาทแบบเต็ม แสดงในหน้าเริ่มต้นใช้งาน
 * ใช้สถานะชุดเดียวกับตัวจับเวลาแบบลอย จึงแสดงเวลาตรงกันเสมอ
 */
export const RoleTimer = () => {
  const { seconds, running, timeUp, switchCount, start, pause, reset, markSwitched } =
    useRoleTimer();

  return (
    <Card
      title="Role Switch Timer"
      subtitle="จับเวลาเพื่อสลับบทบาทให้ทั้งคู่ได้ลงมือทำจริง"
      icon={<Timer className="h-5 w-5 text-think-600" aria-hidden="true" />}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p
            className={`inline-block rounded-[1.25rem] border-4 px-5 py-2 font-mono text-5xl font-bold tabular-nums ${
              timeUp
                ? 'animate-wiggle border-bubble-200 bg-gradient-to-b from-bubble-50 to-bubble-100 text-bubble-700'
                : 'border-slate-100 bg-gradient-to-b from-white to-slate-100 text-slate-800'
            }`}
            style={{
              boxShadow: '0 6px 0 -1px rgba(203,213,225,0.7), inset 0 2px 6px rgba(255,255,255,0.9)',
            }}
            aria-live="polite"
          >
            {formatClock(seconds)}
          </p>
          <p className="mt-1 text-xs text-slate-500">สลับบทบาทแล้ว {switchCount} ครั้ง</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
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
          <Button variant="purple" onClick={markSwitched}>
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            สลับบทบาทแล้ว
          </Button>
        </div>
      </div>

      <p className="mt-4 rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
        เมื่อกดเริ่มกิจกรรมแล้ว ตัวจับเวลาจะไปเกาะอยู่มุมซ้ายล่างของหน้าจอทุกหน้า
        เวลาจะเดินต่อเนื่องแม้สลับไปหน้าอื่น กดที่ตัวเลขเพื่อเปิดปุ่มควบคุมได้ทุกเมื่อ
      </p>

      {timeUp && (
        <p
          className="mt-3 flex animate-pop items-start gap-2 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-3.5 py-3 text-sm font-semibold text-peach-900"
          role="alert"
        >
          <Bell className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ถึงเวลาสลับบทบาท Driver และ Navigator แล้ว เมื่อสลับเสร็จให้กดปุ่ม &quot;สลับบทบาทแล้ว&quot;
        </p>
      )}
    </Card>
  );
};
