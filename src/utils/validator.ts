import type { BlockId, LogicIssue, LogicReport, WorkspaceBlock } from '../types';

/** ตำแหน่งแรกที่พบบล็อกชนิดนั้นใน Workspace (-1 = ไม่พบ) */
export const indexOfBlock = (blocks: WorkspaceBlock[], id: BlockId): number =>
  blocks.findIndex((b) => b.blockId === id);

export const hasBlock = (blocks: WorkspaceBlock[], id: BlockId): boolean =>
  indexOfBlock(blocks, id) >= 0;

/**
 * ตรวจว่าบล็อกในรายการ order ปรากฏครบ และเรียงตามลำดับสัมพัทธ์ที่ถูกต้อง
 * ตรวจแบบยืดหยุ่น: อนุญาตให้มีบล็อกอื่นแทรกกลางได้
 * (ตาม "ข้อควรระวัง" ในข้อกำหนด ไม่ตรวจเข้มจนตรรกะที่เทียบเท่ากันผ่านไม่ได้)
 */
export const hasOrderedSequence = (blocks: WorkspaceBlock[], order: BlockId[]): boolean => {
  const positions = order.map((id) => indexOfBlock(blocks, id));
  if (positions.some((p) => p < 0)) return false;
  for (let i = 1; i < positions.length; i += 1) {
    if (positions[i] < positions[i - 1]) return false;
  }
  return true;
};

/** ลำดับตรรกะสุ่มข้อสอบที่ถูกต้อง (ข้อ 10 ของข้อกำหนด) */
export const RANDOM_SEQUENCE: BlockId[] = [
  'func_random',
  'set_num',
  'set_current',
  'delete_index',
  'display_question',
];

/** ลำดับตรรกะตรวจคำตอบที่ถูกต้อง */
export const ANSWER_SEQUENCE: BlockId[] = [
  'on_answer_clicked',
  'if_answer_correct',
  'add_score',
  'call_random',
];

/** ลำดับตรรกะเงื่อนไขจบเกมที่ถูกต้อง */
export const END_SEQUENCE: BlockId[] = ['if_array_empty', 'go_summary', 'display_score'];

/** ค่าสถานะที่ตัวจำลองต้องใช้ สรุปมาจาก Workspace ครั้งเดียวแล้วส่งต่อ */
export interface LogicFlags {
  hasRandomLogic: boolean;
  hasSetNum: boolean;
  hasSetCurrent: boolean;
  hasDelete: boolean;
  hasDisplayQuestion: boolean;
  hasAnswerClicked: boolean;
  hasAnswerCheck: boolean;
  hasAddScore: boolean;
  hasCallRandom: boolean;
  /** มี Else ที่วางไว้หลังเงื่อนไขตรวจคำตอบแล้ว */
  hasElse: boolean;
  hasArrayEmptyCheck: boolean;
  hasGoSummary: boolean;
  hasDisplayScore: boolean;
  scoreBeforeCheck: boolean;
  summaryBeforeEmptyCheck: boolean;
  bugNoDelete: boolean;
  bugScoreNoCheck: boolean;
  bugEmptyWrongPosition: boolean;
  bugSummaryEarly: boolean;
  bugWrongVariable: boolean;
}

export const analyzeFlags = (blocks: WorkspaceBlock[]): LogicFlags => {
  const iScore = indexOfBlock(blocks, 'add_score');
  const iCheck = indexOfBlock(blocks, 'if_answer_correct');
  const iElse = indexOfBlock(blocks, 'else_branch');
  const iSummary = indexOfBlock(blocks, 'go_summary');
  const iEmpty = indexOfBlock(blocks, 'if_array_empty');

  return {
    hasRandomLogic: hasBlock(blocks, 'func_random') || hasBlock(blocks, 'set_num'),
    hasSetNum: hasBlock(blocks, 'set_num'),
    hasSetCurrent: hasBlock(blocks, 'set_current'),
    hasDelete: hasBlock(blocks, 'delete_index'),
    hasDisplayQuestion: hasBlock(blocks, 'display_question'),
    hasAnswerClicked: hasBlock(blocks, 'on_answer_clicked'),
    hasAnswerCheck: iCheck >= 0,
    hasAddScore: iScore >= 0,
    hasCallRandom: hasBlock(blocks, 'call_random'),
    // Else ต้องอยู่หลังเงื่อนไขตรวจคำตอบจึงจะมีความหมาย ถ้าวางก่อนถือว่ายังไม่ได้จับคู่กับเงื่อนไขใด
    hasElse: iElse >= 0 && iCheck >= 0 && iElse > iCheck,
    hasArrayEmptyCheck: iEmpty >= 0,
    hasGoSummary: iSummary >= 0,
    hasDisplayScore: hasBlock(blocks, 'display_score'),
    scoreBeforeCheck: iScore >= 0 && iCheck >= 0 && iScore < iCheck,
    summaryBeforeEmptyCheck: iSummary >= 0 && iEmpty >= 0 && iSummary < iEmpty,
    bugNoDelete: hasBlock(blocks, 'bug_no_delete'),
    bugScoreNoCheck: hasBlock(blocks, 'bug_score_no_check'),
    bugEmptyWrongPosition: hasBlock(blocks, 'bug_empty_wrong_position'),
    bugSummaryEarly: hasBlock(blocks, 'bug_summary_early'),
    bugWrongVariable: hasBlock(blocks, 'bug_wrong_variable'),
  };
};

/**
 * ระบบตรวจตรรกะเบื้องต้น
 * คืนรายการความเสี่ยงเป็นภาษาไทย พร้อมคำแนะนำวิธีแก้
 */
export const validateWorkspace = (blocks: WorkspaceBlock[]): LogicReport => {
  const issues: LogicIssue[] = [];
  const f = analyzeFlags(blocks);

  if (blocks.length === 0) {
    return {
      issues: [
        {
          id: 'empty',
          severity: 'risk',
          message: 'ยังไม่มีบล็อกคำสั่งใน Workspace',
          advice: 'เลือกบล็อกจากคลังคำสั่งด้านซ้าย แล้วกดปุ่มเพิ่มเพื่อเริ่มเรียงตรรกะ',
        },
      ],
      randomLogicOk: false,
      answerLogicOk: false,
      endLogicOk: false,
    };
  }

  /* --- กฎที่ 1: สุ่มแล้วไม่ลบข้อสอบที่ใช้แล้ว --- */
  if ((f.hasRandomLogic && !f.hasDelete) || f.bugNoDelete) {
    issues.push({
      id: 'no_delete',
      severity: 'risk',
      message: 'พบความเสี่ยง: ข้อสอบอาจถูกสุ่มซ้ำ เพราะยังไม่มีคำสั่งลบข้อสอบที่ใช้แล้ว',
      advice: 'เพิ่มบล็อก Array -> Delete index Num from X axis ต่อจาก Set CurrentQuestion',
    });
  }

  /* --- กฎที่ 2: ไม่มีเงื่อนไขตรวจว่า Array ว่าง --- */
  if (!f.hasArrayEmptyCheck) {
    issues.push({
      id: 'no_empty_check',
      severity: 'risk',
      message: 'พบความเสี่ยง: ระบบอาจไม่ทราบว่าเมื่อใดควรจบแบบทดสอบ',
      advice: 'เพิ่มบล็อก If Array is empty แล้วตามด้วย Go to Layout "Summary"',
    });
  }

  /* --- กฎที่ 3: เพิ่มคะแนนก่อนตรวจคำตอบ --- */
  if (f.scoreBeforeCheck || f.bugScoreNoCheck || (f.hasAddScore && !f.hasAnswerCheck)) {
    issues.push({
      id: 'score_before_check',
      severity: 'risk',
      message: 'พบความเสี่ยง: คะแนนอาจเพิ่มแม้ผู้เรียนตอบผิด',
      advice: 'ย้ายบล็อก Add 1 to Score ให้อยู่หลังเงื่อนไข If Answer = bt_Select.Choice',
    });
  }

  /* --- กฎที่ 4: ไปหน้า Summary ก่อนตรวจว่า Array ว่าง --- */
  if (f.summaryBeforeEmptyCheck || f.bugSummaryEarly) {
    issues.push({
      id: 'summary_too_early',
      severity: 'risk',
      message: 'พบความเสี่ยง: ระบบอาจจบแบบทดสอบก่อนทำครบทุกข้อ',
      advice: 'ย้ายบล็อก Go to Layout "Summary" ให้อยู่หลัง If Array is empty',
    });
  }

  /* --- กฎเสริม: บล็อก Bug อื่น ๆ ที่ยังค้างอยู่ใน Workspace --- */
  if (f.bugWrongVariable) {
    issues.push({
      id: 'wrong_variable',
      severity: 'bug',
      message: 'พบบล็อก Bug: เปรียบเทียบผิดตัวแปร ระบบจะตัดสินว่าตอบผิดเสมอ',
      advice: 'ลบบล็อก Compare wrong answer variable แล้วใช้ If Answer = bt_Select.Choice แทน',
    });
  }
  if (f.bugEmptyWrongPosition) {
    issues.push({
      id: 'empty_wrong_position',
      severity: 'bug',
      message: 'พบบล็อก Bug: ตรวจ Array is empty ผิดตำแหน่ง เงื่อนไขจบเกมจะไม่เป็นจริง',
      advice: 'ลบบล็อกนี้ แล้ววาง If Array is empty ไว้หลังคำสั่ง Delete index',
    });
  }

  /* --- กฎเสริม: คำสั่งพื้นฐานที่ขาด --- */
  if (f.hasRandomLogic && !f.hasDisplayQuestion) {
    issues.push({
      id: 'no_display',
      severity: 'risk',
      message: 'พบความเสี่ยง: สุ่มข้อสอบได้แต่ไม่ได้แสดงคำถามให้ผู้เล่นเห็น',
      advice: 'เพิ่มบล็อก Display CurrentQuestion ต่อท้ายฟังก์ชัน Random',
    });
  }
  // Else ไม่ได้ทำให้ภารกิจไม่ผ่าน แต่ถ้าไม่มี ผู้เล่นตอบผิดแล้วจะไม่มีอะไรเกิดขึ้นเลย
  // ซึ่งเป็นสิ่งที่ไฟล์จริงมี จึงแจ้งเป็นความเสี่ยงให้ผู้เรียนเห็นก่อนนำไปเขียนของจริง
  if (f.hasAnswerCheck && !f.hasElse) {
    issues.push({
      id: 'no-else',
      severity: 'risk',
      message: 'ยังไม่มี System: Else ต่อจากเงื่อนไขตรวจคำตอบ',
      advice: 'เมื่อผู้เล่นตอบผิด จะไม่มีคำสั่งใดทำงานเลย เพิ่มบล็อก System: Else ไว้หลังคำสั่งของกรณีตอบถูก',
    });
  }

  if (f.hasAnswerClicked && !f.hasCallRandom) {
    issues.push({
      id: 'no_call_random',
      severity: 'risk',
      message: 'พบความเสี่ยง: ตอบคำถามแล้วระบบไม่ไปข้อถัดไป',
      advice: 'เพิ่มบล็อก Call Function "Random" ต่อท้ายขั้นตอนตรวจคำตอบ',
    });
  }

  const randomLogicOk = hasOrderedSequence(blocks, RANDOM_SEQUENCE) && !f.bugNoDelete;
  const answerLogicOk =
    hasOrderedSequence(blocks, ANSWER_SEQUENCE) && !f.bugScoreNoCheck && !f.bugWrongVariable;
  const endLogicOk =
    hasOrderedSequence(blocks, END_SEQUENCE) && !f.bugSummaryEarly && !f.bugEmptyWrongPosition;

  if (issues.length === 0 && randomLogicOk && answerLogicOk && endLogicOk) {
    issues.push({
      id: 'all_ok',
      severity: 'ok',
      message: 'ตรรกะครบถ้วน: สุ่มข้อสอบ ตรวจคำตอบ และเงื่อนไขจบเกมถูกต้องทั้งหมด',
      advice: 'กด Run Simulation เพื่อดูการเปลี่ยนแปลงของ Array และคะแนนแบบ Real-time',
    });
  }

  return { issues, randomLogicOk, answerLogicOk, endLogicOk };
};

/** คำใบ้ตามสถานการณ์ปัจจุบันของ Workspace สำหรับปุ่ม "แสดงคำใบ้" */
export const buildHints = (blocks: WorkspaceBlock[]): string[] => {
  const f = analyzeFlags(blocks);
  const hints: string[] = [];

  if (!f.hasRandomLogic) {
    hints.push('เริ่มจากบล็อก On start of layout และ Function "Random" เพื่อสร้างจุดเริ่มของระบบ');
  }
  if (!f.hasSetNum) {
    hints.push('ใช้ Set Num to floor(random(Array.Width)) เพื่อสุ่มเลข Index ของข้อสอบ');
  }
  if (!f.hasSetCurrent) {
    hints.push('ดึงคำถามออกมาด้วย Set CurrentQuestion to Array.At(Num, 0, 0)');
  }
  if (!f.hasDelete) {
    hints.push(
      'ข้อสอบที่ใช้แล้วต้องหายไปจาก Array ลองหาบล็อกที่มีคำว่า Delete index แล้ววางต่อจาก Set CurrentQuestion',
    );
  }
  if (f.hasAddScore && !f.hasAnswerCheck) {
    hints.push('คะแนนควรเพิ่มเฉพาะเมื่อตอบถูก จึงต้องมี If Answer = bt_Select.Choice ก่อน Add 1 to Score');
  }
  if (f.scoreBeforeCheck) {
    hints.push('ลองใช้ปุ่มลูกศรเลื่อนบล็อก Add 1 to Score ลงไปอยู่ใต้เงื่อนไขตรวจคำตอบ');
  }
  if (!f.hasArrayEmptyCheck) {
    hints.push('ระบบต้องรู้ว่าเมื่อใดข้อสอบหมด ลองเพิ่ม If Array is empty ในหมวดเงื่อนไขจบเกม');
  }
  if (f.hasArrayEmptyCheck && !f.hasGoSummary) {
    hints.push('เมื่อ Array ว่างแล้ว ต้องสั่ง Go to Layout "Summary" เพื่อไปหน้าสรุปผล');
  }
  if (f.summaryBeforeEmptyCheck) {
    hints.push('Go to Layout "Summary" ต้องอยู่หลัง If Array is empty ไม่เช่นนั้นเกมจะจบเร็วเกินไป');
  }
  if (blocks.some((b) => b.blockId.startsWith('bug_'))) {
    hints.push('ใน Workspace ยังมีบล็อก Bug อยู่ ลองลบออกแล้ว Run Simulation ใหม่เพื่อเปรียบเทียบผล');
  }
  if (hints.length === 0) {
    hints.push('ตรรกะดูครบแล้ว ลองกด "Run ทีละขั้น" เพื่ออธิบายให้คู่ของคุณฟังว่าแต่ละขั้นเกิดอะไรขึ้น');
  }
  return hints;
};
