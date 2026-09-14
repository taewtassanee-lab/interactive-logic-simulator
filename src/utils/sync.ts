import { SYNC_CONFIG } from '../config';
import type { AppState } from '../types';
import { getWorksheetProgress } from './format';

/**
 * ส่งความก้าวหน้าของแต่ละคู่ไปเก็บที่ Google Sheets ผ่าน Apps Script
 *
 * หลักการที่ยึดไว้
 * 1) ส่งเฉพาะ "สรุปความก้าวหน้า" ไม่ส่งคำตอบเรียงความในใบงาน
 *    คำตอบฉบับเต็มอยู่ในไฟล์ PDF ที่นักเรียนส่งเองอยู่แล้ว จึงไม่ต้องเก็บซ้ำบนเซิร์ฟเวอร์
 * 2) ถ้าไม่ได้ตั้งค่า endpoint ระบบจะทำงานเหมือนเดิมทุกประการ (เก็บใน localStorage อย่างเดียว)
 * 3) ถ้าส่งไม่สำเร็จ ต้องไม่กระทบการทำกิจกรรมของนักเรียน เก็บสถานะไว้เฉย ๆ
 */

export interface ProgressRow {
  classroom: string;
  pairCode: string;
  driverName: string;
  driverNumber: string;
  navigatorName: string;
  navigatorNumber: string;
  mission1Passed: boolean;
  mission2Passed: boolean;
  bestScore: number;
  worksheetPercent: number;
  pdfGenerated: boolean;
  capxFileName: string;
  roleSwitchCount: number;
  /* ---------- ร่องรอยการทำกิจกรรมจำลอง ใช้ทำรายงานรายคู่ ---------- */
  runCount: number;
  hintsUsed: number;
  blockCount: number;
  /** เวลาที่ผ่านภารกิจแต่ละข้อครั้งแรก */
  mission1At: string;
  mission2At: string;
  /** สรุป Debug Log รอบล่าสุด เก็บเป็นข้อความบรรทัดเดียวเพื่อลงเซลล์เดียว */
  debugLog: string;
  updatedAt?: string;
  deviceId?: string;
}

export type SyncStatus = 'off' | 'idle' | 'sending' | 'ok' | 'error';

const DEVICE_ID_KEY = 'ils_device_id';

/** รหัสเครื่องแบบสุ่ม ใช้ช่วยครูไล่ดูว่าข้อมูลมาจากเครื่องไหนเวลามีปัญหา */
const getDeviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
};

export const isSyncEnabled = (): boolean => Boolean(SYNC_CONFIG.endpoint.trim());

export const buildProgressRow = (state: AppState): ProgressRow => ({
  classroom: state.pair.classroom.trim(),
  pairCode: state.pair.pairCode.trim(),
  driverName: state.pair.driverName.trim(),
  driverNumber: state.pair.driverNumber.trim(),
  navigatorName: state.pair.navigatorName.trim(),
  navigatorNumber: state.pair.navigatorNumber.trim(),
  mission1Passed: state.missions.mission1Passed,
  mission2Passed: state.missions.mission2Passed,
  bestScore: state.missions.bestScore,
  worksheetPercent: getWorksheetProgress(state.worksheet),
  pdfGenerated: Boolean(state.pdfGeneratedAt),
  capxFileName: state.capxFile?.name ?? '',
  roleSwitchCount: state.session.roleSwitchCount,
  runCount: state.missions.runCount,
  hintsUsed: state.missions.hintsUsed,
  blockCount: state.missions.lastBlockCount,
  mission1At: state.missions.mission1At ?? '',
  mission2At: state.missions.mission2At ?? '',
  /**
   * ส่ง Debug Log ไปด้วยเพื่อให้ครูเห็นกระบวนการแก้ Bug ไม่ใช่แค่ผลผ่านหรือไม่ผ่าน
   * ตัดเหลือ 40 บรรทัดท้ายสุด กันเซลล์ในชีตยาวเกินขีดจำกัด
   * ยังคงหลักเดิมคือไม่ส่งข้อความเรียงความในใบงานขึ้นเซิร์ฟเวอร์
   */
  debugLog: state.lastDebugLog
    .slice(-40)
    .map((l) => `${l.time} ${l.message}`)
    .join(' | '),
  deviceId: getDeviceId(),
});

/** ส่งจริงเมื่อข้อมูลเปลี่ยนเท่านั้น ป้องกันการยิงซ้ำโดยไม่จำเป็น */
let lastPayload = '';

export const syncProgress = async (state: AppState): Promise<SyncStatus> => {
  if (!isSyncEnabled()) return 'off';
  if (!state.session.activityStarted) return 'idle';

  const payload = buildProgressRow(state);
  if (!payload.classroom || !payload.pairCode) return 'idle';

  const body = JSON.stringify({ secret: SYNC_CONFIG.classSecret, payload });
  if (body === lastPayload) return 'idle';

  try {
    const res = await fetch(SYNC_CONFIG.endpoint, {
      method: 'POST',
      // ใช้ text/plain เพื่อให้เป็น simple request เบราว์เซอร์จะไม่ยิง preflight
      // ซึ่ง Google Apps Script ไม่รองรับ (ตัว Apps Script อ่าน body เป็น JSON เองอยู่แล้ว)
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    const data = (await res.json()) as { ok?: boolean };
    if (!data.ok) return 'error';
    lastPayload = body;
    return 'ok';
  } catch {
    return 'error';
  }
};

export interface DashboardResult {
  ok: boolean;
  rows: ProgressRow[];
  error?: string;
}

/** ดึงข้อมูลทุกคู่มาแสดงในแดชบอร์ดของครู */
export const fetchDashboard = async (teacherKey: string): Promise<DashboardResult> => {
  if (!isSyncEnabled()) {
    return { ok: false, rows: [], error: 'ยังไม่ได้ตั้งค่าที่เก็บข้อมูล' };
  }
  try {
    const url = `${SYNC_CONFIG.endpoint}?key=${encodeURIComponent(teacherKey)}&t=${Date.now()}`;
    const res = await fetch(url);
    const data = (await res.json()) as { ok?: boolean; rows?: ProgressRow[]; error?: string };
    if (!data.ok) {
      return { ok: false, rows: [], error: data.error || 'รหัสครูไม่ถูกต้อง' };
    }
    /**
     * แถวที่บันทึกไว้ก่อนระบบเริ่มเก็บร่องรอยการทำกิจกรรมจำลอง จะไม่มีช่องเหล่านี้เลย
     * เติมค่าศูนย์ให้ครบ หน้ารายงานจะได้แสดงเลข 0 แทนที่จะเป็นช่องว่างลอย ๆ
     */
    const rows = (data.rows ?? []).map((r) => ({
      ...r,
      runCount: Number(r.runCount) || 0,
      hintsUsed: Number(r.hintsUsed) || 0,
      blockCount: Number(r.blockCount) || 0,
      mission1At: r.mission1At ?? '',
      mission2At: r.mission2At ?? '',
      debugLog: r.debugLog ?? '',
    }));
    return { ok: true, rows };
  } catch {
    return {
      ok: false,
      rows: [],
      error: 'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตและลิงก์ Apps Script',
    };
  }
};

/**
 * ลบข้อมูลของคู่ใดคู่หนึ่งออกจาก Google Sheets
 * ใช้รหัสครูเป็นตัวยืนยันสิทธิ์ นักเรียนที่มีแต่รหัสห้องเรียนสั่งลบไม่ได้
 */
export const deletePairRow = async (
  teacherKey: string,
  classroom: string,
  pairCode: string,
): Promise<{ ok: boolean; error?: string }> => {
  if (!isSyncEnabled()) return { ok: false, error: 'ยังไม่ได้ตั้งค่าที่เก็บข้อมูล' };
  try {
    const res = await fetch(SYNC_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', teacherKey, classroom, pairCode }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!data.ok) {
      // สคริปต์รุ่นเก่ายังไม่รู้จักคำสั่ง delete จึงตีความเป็นการเขียนข้อมูลแล้วฟ้องเรื่องรหัสห้องเรียน
      const outdated = (data.error ?? '').includes('รหัสห้องเรียน');
      return {
        ok: false,
        error: outdated
          ? 'สคริปต์ใน Google Sheets ยังเป็นรุ่นเก่าที่ยังลบข้อมูลไม่ได้ ให้อัปเดตโค้ด Apps Script แล้ว Deploy รุ่นใหม่ก่อน'
          : (data.error ?? 'ลบข้อมูลไม่สำเร็จ'),
      };
    }
    // ล้างแคชการส่งข้อมูล เพื่อให้รอบถัดไปส่งค่าใหม่ได้แม้ข้อมูลจะเหมือนเดิม
    lastPayload = '';
    return { ok: true };
  } catch {
    return { ok: false, error: 'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' };
  }
};

/** แปลงข้อมูลเป็นไฟล์ CSV ให้ครูดาวน์โหลดไปทำคะแนนต่อ */
export const rowsToCsv = (rows: ProgressRow[]): string => {
  const headers = [
    'ห้องเรียน',
    'รหัสคู่',
    'ชื่อ Driver',
    'เลขที่ Driver',
    'ชื่อ Navigator',
    'เลขที่ Navigator',
    'ภารกิจ 1',
    'ภารกิจ 2',
    'คะแนนจำลอง',
    'ใบงาน (%)',
    'สร้าง PDF',
    'ไฟล์ .capx',
    'สลับบทบาท',
    'กด Run (ครั้ง)',
    'เปิดคำใบ้ (ครั้ง)',
    'บล็อกที่วาง',
    'ผ่านภารกิจ 1 เมื่อ',
    'ผ่านภารกิจ 2 เมื่อ',
    'Debug Log',
    'อัปเดตล่าสุด',
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.classroom,
      r.pairCode,
      r.driverName,
      r.driverNumber,
      r.navigatorName,
      r.navigatorNumber,
      r.mission1Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
      r.mission2Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
      r.bestScore,
      r.worksheetPercent,
      r.pdfGenerated ? 'แล้ว' : 'ยังไม่ได้สร้าง',
      r.capxFileName,
      r.roleSwitchCount,
      r.runCount,
      r.hintsUsed,
      r.blockCount,
      r.mission1At ? new Date(r.mission1At).toLocaleString('th-TH') : '',
      r.mission2At ? new Date(r.mission2At).toLocaleString('th-TH') : '',
      r.debugLog,
      r.updatedAt ? new Date(r.updatedAt).toLocaleString('th-TH') : '',
    ]
      .map(esc)
      .join(','),
  );
  // ใส่ BOM เพื่อให้ Excel เปิดไฟล์ภาษาไทยได้ถูกต้อง
  return '﻿' + [headers.map(esc).join(','), ...lines].join('\n');
};
