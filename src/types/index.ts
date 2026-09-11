/* ประเภทข้อมูลกลางของระบบทั้งหมด */

export type TabId =
  | 'start'
  | 'simulator'
  | 'knowledge'
  | 'worksheet'
  | 'summary'
  | 'teacher'
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

export interface SessionInfo {
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

export type BlockCategory = 'start' | 'answer' | 'end' | 'bug';

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
}

export type BadgeId = 'array_detective' | 'bug_hunter' | 'logic_master';

/* ---------- ใบงานดิจิทัล ---------- */

export interface DebugRow {
  point: string; // จุดที่พบ Bug (คงที่)
  symptom: string; // สภาพปัญหา (คงที่)
  cause: string; // สาเหตุ (นักเรียนกรอก)
  fix: string; // แนวทางแก้ไข (นักเรียนกรอก)
  evidence: string; // หลักฐานจาก State Monitor
}

export interface WorksheetData {
  /* ส่วนที่ 1 */
  q1Observation: string;
  q2FillIn: string;
  q3Choice: string;
  /** ข้อ 4: ตรรกะของ int(random(Array.Width)) และเหตุผลที่ต้องครอบด้วย int หรือ floor */
  q4RandomLogic: string;
  /** ข้อ 5: ผลกระทบเมื่อลืมสั่ง Delete index */
  q5NoDeleteEffect: string;
  /* ส่วนที่ 2 */
  debugRows: DebugRow[];
  /* ส่วนที่ 3 */
  rolesPlayed: { driver: boolean; navigator: boolean };
  q3AppHelp: string;
  q3PartnerGood: string;
  q3ToImprove: string;
  collaborationRating: number; // 1-5
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
