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

interface AppContextValue {
  state: AppState;
  /** อัปเดตสถานะแบบบางส่วน แล้วบันทึกลง localStorage อัตโนมัติ */
  update: (patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => void;
  resetAll: () => void;
  /** เวลาที่บันทึกล่าสุด ใช้แสดงข้อความ "บันทึกอัตโนมัติแล้ว" */
  lastSavedAt: Date | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
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

  const update = useCallback<AppContextValue['update']>((patch) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState(createInitialState());
    setLastSavedAt(null);
  }, []);

  const value = useMemo(
    () => ({ state, update, resetAll, lastSavedAt }),
    [state, update, resetAll, lastSavedAt],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp ต้องใช้ภายใน <AppProvider> เท่านั้น');
  return ctx;
};
