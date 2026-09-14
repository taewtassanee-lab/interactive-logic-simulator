import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchSettings, loadCachedSettings } from '../utils/settings';
import type { AppSettings } from '../types/settings';

/**
 * ค่าตั้งระบบระดับแอป
 *
 * เริ่มจากค่าที่แคชไว้ในเครื่องทันที หน้าจอจึงขึ้นได้เลยโดยไม่ต้องรอเครือข่าย
 * แล้วค่อยดึงค่าล่าสุดจากเซิร์ฟเวอร์มาทับทีหลังเมื่อได้
 */
interface SettingsValue {
  settings: AppSettings;
  /** true ระหว่างกำลังดึงค่าครั้งแรก ใช้เฉพาะหน้าตั้งค่าของครู */
  loading: boolean;
  /** ดึงค่าล่าสุดจากเซิร์ฟเวอร์ใหม่ */
  reload: () => Promise<void>;
  /** ใช้หลังครูบันทึกค่าตั้งสำเร็จ เพื่อให้จอครูเห็นผลทันที */
  applyLocal: (next: AppSettings) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => loadCachedSettings());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const fresh = await fetchSettings();
    setLoading(false);
    if (fresh) setSettings(fresh);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ settings, loading, reload, applyLocal: setSettings }),
    [settings, loading, reload],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings ต้องใช้ภายใน <SettingsProvider> เท่านั้น');
  return ctx;
};
