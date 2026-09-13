import { SYNC_CONFIG } from '../config';
import type { LiveIdentity, LiveResponse, LiveSession } from '../types/live';

/**
 * ตัวเชื่อมต่อ "กิจกรรมสด" กับ Google Apps Script
 *
 * ข้อจำกัดที่ออกแบบเผื่อไว้
 * 1) เครื่องนักเรียนถามหากิจกรรมเฉพาะตอนเปิดหน้านี้อยู่และแท็บไม่ได้ถูกซ่อน
 *    ทำให้ไม่มีคำขอค้างเมื่อนักเรียนสลับไปทำอย่างอื่น
 *    คำสั่ง livePoll อ่านค่าจาก Script Properties อย่างเดียว ไม่ได้เปิดสเปรดชีต จึงเบามาก
 * 2) ใช้ชื่อฟิลด์ classSecret แทน secret โดยตั้งใจ เพื่อให้สคริปต์รุ่นเก่าที่ยังไม่รู้จัก
 *    คำสั่งกิจกรรมสดปฏิเสธคำขอ แทนที่จะเผลอเขียนข้อมูลขยะลงชีตผลกิจกรรม
 * 3) ทุกฟังก์ชันคืนค่าเป็นผลลัพธ์ปกติ ไม่โยน error ออกไป เพื่อไม่ให้หน้าจอนักเรียนพัง
 */

/** จอครูถามหาคำตอบใหม่ทุกกี่มิลลิวินาที (เครื่องเดียว จึงถี่ได้) */
export const TEACHER_POLL_MS = 5000;

/**
 * เครื่องนักเรียนถามหากิจกรรมใหม่ทุกกี่มิลลิวินาที ขณะยังไม่ได้ตอบ
 *
 * คำสั่ง livePoll แค่อ่านค่าจาก Script Properties ใช้เวลาราว 0.3 วินาที
 * ไม่ได้เปิดสเปรดชีตเลย ห้องละ 60 เครื่องที่ทุก 6 วินาทีจึงเฉลี่ยราว 10 คำขอต่อวินาที
 * และมีงานทำพร้อมกันราว 3 งาน ยังห่างจากเพดาน 30 งานพร้อมกันของ Apps Script มาก
 */
export const STUDENT_POLL_MS = 6000;

/**
 * หลังส่งคำตอบแล้วยังถามต่อ แต่ห่างขึ้น เพื่อให้กิจกรรมถัดไปเด้งขึ้นเองโดยไม่ต้องกดปุ่ม
 * ช่วงนี้นักเรียนไม่ได้รอทำอะไร ความไวจึงไม่จำเป็นเท่าตอนรอโจทย์
 */
export const STUDENT_IDLE_POLL_MS = 15000;

const IDENTITY_KEY = 'ils_live_identity_v1';

/**
 * ทำชื่อห้องให้อยู่ในรูปเดียวกันก่อนใช้จับคู่ระหว่างจอครูกับเครื่องนักเรียน
 *
 * ในห้องเรียนจริงครูอาจพิมพ์ "ม.5/1" แต่นักเรียนพิมพ์ "5/1" หรือ "ม.5-1"
 * ถ้าเทียบตัวอักษรแบบตรงตัวจะกลายเป็นคนละห้อง นักเรียนก็จะไม่เห็นกิจกรรมเลย
 * ทั้งที่ทุกอย่างทำงานปกติ จึงตัดช่องว่าง ตัดคำนำหน้า ม. และถือขีดกลางเท่ากับทับ
 *
 * ใช้เฉพาะเป็นกุญแจจับคู่เท่านั้น ชื่อที่ผู้ใช้พิมพ์ยังแสดงตามเดิมบนหน้าจอ
 */
export const normalizeRoom = (value: string): string => {
  const core = String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/^ม\.?/, '')
    .replace(/[-–—]/g, '/')
    .toLowerCase();

  /**
   * เติมคำนำหน้า ม. กลับเข้าไปเมื่อเหลือแต่ตัวเลขกับเครื่องหมายทับ
   *
   * Google Sheets แปลงข้อความอย่าง "5/1" เป็นวันที่ให้เองโดยอัตโนมัติ
   * พอเขียนลงชีตแล้วอ่านกลับ ค่าจะกลายเป็นวันที่ ไม่ใช่ "5/1" อีกต่อไป
   * การจับคู่ห้องจึงพัง คำตอบเขียนลงได้แต่หาไม่เจอ โดยไม่มีข้อความแจ้งเตือนใด ๆ
   * การมีตัวอักษรไทยนำหน้าทำให้ Sheets เก็บเป็นข้อความเสมอ
   */
  return /^[\d/]+$/.test(core) ? `ม.${core}` : core;
};

export const isLiveEnabled = (): boolean => Boolean(SYNC_CONFIG.endpoint.trim());

/** ข้อความที่สคริปต์รุ่นเก่าตอบกลับมาเมื่อยังไม่รู้จักคำสั่งกิจกรรมสด */
const OUTDATED_HINT = 'สคริปต์ใน Google Sheets ยังเป็นรุ่นเก่า ยังไม่รองรับกิจกรรมสด ให้ครูอัปเดตโค้ด Apps Script แล้ว Deploy รุ่นใหม่ก่อน';

const looksOutdated = (error: string): boolean =>
  error.includes('รหัสห้องเรียน') || error.includes('รหัสครู') || error.includes('ไม่รู้จักคำสั่ง');

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  outdated?: boolean;
}

/**
 * ยิงคำขอพร้อมกำหนดเวลาสูงสุดและลองซ้ำอัตโนมัติ
 *
 * เน็ตโรงเรียนและไอแพดหลุดเป็นช่วง ๆ ได้ตลอด และ Apps Script เองก็ตอบช้าราว 2-4 วินาที
 * ถ้าพลาดครั้งเดียวแล้วขึ้นข้อความแดงทันที นักเรียนจะคิดว่าระบบเสียทั้งที่รอบถัดไปก็ผ่าน
 * จึงลองซ้ำให้เองก่อน แล้วค่อยรายงานว่าไม่สำเร็จจริง ๆ
 */
const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  { attempts, timeoutMs }: { attempts: number; timeoutMs: number },
): Promise<Response> => {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      lastError = err;
      // เว้นระยะก่อนลองใหม่ ให้เครือข่ายได้ตั้งหลัก
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 900 * (i + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('network');
};

/** ข้อความบอกสาเหตุที่อ่านรู้เรื่อง ช่วยให้แยกออกว่าเน็ตหลุดหรือรอนานเกินไป */
const describeNetworkError = (err: unknown): string => {
  const name = err instanceof Error ? err.name : '';
  if (name === 'AbortError') {
    return 'เซิร์ฟเวอร์ตอบช้าเกินไป รอสักครู่แล้วลองอีกครั้ง';
  }
  return 'เชื่อมต่อไม่สำเร็จ ตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองอีกครั้ง';
};

const post = async <T>(body: Record<string, unknown>): Promise<ApiResult<T>> => {
  if (!isLiveEnabled()) return { ok: false, error: 'ยังไม่ได้ตั้งค่าที่เก็บข้อมูล' };
  try {
    const res = await fetchWithRetry(
      SYNC_CONFIG.endpoint,
      {
        method: 'POST',
        // text/plain ทำให้เป็น simple request เบราว์เซอร์จึงไม่ยิง preflight ที่ Apps Script ไม่รองรับ
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      },
      // การส่งคำตอบสำคัญกว่าความเร็ว จึงรอนานกว่าและลองซ้ำมากกว่าตอนอ่านข้อมูล
      { attempts: 3, timeoutMs: 25000 },
    );
    const data = (await res.json()) as { ok?: boolean; error?: string } & T;
    if (!data.ok) {
      const error = data.error ?? 'ทำรายการไม่สำเร็จ';
      const outdated = looksOutdated(error);
      return { ok: false, error: outdated ? OUTDATED_HINT : error, outdated };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: describeNetworkError(err) };
  }
};

const get = async <T>(params: Record<string, string>): Promise<ApiResult<T>> => {
  if (!isLiveEnabled()) return { ok: false, error: 'ยังไม่ได้ตั้งค่าที่เก็บข้อมูล' };
  try {
    const qs = new URLSearchParams({ ...params, t: String(Date.now()) }).toString();
    const res = await fetchWithRetry(
      `${SYNC_CONFIG.endpoint}?${qs}`,
      {},
      { attempts: 2, timeoutMs: 15000 },
    );
    const data = (await res.json()) as { ok?: boolean; error?: string } & T;
    if (!data.ok) {
      const error = data.error ?? 'ดึงข้อมูลไม่สำเร็จ';
      const outdated = looksOutdated(error);
      return { ok: false, error: outdated ? OUTDATED_HINT : error, outdated };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: describeNetworkError(err) };
  }
};

/* ==================== ฝั่งครู ==================== */

/** เปิดกิจกรรมให้ทั้งห้องทำพร้อมกัน */
export const startLiveActivity = async (
  teacherKey: string,
  session: Omit<LiveSession, 'open' | 'openedAt'>,
): Promise<ApiResult<{ session: LiveSession }>> =>
  post<{ session: LiveSession }>({
    action: 'liveStart',
    teacherKey,
    ...session,
    classroom: normalizeRoom(session.classroom),
  });

/** ปิดรับคำตอบ แต่ยังเก็บคำตอบเดิมไว้ให้ดูบนจอ */
export const closeLiveActivity = async (
  teacherKey: string,
  classroom: string,
): Promise<ApiResult<unknown>> =>
  post({ action: 'liveClose', teacherKey, classroom: normalizeRoom(classroom) });

/** ดึงคำตอบทั้งหมดของกิจกรรมที่กำลังเปิดอยู่ */
export const fetchLiveResponses = async (
  teacherKey: string,
  classroom: string,
  activityId: string,
): Promise<ApiResult<{ responses: LiveResponse[]; session: LiveSession | null }>> => {
  const res = await get<{ responses?: LiveResponse[]; session?: LiveSession | null }>({
    action: 'liveResponses',
    key: teacherKey,
    classroom: normalizeRoom(classroom),
    activityId,
  });
  if (!res.ok) return res as ApiResult<{ responses: LiveResponse[]; session: LiveSession | null }>;
  // สคริปต์รุ่นเก่าตอบกลับเป็นรายการความก้าวหน้าแทน จึงไม่มีฟิลด์ responses
  if (!res.data || !Array.isArray(res.data.responses)) {
    return { ok: false, error: OUTDATED_HINT, outdated: true };
  }
  return {
    ok: true,
    data: { responses: res.data.responses, session: res.data.session ?? null },
  };
};

/** ลบคำตอบของกิจกรรมหนึ่งทิ้ง ใช้ตอนซ้อมก่อนสอนจริง */
export const clearLiveResponses = async (
  teacherKey: string,
  classroom: string,
  activityId: string,
): Promise<ApiResult<unknown>> =>
  post({ action: 'liveClear', teacherKey, classroom: normalizeRoom(classroom), activityId });

/** ดึงภาพ SOS ที่นักเรียนส่งมา คืนค่าเป็น data URL พร้อมแสดงบนจอ */
export const fetchSosImage = async (
  teacherKey: string,
  fileId: string,
): Promise<ApiResult<{ dataUrl: string }>> => {
  const res = await get<{ base64?: string; mimeType?: string }>({
    action: 'sosImage',
    key: teacherKey,
    fileId,
  });
  if (!res.ok) return res as ApiResult<{ dataUrl: string }>;
  if (!res.data?.base64) return { ok: false, error: 'ไม่พบไฟล์ภาพนี้' };
  const mime = res.data.mimeType || 'image/jpeg';
  return { ok: true, data: { dataUrl: `data:${mime};base64,${res.data.base64}` } };
};

/* ==================== ฝั่งนักเรียน ==================== */

/** ถามว่าตอนนี้ครูเปิดกิจกรรมอะไรอยู่ */
export const pollLiveSession = async (
  classroom: string,
): Promise<ApiResult<{ session: LiveSession | null }>> =>
  get<{ session: LiveSession | null }>({
    action: 'livePoll',
    classSecret: SYNC_CONFIG.classSecret,
    classroom: normalizeRoom(classroom),
  });

/** ส่งคำตอบเข้ากิจกรรมที่เปิดอยู่ */
export const submitLiveResponse = async (
  response: Omit<LiveResponse, 'submittedAt'>,
  image?: { base64: string; name: string },
): Promise<ApiResult<{ imageId?: string }>> =>
  post<{ imageId?: string }>({
    action: 'liveRespond',
    classSecret: SYNC_CONFIG.classSecret,
    response: { ...response, classroom: normalizeRoom(response.classroom) },
    image,
  });

/* ==================== ข้อมูลผู้ตอบบนเครื่องนี้ ==================== */

export const loadIdentity = (): LiveIdentity | null => {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LiveIdentity>;
    if (!parsed.studentName || !parsed.classroom) return null;
    return {
      classroom: parsed.classroom,
      studentName: parsed.studentName,
      studentNumber: parsed.studentNumber ?? '',
      pairCode: parsed.pairCode ?? '',
    };
  } catch {
    return null;
  }
};

export const saveIdentity = (identity: LiveIdentity): void => {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* เบราว์เซอร์บางเครื่องปิด localStorage ไว้ ปล่อยผ่านได้ ไม่กระทบการส่งคำตอบ */
  }
};

/* ==================== ตัวช่วยประมวลผลคำตอบ ==================== */

export interface WordCount {
  word: string;
  count: number;
}

/**
 * นับความถี่ของคำเพื่อทำคลาวด์คำ
 * รวมคำที่ต่างกันแค่ตัวพิมพ์เล็กใหญ่และช่องว่างเข้าด้วยกัน
 * แต่แสดงผลด้วยรูปแบบที่นักเรียนพิมพ์มาครั้งแรก
 */
export const countWords = (responses: LiveResponse[]): WordCount[] => {
  const map = new Map<string, { display: string; count: number }>();
  responses.forEach((r) => {
    r.answer
      .split('|')
      .map((w) => w.trim())
      .filter(Boolean)
      .forEach((w) => {
        const key = w.toLowerCase().replace(/\s+/g, ' ');
        const found = map.get(key);
        if (found) found.count += 1;
        else map.set(key, { display: w, count: 1 });
      });
  });
  return [...map.values()]
    .map((v) => ({ word: v.display, count: v.count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, 'th'));
};

/** นับผลโพลตามตัวเลือก */
export const countOptions = (responses: LiveResponse[], options: string[]): number[] =>
  options.map((opt) => responses.filter((r) => r.answer === opt).length);

/** ค่าเฉลี่ยของการให้ดาว 1-5 */
export const averageStars = (responses: LiveResponse[]): number => {
  const nums = responses.map((r) => Number(r.answer)).filter((n) => n >= 1 && n <= 5);
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

/** เรียงอันดับจากคะแนนมากไปน้อย คะแนนเท่ากันให้คนที่ใช้เวลาน้อยกว่าอยู่ก่อน */
export const rankResponses = (responses: LiveResponse[]): LiveResponse[] =>
  [...responses].sort((a, b) => b.score - a.score || a.seconds - b.seconds);

/**
 * ย่อภาพก่อนส่ง เพื่อไม่ให้คำขอใหญ่เกินกว่าที่ Apps Script รับไหว
 * และเพื่อให้อัปโหลดเสร็จเร็วบนเน็ตของโรงเรียน
 */
export const compressImage = (file: File, maxWidth = 1280): Promise<{ base64: string; name: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('อ่านไฟล์ภาพไม่สำเร็จ'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไฟล์นี้ไม่ใช่รูปภาพที่เปิดได้'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('เบราว์เซอร์นี้ย่อภาพไม่ได้'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve({ base64: dataUrl.split(',')[1] ?? '', name: file.name });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
