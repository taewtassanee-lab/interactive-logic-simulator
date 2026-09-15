import { Bug, Medal, Search, Target, type LucideIcon } from 'lucide-react';
import { MISSION_SUCCESS_MESSAGES } from '../utils/simulator';

export type MissionKey = 'mission1' | 'mission2';

export interface MissionDef {
  key: MissionKey;
  /** เลขลำดับที่แสดงบนแถบภารกิจ */
  order: 1 | 2;
  shortTitle: string;
  title: string;
  symptom: string;
  /**
   * ผลลัพธ์ที่ถูกต้อง เขียนให้ตรวจได้จริงจากค่าใน State Monitor
   *
   * เดิมแถบภารกิจบอกแต่อาการกับวิธีแก้ ไม่ได้บอกว่าถ้าแก้ถูกแล้วหน้าจอควรเป็นอย่างไร
   * ผู้เรียนจึงต้องรอให้ระบบขึ้นว่าผ่าน แทนที่จะตรวจงานของตัวเองเป็น
   */
  expected: string;
  goal: string;
  /** คำใบ้เฉพาะของภารกิจนี้ ไล่จากใบ้น้อยไปใบ้มาก */
  hints: string[];
  success: string;
  icon: LucideIcon;
}

export const MISSIONS: MissionDef[] = [
  {
    key: 'mission1',
    order: 1,
    shortTitle: 'ระบบสุ่มข้อสอบซ้ำ',
    title: 'ภารกิจที่ 1: ระบบสุ่มข้อสอบซ้ำ',
    symptom: 'ระบบสุ่มคำถามเดิมซ้ำ ผู้เล่นเจอข้อเดิมหลายครั้ง และเกมไม่จบสักที',
    expected: 'ทุกครั้งที่สุ่ม ค่า Array Size ต้องลดลงทีละ 1 ช่อง จนเหลือ 0 และค่า "จำนวนครั้งที่สุ่มซ้ำ" ต้องเป็น 0 ตลอดทั้งรอบ',
    goal: 'เพิ่มบล็อก Delete index ให้อยู่ต่อจาก Set CurrentQuestion ภายใน Function "Random"',
    hints: [
      'ลอง Run แล้วดู Debug Log ว่ามีบรรทัดที่บอกว่าสุ่มได้ข้อเดิมซ้ำหรือไม่',
      'สังเกตค่า Array Size ใน State Monitor ว่าลดลงหรือเท่าเดิมทุกรอบ',
      'หาบล็อกที่มีคำว่า Delete index ในหมวด "เริ่มต้นและสุ่มข้อสอบ" แล้ววางต่อจาก Set CurrentQuestion',
    ],
    success: MISSION_SUCCESS_MESSAGES.mission1,
    icon: Search,
  },
  {
    key: 'mission2',
    order: 2,
    shortTitle: 'เงื่อนไขจบเกม',
    title: 'ภารกิจที่ 2: ทำข้อสอบครบแต่ไม่เข้าสู่หน้าสรุปผล',
    symptom: 'ทำข้อสอบครบทุกข้อแล้ว แต่หน้าจอยังค้างอยู่ที่ Layout Quiz ไม่ไปหน้าสรุปผล',
    expected: 'เมื่อ Array Size เหลือ 0 ค่า Current Layout ต้องเปลี่ยนจาก Quiz เป็น Summary และ Debug Log ต้องมีบรรทัดที่แสดงคะแนนรวม',
    goal: 'จัดบล็อก If Array is empty ให้อยู่ก่อน Go to Layout "Summary" และ Display Score',
    hints: [
      'Run จนข้อสอบหมด แล้วดูว่า Current Layout ยังเป็น Quiz อยู่หรือไม่',
      'ระบบต้องรู้ว่าเมื่อใดข้อสอบหมด ลองหาบล็อกในหมวด "เงื่อนไขจบเกม"',
      'ลำดับสำคัญ: ต้องตรวจว่า Array ว่างก่อน แล้วจึงสั่งเปลี่ยนหน้าและแสดงคะแนน',
    ],
    success: MISSION_SUCCESS_MESSAGES.mission2,
    icon: Target,
  },
];

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tone: 'brand' | 'bubble' | 'think';
}

export const BADGES: BadgeDef[] = [
  {
    id: 'array_detective',
    name: 'Array Detective',
    description: 'แก้ภารกิจระบบสุ่มข้อสอบซ้ำสำเร็จ',
    icon: Search,
    tone: 'brand',
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'แก้ภารกิจเงื่อนไขจบเกมสำเร็จ',
    icon: Bug,
    tone: 'bubble',
  },
  {
    id: 'logic_master',
    name: 'Logic Master',
    description: 'ผ่านทั้ง 2 ภารกิจ เข้าใจตรรกะทั้งระบบ',
    icon: Medal,
    tone: 'think',
  },
];
