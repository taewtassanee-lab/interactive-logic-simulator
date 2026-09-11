import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { APP_CONFIG } from '../config';
import { useApp } from './AppContext';
import { useToast } from '../components/Toast';

/**
 * สถานะของนาฬิกาสลับบทบาท เก็บไว้ระดับแอปทั้งหมด
 *
 * เหตุผล: เดิมเก็บ state ไว้ในคอมโพเนนต์ที่อยู่ในหน้าเริ่มต้นใช้งาน
 * พอผู้เรียนสลับไปแท็บอื่น คอมโพเนนต์ถูกถอดออกจากหน้าจอ เวลาที่เดินไปแล้วจึงหายหมด
 * ย้ายมาไว้ที่นี่เพื่อให้เวลาเดินต่อเนื่องไม่ว่าจะอยู่แท็บไหน
 */
interface RoleTimerValue {
  seconds: number;
  running: boolean;
  timeUp: boolean;
  switchCount: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  markSwitched: () => void;
}

const RoleTimerContext = createContext<RoleTimerValue | null>(null);

export const RoleTimerProvider = ({ children }: { children: ReactNode }) => {
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

  const start = useCallback(() => {
    setSeconds((prev) => (prev === 0 ? APP_CONFIG.roleSwitchSeconds : prev));
    setAlerted(false);
    setRunning(true);
  }, []);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setAlerted(false);
    setSeconds(APP_CONFIG.roleSwitchSeconds);
  }, []);

  const markSwitched = useCallback(() => {
    update((prev) => ({
      session: {
        ...prev.session,
        roleSwitchCount: prev.session.roleSwitchCount + 1,
        lastRoleSwitchAt: new Date().toISOString(),
      },
    }));
    reset();
    notify('บันทึกการสลับบทบาทเรียบร้อยแล้ว เริ่มจับเวลารอบใหม่ได้', 'success');
  }, [notify, reset, update]);

  const value = useMemo(
    () => ({
      seconds,
      running,
      timeUp: seconds === 0,
      switchCount: state.session.roleSwitchCount,
      start,
      pause,
      reset,
      markSwitched,
    }),
    [seconds, running, state.session.roleSwitchCount, start, pause, reset, markSwitched],
  );

  return <RoleTimerContext.Provider value={value}>{children}</RoleTimerContext.Provider>;
};

export const useRoleTimer = (): RoleTimerValue => {
  const ctx = useContext(RoleTimerContext);
  if (!ctx) throw new Error('useRoleTimer ต้องใช้ภายใน <RoleTimerProvider> เท่านั้น');
  return ctx;
};
