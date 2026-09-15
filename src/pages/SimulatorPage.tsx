import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Compass, Mouse, Play, Search, Wrench } from 'lucide-react';
import { BUGGY_EXAMPLE } from '../data/blocks';
import { BlockLibrary } from '../components/BlockLibrary';
import { LogicWorkspace } from '../components/LogicWorkspace';
import { StateMonitor } from '../components/StateMonitor';
import { MissionBar } from '../components/MissionBar';
import { ComparePanel } from '../components/ComparePanel';
import { ExpectedResult } from '../components/ExpectedResult';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import type { BlockCategory, BlockId, SimResult, WorkspaceBlock } from '../types';
import { emptyState, MISSION_SUCCESS_MESSAGES, runSimulation } from '../utils/simulator';
import { analyzeFlags, buildHints, validateWorkspace } from '../utils/validator';
import { useRoleTimer } from '../context/RoleTimerContext';

const newUid = () => `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const SimulatorPage = () => {
  const { state, update } = useApp();
  const { notify } = useToast();
  const { currentDriver, currentNavigator } = useRoleTimer();

  const [result, setResult] = useState<SimResult | null>(null);
  const [frameIndex, setFrameIndex] = useState(-1);
  const [hintsOpen, setHintsOpen] = useState(false);

  const blocks = state.workspace;
  const report = useMemo(() => validateWorkspace(blocks), [blocks]);
  const flags = useMemo(() => analyzeFlags(blocks), [blocks]);
  const hints = useMemo(() => buildHints(blocks), [blocks]);

  const frame = result && frameIndex >= 0 ? result.frames[frameIndex] : null;
  const displayState = frame ? frame.state : emptyState();

  const setBlocks = useCallback(
    (next: WorkspaceBlock[]) => {
      update({ workspace: next });
      // ตรรกะเปลี่ยน ผลจำลองเดิมใช้ไม่ได้แล้ว
      setResult(null);
      setFrameIndex(-1);
    },
    [update],
  );

  /**
   * โหลดโจทย์ตั้งต้นให้อัตโนมัติเมื่อเข้าหน้านี้ครั้งแรก
   *
   * ภารกิจของหน้านี้คือ "แก้ Bug" ไม่ใช่ "เขียนโปรแกรมขึ้นมาจากศูนย์"
   * แต่เดิมพื้นที่เรียงตรรกะว่างเปล่า ผู้เรียนจึงต้องประกอบโปรแกรมทั้งชุดเองก่อน
   * ทำให้คำสั่งภารกิจที่บอกว่า "เพิ่มบล็อกต่อจาก Set CurrentQuestion" อ่านแล้วไม่รู้เรื่อง
   * เพราะบล็อกที่อ้างถึงยังไม่มีอยู่บนจอเลยสักอัน
   *
   * โหลดเฉพาะตอนที่ยังไม่เคยกด Run เลยเท่านั้น
   * ถ้าผู้เรียนตั้งใจกดล้าง Workspace ทีหลัง ระบบจะไม่โหลดกลับมาทับ
   */
  const autoLoaded = useRef(false);
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    if (blocks.length > 0 || state.missions.runCount > 0) return;
    setBlocks(BUGGY_EXAMPLE.map((blockId) => ({ uid: newUid(), blockId })));
  }, [blocks.length, state.missions.runCount, setBlocks]);

  /** บันทึกผลภารกิจและ Debug Log เมื่อการจำลองเดินมาถึงเฟรมสุดท้าย */
  const finalize = useCallback(
    (r: SimResult) => {
      const alreadyM1 = state.missions.mission1Passed;
      const alreadyM2 = state.missions.mission2Passed;

      const now = new Date().toISOString();
      update((prev) => ({
        missions: {
          ...prev.missions,
          mission1Passed: prev.missions.mission1Passed || r.mission1Passed,
          mission2Passed: prev.missions.mission2Passed || r.mission2Passed,
          // นับคะแนนเฉพาะรอบที่ระบบทำงานจบอย่างถูกต้อง
          // กันไม่ให้ตรรกะที่มี Bug (เช่น เพิ่มคะแนนโดยไม่ตรวจคำตอบ) ดันคะแนนสูงเกินจริง
          bestScore:
            r.finalState.status === 'completed'
              ? Math.max(prev.missions.bestScore, r.finalState.score)
              : prev.missions.bestScore,
          // เก็บร่องรอยการลงมือทำ ใช้ทำรายงานให้ครูเห็นกระบวนการไม่ใช่แค่ผลลัพธ์
          runCount: prev.missions.runCount + 1,
          mission1At: prev.missions.mission1At ?? (r.mission1Passed ? now : null),
          mission2At: prev.missions.mission2At ?? (r.mission2Passed ? now : null),
          lastBlockCount: blocks.length,
        },
        lastDebugLog: r.finalState.log,
      }));

      if (r.mission1Passed && !alreadyM1) notify(MISSION_SUCCESS_MESSAGES.mission1, 'success');
      if (r.mission2Passed && !alreadyM2) notify(MISSION_SUCCESS_MESSAGES.mission2, 'success');
      if (r.mission1Passed && r.mission2Passed && !(alreadyM1 && alreadyM2)) {
        notify('ได้รับเหรียญ Logic Master ครบทั้ง 2 ภารกิจแล้ว', 'success');
      }
    },
    [blocks.length, notify, state.missions.mission1Passed, state.missions.mission2Passed, update],
  );

  /* ---------- จัดการบล็อกใน Workspace ---------- */

  const handleAdd = (blockId: BlockId) => {
    // ไม่แจ้งเตือนทุกครั้งที่เพิ่มบล็อก เพราะผู้เรียนเห็นบล็อกปรากฏใน Workspace อยู่แล้ว
    setBlocks([...blocks, { uid: newUid(), blockId }]);
  };

  const handleRemove = (uid: string) => {
    setBlocks(blocks.filter((b) => b.uid !== uid));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };

  const handleLoadBuggy = () => {
    setBlocks(BUGGY_EXAMPLE.map((blockId) => ({ uid: newUid(), blockId })));
    setHintsOpen(true);
    notify('โหลดตัวอย่างตรรกะที่มี Bug แล้ว ลอง Run Simulation เพื่อดูอาการของปัญหา', 'warn');
  };

  const handleClear = () => {
    setBlocks([]);
    notify('ล้าง Workspace เรียบร้อยแล้ว', 'info');
  };

  /* ---------- ควบคุมการจำลอง ---------- */

  const handleRun = () => {
    const r = runSimulation(blocks);
    setResult(r);
    setFrameIndex(r.frames.length - 1);
    finalize(r);
    notify('จำลองการทำงานเสร็จแล้ว ตรวจผลได้ที่ State Monitor และ Debug Log', 'info');
  };

  const handleStep = () => {
    if (!result) {
      const r = runSimulation(blocks);
      setResult(r);
      setFrameIndex(0);
      if (r.frames.length === 1) finalize(r);
      return;
    }
    if (frameIndex >= result.frames.length - 1) {
      notify('การจำลองเดินมาถึงขั้นสุดท้ายแล้ว กด Reset Simulation เพื่อเริ่มใหม่', 'info');
      return;
    }
    const next = frameIndex + 1;
    setFrameIndex(next);
    if (next === result.frames.length - 1) finalize(result);
  };

  const handleResetSim = () => {
    setResult(null);
    setFrameIndex(-1);
    notify('รีเซ็ตการจำลองแล้ว ค่าทุกตัวกลับสู่สถานะเริ่มต้น', 'info');
  };

  const handleCopyLog = async () => {
    const text = displayState.log.map((l) => `[${l.time}] ${l.message}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      notify('คัดลอก Debug Log ลงคลิปบอร์ดแล้ว นำไปวางในใบงานได้เลย', 'success');
    } catch {
      notify('เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ กรุณาเลือกข้อความแล้วกด Ctrl+C', 'warn');
    }
  };

  /**
   * หมวดบล็อกที่ภารกิจปัจจุบันต้องใช้
   * ภารกิจที่ 1 แก้ที่ชุดคำสั่งสุ่มข้อสอบ ภารกิจที่ 2 แก้ที่เงื่อนไขจบเกม
   * เมื่อผ่านครบทั้งสองภารกิจแล้วจึงเปิดทุกหมวด เพราะไม่มีภารกิจให้โฟกัสอีก
   */
  const focusCategory: BlockCategory | null =
    state.missions.mission1Passed && state.missions.mission2Passed
      ? null
      : state.missions.mission1Passed
        ? 'end'
        : 'start';

  const stepLabel = result
    ? `ขั้นที่ ${frameIndex + 1} จาก ${result.frames.length}`
    : 'ยังไม่เริ่มการจำลอง';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        {/* แสดงว่าตอนนี้ใครทำหน้าที่อะไร เปลี่ยนตามการสลับบทบาทจริง */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-slate-700">คู่ {state.pair.pairCode || '-'}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
            <Mouse className="h-3.5 w-3.5" aria-hidden="true" />
            Driver: {currentDriver}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-think-200 bg-think-50 px-2.5 py-1 text-xs font-semibold text-think-800">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            Navigator: {currentNavigator}
          </span>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          {stepLabel}
        </p>
      </div>

      <MissionBar missions={state.missions} />

      {/* ป้ายบอกลำดับการทำงาน แสดงเฉพาะก่อนกด Run ครั้งแรก
          หน้านี้มีแผงข้อมูลหลายแผง ผู้เรียนที่เพิ่งเปิดครั้งแรกจึงไม่รู้ว่าควรเริ่มจากตรงไหน */}
      {result === null && (
        <section
          className="rounded-[1.25rem] border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white px-4 py-3.5"
          style={{ boxShadow: '0 5px 0 0 rgba(99,102,241,0.25)' }}
        >
          <p className="mb-2.5 font-display text-[15px] font-bold text-brand-800">
            เริ่มตรงนี้ ทำ 3 ขั้นตามลำดับ
          </p>
          <ol className="grid gap-2 sm:grid-cols-3">
            {[
              {
                icon: Play,
                title: 'กด Run Simulation ก่อน',
                detail: 'โปรแกรมที่มี Bug ถูกวางไว้ให้แล้ว กด Run เพื่อดูว่าอาการเสียเป็นอย่างไร',
              },
              {
                icon: Search,
                title: 'อ่าน State Monitor',
                detail: 'ดูว่าค่าไหนไม่เปลี่ยนตามที่ควรเป็น โดยเฉพาะ Array Size และจำนวนครั้งที่สุ่มซ้ำ',
              },
              {
                icon: Wrench,
                title: 'เพิ่มหรือย้ายบล็อก แล้ว Run ใหม่',
                detail: 'แก้ทีละอย่างแล้ว Run ทุกครั้ง จะได้รู้ว่าการแก้นั้นได้ผลจริงหรือไม่',
              },
            ].map((s2, i) => {
              const Icon = s2.icon;
              return (
                <li
                  key={s2.title}
                  className="flex gap-2.5 rounded-2xl border-2 border-white bg-white/80 px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-clay-sm">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-bold text-slate-800">
                      {i + 1}. {s2.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                      {s2.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ตารางเทียบผลของผู้เรียนกับผลที่ถูกต้อง วางไว้เหนือพื้นที่ทำงาน
          เพื่อให้เห็นเป้าหมายก่อนลงมือ และกวาดตากลับมาเทียบได้ทุกครั้งหลังกด Run */}
      <ExpectedResult state={displayState} hasRun={result !== null} />

      {/* 3 คอลัมน์บนจอใหญ่ เรียงลงมาบนมือถือ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,340px)]">
        {/* คลังบล็อกเต็มรูปแบบใช้เฉพาะจอกว้างที่วางได้ 3 คอลัมน์
            จอเล็กกว่านั้นใช้ตัวเลือกย่อที่อยู่ในกรอบเดียวกับพื้นที่เรียงตรรกะแทน */}
        <div className="hidden xl:block">
          <BlockLibrary onAdd={handleAdd} focusCategory={focusCategory} />
        </div>

        <LogicWorkspace
          blocks={blocks}
          report={report}
          activeBlockId={frame?.activeBlockId ?? null}
          hints={hints}
          hintsOpen={hintsOpen}
          isRunning={result !== null}
          onMove={handleMove}
          onRemove={handleRemove}
          onLoadBuggy={handleLoadBuggy}
          onClear={handleClear}
          onRun={handleRun}
          onStep={handleStep}
          onResetSim={handleResetSim}
          onToggleHints={() => setHintsOpen((v) => !v)}
          onAdd={handleAdd}
          focusCategory={focusCategory}
        />

        <StateMonitor
          state={displayState}
          caption={frame?.caption ?? ''}
          onCopyLog={handleCopyLog}
          focus={state.missions.mission1Passed ? 'mission2' : 'mission1'}
        />
      </div>

      {/* ตารางเปรียบเทียบจะมีความหมายก็ต่อเมื่อมีผลการจำลองให้เทียบแล้ว
          ถ้าแสดงตั้งแต่ยังไม่ได้ Run จะเป็นแผงที่เต็มไปด้วยคำว่า "ยังไม่เกิดขึ้น" และรกตาเปล่า ๆ */}
      {result !== null && <ComparePanel flags={flags} state={displayState} />}
    </div>
  );
};
