import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Pause, Play, RefreshCw, Repeat2, Timer } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import { formatClock } from '../utils/format';
import { Button, Card } from './Ui';

/**
 * นาฬิกาจับเวลาสำหรับสลับบทบาท Driver / Navigator
 * ตั้งต้น 10 นาที ตามข้อกำหนดของกิจกรรม Pair Programming
 */
export const RoleTimer = () => {
  const { state, update } = useApp();
  const { notify } = useToast();
  const [seconds, setSeconds] = useState(APP_CONFIG.roleSwitchSeconds);
  const [running, setRunning] = useState(false);
  const [alerted, setAlerted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      stopInterval();
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return stopInterval;
  }, [running, stopInterval]);

  useEffect(() => {
    if (seconds === 0 && running && !alerted) {
      setRunning(false);
      setAlerted(true);
      notify('ถึงเวลาสลับบทบาท Driver และ Navigator แล้ว', 'warn');
    }
  }, [seconds, running, alerted, notify]);

  const handleReset = () => {
    setRunning(false);
    setAlerted(false);
    setSeconds(APP_CONFIG.roleSwitchSeconds);
  };

  const handleSwitched = () => {
    update((prev) => ({
      session: {
        ...prev.session,
        roleSwitchCount: prev.session.roleSwitchCount + 1,
        lastRoleSwitchAt: new Date().toISOString(),
      },
    }));
    handleReset();
    notify('บันทึกการสลับบทบาทเรียบร้อยแล้ว เริ่มจับเวลารอบใหม่ได้', 'success');
  };

  const timeUp = seconds === 0;

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
            style={{ boxShadow: '0 6px 0 -1px rgba(203,213,225,0.7), inset 0 2px 6px rgba(255,255,255,0.9)' }}
            aria-live="polite"
          >
            {formatClock(seconds)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            สลับบทบาทแล้ว {state.session.roleSwitchCount} ครั้ง
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {running ? (
            <Button variant="secondary" onClick={() => setRunning(false)}>
              <Pause className="h-4 w-4" aria-hidden="true" />
              Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                if (seconds === 0) handleReset();
                setAlerted(false);
                setRunning(true);
              }}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start
            </Button>
          )}
          <Button variant="secondary" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
          <Button variant="purple" onClick={handleSwitched}>
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            สลับบทบาทแล้ว
          </Button>
        </div>
      </div>

      {timeUp && (
        <p
          className="mt-4 flex animate-pop items-start gap-2 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-3.5 py-3 text-sm font-semibold text-peach-900"
          role="alert"
        >
          <Bell className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ถึงเวลาสลับบทบาท Driver และ Navigator แล้ว เมื่อสลับเสร็จให้กดปุ่ม &quot;สลับบทบาทแล้ว&quot;
        </p>
      )}
    </Card>
  );
};
