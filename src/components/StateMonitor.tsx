import { useEffect, useRef, useState } from 'react';
import { Activity, ChevronDown, Copy, Database, ScrollText, Terminal } from 'lucide-react';
import type { LogLevel, SimState, SystemStatus } from '../types';
import { Card, EmptyState, Tooltip } from './Ui';
import { IsoCube } from './Illustrations';

const STATUS_META: Record<SystemStatus, { label: string; className: string; symbol: string }> = {
  ready: {
    label: 'Ready - พร้อมเริ่ม',
    className: 'bg-gradient-to-b from-white to-slate-100 text-slate-700 border-slate-200',
    symbol: '○',
  },
  running: {
    label: 'Running - กำลังทำงาน',
    className: 'bg-gradient-to-b from-brand-100 to-brand-200 text-brand-900 border-brand-300',
    symbol: '▶',
  },
  bug: {
    label: 'Bug Detected - พบข้อผิดพลาด',
    className: 'bg-gradient-to-b from-bubble-100 to-bubble-200 text-bubble-900 border-bubble-300',
    symbol: '✕',
  },
  completed: {
    label: 'Completed - ทำงานครบถ้วน',
    className: 'bg-gradient-to-b from-mint-100 to-mint-200 text-mint-900 border-mint-300',
    symbol: '✓',
  },
};

const LOG_STYLE: Record<LogLevel, string> = {
  info: 'text-slate-300',
  success: 'text-mint-300',
  warn: 'text-lemon-200',
  error: 'text-bubble-300',
};

const LOG_PREFIX: Record<LogLevel, string> = {
  info: '·',
  success: '✓',
  warn: '!',
  error: '✕',
};

const Row = ({ label, value, mono = true }: { label: React.ReactNode; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
    <span className="shrink-0 text-xs text-slate-500">{label}</span>
    <span
      className={`min-w-0 break-words text-right text-xs font-semibold text-slate-800 ${
        mono ? 'font-mono' : ''
      }`}
    >
      {value}
    </span>
  </div>
);

export const StateMonitor = ({
  state,
  caption,
  onCopyLog,
  focus,
}: {
  state: SimState;
  caption: string;
  onCopyLog: () => void;
  /** ภารกิจที่ผู้เรียนกำลังทำอยู่ ใช้เลือกว่าค่าไหนต้องเด่น ค่าไหนพับเก็บได้ */
  focus: 'mission1' | 'mission2';
}) => {
  const logRef = useRef<HTMLDivElement>(null);
  const status = STATUS_META[state.status];
  /**
   * State Monitor มีค่าให้ดู 10 ค่า แต่แต่ละภารกิจใช้จริงแค่ 2 ถึง 3 ค่า
   * การวางทั้งหมดเรียงกันทำให้ผู้เรียนที่เพิ่งเริ่มไม่รู้ว่าควรมองค่าไหน
   * จึงแยกค่าที่ภารกิจปัจจุบันต้องใช้ขึ้นมาไว้ด้านบน ที่เหลือพับเก็บไว้ให้กางดูเองได้
   */
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    // เลื่อน Debug Log ไปบรรทัดล่าสุดเสมอ เพื่อให้เห็นเหตุการณ์ปัจจุบัน
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log.length]);

  return (
    <div className="space-y-4">
      <Card
        title="State Monitor"
        subtitle="สถานะข้อมูลในระบบแบบ Real-time"
        icon={<Activity className="h-5 w-5 text-mint-600" aria-hidden="true" />}
      >
        <div
          className={`mb-3 flex items-center gap-2 rounded-2xl border-2 px-3.5 py-2.5 font-display text-sm font-bold shadow-clay-sm ${status.className}`}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">{status.symbol}</span>
          <span>System Status: {status.label}</span>
        </div>

        {caption && (
          <p className="mb-3 rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2 text-xs leading-relaxed text-think-900">
            ขั้นตอนล่าสุด: {caption}
          </p>
        )}

        {/* ---------- Array ---------- */}
        <div className="mb-3 rounded-[1.25rem] border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-900">
            <Database className="h-4 w-4" aria-hidden="true" />
            <Tooltip term="Question Array">
              พื้นที่เก็บข้อสอบทั้งหมด แต่ละช่องมีเลขตำแหน่ง (Index) เริ่มจาก 0 เมื่อลบช่องหนึ่งออก Array.Width จะลดลง 1
            </Tooltip>
          </p>
          {/* แสดงข้อสอบเป็นลูกบาศก์ 3 มิติ ให้เห็นว่าแต่ละช่องหายไปจริงเมื่อถูกลบ */}
          <div className="flex min-h-[64px] flex-wrap items-end gap-1.5">
            {state.remaining.length === 0 ? (
              <span className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-mint-300 bg-mint-50 px-3 py-2 font-mono text-xs font-semibold text-mint-800">
                [ ] ว่างแล้ว ครบทุกข้อ
              </span>
            ) : (
              state.remaining.map((code, i) => (
                <IsoCube
                  key={`${code}-${i}`}
                  label={code}
                  index={i}
                  tone={state.num === i ? 'think' : 'brand'}
                  highlighted={state.num === i}
                />
              ))
            )}
          </div>
        </div>

        {/* ---------- ค่าที่ภารกิจปัจจุบันต้องดู ---------- */}
        <div
          className="rounded-[1.25rem] border-2 border-mint-300 bg-gradient-to-b from-mint-50 to-white px-3.5 py-1"
          style={{ boxShadow: '0 4px 0 0 rgba(16,185,129,0.22)' }}
        >
          <p className="pb-1 pt-2 font-display text-xs font-bold uppercase tracking-wide text-mint-800">
            ค่าที่ต้องดูในภารกิจที่ {focus === 'mission1' ? '1' : '2'}
          </p>
          <Row label="Array Size (Array.Width)" value={state.arraySize} />
          {focus === 'mission1' ? (
            <Row
              label="จำนวนครั้งที่สุ่มซ้ำ"
              value={
                <span className={state.duplicateCount > 0 ? 'text-bubble-700' : 'text-mint-700'}>
                  {state.duplicateCount}
                </span>
              }
            />
          ) : (
            <Row
              label="Current Layout"
              value={
                <span className={state.layout === 'Summary' ? 'text-mint-700' : 'text-brand-700'}>
                  {state.layout}
                </span>
              }
            />
          )}
          <Row label="จำนวนข้อที่ตอบแล้ว" value={state.answeredCount} />
        </div>

        {/* ---------- ค่าอื่น ๆ พับเก็บไว้ ---------- */}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2 text-left font-display text-xs font-semibold text-slate-500 transition hover:text-slate-700"
        >
          ค่าอื่น ๆ ในระบบ อีก 7 ค่า
          <ChevronDown
            className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {moreOpen && (
          <div className="mt-2 rounded-[1.25rem] border-2 border-slate-100 bg-white px-3.5 py-1">
            <Row
              label={
                <Tooltip term="Random Index (Num)">
                  ตัวแปรเก็บเลขตำแหน่งที่สุ่มได้ คำนวณจาก floor(random(Array.Width)) จึงได้ค่า 0 ถึง Width-1
                </Tooltip>
              }
              value={state.num === null ? '-' : state.num}
            />
            <Row
              label="Current Question"
              value={state.currentQuestion ? state.currentQuestion.code : '-'}
            />
            <Row
              label="ข้อความคำถาม"
              value={state.currentQuestion ? state.currentQuestion.text : '-'}
              mono={false}
            />
            <Row label="Selected Answer" value={state.selectedAnswer ?? '-'} mono={false} />
            <Row label="Correct Answer" value={state.correctAnswer ?? '-'} mono={false} />
            <Row
              label="Score"
              value={<span className="text-base text-mint-700">{state.score}</span>}
            />
            {focus === 'mission1' ? (
              <Row
                label="Current Layout"
                value={
                  <span className={state.layout === 'Summary' ? 'text-mint-700' : 'text-brand-700'}>
                    {state.layout}
                  </span>
                }
              />
            ) : (
              <Row
                label="จำนวนครั้งที่สุ่มซ้ำ"
                value={
                  <span className={state.duplicateCount > 0 ? 'text-bubble-700' : 'text-slate-800'}>
                    {state.duplicateCount}
                  </span>
                }
              />
            )}
          </div>
        )}
      </Card>

      {/* ---------- Debug Log ---------- */}
      <Card
        title="Debug Log"
        subtitle="บันทึกเหตุการณ์เรียงตามลำดับเวลา"
        icon={<Terminal className="h-5 w-5 text-slate-600" aria-hidden="true" />}
        actions={
          <button
            type="button"
            onClick={onCopyLog}
            disabled={state.log.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            คัดลอก Log
          </button>
        }
      >
        {state.log.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-9 w-9" aria-hidden="true" />}
            title="ยังไม่มีบันทึกเหตุการณ์"
            description="กดปุ่ม Run Simulation หรือ Run ทีละขั้น เพื่อดูว่าระบบทำงานอะไรบ้างในแต่ละขั้นตอน"
          />
        ) : (
          <div
            ref={logRef}
            className="scroll-thin max-h-80 overflow-y-auto rounded-[1.25rem] border-4 border-slate-700 bg-slate-900 p-3 font-mono text-[12px] leading-relaxed"
            role="log"
            aria-label="บันทึกเหตุการณ์ของระบบ"
          >
            {state.log.map((entry, i) => (
              <p key={`${entry.time}-${i}`} className={LOG_STYLE[entry.level]}>
                <span className="text-slate-500">[{entry.time}]</span>{' '}
                <span aria-hidden="true">{LOG_PREFIX[entry.level]}</span> {entry.message}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
