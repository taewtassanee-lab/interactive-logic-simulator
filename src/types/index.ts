/* ประเภทข้อมูลกลางของระบบทั้งหมด */

export type TabId =
  | 'start'
  | 'simulator'
  | 'knowledge'
  | 'live'
  | 'worksheet'
  | 'summary'
  | 'guide'
  | 'dashboard';

/* ---------- ข้อมูลผู้เรียนและคู่ Pair Programming ---------- */

export interface PairInfo {
  classroom: string;
  pairCode: string;
  driverName: string;
  driverNumber: string;
  navigatorName: string;
  navigatorNumber: string;
}

/**
 * บทบาทของเครื่องที่ใช้งาน
 * primary   = เครื่อง Driver (พีซีที่ Driver ใช้) ทำกิจกรรมและบันทึกข้อมูลได้ทั้งหมด
 * assistant = เครื่อง Navigator (iPad) เปิดอ่านและติดตามได้ แต่ไม่กรอกใบงานและไม่ส่งข้อมูล
 *             ป้องกันไม่ให้สองเครื่องของคู่เดียวกันเขียนข้อมูลทับกัน
 */
export type DeviceMode = 'primary' | 'assistant';

export interface SessionInfo {
  deviceMode: DeviceMode;
  /** กด "เริ่มกิจกรรม" แล้วหรือยัง ใช้ล็อกไม่ให้ข้ามไปหน้าจำลองตรรกะ */
  activityStarted: boolean;
  /** จำนวนครั้งที่ยืนยันการสลับบทบาท */
  roleSwitchCount: number;
  lastRoleSwitchAt: string | null;
  /**
   * true = คนที่กรอกชื่อในช่อง Driver กำลังทำหน้าที่ Driver อยู่
   * false = สลับแล้ว คนที่กรอกในช่อง Navigator มาเป็น Driver แทน
   */
  driverIsFirstPerson: boolean;
  /** เวลาที่สลับบทบาทแต่ละครั้ง ใช้เป็นหลักฐานในใบงาน */
  roleSwitchLog: string[];
}

/* ---------- บล็อกคำสั่ง ---------- */

export type BlockCategory = 'start' | 'answer' | 'end';

export type BlockId =
  // หมวดเริ่มต้นและสุ่มข้อสอบ
  | 'on_start'
  | 'func_random'
  | 'set_num'
  | 'set_current'
  | 'delete_index'
  | 'display_question'
  // หมวดตรวจคำตอบ
  | 'on_answer_clicked'
  | 'if_answer_correct'
  | 'add_score'
  | 'call_random'
  // หมวดเงื่อนไขจบเกม
  | 'if_array_empty'
  | 'go_summary'
  | 'display_score'
  // หมวดบล็อก Bug
  | 'bug_no_delete'
  | 'bug_score_no_check'
  | 'bug_empty_wrong_position'
  | 'bug_summary_early'
  | 'bug_wrong_variable';

export interface BlockDef {
  id: BlockId;
  label: string;
  category: BlockCategory;
  /** คำอธิบายภาษาไทยสำหรับ Tooltip และ Empty State */
  hint: string;
  /**
   * true = เป็นบล็อกลวง (Distractor)
   *
   * ตั้งใจไม่นำค่านี้ไปแสดงผลบนหน้าจอเลย ทั้งสีปุ่ม กรอบ และไอคอนเตือน
   * เพราะถ้าติดป้ายบอกไว้ว่าบล็อกไหนคือกับดัก ผู้เรียนก็แค่หลบบล็อกที่มีสีต่าง
   * โดยไม่ต้องใช้ตรรกะแยกเลย ซึ่งขัดกับหลักของ Parsons Problems
   * ผู้เรียนต้องรู้ว่าเลือกผิดจากผลการจำลองใน State Monitor และ Debug Log เท่านั้น
   *
   * ค่านี้ยังเก็บไว้เพื่อใช้อ้างอิงในคู่มือครูและการตรวจสอบภายใน
   */
  isBug: boolean;
}

/** บล็อกหนึ่งชิ้นที่ถูกวางไว้ใน Workspace (uid ไม่ซ้ำ เพื่อวางบล็อกเดิมซ้ำได้) */
export interface WorkspaceBlock {
  uid: string;
  blockId: BlockId;
}

/* ---------- ข้อสอบและการจำลอง ---------- */

export interface QuizQuestion {
  code: string; // Q1, Q2, ...
  text: string;
  choices: string[];
  correctAnswer: string;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  time: string; // HH:MM:SS
  message: string;
  level: LogLevel;
}

export type SystemStatus = 'ready' | 'running' | 'bug' | 'completed';
export type LayoutName = 'Quiz' | 'Summary';

/** สถานะระบบ ณ ขณะหนึ่ง ใช้แสดงบน State Monitor */
export interface SimState {
  remaining: string[]; // รหัสข้อสอบที่เหลือใน Array เช่น ["Q1","Q3"]
  arraySize: number;
  num: number | null;
  currentQuestion: QuizQuestion | null;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  score: number;
  layout: LayoutName;
  status: SystemStatus;
  answeredCount: number;
  duplicateCount: number;
  log: LogEntry[];
}

/** หนึ่งเฟรมของการจำลอง = สถานะหลังทำคำสั่งขั้นนั้นเสร็จ */
export interface SimFrame {
  state: SimState;
  /** ชื่อคำสั่งที่เพิ่งทำงานในขั้นนี้ ใช้ไฮไลต์บล็อกใน Workspace */
  activeBlockId: BlockId | null;
  caption: string;
}

export interface SimResult {
  frames: SimFrame[];
  finalState: SimState;
  mission1Passed: boolean;
  mission2Passed: boolean;
}

/* ---------- ผลตรวจตรรกะ ---------- */

export type IssueSeverity = 'risk' | 'bug' | 'ok';

export interface LogicIssue {
  id: string;
  severity: IssueSeverity;
  message: string;
  advice: string;
}

export interface LogicReport {
  issues: LogicIssue[];
  randomLogicOk: boolean;
  answerLogicOk: boolean;
  endLogicOk: boolean;
}

/* ---------- ภารกิจแก้ Bug และเหรียญตรา ---------- */

export interface MissionState {
  mission1Passed: boolean; // ระบบสุ่มข้อสอบซ้ำ
  mission2Passed: boolean; // ทำครบแต่ไม่เข้าหน้าสรุปผล
  bestScore: number;
  /**
   * ร่องรอยการลงมือทำ ใช้ทำรายงานให้ครูเห็นกระบวนการ ไม่ใช่แค่ผลลัพธ์ผ่านหรือไม่ผ่าน
   * ตอบตัวชี้วัดเรื่องทักษะการแก้ปัญหาได้ตรงกว่าการดูแค่ช่องผ่าน
   */
  runCount: number;
  hintsUsed: number;
  /** เวลาที่ผ่านภารกิจแต่ละข้อครั้งแรก */
  mission1At: string | null;
  mission2At: string | null;
  /** จำนวนบล็อกที่วางไว้ในรอบที่จำลองล่าสุด */
  lastBlockCount: number;
}

export type BadgeId = 'array_detective' | 'bug_hunter' | 'logic_master';

/* ---------- ใบงานดิจิทัล ---------- */

export interface DebugRow {
  point: string; // จุดที่พบ Bug (คงที่)
  symptom: string; // สภาพปัญหา (คงที่)
  /**
   * แผนที่วางไว้ก่อนลงมือแก้ (นักเรียนกรอกก่อนกด Run)
   *
   * แยกจากช่อง "สาเหตุ" โดยตั้งใจ เพราะสาเหตุคือสิ่งที่รู้ "หลัง" แก้ได้แล้ว
   * ส่วนช่องนี้เก็บสมมติฐานที่ตั้งไว้ "ก่อน" จึงเป็นหลักฐานของทักษะการออกแบบและวางแผน
   * และทำให้เห็นด้วยว่าผู้เรียนแก้ปัญหาอย่างเป็นระบบ ไม่ใช่สุ่มลองไปเรื่อย
   */
  plan: string;
  cause: string; // สาเหตุ (นักเรียนกรอก)
  fix: string; // แนวทางแก้ไข (นักเรียนกรอก)
  evidence: string; // หลักฐานจาก State Monitor
}

/**
 * (เลิกใช้แล้ว) คำตอบสะท้อนตนเองของผู้เรียนหนึ่งคน
 *
 * ย้ายไปเก็บผ่านกิจกรรมสดแทน เพราะกิจกรรมสดบันทึกเป็นรายบุคคลพร้อมชื่อและเวลาลงชีตให้เอง
 * และผู้เรียนตอบจากเครื่องของตนเองพร้อมกันได้ ไม่ต้องรอผลัดกันพิมพ์ที่เครื่อง Driver เครื่องเดียว
 * คงชนิดข้อมูลไว้เพื่อให้โค้ดย้ายข้อมูลรุ่นเก่าอ่านได้
 *
 * แยกเก็บรายคนเพราะคำถามส่วนนี้ใช้สรรพนามรายบุคคล เช่น "คู่ของฉัน" และ "ฉันต้องพัฒนา"
 * ถ้าเก็บช่องเดียวต่อคู่ จะกลายเป็นคนหนึ่งเขียนแทนอีกคน ซึ่งผิดเจตนาของคำถาม
 * และใช้เป็นหลักฐานการประเมินรายบุคคลไม่ได้
 */
export interface PersonReflection {
  /** บทบาทที่คนนี้ได้ลงมือทำจริงระหว่างกิจกรรม */
  rolesPlayed: { driver: boolean; navigator: boolean };
  partnerGood: string;
  toImprove: string;
  /** คะแนนความร่วมมือ 1-5 */
  collaborationRating: number;
}

export interface WorksheetData {
  /**
   * ก่อนลงมือ: เป้าหมายและข้อตกลงที่คู่กำหนดเอง
   *
   * เดิมแยกเป็นสองช่อง แต่ทั้งคู่เป็นหลักฐานของตัวชี้วัดที่ 8 ข้อ 1 ข้อเดียวกัน
   * จึงรวมเป็นช่องเดียวเพื่อลดเวลาพิมพ์โดยไม่เสียหลักฐาน
   */
  goal: string;
  /* ส่วนที่ 1 */
  q1Observation: string;
  q2FillIn: string;
  q3Choice: string;
  /** ข้อ 4: ตรรกะของ int(random(Array.Width)) และเหตุผลที่ต้องครอบด้วย int หรือ floor */
  q4RandomLogic: string;
  /* ส่วนที่ 2 */
  debugRows: DebugRow[];
  /* ส่วนที่ 3 */
  /** ข้อเสนอต่อยอดระบบ เป็นช่องเดียวในใบงานที่ไม่มีคำตอบถูกผิดตายตัว */
  q4Extend: string;
}

/* ---------- ไฟล์ผลงาน ---------- */

export interface CapxFileMeta {
  name: string;
  sizeBytes: number;
  attachedAt: string; // ISO string
}

/* ---------- สถานะรวมของแอป ---------- */

export interface AppState {
  pair: PairInfo;
  session: SessionInfo;
  workspace: WorkspaceBlock[];
  missions: MissionState;
  worksheet: WorksheetData;
  capxFile: CapxFileMeta | null;
  lastDebugLog: LogEntry[];
  pdfGeneratedAt: string | null;
}
