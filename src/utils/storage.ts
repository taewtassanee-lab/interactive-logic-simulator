import { APP_CONFIG } from '../config';
import type { AppState, PersonReflection, WorksheetData } from '../types';

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
    q1Observation: '',
    q2FillIn: '',
    q3Choice: '',
    q4RandomLogic: '',
    q5NoDeleteEffect: '',
    debugRows: [
      {
        point: 'จุดที่ 1 ระบบสุ่ม',
        symptom: 'สุ่มได้ข้อสอบข้อเดิมซ้ำ ๆ ไม่เปลี่ยนข้อ',
        cause: '',
        fix: '',
        evidence: '',
      },
      {
        point: 'จุดที่ 2 เงื่อนไขจบเกม',
        symptom: 'ทำข้อสอบครบแล้วแต่ไม่ยอมเปลี่ยนไปหน้าสรุปผล',
        cause: '',
        fix: '',
        evidence: '',
      },
    ],
    q3AppHelp: '',
    reflections: [
      { rolesPlayed: { driver: false, navigator: false }, partnerGood: '', toImprove: '', collaborationRating: 0 },
      { rolesPlayed: { driver: false, navigator: false }, partnerGood: '', toImprove: '', collaborationRating: 0 },
    ],
  },
  capxFile: null,
  lastDebugLog: [],
  pdfGeneratedAt: null,
});

/**
 * ย้ายคำตอบส่วนที่ 3 จากรูปแบบเดิมที่มีช่องเดียวต่อคู่ มาเป็นแยกรายคน
 *
 * ข้อมูลเดิมที่นักเรียนพิมพ์ไว้แล้วจะถูกยกไปเป็นคำตอบของผู้เรียนคนที่ 1
 * เพื่อไม่ให้คำตอบที่กรอกไปแล้วหายไปเมื่ออัปเดตระบบ
 */
type LegacyWorksheet = Partial<WorksheetData> & {
  rolesPlayed?: { driver?: boolean; navigator?: boolean };
  q3PartnerGood?: string;
  q3ToImprove?: string;
  collaborationRating?: number;
};

const emptyReflection = (): PersonReflection => ({
  rolesPlayed: { driver: false, navigator: false },
  partnerGood: '',
  toImprove: '',
  collaborationRating: 0,
});

const mergeReflections = (saved?: LegacyWorksheet): [PersonReflection, PersonReflection] => {
  const list = saved?.reflections;
  if (Array.isArray(list) && list.length === 2) {
    return [
      { ...emptyReflection(), ...list[0], rolesPlayed: { ...emptyReflection().rolesPlayed, ...list[0]?.rolesPlayed } },
      { ...emptyReflection(), ...list[1], rolesPlayed: { ...emptyReflection().rolesPlayed, ...list[1]?.rolesPlayed } },
    ];
  }
  const legacy: PersonReflection = {
    rolesPlayed: {
      driver: Boolean(saved?.rolesPlayed?.driver),
      navigator: Boolean(saved?.rolesPlayed?.navigator),
    },
    partnerGood: saved?.q3PartnerGood ?? '',
    toImprove: saved?.q3ToImprove ?? '',
    collaborationRating: Number(saved?.collaborationRating) || 0,
  };
  return [legacy, emptyReflection()];
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
      reflections: mergeReflections(saved.worksheet),
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
