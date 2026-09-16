import { APP_CONFIG } from '../config';
import { QUIZ_QUESTIONS } from '../data/questions';
import type {
  BlockId,
  LogEntry,
  LogLevel,
  QuizQuestion,
  SimFrame,
  SimResult,
  SimState,
  WorkspaceBlock,
} from '../types';
import { analyzeFlags } from './validator';

/** ตัวสุ่มแบบมี seed เพื่อให้ผลของ "Run ทั้งหมด" กับ "Run ทีละขั้น" ตรงกันเสมอ */
const createRandom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

const pad = (n: number) => String(n).padStart(2, '0');

/** เวลาเดินหน้าครั้งละ 1 วินาที เพื่อให้ Debug Log อ่านเป็นลำดับเวลาได้ */
const makeClock = (start: Date) => {
  let tick = 0;
  return () => {
    const d = new Date(start.getTime() + tick * 1000);
    tick += 1;
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
};

export const emptyState = (): SimState => ({
  remaining: QUIZ_QUESTIONS.map((q) => q.code),
  arraySize: QUIZ_QUESTIONS.length,
  num: null,
  currentQuestion: null,
  selectedAnswer: null,
  correctAnswer: null,
  score: 0,
  layout: 'Quiz',
  status: 'ready',
  answeredCount: 0,
  duplicateCount: 0,
  log: [],
});

/**
 * สร้างการจำลองทั้งหมดล่วงหน้าเป็นลำดับเฟรม
 * ทำให้ปุ่ม Run / Run ทีละขั้น / Reset ใช้ข้อมูลชุดเดียวกัน
 */
export const runSimulation = (blocks: WorkspaceBlock[], seed = 20690701): SimResult => {
  const flags = analyzeFlags(blocks);
  const rand = createRandom(seed);
  const clock = makeClock(new Date());

  const frames: SimFrame[] = [];
  let state = emptyState();

  /** เก็บภาพสถานะปัจจุบันเป็นเฟรมใหม่ */
  const commit = (activeBlockId: BlockId | null, caption: string) => {
    frames.push({
      state: { ...state, remaining: [...state.remaining], log: [...state.log] },
      activeBlockId,
      caption,
    });
  };

  const log = (message: string, level: LogLevel = 'info') => {
    const entry: LogEntry = { time: clock(), message, level };
    state = { ...state, log: [...state.log, entry] };
  };

  /** พูลข้อสอบที่ยังอยู่ใน Array จริง ๆ (จำลอง Array ของ Construct 2) */
  let pool: QuizQuestion[] = [...QUIZ_QUESTIONS];
  const answeredCodes = new Set<string>();

  state = { ...state, status: 'running' };
  log('เริ่มการจำลองระบบ', 'info');
  commit(flags.hasRandomLogic ? 'on_start' : null, 'เริ่มการจำลองระบบ');

  /* ไม่มีตรรกะสุ่มเลย ระบบเริ่มแบบทดสอบไม่ได้ */
  if (!flags.hasRandomLogic) {
    log('ไม่พบคำสั่งสุ่มข้อสอบ ระบบจึงเริ่มแบบทดสอบไม่ได้', 'error');
    state = { ...state, status: 'bug' };
    commit(null, 'หยุดทำงาน: ไม่มี Function "Random"');
    return finish(frames, state, flags.hasDelete);
  }

  const maxRounds = APP_CONFIG.maxSimulationRounds;
  let round = 0;
  let stopped = false;

  while (round < maxRounds && !stopped) {
    round += 1;

    /* ---------- ตรวจเงื่อนไขจบเกมก่อนสุ่มรอบใหม่ ---------- */
    if (pool.length === 0) {
      if (flags.hasArrayEmptyCheck && flags.hasGoSummary && !flags.bugEmptyWrongPosition) {
        log('ตรวจเงื่อนไข: Array is empty เป็นจริง', 'success');
        commit('if_array_empty', 'Array ว่างแล้ว เงื่อนไขจบเกมเป็นจริง');
        state = { ...state, layout: 'Summary', status: 'completed' };
        log('เปลี่ยน Layout เป็น "Summary"', 'success');
        commit('go_summary', 'ไปหน้า Summary');
        if (flags.hasDisplayScore) {
          log(`แสดงคะแนนรวม: ${state.score} คะแนน`, 'success');
          commit('display_score', 'แสดงคะแนนรวมบนหน้า Summary');
        } else {
          log('ยังไม่มีคำสั่ง Display Score ผู้เล่นจึงไม่เห็นคะแนนบนหน้าสรุปผล', 'warn');
          commit(null, 'ขาดคำสั่ง Display Score');
        }
      } else {
        log('ข้อสอบใน Array หมดแล้ว แต่ระบบยังค้างอยู่ที่หน้า Quiz', 'error');
        log('สาเหตุ: ไม่มีเงื่อนไข If Array is empty หรือวาง Go to Layout "Summary" ผิดตำแหน่ง', 'error');
        state = { ...state, status: 'bug' };
        commit(null, 'Bug: ทำข้อสอบครบแล้วแต่ไม่เข้าสู่หน้าสรุปผล');
      }
      stopped = true;
      break;
    }

    /* ---------- Function "Random" ---------- */
    const num = Math.floor(rand() * pool.length);
    const picked = pool[num];
    state = { ...state, num };
    log(`สุ่มตำแหน่ง Num = ${num}`, 'info');
    commit('set_num', `สุ่ม Index จาก Array.Width = ${pool.length}`);

    state = {
      ...state,
      currentQuestion: picked,
      correctAnswer: picked.correctAnswer,
      selectedAnswer: null,
    };
    log(`เลือกข้อสอบ ${picked.code}`, 'info');
    commit('set_current', `Set CurrentQuestion = ${picked.code}`);

    const isDuplicate = answeredCodes.has(picked.code);
    if (isDuplicate) {
      state = { ...state, duplicateCount: state.duplicateCount + 1, status: 'bug' };
      log(`พบข้อผิดพลาด: สุ่มได้ข้อสอบ ${picked.code} ซ้ำกับที่ทำไปแล้ว`, 'error');
      commit(null, `สุ่มซ้ำ: ${picked.code}`);
    }

    /* ---------- Delete index ---------- */
    if (flags.hasDelete && !flags.bugNoDelete) {
      pool = pool.filter((_, i) => i !== num);
      state = { ...state, remaining: pool.map((q) => q.code), arraySize: pool.length };
      log(`ลบข้อมูลตำแหน่ง Index ${num}`, 'success');
      log(`Array คงเหลือ ${pool.length} ข้อ`, 'info');
      commit('delete_index', `ลบข้อสอบที่ใช้แล้ว เหลือ ${pool.length} ข้อ`);
    } else {
      log(`ยังไม่ได้ลบ Index ${num} ออกจาก Array คงเหลือ ${pool.length} ข้อเท่าเดิม`, 'warn');
      commit(null, `ไม่มี Delete index: Array.Width ยังเท่ากับ ${pool.length}`);
    }

    /* ---------- Display CurrentQuestion ---------- */
    if (flags.hasDisplayQuestion) {
      log(`แสดงคำถาม: ${picked.text}`, 'info');
      commit('display_question', 'แสดงคำถามบนหน้าจอ');
    } else {
      log('ไม่มีคำสั่ง Display CurrentQuestion ผู้เล่นจึงไม่เห็นโจทย์', 'warn');
      commit(null, 'ขาดคำสั่ง Display CurrentQuestion');
    }

    /* ---------- ผู้เล่นตอบคำถาม ---------- */
    const answersCorrectly = rand() > 0.25;
    const wrongChoice =
      picked.choices.find((c) => c !== picked.correctAnswer) ?? picked.correctAnswer;
    const selected = answersCorrectly ? picked.correctAnswer : wrongChoice;
    state = { ...state, selectedAnswer: selected, answeredCount: state.answeredCount + 1 };
    answeredCodes.add(picked.code);
    log(`ผู้เล่นเลือกคำตอบ: ${selected}`, 'info');
    commit(flags.hasAnswerClicked ? 'on_answer_clicked' : null, 'ผู้เล่นกดปุ่มคำตอบ');

    /* ---------- ตรวจคำตอบและให้คะแนน ---------- */
    const judgedCorrect = flags.bugWrongVariable ? false : answersCorrectly;
    if (flags.bugWrongVariable) {
      log('เปรียบเทียบผิดตัวแปร ระบบตัดสินว่าตอบผิดเสมอ', 'error');
      state = { ...state, status: 'bug' };
      commit(null, 'Bug: Compare wrong answer variable');
    }

    if (!flags.hasAddScore) {
      log('ไม่มีคำสั่ง Add 1 to Score คะแนนจึงไม่เปลี่ยนแปลง', 'warn');
      commit(null, 'ขาดคำสั่ง Add 1 to Score');
    } else if (flags.scoreBeforeCheck || flags.bugScoreNoCheck || !flags.hasAnswerCheck) {
      state = { ...state, score: state.score + 1, status: 'bug' };
      log(
        `เพิ่มคะแนนโดยไม่ตรวจคำตอบก่อน Score = ${state.score} (ผู้เล่นตอบ${answersCorrectly ? 'ถูก' : 'ผิด'})`,
        'error',
      );
      commit('add_score', 'Bug: คะแนนเพิ่มแม้ตอบผิด');
    } else {
      log(`ตรวจคำตอบ: ${judgedCorrect ? 'ถูกต้อง' : 'ไม่ถูกต้อง'}`, judgedCorrect ? 'success' : 'warn');
      commit('if_answer_correct', 'ตรวจคำตอบด้วย If Answer = bt_Select.Choice');
      if (judgedCorrect) {
        state = { ...state, score: state.score + 1 };
        log(`Score เพิ่มเป็น ${state.score}`, 'success');
        commit('add_score', `เพิ่มคะแนนเป็น ${state.score}`);
      } else if (flags.hasElse) {
        // กรณีตอบผิดมีคำสั่งรองรับ ตรงกับ Event 9 ในไฟล์จริงที่แสดงเครื่องหมายผิด
        log('เข้าเงื่อนไข Else: ตอบผิด ระบบแจ้งผลว่าผิดโดยไม่เพิ่มคะแนน', 'info');
        commit('else_branch', 'เข้าเงื่อนไข Else กรณีตอบผิด');
      } else {
        log('ตอบผิดแล้วไม่มีคำสั่งใดทำงาน เพราะยังไม่มี System: Else รองรับกรณีนี้', 'warn');
        commit(null, 'ไม่มี Else รองรับกรณีตอบผิด');
      }
    }

    /* ---------- ไปหน้าสรุปผลเร็วเกินไป ---------- */
    if (flags.summaryBeforeEmptyCheck || flags.bugSummaryEarly) {
      state = { ...state, layout: 'Summary', status: 'bug' };
      log('เปลี่ยนไปหน้า Summary ทั้งที่ยังมีข้อสอบเหลือใน Array', 'error');
      commit('go_summary', 'Bug: จบแบบทดสอบก่อนทำครบทุกข้อ');
      stopped = true;
      break;
    }

    /* ---------- เรียกข้อถัดไป ---------- */
    if (!flags.hasCallRandom) {
      log('ไม่มี Call Function "Random" ระบบจึงค้างอยู่ที่ข้อเดิม', 'warn');
      state = { ...state, status: 'bug' };
      commit(null, 'Bug: ระบบไม่ไปข้อถัดไป');
      stopped = true;
      break;
    }
    log('เรียก Function "Random" เพื่อไปข้อถัดไป', 'info');
    commit('call_random', 'ไปข้อถัดไป');
  }

  if (!stopped && round >= maxRounds) {
    log(`ทำงานครบ ${maxRounds} รอบแล้วแต่ Array ยังเหลือ ${pool.length} ข้อ ระบบจึงไม่จบสักที`, 'error');
    state = { ...state, status: 'bug' };
    commit(null, 'หยุดการจำลอง: ตรวจพบการวนซ้ำไม่รู้จบ');
  }

  return finish(frames, state, flags.hasDelete && !flags.bugNoDelete);
};

const finish = (frames: SimFrame[], state: SimState, deleteUsed: boolean): SimResult => {
  const mission1Passed = deleteUsed && state.duplicateCount === 0 && state.answeredCount > 0;
  const mission2Passed = state.layout === 'Summary' && state.status === 'completed';
  return { frames, finalState: state, mission1Passed, mission2Passed };
};

export const MISSION_SUCCESS_MESSAGES = {
  mission1: 'แก้ไขสำเร็จ: ข้อสอบที่ใช้งานแล้วถูกลบออกจาก Array จึงไม่ถูกสุ่มซ้ำ',
  mission2: 'แก้ไขสำเร็จ: เมื่อ Array ว่าง ระบบจะเปลี่ยนไปหน้า Summary',
} as const;
