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
import type { AppState } from '../types';
import { clearState, createInitialState, loadState, saveState } from '../utils/storage';
import { isSyncEnabled, syncProgress, type SyncStatus } from '../utils/sync';
import { clearIdentity } from '../utils/live';
import { SYNC_CONFIG } from '../config';

interface AppContextValue {
  state: AppState;
  /** อัปเดตสถานะแบบบางส่วน แล้วบันทึกลง localStorage อัตโนมัติ */
  update: (patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => void;
  resetAll: () => void;
  /** เพิ่มขึ้นทุกครั้งที่กด Reset ใช้ให้หน้าที่เก็บ state แยกของตัวเองรู้ว่าต้องล้างตาม */
  resetToken: number;
  /** เวลาที่บันทึกล่าสุด ใช้แสดงข้อความ "บันทึกอัตโนมัติแล้ว" */
  lastSavedAt: Date | null;
  /** สถานะการส่งข้อมูลขึ้นแดชบอร์ดของครู */
  syncStatus: SyncStatus;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSyncEnabled() ? 'idle' : 'off');
  const [resetToken, setResetToken] = useState(0);
  const firstRender = useRef(true);

  // บันทึกอัตโนมัติแบบหน่วงเวลา ลดการเขียน localStorage ขณะพิมพ์ใบงาน
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      if (saveState(state)) setLastSavedAt(new Date());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state]);

  // ส่งความก้าวหน้าขึ้น Google Sheets แบบหน่วงเวลา ไม่รบกวนการทำงานของนักเรียน
  useEffect(() => {
    // เครื่อง Navigator ไม่ส่งข้อมูล กันการเขียนทับข้อมูลของเครื่อง Driver ในคู่เดียวกัน
    if (!isSyncEnabled() || !state.session.activityStarted) return;
    if (state.session.deviceMode !== 'primary') return;
    const timer = window.setTimeout(async () => {
      setSyncStatus('sending');
      setSyncStatus(await syncProgress(state));
    }, SYNC_CONFIG.debounceMs);
    return () => window.clearTimeout(timer);
  }, [state]);

  const update = useCallback<AppContextValue['update']>((patch) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    // ข้อมูลผู้ตอบกิจกรรมสดเก็บคนละคีย์กับข้อมูลคู่ ต้องลบด้วย
    // ไม่งั้นห้องเดิมจะค้าง แล้วผู้เรียนคาบถัดไปจะไม่เห็นโจทย์
    clearIdentity();
    setState(createInitialState());
    setLastSavedAt(null);
    setSyncStatus(isSyncEnabled() ? 'idle' : 'off');
    setResetToken((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ state, update, resetAll, resetToken, lastSavedAt, syncStatus }),
    [state, update, resetAll, resetToken, lastSavedAt, syncStatus],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp ต้องใช้ภายใน <AppProvider> เท่านั้น');
  return ctx;
};
