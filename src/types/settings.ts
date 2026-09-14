import type { TabId } from './index';
import type { LiveQuizQuestion } from './live';

/**
 * ค่าตั้งระบบที่ครูแก้ได้เองจากหน้าแดชบอร์ด โดยไม่ต้องแก้โค้ดแล้วเผยแพร่ใหม่
 *
 * เก็บไว้ฝั่ง Apps Script เพื่อให้เครื่องนักเรียนดึงค่าเดียวกันไปใช้
 * ถ้าดึงไม่ได้ (เน็ตล่ม หรือยังไม่เคยตั้งค่า) ระบบจะใช้ค่าตั้งต้นในโค้ดแทน
 * บทเรียนจึงเดินต่อได้เสมอ ไม่ผูกกับการเชื่อมต่อ
 */
export interface AppSettings {
  /** เลขรุ่นของค่าตั้ง ใช้ตัดสินว่าค่าที่ดึงมาใหม่กว่าที่เก็บไว้ในเครื่องหรือไม่ */
  version: number;
  updatedAt: string;

  /* ---------- ข้อมูลครูและรายวิชา ---------- */
  teacherName: string;
  teacherFormalName: string;
  teacherPosition: string;
  school: string;
  courseLabel: string;
  courseName: string;
  gradeLevel: string;
  semester: string;
  unitName: string;

  /* ---------- การจัดกิจกรรม ---------- */
  /** เวลาสลับบทบาท Driver และ Navigator (นาที) */
  roleSwitchMinutes: number;
  /** แท็บที่นักเรียนมองเห็น แท็บเริ่มต้นใช้งานเปิดไว้เสมอ */
  visibleTabs: TabId[];

  /* ---------- เนื้อหากิจกรรมสดที่แก้ได้ ---------- */
  /** แทนที่ชื่อและโจทย์ของกิจกรรมในคลัง เก็บเฉพาะตัวที่ครูแก้ */
  activityOverrides: Record<string, { title?: string; prompt?: string }>;
  /** แทนที่ข้อสอบก่อนเรียนทั้งชุด ถ้าเว้นว่างจะใช้ชุดตั้งต้นในโค้ด */
  pretestQuestions: LiveQuizQuestion[] | null;
}

/** แท็บที่ครูเลือกซ่อนได้ ไม่รวมแท็บเริ่มต้นใช้งานซึ่งจำเป็นต้องมีเสมอ */
export const TOGGLEABLE_TABS: { id: TabId; label: string; note: string }[] = [
  { id: 'knowledge', label: 'คลังความรู้', note: 'เนื้อหา Array และ Function พร้อมพื้นที่ทดลอง' },
  { id: 'simulator', label: 'จำลองตรรกะ', note: 'ภารกิจแก้ Bug และ State Monitor' },
  { id: 'live', label: 'กิจกรรมสด', note: 'เข้าร่วมกิจกรรมที่ครูเปิดหน้าชั้น' },
  { id: 'worksheet', label: 'ใบงานดิจิทัล', note: 'ใบงาน 3 ส่วน บันทึกอัตโนมัติ' },
  { id: 'summary', label: 'สรุปและส่งงาน', note: 'ตรวจความพร้อมและสร้างไฟล์ PDF' },
  { id: 'guide', label: 'คู่มือนักเรียน', note: 'วิธีทำกิจกรรม บทบาท และสิ่งที่ต้องส่ง' },
  { id: 'dashboard', label: 'แดชบอร์ดครู', note: 'ต้องใช้รหัสครูอยู่แล้ว ซ่อนได้ถ้าไม่อยากให้เห็นแท็บ' },
];
