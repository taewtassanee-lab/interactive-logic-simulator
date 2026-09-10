import type { BlockDef, BlockId, BlockCategory } from '../types';

/** คลังบล็อกคำสั่งทั้งหมด อ้างอิงชื่อ Event/Action จริงของ Construct 2 */
export const BLOCK_LIBRARY: BlockDef[] = [
  /* ---------- หมวดเริ่มต้นและสุ่มข้อสอบ ---------- */
  {
    id: 'on_start',
    label: 'On start of layout',
    category: 'start',
    hint: 'เหตุการณ์เริ่มต้นเมื่อเปิด Layout ใช้เป็นจุดเริ่มของระบบแบบทดสอบ',
    isBug: false,
  },
  {
    id: 'func_random',
    label: 'Function "Random"',
    category: 'start',
    hint: 'ประกาศฟังก์ชันสำหรับสุ่มข้อสอบ เรียกซ้ำได้ทุกครั้งที่ต้องการข้อถัดไป',
    isBug: false,
  },
  {
    id: 'set_num',
    label: 'Set Num to floor(random(Array.Width))',
    category: 'start',
    hint: 'สุ่มเลข Index ตั้งแต่ 0 ถึง Array.Width-1 เก็บไว้ในตัวแปร Num',
    isBug: false,
  },
  {
    id: 'set_current',
    label: 'Set CurrentQuestion to Array.At(Num, 0, 0)',
    category: 'start',
    hint: 'ดึงข้อความคำถามจาก Array ตำแหน่ง Num มาเก็บในตัวแปร CurrentQuestion',
    isBug: false,
  },
  {
    id: 'delete_index',
    label: 'Array -> Delete index Num from X axis',
    category: 'start',
    hint: 'ลบข้อสอบที่ใช้แล้วออกจาก Array ทำให้ Array.Width ลดลงและไม่ถูกสุ่มซ้ำ',
    isBug: false,
  },
  {
    id: 'display_question',
    label: 'Display CurrentQuestion',
    category: 'start',
    hint: 'แสดงคำถามที่สุ่มได้บนหน้าจอให้ผู้เล่นอ่าน',
    isBug: false,
  },

  /* ---------- หมวดตรวจคำตอบ ---------- */
  {
    id: 'on_answer_clicked',
    label: 'On button answer clicked',
    category: 'answer',
    hint: 'เหตุการณ์เมื่อผู้เล่นคลิกปุ่มคำตอบ เป็นจุดเริ่มของการตรวจคำตอบ',
    isBug: false,
  },
  {
    id: 'if_answer_correct',
    label: 'If Answer = bt_Select.Choice',
    category: 'answer',
    hint: 'เงื่อนไขเปรียบเทียบคำตอบที่ผู้เล่นเลือกกับเฉลยของข้อนั้น',
    isBug: false,
  },
  {
    id: 'add_score',
    label: 'Add 1 to Score',
    category: 'answer',
    hint: 'เพิ่มคะแนน 1 คะแนน ต้องอยู่ภายใต้เงื่อนไขตรวจคำตอบเสมอ',
    isBug: false,
  },
  {
    id: 'call_random',
    label: 'Call Function "Random"',
    category: 'answer',
    hint: 'เรียกฟังก์ชัน Random อีกครั้งเพื่อไปข้อถัดไป',
    isBug: false,
  },

  /* ---------- หมวดเงื่อนไขจบเกม ---------- */
  {
    id: 'if_array_empty',
    label: 'If Array is empty',
    category: 'end',
    hint: 'ตรวจว่า Array.Width = 0 หรือไม่ คือเงื่อนไขว่าทำข้อสอบครบทุกข้อแล้ว',
    isBug: false,
  },
  {
    id: 'go_summary',
    label: 'Go to Layout "Summary"',
    category: 'end',
    hint: 'เปลี่ยนไปหน้าสรุปผล ต้องทำหลังตรวจว่า Array ว่างแล้วเท่านั้น',
    isBug: false,
  },
  {
    id: 'display_score',
    label: 'Display Score',
    category: 'end',
    hint: 'แสดงคะแนนรวมบนหน้า Summary',
    isBug: false,
  },

  /* ---------- หมวดบล็อก Bug ---------- */
  {
    id: 'bug_no_delete',
    label: 'Random question without Delete index',
    category: 'bug',
    hint: 'สุ่มข้อสอบโดยไม่ลบข้อที่ใช้แล้ว ทำให้ Array.Width เท่าเดิมและสุ่มซ้ำได้',
    isBug: true,
  },
  {
    id: 'bug_score_no_check',
    label: 'Add score without checking answer',
    category: 'bug',
    hint: 'เพิ่มคะแนนโดยไม่ตรวจคำตอบก่อน ทำให้ตอบผิดก็ยังได้คะแนน',
    isBug: true,
  },
  {
    id: 'bug_empty_wrong_position',
    label: 'Check Array is empty in wrong position',
    category: 'bug',
    hint: 'ตรวจ Array ว่างผิดตำแหน่ง เช่น ตรวจก่อนลบข้อสอบ ทำให้เงื่อนไขจบเกมไม่เป็นจริง',
    isBug: true,
  },
  {
    id: 'bug_summary_early',
    label: 'Go to Summary too early',
    category: 'bug',
    hint: 'เปลี่ยนไปหน้าสรุปผลตั้งแต่ยังทำข้อสอบไม่ครบ',
    isBug: true,
  },
  {
    id: 'bug_wrong_variable',
    label: 'Compare wrong answer variable',
    category: 'bug',
    hint: 'เปรียบเทียบผิดตัวแปร เช่น เทียบกับ CurrentQuestion แทน bt_Select.Choice',
    isBug: true,
  },
];

export const BLOCK_MAP: Record<BlockId, BlockDef> = BLOCK_LIBRARY.reduce(
  (acc, block) => {
    acc[block.id] = block;
    return acc;
  },
  {} as Record<BlockId, BlockDef>,
);

export const CATEGORY_META: Record<
  BlockCategory,
  { title: string; description: string; accent: string; chip: string }
> = {
  start: {
    title: 'เริ่มต้นและสุ่มข้อสอบ',
    description: 'ชุดคำสั่งสำหรับเริ่มระบบและสุ่มข้อสอบจาก Array',
    accent: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white',
    chip: 'bg-brand-100 text-brand-800',
  },
  answer: {
    title: 'ตรวจคำตอบ',
    description: 'ชุดคำสั่งสำหรับตรวจคำตอบและให้คะแนน',
    accent: 'border-think-200 bg-gradient-to-b from-think-50 to-white',
    chip: 'bg-think-100 text-think-800',
  },
  end: {
    title: 'เงื่อนไขจบเกม',
    description: 'ชุดคำสั่งสำหรับตรวจว่าเมื่อใดควรจบแบบทดสอบ',
    accent: 'border-mint-200 bg-gradient-to-b from-mint-50 to-white',
    chip: 'bg-mint-100 text-mint-800',
  },
  bug: {
    title: 'บล็อก Bug',
    description: 'บล็อกที่จงใจทำให้ระบบทำงานผิด ใช้ทดลองหาสาเหตุของปัญหา',
    accent: 'border-bubble-200 bg-gradient-to-b from-bubble-50 to-white',
    chip: 'bg-bubble-100 text-bubble-800',
  },
};

/** ตรรกะที่ถูกต้องครบทุกส่วน ใช้เป็นเฉลยและใช้ตรวจเทียบ */
export const CORRECT_SOLUTION: BlockId[] = [
  'on_start',
  'func_random',
  'set_num',
  'set_current',
  'delete_index',
  'display_question',
  'on_answer_clicked',
  'if_answer_correct',
  'add_score',
  'call_random',
  'if_array_empty',
  'go_summary',
  'display_score',
];

/** ตัวอย่างตรรกะที่มี Bug สำหรับปุ่ม "โหลดตัวอย่างตรรกะที่มี Bug" */
export const BUGGY_EXAMPLE: BlockId[] = [
  'on_start',
  'func_random',
  'set_num',
  'set_current',
  'display_question',

  'on_answer_clicked',
  'add_score',
  'if_answer_correct',
  'call_random',
];
