/* ประเภทข้อมูลของ "กิจกรรมสด" ระบบตอบรับการมีส่วนร่วมในชั้นเรียน */

/**
 * ชนิดของกิจกรรมที่ครูเปิดให้ทั้งห้องทำพร้อมกัน
 *
 * 5 ชนิดแรกรับคำตอบจากเครื่องนักเรียนผ่าน Google Sheets
 * ส่วน namepicker และ bigtimer ทำงานบนเครื่องครูอย่างเดียว ไม่ต้องต่อเน็ต
 */
export type LiveActivityType =
  | 'wordcloud' // คลาวด์คำ พิมพ์คำศัพท์ขึ้นจอพร้อมกัน
  | 'quiz' // แบบทดสอบก่อนเรียน ตรวจอัตโนมัติพร้อมจัดอันดับ
  | 'match' // จับคู่เงื่อนไขกับผลลัพธ์ แทน Slide Drawing
  | 'poll' // โพลสำรวจด่วน แบบใช่/ไม่ใช่ หรือให้ดาว 1-5
  | 'shortanswer' // พิมพ์ตอบสั้น ขึ้นเป็นการ์ดบนจอ
  | 'image'; // ส่งภาพหน้าจอขอความช่วยเหลือ (SOS)

/** กิจกรรมที่เตรียมไว้ในคลัง ครูเลือกเปิดได้ทันทีโดยไม่ต้องพิมพ์เอง */
export interface LiveActivityPreset {
  id: string;
  type: LiveActivityType;
  /** ขั้น GPAS ที่กิจกรรมนี้อยู่ ใช้จัดกลุ่มในแผงควบคุมของครู */
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** โจทย์หรือคำสั่งที่นักเรียนเห็นบนเครื่องตัวเอง */
  prompt: string;
  /** คำอธิบายสั้นให้ครูเลือกถูกตัว */
  teacherNote: string;
  /**
   * true = แผนการสอน 60 นาทีเปิดกิจกรรมนี้จริง
   * คลังกิจกรรมจะแสดงเฉพาะกลุ่มนี้ก่อน ส่วนที่เหลือซ่อนไว้ใต้ปุ่มแสดงเพิ่ม
   * เพื่อไม่ให้ครูต้องไล่หาท่ามกลางกิจกรรมสำรองขณะกล้องถ่ายอยู่
   */
  inPlan?: boolean;
  /** ใช้กับ poll: ตัวเลือกที่ให้กด ถ้าเว้นว่างจะเป็นการให้ดาว 1-5 */
  options?: string[];
  /** ใช้กับ wordcloud และ shortanswer: จำนวนคำตอบสูงสุดต่อคน */
  maxEntries?: number;
  /** ป้ายกำกับช่องกรอกแต่ละช่อง เช่น Two Stars and a Wish */
  entryLabels?: string[];
  /** ใช้กับ quiz */
  questions?: LiveQuizQuestion[];
  /** ใช้กับ match */
  pairs?: LiveMatchPair[];
}

export interface LiveQuizQuestion {
  id: string;
  text: string;
  choices: string[];
  /** ดัชนีของตัวเลือกที่ถูก */
  answerIndex: number;
  /** คำเฉลยอธิบาย แสดงบนจอครูหลังปิดกิจกรรม */
  explain: string;
}

export interface LiveMatchPair {
  id: string;
  /** ฝั่งซ้าย เงื่อนไข */
  condition: string;
  /** ฝั่งขวา ผลลัพธ์ */
  action: string;
}

/** กิจกรรมที่กำลังเปิดอยู่ ณ ขณะนี้ อ่านมาจากเซิร์ฟเวอร์ */
export interface LiveSession {
  classroom: string;
  activityId: string;
  presetId: string;
  type: LiveActivityType;
  title: string;
  prompt: string;
  /** true = ยังรับคำตอบอยู่, false = ครูปิดรับแล้ว */
  open: boolean;
  openedAt: string;
}

/** คำตอบหนึ่งรายการที่นักเรียนส่งเข้ามา */
export interface LiveResponse {
  activityId: string;
  classroom: string;
  studentName: string;
  studentNumber: string;
  pairCode: string;
  /** เนื้อคำตอบ: คำเดียว ข้อความสั้น ตัวเลือกที่กด หรือลิงก์รูป */
  answer: string;
  /** คะแนนที่ตรวจได้ ใช้กับ quiz และ match */
  score: number;
  /** คะแนนเต็ม ใช้กับ quiz และ match */
  total: number;
  /** เวลาที่ใช้ตอบ (วินาที) ใช้ตัดสินอันดับเมื่อคะแนนเท่ากัน */
  seconds: number;
  submittedAt: string;
}

/** ข้อมูลผู้เรียนที่ลงทะเบียนไว้บนเครื่องนี้ ใช้ระบุตัวตนตอนส่งคำตอบ */
export interface LiveIdentity {
  classroom: string;
  studentName: string;
  studentNumber: string;
  pairCode: string;
}

/** สถานะการเชื่อมต่อของหน้ากิจกรรมสด */
export type LiveStatus = 'idle' | 'loading' | 'ready' | 'sent' | 'closed' | 'error' | 'outdated';
