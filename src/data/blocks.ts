import type { BlockDef, BlockId, BlockCategory } from '../types';

/** คลังบล็อกคำสั่งทั้งหมด อ้างอิงชื่อ Event/Action จริงของ Construct 2 */
export const BLOCK_LIBRARY: BlockDef[] = [
  /* ---------- หมวดเริ่มต้นและสุ่มข้อสอบ ---------- */
  {
    id: 'on_start',
    kind: 'event',
    label: 'On start of layout',
    category: 'start',
    hint: 'เหตุการณ์เริ่มต้นเมื่อเปิด Layout ใช้เป็นจุดเริ่มของระบบแบบทดสอบ',
    isBug: false,
  },
  {
    id: 'func_random',
    kind: 'event',
    label: 'Function "Random"',
    category: 'start',
    hint: 'ประกาศฟังก์ชันสำหรับสุ่มข้อสอบ เรียกซ้ำได้ทุกครั้งที่ต้องการข้อถัดไป',
    isBug: false,
  },
  {
    id: 'set_num',
    kind: 'action',
    label: 'Set Num to floor(random(Array.Width))',
    category: 'start',
    hint: 'สุ่มเลข Index ตั้งแต่ 0 ถึง Array.Width-1 เก็บไว้ในตัวแปร Num',
    isBug: false,
  },
  {
    id: 'set_current',
    kind: 'action',
    label: 'Set CurrentQuestion to Array.At(Num, 0, 0)',
    category: 'start',
    hint: 'ดึงข้อความคำถามจาก Array ตำแหน่ง Num มาเก็บในตัวแปร CurrentQuestion',
    isBug: false,
  },
  {
    id: 'delete_index',
    kind: 'action',
    label: 'Array -> Delete index Num from X axis',
    category: 'start',
    hint: 'ลบข้อสอบที่ใช้แล้วออกจาก Array ทำให้ Array.Width ลดลงและไม่ถูกสุ่มซ้ำ',
    isBug: false,
  },
  {
    id: 'display_question',
    kind: 'action',
    label: 'Display CurrentQuestion',
    category: 'start',
    hint: 'แสดงคำถามที่สุ่มได้บนหน้าจอให้ผู้เล่นอ่าน',
    isBug: false,
  },

  /* ---------- หมวดตรวจคำตอบ ---------- */
  {
    id: 'on_answer_clicked',
    kind: 'event',
    label: 'On button answer clicked',
    category: 'answer',
    hint: 'เหตุการณ์เมื่อผู้เล่นคลิกปุ่มคำตอบ เป็นจุดเริ่มของการตรวจคำตอบ',
    isBug: false,
  },
  {
    id: 'if_answer_correct',
    kind: 'condition',
    label: 'If Answer = bt_Select.Choice',
    category: 'answer',
    hint: 'เงื่อนไขเปรียบเทียบคำตอบที่ผู้เล่นเลือกกับเฉลยของข้อนั้น',
    isBug: false,
  },
  {
    id: 'add_score',
    kind: 'action',
    label: 'Add 1 to Score',
    category: 'answer',
    hint: 'เพิ่มคะแนน 1 คะแนน ต้องอยู่ภายใต้เงื่อนไขตรวจคำตอบเสมอ',
    isBug: false,
  },
  {
    /**
     * Else ใน Construct 2 ไม่ใช่คำสั่ง แต่เป็นเงื่อนไขที่รับกรณีตรงข้ามของเงื่อนไขก่อนหน้า
     * จึงอยู่ระดับเดียวกับเงื่อนไขที่มันจับคู่ด้วย ไม่ใช่ลึกลงไปอีกชั้น
     * ไฟล์จริงใช้ Else สองที่ คือกรณีตอบผิด และกรณีข้อสอบหมด
     */
    id: 'else_branch',
    kind: 'condition',
    label: 'System: Else',
    category: 'answer',
    hint: 'รับกรณีตรงข้ามของเงื่อนไขที่อยู่เหนือมัน เช่น เมื่อคำตอบไม่ตรงกับเฉลย',
    isBug: false,
  },
  {
    id: 'call_random',
    kind: 'action',
    label: 'Call Function "Random"',
    category: 'answer',
    hint: 'เรียกฟังก์ชัน Random อีกครั้งเพื่อไปข้อถัดไป',
    isBug: false,
  },

  /* ---------- หมวดเงื่อนไขจบเกม ---------- */
  {
    id: 'if_array_empty',
    kind: 'condition',
    label: 'If Array is empty',
    category: 'end',
    hint: 'ตรวจว่า Array.Width = 0 หรือไม่ คือเงื่อนไขว่าทำข้อสอบครบทุกข้อแล้ว',
    isBug: false,
  },
  {
    id: 'go_summary',
    kind: 'action',
    label: 'Go to Layout "Summary"',
    category: 'end',
    hint: 'เปลี่ยนไปหน้าสรุปผล ต้องทำหลังตรวจว่า Array ว่างแล้วเท่านั้น',
    isBug: false,
  },
  {
    id: 'display_score',
    kind: 'action',
    label: 'Display Score',
    category: 'end',
    hint: 'แสดงคะแนนรวมบนหน้า Summary',
    isBug: false,
  },

  /* ---------- บล็อกลวง (Distractors) ----------
     กระจายเข้าไปอยู่ในหมวดเดียวกับบล็อกจริงที่หน้าตาใกล้เคียงกัน
     ป้ายกำกับเขียนเป็นคำสั่งที่เป็นไปได้จริงใน Construct 2 และคำอธิบายบอกเฉพาะว่า
     บล็อกนั้นทำอะไร ไม่บอกว่าผิดตรงไหน ผู้เรียนต้องแยกเองด้วยตรรกะและผลการจำลอง */
  {
    id: 'bug_no_delete',
    kind: 'action',
    label: 'Array -> Set value at (Num, 0) to ""',
    category: 'start',
    hint: 'ล้างข้อความในช่องที่สุ่มได้ให้เป็นค่าว่าง โดยจำนวนช่องของ Array ยังเท่าเดิม',
    isBug: true,
  },
  {
    id: 'bug_wrong_variable',
    kind: 'condition',
    label: 'If Answer = CurrentQuestion',
    category: 'answer',
    hint: 'เงื่อนไขเปรียบเทียบตัวแปร Answer กับตัวแปร CurrentQuestion',
    isBug: true,
  },
  {
    id: 'bug_score_no_check',
    kind: 'event',
    label: 'On button answer clicked -> Add 1 to Score',
    category: 'answer',
    hint: 'เพิ่มคะแนน 1 คะแนนทันทีที่ผู้เล่นกดปุ่มคำตอบ',
    isBug: true,
  },
  {
    id: 'bug_empty_wrong_position',
    kind: 'event',
    label: 'On start of layout -> If Array is empty',
    category: 'end',
    hint: 'ตรวจว่า Array ว่างหรือไม่ ตั้งแต่ตอนเปิด Layout ก่อนเริ่มสุ่มข้อสอบ',
    isBug: true,
  },
  {
    id: 'bug_summary_early',
    kind: 'condition',
    label: 'If Score > 0 -> Go to Layout "Summary"',
    category: 'end',
    hint: 'เปลี่ยนไปหน้าสรุปผลเมื่อคะแนนมากกว่า 0',
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
    description: 'ชุดคำสั่งสำหรับเริ่มระบบและสุ่มข้อสอบจาก Array บางบล็อกในหมวดนี้ใช้ไม่ได้ผล ต้องเลือกให้ถูก',
    accent: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white',
    chip: 'bg-brand-100 text-brand-800',
  },
  answer: {
    title: 'ตรวจคำตอบ',
    description: 'ชุดคำสั่งสำหรับตรวจคำตอบและให้คะแนน บางบล็อกในหมวดนี้ใช้ไม่ได้ผล ต้องเลือกให้ถูก',
    accent: 'border-think-200 bg-gradient-to-b from-think-50 to-white',
    chip: 'bg-think-100 text-think-800',
  },
  end: {
    title: 'เงื่อนไขจบเกม',
    description: 'ชุดคำสั่งสำหรับตรวจว่าเมื่อใดควรจบแบบทดสอบ บางบล็อกในหมวดนี้ใช้ไม่ได้ผล ต้องเลือกให้ถูก',
    accent: 'border-mint-200 bg-gradient-to-b from-mint-50 to-white',
    chip: 'bg-mint-100 text-mint-800',
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
  'else_branch',
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
