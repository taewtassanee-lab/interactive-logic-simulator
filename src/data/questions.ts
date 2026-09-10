import type { QuizQuestion } from '../types';

/**
 * ข้อมูลข้อสอบตั้งต้นใน Array ของระบบจำลอง
 * เทียบเท่ากับ Array "arr_Question" ขนาด Width = 4 ใน Construct 2
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    code: 'Q1',
    text: 'คำสั่งใดใช้ลบข้อสอบที่สุ่มแล้วออกจาก Array?',
    choices: ['Array -> Delete index', 'Array -> Push back', 'Set CurrentQuestion', 'Add 1 to Score'],
    correctAnswer: 'Array -> Delete index',
  },
  {
    code: 'Q2',
    text: 'เมื่อ Array ไม่มีข้อสอบเหลือ ระบบควรทำอะไร?',
    choices: ['Go to Layout Summary', 'สุ่มข้อสอบใหม่อีกครั้ง', 'รีเซ็ต Score เป็น 0', 'รอผู้เรียนกดปุ่ม'],
    correctAnswer: 'Go to Layout Summary',
  },
  {
    code: 'Q3',
    text: 'คำสั่งใดใช้เพิ่มคะแนนเมื่อผู้เรียนตอบถูก?',
    choices: ['Add 1 to Score', 'Set Num to 1', 'Array -> Delete index', 'Display CurrentQuestion'],
    correctAnswer: 'Add 1 to Score',
  },
  {
    code: 'Q4',
    text: 'Function Random มีหน้าที่สำคัญอะไร?',
    choices: ['สุ่มและแสดงข้อสอบถัดไป', 'บันทึกคะแนนลงไฟล์', 'เปลี่ยนสีปุ่มคำตอบ', 'ปิดโปรแกรม'],
    correctAnswer: 'สุ่มและแสดงข้อสอบถัดไป',
  },
];

export const getQuestionByCode = (code: string): QuizQuestion | undefined =>
  QUIZ_QUESTIONS.find((q) => q.code === code);
