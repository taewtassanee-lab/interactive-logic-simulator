import { APP_CONFIG } from '../config';
import type { AppState, WorksheetData } from '../types';

export const createInitialState = (): AppState => ({
  pair: {
    classroom: '',
    pairCode: '',
    driverName: '',
    driverNumber: '',
    navigatorName: '',
    navigatorNumber: '',
  },
  session: {
    deviceMode: 'primary',
    activityStarted: false,
    roleSwitchCount: 0,
    lastRoleSwitchAt: null,
    driverIsFirstPerson: true,
    roleSwitchLog: [],
  },
  workspace: [],
  missions: {
    mission1Passed: false,
    mission2Passed: false,
    bestScore: 0,
    runCount: 0,
    hintsUsed: 0,
    mission1At: null,
    mission2At: null,
    lastBlockCount: 0,
  },
  worksheet: {
    goal: '',
    q1Observation: '',
    q2FillIn: '',
    q3Choice: '',
    q4RandomLogic: '',
    debugRows: [
      {
        point: 'จุดที่ 1 ระบบสุ่ม',
        symptom: 'สุ่มได้ข้อสอบข้อเดิมซ้ำ ๆ ไม่เปลี่ยนข้อ',
        plan: '',
        cause: '',
        fix: '',
        evidence: '',
      },
      {
        point: 'จุดที่ 2 เงื่อนไขจบเกม',
        symptom: 'ทำข้อสอบครบแล้วแต่ไม่ยอมเปลี่ยนไปหน้าสรุปผล',
        plan: '',
        cause: '',
        fix: '',
        evidence: '',
      },
    ],
    q4Extend: '',
  },
  capxFile: null,
  lastDebugLog: [],
  pdfGeneratedAt: null,
});

/**
 * ข้อมูลใบงานรุ่นก่อน ๆ ที่ยังอาจค้างอยู่ในเบราว์เซอร์ของผู้เรียน
 *
 * ใบงานเคยมีช่องเป้าหมายแยกสองช่อง ช่องความเห็นต่อสื่อ และช่องสะท้อนตนเองรายคน
 * ตอนนี้ตัดออกและย้ายการสะท้อนตนเองไปเป็นกิจกรรมสดแล้ว
 * แต่ยังต้องรับข้อมูลเก่าเพื่อไม่ให้สิ่งที่ผู้เรียนพิมพ์ไว้แล้วหายไปเฉย ๆ
 */
type LegacyWorksheet = Partial<WorksheetData> & {
  goalTarget?: string;
  goalHow?: string;
};

/** ต่อเป้าหมายกับข้อตกลงของรุ่นเก่าเข้าด้วยกัน ให้กลายเป็นช่องเดียวของรุ่นปัจจุบัน */
const mergeGoal = (saved?: LegacyWorksheet): string => {
  if (saved?.goal?.trim()) return saved.goal;
  return [saved?.goalTarget, saved?.goalHow].map((t) => t?.trim()).filter(Boolean).join(' ');
};

/** รวมข้อมูลที่โหลดมากับค่าเริ่มต้น กัน error เมื่อเวอร์ชันข้อมูลเก่าไม่มีบางฟิลด์ */
const mergeState = (saved: Partial<AppState>): AppState => {
  const base = createInitialState();
  return {
    ...base,
    ...saved,
    pair: { ...base.pair, ...(saved.pair ?? {}) },
    session: {
      ...base.session,
      ...(saved.session ?? {}),
      roleSwitchLog: Array.isArray(saved.session?.roleSwitchLog) ? saved.session.roleSwitchLog : [],
    },
    missions: { ...base.missions, ...(saved.missions ?? {}) },
    worksheet: {
      ...base.worksheet,
      ...(saved.worksheet ?? {}),
      goal: mergeGoal(saved.worksheet),
      debugRows:
        saved.worksheet?.debugRows && saved.worksheet.debugRows.length === 2
          ? saved.worksheet.debugRows.map((row, i) => ({
              ...base.worksheet.debugRows[i],
              ...row,
              // หัวข้อ 2 ช่องแรกเป็นข้อความคงที่ตามใบงาน ไม่ให้ข้อมูลเก่าเขียนทับ
              point: base.worksheet.debugRows[i].point,
              symptom: base.worksheet.debugRows[i].symptom,
            }))
          : base.worksheet.debugRows,
    },
    workspace: Array.isArray(saved.workspace) ? saved.workspace : base.workspace,
    lastDebugLog: Array.isArray(saved.lastDebugLog) ? saved.lastDebugLog : [],
  };
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return createInitialState();
    return mergeState(JSON.parse(raw) as Partial<AppState>);
  } catch {
    // ข้อมูลเสียหายหรือเบราว์เซอร์ปิด localStorage ให้เริ่มใหม่แทนการทำให้แอปพัง
    return createInitialState();
  }
};

export const saveState = (state: AppState): boolean => {
  try {
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(APP_CONFIG.storageKey);
  } catch {
    /* ไม่ต้องทำอะไร ถ้าลบไม่ได้ก็ยังใช้งานต่อได้ */
  }
};
