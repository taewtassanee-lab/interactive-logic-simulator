import { useMemo } from 'react';
import { Check, Minus, Target, X } from 'lucide-react';
import { CORRECT_SOLUTION } from '../data/blocks';
import { runSimulation } from '../utils/simulator';
import type { SimState } from '../types';

/**
 * ตัวอย่างผลลัพธ์ที่ถูกต้อง เทียบกับผลของผู้เรียน ณ ขณะนี้
 *
 * แถบภารกิจบอกเป็นข้อความว่าผลลัพธ์ที่ต้องการคืออะไร แต่ข้อความอย่างเดียวยังต้องตีความ
 * ส่วนนี้จึงแสดงตัวเลขจริงคู่กันไปเลยว่าค่าที่ถูกต้องคือเท่าไร และตอนนี้ได้เท่าไร
 *
 * ค่าฝั่งขวาไม่ได้พิมพ์ไว้ตายตัว แต่ได้จากการสั่งให้ตัวจำลองรันเฉลย CORRECT_SOLUTION จริง
 * ด้วย seed เดียวกับที่ผู้เรียนใช้ ตัวเลขสองฝั่งจึงเทียบกันได้ตรงและไม่มีทางคลาดจากเครื่องยนต์จำลอง
 *
 * แสดงเฉพาะ "ผลลัพธ์" ไม่แสดงลำดับบล็อกของเฉลย ผู้เรียนจึงยังต้องคิดวิธีแก้เอง
 */
interface Line {
  label: string;
  mine: string;
  want: string;
  ok: boolean;
}

const fmt = (v: string | number) => String(v);

export const ExpectedResult = ({
  state,
  hasRun,
}: {
  state: SimState;
  hasRun: boolean;
}) => {
  const target = useMemo(
    () =>
      runSimulation(CORRECT_SOLUTION.map((blockId, i) => ({ uid: `t_${i}`, blockId })))
        .finalState,
    [],
  );

  const lines: Line[] = [
    {
      label: 'Array Size (Array.Width)',
      mine: fmt(state.arraySize),
      want: fmt(target.arraySize),
      ok: state.arraySize === target.arraySize,
    },
    {
      label: 'จำนวนครั้งที่สุ่มซ้ำ',
      mine: fmt(state.duplicateCount),
      want: fmt(target.duplicateCount),
      ok: state.duplicateCount === target.duplicateCount,
    },
    {
      label: 'จำนวนข้อที่ตอบแล้ว',
      mine: fmt(state.answeredCount),
      want: fmt(target.answeredCount),
      ok: state.answeredCount === target.answeredCount,
    },
    {
      label: 'Current Layout',
      mine: state.layout,
      want: target.layout,
      ok: state.layout === target.layout,
    },
  ];

  const passed = lines.filter((l) => l.ok).length;

  return (
    <section
      className="rounded-[1.25rem] border-2 border-mint-200 bg-gradient-to-b from-mint-50 to-white px-4 py-3.5"
      style={{ boxShadow: '0 5px 0 0 rgba(16,185,129,0.25)' }}
    >
      <header className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-mint-400 to-mint-600 text-white shadow-clay-sm">
          <Target className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-display text-[15px] font-bold text-mint-900">
          ตัวอย่างผลลัพธ์ที่ถูกต้อง เทียบกับผลของเราตอนนี้
        </p>
        <span
          className={`ml-auto rounded-full border-2 px-2.5 py-0.5 font-display text-xs font-bold ${
            !hasRun
              ? 'border-slate-200 bg-white text-slate-500'
              : passed === lines.length
                ? 'border-mint-300 bg-white text-mint-700'
                : 'border-bubble-300 bg-white text-bubble-700'
          }`}
        >
          {hasRun ? `ตรงแล้ว ${passed} จาก ${lines.length} ค่า` : 'ยังไม่ได้ Run'}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="w-1/2 pb-1.5 font-display text-xs font-bold uppercase tracking-wide text-slate-500">
                ค่าใน State Monitor
              </th>
              <th className="pb-1.5 font-display text-xs font-bold uppercase tracking-wide text-slate-500">
                ของเราตอนนี้
              </th>
              <th className="pb-1.5 font-display text-xs font-bold uppercase tracking-wide text-mint-700">
                ค่าที่ถูกต้อง
              </th>
              <th className="w-10 pb-1.5" aria-label="ผลการเทียบ" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.label} className="border-t-2 border-dashed border-mint-100">
                <td className="py-1.5 pr-3 text-slate-700">{l.label}</td>
                <td className="py-1.5 pr-3 font-mono text-[13px] font-semibold tabular-nums text-slate-800">
                  {hasRun ? l.mine : '—'}
                </td>
                <td className="py-1.5 pr-3 font-mono text-[13px] font-bold tabular-nums text-mint-700">
                  {l.want}
                </td>
                <td className="py-1.5">
                  {!hasRun ? (
                    <Minus className="h-4 w-4 text-slate-300" aria-label="ยังไม่ได้ Run" />
                  ) : l.ok ? (
                    <Check className="h-4 w-4 text-mint-600" aria-label="ตรงแล้ว" />
                  ) : (
                    <X className="h-4 w-4 text-bubble-500" aria-label="ยังไม่ตรง" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
        ค่าฝั่งขวาได้จากการให้ระบบรันตรรกะที่ถูกต้องจริง ไม่ใช่ตัวเลขที่พิมพ์ไว้ล่วงหน้า
        ส่วนลำดับบล็อกของเฉลยไม่แสดงไว้ เพราะเป็นสิ่งที่เราต้องคิดเอง
      </p>
    </section>
  );
};
