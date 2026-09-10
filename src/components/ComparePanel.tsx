import { ArrowRightLeft, CircleAlert, CircleCheck, Flag } from 'lucide-react';
import type { SimState } from '../types';
import type { LogicFlags } from '../utils/validator';
import { Card } from './Ui';

/**
 * เปรียบเทียบ 3 กรณีสำคัญให้ผู้เรียนเห็นความต่างอย่างชัดเจน
 * แถบสถานะทางขวาอ้างอิงผลการจำลองรอบล่าสุดจริง ไม่ใช่ข้อความคงที่
 */
export const ComparePanel = ({ flags, state }: { flags: LogicFlags; state: SimState }) => {
  const cases = [
    {
      key: 'no-delete',
      title: 'กรณีไม่มี Delete index',
      icon: CircleAlert,
      tone: 'rose' as const,
      expectation: 'Array.Width คงที่ ข้อสอบที่ทำแล้วยังอยู่ จึงมีโอกาสถูกสุ่มได้ซ้ำ',
      active: !flags.hasDelete || flags.bugNoDelete,
      liveLabel: 'ผลรอบล่าสุด',
      liveValue:
        state.duplicateCount > 0
          ? `สุ่มซ้ำแล้ว ${state.duplicateCount} ครั้ง`
          : 'ยังไม่พบการสุ่มซ้ำในรอบนี้',
    },
    {
      key: 'with-delete',
      title: 'กรณีมี Delete index',
      icon: CircleCheck,
      tone: 'emerald' as const,
      expectation: 'ทุกครั้งที่สุ่ม ข้อมูลใน Array จะลดลง 1 ช่อง ข้อสอบจึงไม่ซ้ำ',
      active: flags.hasDelete && !flags.bugNoDelete,
      liveLabel: 'Array คงเหลือ',
      liveValue: `${state.arraySize} ข้อ จากทั้งหมด 4 ข้อ`,
    },
    {
      key: 'empty',
      title: 'กรณี Array ว่าง',
      icon: Flag,
      tone: 'brand' as const,
      expectation: 'เงื่อนไข If Array is empty เป็นจริง ระบบเปลี่ยน Layout เป็น Summary',
      active: state.arraySize === 0,
      liveLabel: 'Current Layout',
      liveValue: state.layout,
    },
  ];

  const toneClass = {
    rose: 'border-bubble-200 bg-gradient-to-b from-bubble-50 to-white text-bubble-900',
    emerald: 'border-mint-200 bg-gradient-to-b from-mint-50 to-white text-mint-900',
    brand: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white text-brand-900',
  };

  return (
    <Card
      title="เปรียบเทียบผลของตรรกะแต่ละแบบ"
      subtitle="ดูว่าการมีหรือไม่มีคำสั่งเพียงบรรทัดเดียว ทำให้ระบบต่างกันอย่างไร"
      icon={<ArrowRightLeft className="h-5 w-5 text-think-600" aria-hidden="true" />}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {cases.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className={`rounded-[1.25rem] border-2 p-3.5 transition-transform hover:-translate-y-0.5 ${
                c.active
                  ? `${toneClass[c.tone]} shadow-clay-sm`
                  : 'border-dashed border-slate-200 bg-white/70 text-slate-500'
              }`}
            >
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {c.title}
              </p>
              <p className="text-xs leading-relaxed">{c.expectation}</p>
              <div className="mt-2.5 rounded-xl border-2 border-white bg-white/80 px-2.5 py-1.5">
                <p className="text-[11px] text-slate-500">{c.liveLabel}</p>
                <p className="font-mono text-xs font-semibold text-slate-800">{c.liveValue}</p>
              </div>
              <p className="mt-2 text-[11px] font-semibold">
                {c.active ? '● ตรงกับสถานการณ์ปัจจุบัน' : '○ ยังไม่เกิดขึ้นในรอบนี้'}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
