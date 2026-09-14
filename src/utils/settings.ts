import { APP_CONFIG, SYNC_CONFIG, TEACHER_INFO } from '../config';
import type { AppSettings } from '../types/settings';

/**
 * อ่านและบันทึกค่าตั้งระบบผ่าน Apps Script
 *
 * หลักที่ยึดไว้: ค่าตั้งเป็นของเสริม ไม่ใช่ของจำเป็น
 * ถ้าดึงไม่ได้ด้วยเหตุใดก็ตาม ระบบต้องใช้ค่าตั้งต้นในโค้ดแล้วเดินต่อได้ทันที
 * ห้ามให้หน้าจอนักเรียนค้างรอค่าตั้งเด็ดขาด
 */

const CACHE_KEY = 'ils_settings_cache_v1';

/** ค่าตั้งต้นที่มาจากโค้ด ใช้เมื่อครูยังไม่เคยตั้งค่าหรือดึงค่าไม่ได้ */
export const defaultSettings = (): AppSettings => ({
  version: 0,
  updatedAt: '',
  teacherName: TEACHER_INFO.name,
  teacherFormalName: TEACHER_INFO.formalName,
  teacherPosition: TEACHER_INFO.position,
  school: TEACHER_INFO.school,
  courseLabel: APP_CONFIG.courseLabel,
  courseName: APP_CONFIG.courseName,
  gradeLevel: APP_CONFIG.gradeLevel,
  semester: APP_CONFIG.semester,
  unitName: APP_CONFIG.unitName,
  roleSwitchMinutes: Math.round(APP_CONFIG.roleSwitchSeconds / 60),
  visibleTabs: ['start', 'knowledge', 'simulator', 'live', 'worksheet', 'summary', 'teacher', 'dashboard'],
  activityOverrides: {},
  pretestQuestions: null,
});

/** เติมช่องที่ขาดด้วยค่าตั้งต้น กันค่าตั้งรุ่นเก่าที่ยังไม่มีบางช่องทำให้หน้าจอพัง */
export const mergeSettings = (raw: unknown): AppSettings => {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<AppSettings>;
  const minutes = Number(s.roleSwitchMinutes);
  return {
    ...base,
    ...s,
    // ค่าที่ผิดรูปอาจทำให้ตัวจับเวลาพัง จึงบังคับให้อยู่ในช่วงที่ใช้สอนได้จริง
    roleSwitchMinutes: Number.isFinite(minutes) && minutes >= 1 && minutes <= 60 ? Math.round(minutes) : base.roleSwitchMinutes,
    visibleTabs: Array.isArray(s.visibleTabs) && s.visibleTabs.length ? s.visibleTabs : base.visibleTabs,
    activityOverrides:
      s.activityOverrides && typeof s.activityOverrides === 'object' ? s.activityOverrides : {},
    pretestQuestions: Array.isArray(s.pretestQuestions) && s.pretestQuestions.length
      ? s.pretestQuestions
      : null,
  };
};

export const loadCachedSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? mergeSettings(JSON.parse(raw)) : defaultSettings();
  } catch {
    return defaultSettings();
  }
};

const cacheSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    /* เบราว์เซอร์ปิด localStorage ไว้ ยังใช้งานต่อได้ เพียงแต่ต้องดึงใหม่ทุกครั้งที่เปิด */
  }
};

const timedFetch = async (url: string, init: RequestInit, ms: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * ดึงค่าตั้งจากเซิร์ฟเวอร์ ใช้ตอนเปิดแอป
 * ตั้งเวลารอไว้สั้น เพราะถ้าช้าก็ใช้ค่าที่แคชไว้ไปก่อนได้ ไม่ควรถ่วงการเปิดหน้า
 */
export const fetchSettings = async (): Promise<AppSettings | null> => {
  if (!SYNC_CONFIG.endpoint.trim()) return null;
  try {
    const qs = new URLSearchParams({
      action: 'getSettings',
      classSecret: SYNC_CONFIG.classSecret,
      t: String(Date.now()),
    }).toString();
    const res = await timedFetch(`${SYNC_CONFIG.endpoint}?${qs}`, {}, 12000);
    const data = (await res.json()) as { ok?: boolean; settings?: unknown };
    if (!data.ok || !data.settings) return null;
    const merged = mergeSettings(data.settings);
    cacheSettings(merged);
    return merged;
  } catch {
    return null;
  }
};

export const saveSettings = async (
  teacherKey: string,
  settings: AppSettings,
): Promise<{ ok: boolean; error?: string; settings?: AppSettings }> => {
  if (!SYNC_CONFIG.endpoint.trim()) {
    return { ok: false, error: 'ยังไม่ได้ตั้งค่าที่เก็บข้อมูล' };
  }
  const next: AppSettings = {
    ...settings,
    version: settings.version + 1,
    updatedAt: new Date().toISOString(),
  };
  try {
    const res = await timedFetch(
      SYNC_CONFIG.endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveSettings', teacherKey, settings: next }),
      },
      25000,
    );
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      const error = data.error ?? 'บันทึกค่าตั้งไม่สำเร็จ';
      const outdated = error.includes('รหัสห้องเรียน') || error.includes('ไม่รู้จัก');
      return {
        ok: false,
        error: outdated
          ? 'สคริปต์ใน Google Sheets ยังเป็นรุ่นเก่า ยังไม่รองรับการตั้งค่า ให้อัปเดตโค้ด Apps Script แล้ว Deploy รุ่นใหม่ก่อน'
          : error,
      };
    }
    cacheSettings(next);
    return { ok: true, settings: next };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    return {
      ok: false,
      error:
        name === 'AbortError'
          ? 'เซิร์ฟเวอร์ตอบช้าเกินไป รอสักครู่แล้วลองอีกครั้ง'
          : 'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
    };
  }
};
