import type { AppState, WorksheetData } from '../types';

/** แปลงห้องเรียน/รหัสคู่ให้เป็นชื่อไฟล์ที่ปลอดภัย เช่น "ม.5/1" -> "M5-1" */
export const toFileToken = (value: string, fallback: string): string => {
  const cleaned = value
    .trim()
    .replace(/ม\.?\s*/g, 'M')
    .replace(/[\s/\\]+/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || fallback;
};

/** ชื่อไฟล์ PDF อัตโนมัติ เช่น Worksheet_QuizDebug_M5-1_Pair01.pdf */
export const buildPdfFileName = (classroom: string, pairCode: string): string =>
  `Worksheet_QuizDebug_${toFileToken(classroom, 'Class')}_${toFileToken(pairCode, 'Pair')}.pdf`;

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} ไบต์`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/** วันเวลาแบบไทย เช่น "10 กันยายน 2569 เวลา 09:45 น." */
export const formatThaiDateTime = (input: Date | string): string => {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543} เวลา ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())} น.`;
};

export const formatClock = (totalSeconds: number): string => {
  const m = Math.floor(Math.max(totalSeconds, 0) / 60);
  const s = Math.max(totalSeconds, 0) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/* ---------- ความครบถ้วนของใบงาน ---------- */

export interface WorksheetField {
  key: string;
  label: string;
  filled: boolean;
}

export const getWorksheetFields = (w: WorksheetData): WorksheetField[] => [
  {
    key: 'q1',
    label: 'ส่วนที่ 1 ข้อ 1: การเปลี่ยนแปลงของค่าใน State Monitor',
    filled: w.q1Observation.trim().length >= 10,
  },
  {
    key: 'q2',
    label: 'ส่วนที่ 1 ข้อ 2: คำสั่งที่ต้องใส่ใน Function "Random"',
    filled: w.q2FillIn.trim().length > 0,
  },
  {
    key: 'q3',
    label: 'ส่วนที่ 1 ข้อ 3: สิ่งที่ระบบควรทำเมื่อ Array ว่าง',
    filled: w.q3Choice.trim().length > 0,
  },
  {
    key: 'row1cause',
    label: 'ส่วนที่ 2 แถวที่ 1: สาเหตุที่พบ',
    filled: w.debugRows[0].cause.trim().length >= 5,
  },
  {
    key: 'row1fix',
    label: 'ส่วนที่ 2 แถวที่ 1: แนวทางการแก้ไข',
    filled: w.debugRows[0].fix.trim().length >= 5,
  },
  {
    key: 'row1evidence',
    label: 'ส่วนที่ 2 แถวที่ 1: หลักฐานจาก State Monitor',
    filled: w.debugRows[0].evidence.trim().length > 0,
  },
  {
    key: 'row2cause',
    label: 'ส่วนที่ 2 แถวที่ 2: สาเหตุที่พบ',
    filled: w.debugRows[1].cause.trim().length >= 5,
  },
  {
    key: 'row2fix',
    label: 'ส่วนที่ 2 แถวที่ 2: แนวทางการแก้ไข',
    filled: w.debugRows[1].fix.trim().length >= 5,
  },
  {
    key: 'row2evidence',
    label: 'ส่วนที่ 2 แถวที่ 2: หลักฐานจาก State Monitor',
    filled: w.debugRows[1].evidence.trim().length > 0,
  },
  {
    key: 'roles',
    label: 'ส่วนที่ 3 ข้อ 1: บทบาทที่ได้ปฏิบัติ',
    filled: w.rolesPlayed.driver || w.rolesPlayed.navigator,
  },
  {
    key: 'appHelp',
    label: 'ส่วนที่ 3 ข้อ 2: Web App ช่วยให้เข้าใจ Array และ Function อย่างไร',
    filled: w.q3AppHelp.trim().length >= 10,
  },
  {
    key: 'partnerGood',
    label: 'ส่วนที่ 3 ข้อ 3: สิ่งที่คู่ของฉันทำได้ดี',
    filled: w.q3PartnerGood.trim().length >= 5,
  },
  {
    key: 'toImprove',
    label: 'ส่วนที่ 3 ข้อ 4: สิ่งที่ต้องพัฒนาต่อไป',
    filled: w.q3ToImprove.trim().length >= 5,
  },
  {
    key: 'rating',
    label: 'ส่วนที่ 3 ข้อ 5: คะแนนความร่วมมือในการทำงานคู่',
    filled: w.collaborationRating > 0,
  },
];

export const getWorksheetProgress = (w: WorksheetData): number => {
  const fields = getWorksheetFields(w);
  const done = fields.filter((f) => f.filled).length;
  return Math.round((done / fields.length) * 100);
};

export const getMissingWorksheetFields = (w: WorksheetData): WorksheetField[] =>
  getWorksheetFields(w).filter((f) => !f.filled);

/** ข้อความสำหรับคัดลอกไปวางใน Google Classroom */
export const buildSubmissionText = (state: AppState): string => {
  const { pair, missions } = state;
  const yes = (ok: boolean) => (ok ? 'สำเร็จ' : 'ยังไม่สำเร็จ');
  return [
    'หัวข้อ: ส่งงาน Pair Programming ระบบแบบทดสอบสุ่ม',
    '',
    `รหัสคู่: ${pair.pairCode || '-'}`,
    `Driver: ${pair.driverName || '-'}${pair.driverNumber ? ` (เลขที่ ${pair.driverNumber})` : ''}`,
    `Navigator: ${pair.navigatorName || '-'}${
      pair.navigatorNumber ? ` (เลขที่ ${pair.navigatorNumber})` : ''
    }`,
    `ห้อง: ${pair.classroom || '-'}`,
    '',
    'รายการที่แนบ:',
    '1. ใบกิจกรรมถอดรหัสตรรกะและบันทึกการแก้ Bug (PDF)',
    `2. ไฟล์ผลงาน Construct 2 (.capx)${state.capxFile ? ` - ${state.capxFile.name}` : ''}`,
    '',
    'ผลการดำเนินงาน:',
    `- แก้ปัญหาระบบสุ่มข้อสอบซ้ำ: ${yes(missions.mission1Passed)}`,
    `- แก้ปัญหาเงื่อนไขจบเกม: ${yes(missions.mission2Passed)}`,
    `- คะแนนจากการจำลอง: ${missions.bestScore}`,
    `- จำนวนครั้งที่สลับบทบาท: ${state.session.roleSwitchCount}`,
    '',
    `ส่งเมื่อ: ${formatThaiDateTime(new Date())}`,
  ].join('\n');
};
