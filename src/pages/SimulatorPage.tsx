import { useCallback, useMemo, useState } from 'react';
import { BUGGY_EXAMPLE } from '../data/blocks';
import { BlockLibrary } from '../components/BlockLibrary';
import { LogicWorkspace } from '../components/LogicWorkspace';
import { StateMonitor } from '../components/StateMonitor';
import { MissionPanel } from '../components/MissionPanel';
import { ComparePanel } from '../components/ComparePanel';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import type { BlockId, SimResult, WorkspaceBlock } from '../types';
import { emptyState, MISSION_SUCCESS_MESSAGES, runSimulation } from '../utils/simulator';
import { analyzeFlags, buildHints, validateWorkspace } from '../utils/validator';

const newUid = () => `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const SimulatorPage = () => {
  const { state, update } = useApp();
  const { notify } = useToast();

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

  /** บันทึกผลภารกิจและ Debug Log เมื่อการจำลองเดินมาถึงเฟรมสุดท้าย */
  const finalize = useCallback(
    (r: SimResult) => {
      const alreadyM1 = state.missions.mission1Passed;
      const alreadyM2 = state.missions.mission2Passed;

      update((prev) => ({
        missions: {
          mission1Passed: prev.missions.mission1Passed || r.mission1Passed,
          mission2Passed: prev.missions.mission2Passed || r.mission2Passed,
          // นับคะแนนเฉพาะรอบที่ระบบทำงานจบอย่างถูกต้อง
          // กันไม่ให้ตรรกะที่มี Bug (เช่น เพิ่มคะแนนโดยไม่ตรวจคำตอบ) ดันคะแนนสูงเกินจริง
          bestScore:
            r.finalState.status === 'completed'
              ? Math.max(prev.missions.bestScore, r.finalState.score)
              : prev.missions.bestScore,
        },
        lastDebugLog: r.finalState.log,
      }));

      if (r.mission1Passed && !alreadyM1) notify(MISSION_SUCCESS_MESSAGES.mission1, 'success');
      if (r.mission2Passed && !alreadyM2) notify(MISSION_SUCCESS_MESSAGES.mission2, 'success');
      if (r.mission1Passed && r.mission2Passed && !(alreadyM1 && alreadyM2)) {
        notify('ได้รับเหรียญ Logic Master ครบทั้ง 2 ภารกิจแล้ว', 'success');
      }
    },
    [notify, state.missions.mission1Passed, state.missions.mission2Passed, update],
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

  const stepLabel = result
    ? `ขั้นที่ ${frameIndex + 1} จาก ${result.frames.length}`
    : 'ยังไม่เริ่มการจำลอง';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          คู่ <span className="font-semibold text-slate-800">{state.pair.pairCode || '-'}</span> | Driver:{' '}
          <span className="font-semibold text-slate-800">{state.pair.driverName || '-'}</span> | Navigator:{' '}
          <span className="font-semibold text-slate-800">{state.pair.navigatorName || '-'}</span>
        </p>
        <p className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          {stepLabel}
        </p>
      </div>

      {/* 3 คอลัมน์บนจอใหญ่ เรียงลงมาบนมือถือ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,340px)]">
        <BlockLibrary onAdd={handleAdd} />

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
        />

        <StateMonitor
          state={displayState}
          caption={frame?.caption ?? ''}
          onCopyLog={handleCopyLog}
        />
      </div>

      <ComparePanel flags={flags} state={displayState} />

      <MissionPanel missions={state.missions} liveState={displayState} />
    </div>
  );
};
