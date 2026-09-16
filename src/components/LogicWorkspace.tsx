import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Blocks,
  ChevronDown,
  CircleCheck,
  Eraser,
  FlaskConical,
  GripVertical,
  Lightbulb,
  Play,
  RotateCcw,
  StepForward,
  Trash2,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
import { BLOCK_MAP } from '../data/blocks';
import type { BlockCategory, BlockId, LogicReport, WorkspaceBlock } from '../types';
import { Button, Card, EmptyState } from './Ui';
import { InlineBlockPicker } from './InlineBlockPicker';

interface Props {
  blocks: WorkspaceBlock[];
  report: LogicReport;
  activeBlockId: BlockId | null;
  hints: string[];
  hintsOpen: boolean;
  isRunning: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  /** ย้ายบล็อกจากตำแหน่ง from ไปแทรกที่ตำแหน่ง to ใช้กับการลากวาง */
  onReorder: (from: number, to: number) => void;
  onRemove: (uid: string) => void;
  onLoadBuggy: () => void;
  onClear: () => void;
  onRun: () => void;
  onStep: () => void;
  onResetSim: () => void;
  onToggleHints: () => void;
  onAdd: (id: BlockId) => void;
  /** หมวดบล็อกที่ภารกิจปัจจุบันต้องใช้ ส่งต่อให้ตัวเลือกบล็อกแบบย่อ */
  focusCategory: BlockCategory | null;
}

/**
 * คำนวณเลขเหตุการณ์และระดับการย่อหน้าของแต่ละบล็อก ให้อ่านเหมือน Event Sheet จริง
 *
 * ของจริงใน Construct 2 เป็นโครงสร้างต้นไม้ คำสั่งอยู่ใต้เงื่อนไข และเงื่อนไขอยู่ใต้เหตุการณ์
 * ส่วนพื้นที่เรียงตรรกะเก็บข้อมูลเป็นรายการเรียงลำดับ จึงคำนวณระดับจากลำดับที่ผู้เรียนวางเอง
 * ไม่ได้กำหนดตายตัวไว้ล่วงหน้า ผู้เรียนจึงเห็นทันทีว่าการสลับลำดับทำให้คำสั่งย้ายไปอยู่ใต้เงื่อนไขอื่น
 *
 * คำสั่งที่ถูกวางไว้ก่อนเหตุการณ์ใด ๆ จะอยู่ระดับ 0 และถูกทำเครื่องหมายว่ายังไม่มีเหตุการณ์ครอบ
 * ซึ่งเป็นความผิดพลาดแบบเดียวกับที่เกิดใน Construct 2 จริง
 */
interface Structured {
  depth: number;
  eventNo: number | null;
  orphan: boolean;
}

const buildStructure = (ids: BlockId[]): Structured[] => {
  let eventNo = 0;
  let hasEvent = false;
  let inCondition = false;
  return ids.map((id) => {
    const kind = BLOCK_MAP[id]?.kind ?? 'action';
    if (kind === 'event') {
      eventNo += 1;
      hasEvent = true;
      inCondition = false;
      return { depth: 0, eventNo, orphan: false };
    }
    if (kind === 'condition') {
      eventNo += 1;
      inCondition = true;
      return { depth: hasEvent ? 1 : 0, eventNo, orphan: !hasEvent };
    }
    const depth = !hasEvent ? 0 : inCondition ? 2 : 1;
    return { depth, eventNo: null, orphan: !hasEvent };
  });
};

export const LogicWorkspace = ({
  blocks,
  report,
  activeBlockId,
  hints,
  hintsOpen,
  isRunning,
  onMove,
  onReorder,
  onRemove,
  onLoadBuggy,
  onClear,
  onRun,
  onStep,
  onResetSim,
  onToggleHints,
  onAdd,
  focusCategory,
}: Props) => {
  /** เครื่องมือที่ใช้นาน ๆ ครั้ง ปิดไว้ก่อนเพื่อลดจำนวนปุ่มที่ต้องทำความเข้าใจ */
  const [toolsOpen, setToolsOpen] = useState(false);
  const structure = buildStructure(blocks.map((b) => b.blockId));

  /**
   * การลากวางด้วย Pointer Events ไม่ใช่ HTML5 drag and drop
   *
   * เลือกแบบนี้เพราะ drag and drop ของ HTML5 ใช้ไม่ได้บน Safari ของ iPad
   * ซึ่งเป็นเครื่องที่ผู้เรียนใช้จริงครึ่งหนึ่ง ส่วน Pointer Events รองรับทั้งเมาส์และนิ้ว
   *
   * ปุ่มขึ้นลงยังอยู่ครบ เพราะลากวางในรายการยาว ๆ บนจอสัมผัสพลาดง่าย
   * และปุ่มยังใช้ได้ด้วยคีย์บอร์ดสำหรับผู้ที่ใช้เมาส์ไม่ได้
   */
  const listRef = useRef<HTMLOListElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  /** หาว่าตำแหน่ง y ของนิ้วหรือเมาส์ ตรงกับแถวที่เท่าไร */
  const rowAt = (clientY: number): number | null => {
    const items = listRef.current?.querySelectorAll('li[data-index]');
    if (!items) return null;
    for (let i = 0; i < items.length; i += 1) {
      const r = items[i].getBoundingClientRect();
      if (clientY < r.bottom) return i;
    }
    return items.length - 1;
  };

  const startDrag = (index: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    // บางเบราว์เซอร์ปฏิเสธการจับ pointer ถ้า id ไม่ได้อยู่ในสถานะใช้งาน
    // การลากยังทำงานได้โดยไม่ต้องจับ จึงไม่ปล่อยให้ข้อผิดพลาดนี้ทำให้ทั้งหน้าพัง
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ไม่เป็นไร ใช้การติดตามจากตำแหน่งแถวแทนได้ */
    }
    setDragFrom(index);
    setDragOver(index);
  };

  const moveDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragFrom === null) return;
    const over = rowAt(e.clientY);
    if (over !== null) setDragOver(over);
  };

  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragFrom !== null && dragOver !== null && dragOver !== dragFrom) {
      onReorder(dragFrom, dragOver);
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ไม่ได้จับไว้ตั้งแต่แรก ข้ามได้ */
    }
    setDragFrom(null);
    setDragOver(null);
  };

  return (
  <Card
    title="พื้นที่เรียงลำดับตรรกะ"
    subtitle="ลากที่จุดจับหรือกดปุ่มขึ้นลงเพื่อจัดลำดับ คำสั่งจะย่อหน้าเข้าไปอยู่ใต้เหตุการณ์หรือเงื่อนไขที่อยู่เหนือมัน เหมือน Event Sheet จริง"
    icon={<Blocks className="h-5 w-5 text-think-600" aria-hidden="true" />}
  >
    {/*
      ตัวเลือกบล็อกอยู่ในกรอบเดียวกับพื้นที่วางบล็อก แสดงเฉพาะจอที่ยังไม่ถึง 3 คอลัมน์
      จอกว้างมีคลังบล็อกเป็นคอลัมน์ซ้ายให้เห็นคู่กันอยู่แล้ว จึงไม่ต้องแสดงซ้ำ
    */}
    <div className="xl:hidden">
      <InlineBlockPicker onAdd={onAdd} focusCategory={focusCategory} />
    </div>

    {/* ---------- แถบปุ่มควบคุม ---------- */}
    {/* แถวปุ่มหลัก เหลือเฉพาะ 4 ปุ่มที่ใช้ทุกครั้งในวงจรแก้ Bug
        ส่วนปุ่มที่ใช้นาน ๆ ครั้งและปุ่มที่ลบงานทิ้งได้ ย้ายไปอยู่หลังปุ่มเครื่องมือเพิ่มเติม
        เพราะหน้านี้มีของให้เรียนรู้มากอยู่แล้ว และการวางปุ่มล้างงานไว้ข้างปุ่ม Run เสี่ยงกดพลาด */}
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button variant="primary" onClick={onRun} disabled={blocks.length === 0}>
        <Play className="h-4 w-4" aria-hidden="true" />
        Run Simulation
      </Button>
      <Button variant="purple" onClick={onStep} disabled={blocks.length === 0}>
        <StepForward className="h-4 w-4" aria-hidden="true" />
        Run ทีละขั้น
      </Button>
      <Button variant="secondary" onClick={onResetSim} disabled={!isRunning}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset Simulation
      </Button>
      <Button variant="secondary" onClick={onToggleHints}>
        <Lightbulb className="h-4 w-4 text-lemon-500" aria-hidden="true" />
        {hintsOpen ? 'ซ่อนคำใบ้' : 'แสดงคำใบ้'}
      </Button>

      <button
        type="button"
        onClick={() => setToolsOpen((v) => !v)}
        aria-expanded={toolsOpen}
        className="ml-auto inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 font-display text-xs font-semibold text-slate-500 transition hover:text-slate-700"
      >
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        เครื่องมือเพิ่มเติม
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
    </div>

    {toolsOpen && (
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
        <Button variant="secondary" onClick={onLoadBuggy}>
          <FlaskConical className="h-4 w-4 text-bubble-500" aria-hidden="true" />
          โหลดโจทย์ตั้งต้นใหม่
        </Button>
        <Button variant="ghost" onClick={onClear} disabled={blocks.length === 0}>
          <Eraser className="h-4 w-4" aria-hidden="true" />
          ล้าง Workspace
        </Button>
        <p className="w-full text-xs leading-relaxed text-slate-500">
          โจทย์ตั้งต้นถูกวางไว้ให้อัตโนมัติตั้งแต่เปิดหน้านี้แล้ว
          สองปุ่มนี้ใช้เมื่อต้องการเริ่มใหม่ทั้งหมดเท่านั้น
        </p>
      </div>
    )}

    {/* ---------- คำใบ้ ---------- */}
    {hintsOpen && (
      <div className="mb-4 animate-pop rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white p-3.5">
        <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-peach-900">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          คำใบ้สำหรับขั้นตอนถัดไป
        </p>
        <ul className="space-y-1.5">
          {hints.map((hint) => (
            <li key={hint} className="flex gap-2 text-sm leading-relaxed text-peach-900">
              <span aria-hidden="true">→</span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* ---------- รายการบล็อก ---------- */}
    {blocks.length === 0 ? (
      <EmptyState
        icon={<Blocks className="h-10 w-10" aria-hidden="true" />}
        title="ยังไม่มีบล็อกคำสั่งในพื้นที่นี้"
        description="เลือกบล็อกจากคลังคำสั่งแล้วกดปุ่ม + เพื่อเริ่มเรียงตรรกะ หรือกดปุ่ม เครื่องมือเพิ่มเติม แล้วเลือก โหลดโจทย์ตั้งต้นใหม่"
      />
    ) : (
      <ol ref={listRef} className="space-y-2">
        {blocks.map((block, index) => {
          const def = BLOCK_MAP[block.blockId];
          const active = activeBlockId === block.blockId;
          const st = structure[index];
          return (
            <li
              key={block.uid}
              data-index={index}
              style={{ paddingLeft: `${st.depth * 22}px` }}
              className={
                dragFrom !== null && dragOver === index && dragOver !== dragFrom
                  ? 'rounded-2xl outline-dashed outline-2 outline-offset-2 outline-brand-400'
                  : undefined
              }
            >
              <div
                /* บล็อกทุกชิ้นหน้าตาเหมือนกัน ไม่ไฮไลต์บล็อกลวงไว้ล่วงหน้า
                   ผู้เรียนต้องรู้ว่าวางผิดจากผลการจำลอง ไม่ใช่จากสีของบล็อก */
                className={`block-3d flex items-start gap-2.5 rounded-2xl border-2 px-3 py-2.5 ${
                  active
                    ? 'scale-[1.02] border-brand-400 bg-gradient-to-b from-brand-50 to-brand-100 ring-4 ring-brand-200'
                    : 'border-slate-100 bg-white'
                }`}
                style={{
                  boxShadow: active
                    ? '0 5px 0 0 #9db4ff'
                    : '0 4px 0 0 rgba(203,213,225,0.55)',
                  opacity: dragFrom === index ? 0.45 : 1,
                }}
              >
                <button
                  type="button"
                  onPointerDown={startDrag(index)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  aria-label={`ลากเพื่อย้ายบล็อก ${def.label}`}
                  title="ลากเพื่อย้ายลำดับ"
                  className="mt-0.5 flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" aria-hidden="true" />
                </button>

                {/* ช่องเลขเหตุการณ์เลียนแบบ Event Sheet จริง เหตุการณ์และเงื่อนไขมีเลขของตัวเอง
                    ส่วนคำสั่งไม่มีเลข เพราะของจริงก็ไม่ให้เลขกับแอ็กชันเช่นกัน */}
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold shadow-clay-sm ${
                    st.eventNo === null
                      ? 'bg-white text-slate-300'
                      : 'bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700'
                  }`}
                  aria-hidden="true"
                >
                  {st.eventNo ?? '→'}
                </span>

                {/* ช่องซ้ายคือชื่ออ็อบเจกต์ ช่องขวาคือเงื่อนไขหรือคำสั่ง
                    เลียนตาราง 2 ช่องของ Event Sheet จริง ผู้เรียนจะได้รู้ว่าต้องไปหาคำสั่งนี้
                    ใต้อ็อบเจกต์ใดตอนเพิ่ม Event ในโปรแกรมของตัวเอง */}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600">
                      {def.object}
                    </span>
                    <span className="min-w-0 break-words font-mono text-[12.5px] font-semibold leading-snug text-slate-800">
                      {def.expr}
                    </span>
                  </p>
                  {st.orphan && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-bubble-700">
                      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                      ยังไม่มีเหตุการณ์ครอบอยู่ คำสั่งนี้จะไม่ถูกเรียกใช้
                    </p>
                  )}
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{def.hint}</p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="rounded-xl p-1.5 text-slate-400 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-brand-600 disabled:opacity-25"
                    aria-label={`เลื่อนบล็อก ${def.label} ขึ้น`}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="rounded-xl p-1.5 text-slate-400 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-brand-600 disabled:opacity-25"
                    aria-label={`เลื่อนบล็อก ${def.label} ลง`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(block.uid)}
                    className="rounded-xl p-1.5 text-bubble-400 transition hover:-translate-y-0.5 hover:bg-bubble-100 hover:text-bubble-700"
                    aria-label={`ลบบล็อก ${def.label}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    )}

    {/* ---------- ผลตรวจตรรกะ ---------- */}
    <div className="mt-4 space-y-2" aria-live="polite">
      <h3 className="text-sm font-semibold text-slate-700">ผลตรวจตรรกะเบื้องต้น</h3>
      {report.issues.map((issue) => {
        const isOk = issue.severity === 'ok';
        return (
          <div
            key={issue.id}
            className={`rounded-2xl border-2 px-3.5 py-2.5 ${
              isOk
                ? 'border-mint-200 bg-gradient-to-b from-mint-50 to-white'
                : issue.severity === 'bug'
                  ? 'border-bubble-200 bg-gradient-to-b from-bubble-50 to-white'
                  : 'border-lemon-200 bg-gradient-to-b from-lemon-50 to-white'
            }`}
          >
            <p
              className={`flex gap-2 text-sm font-medium leading-relaxed ${
                isOk ? 'text-mint-900' : issue.severity === 'bug' ? 'text-bubble-900' : 'text-peach-900'
              }`}
            >
              {isOk ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{issue.message}</span>
            </p>
            <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-600">
              แนวทาง: {issue.advice}
            </p>
          </div>
        );
      })}

      <div className="grid gap-2 pt-1 sm:grid-cols-3">
        {[
          { label: 'ตรรกะสุ่มข้อสอบ', ok: report.randomLogicOk },
          { label: 'ตรรกะตรวจคำตอบ', ok: report.answerLogicOk },
          { label: 'ตรรกะจบเกม', ok: report.endLogicOk },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-xs font-semibold ${
              item.ok
                ? 'border-mint-200 bg-gradient-to-b from-mint-50 to-white text-mint-800'
                : 'border-dashed border-slate-200 bg-white text-slate-400'
            }`}
          >
            {item.ok ? (
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" aria-hidden="true" />
            )}
            <span>
              {item.label}: {item.ok ? 'ถูกต้อง' : 'ยังไม่ครบ'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Card>
  );
};
