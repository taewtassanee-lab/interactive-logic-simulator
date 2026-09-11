import { CircleCheck, Monitor, Tablet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import { Card } from './Ui';
import type { DeviceMode } from '../types';

/**
 * ให้ผู้เรียนระบุว่าเครื่องที่กำลังใช้เป็นเครื่องหลักหรือเครื่องผู้ช่วย
 *
 * เหตุผล: หนึ่งคู่ใช้ 1 พีซี + 2 iPad ถ้าทุกเครื่องกรอกใบงานและส่งข้อมูลด้วยรหัสคู่เดียวกัน
 * ข้อมูลจะเขียนทับกันในชีตของครู และคำตอบในใบงานจะแยกกันคนละชุดจนสร้าง PDF ได้ไม่ครบ
 * จึงกำหนดให้มีเครื่องหลักเพียงเครื่องเดียวต่อคู่
 */
const OPTIONS: {
  mode: DeviceMode;
  title: string;
  device: string;
  icon: typeof Monitor;
  can: string[];
  cannot: string[];
  tone: string;
}[] = [
  {
    mode: 'primary',
    title: 'เครื่องหลักของคู่',
    device: 'เครื่องคอมพิวเตอร์ที่ Driver ใช้',
    icon: Monitor,
    can: [
      'ทำภารกิจแก้ Bug และบันทึกผล',
      'กรอกใบงานดิจิทัลและสร้างไฟล์ PDF',
      'ส่งความก้าวหน้าเข้าแดชบอร์ดของครู',
    ],
    cannot: [],
    tone: 'border-brand-300 bg-gradient-to-b from-brand-50 to-white',
  },
  {
    mode: 'assistant',
    title: 'เครื่องผู้ช่วย',
    device: 'iPad ของนักเรียนแต่ละคน',
    icon: Tablet,
    can: [
      'เปิดคลังความรู้อ่านระหว่างทำงาน',
      'ทดลองเล่นตัวจำลองเพื่อทำความเข้าใจ',
    ],
    cannot: ['ไม่กรอกใบงานและไม่สร้าง PDF', 'ไม่ส่งข้อมูลเข้าแดชบอร์ด'],
    tone: 'border-think-300 bg-gradient-to-b from-think-50 to-white',
  },
];

export const DeviceModePicker = () => {
  const { state, update } = useApp();
  const { notify } = useToast();
  const current = state.session.deviceMode;

  const choose = (mode: DeviceMode) => {
    update((prev) => ({
      session: {
        ...prev.session,
        deviceMode: mode,
        // เครื่องผู้ช่วยเปิดใช้งานได้ทันที ไม่ต้องกรอกข้อมูลผู้เรียน
        activityStarted: mode === 'assistant' ? true : prev.session.activityStarted,
      },
    }));
    notify(
      mode === 'primary'
        ? 'ตั้งเป็นเครื่องหลักของคู่แล้ว กรอกข้อมูลผู้เรียนด้านล่างเพื่อเริ่มกิจกรรม'
        : 'ตั้งเป็นเครื่องผู้ช่วยแล้ว เปิดคลังความรู้อ่านได้ทันที',
      'success',
    );
  };

  return (
    <Card
      title="เครื่องนี้ใช้ทำอะไร"
      subtitle="หนึ่งคู่มีเครื่องหลักได้เพียงเครื่องเดียว เพื่อไม่ให้ข้อมูลของคู่เขียนทับกัน"
      icon={<Monitor className="h-5 w-5 text-brand-600" aria-hidden="true" />}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = current === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => choose(opt.mode)}
              aria-pressed={selected}
              className={`rounded-[1.25rem] border-2 p-4 text-left transition-all duration-150 active:translate-y-[2px] ${
                selected ? opt.tone : 'border-slate-200 bg-white hover:-translate-y-0.5'
              }`}
              style={{ boxShadow: selected ? '0 5px 0 0 rgba(203,213,225,0.7)' : '0 3px 0 0 #e2e8f0' }}
            >
              <span className="mb-2 flex items-center gap-2.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-clay-sm ${
                    opt.mode === 'primary'
                      ? 'bg-gradient-to-b from-brand-400 to-brand-600 text-white'
                      : 'bg-gradient-to-b from-think-400 to-think-600 text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base font-bold text-slate-800">
                    {opt.title}
                  </span>
                  <span className="block text-xs text-slate-500">{opt.device}</span>
                </span>
                {selected && (
                  <CircleCheck className="ml-auto h-6 w-6 shrink-0 text-mint-600" aria-hidden="true" />
                )}
              </span>

              <ul className="space-y-1">
                {opt.can.map((t) => (
                  <li key={t} className="flex gap-1.5 text-xs leading-relaxed text-slate-600">
                    <span className="text-mint-600" aria-hidden="true">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
                {opt.cannot.map((t) => (
                  <li key={t} className="flex gap-1.5 text-xs leading-relaxed text-slate-500">
                    <span className="text-bubble-500" aria-hidden="true">
                      ✕
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

/** ข้อความแจ้งเมื่อเครื่องผู้ช่วยเปิดหน้าที่ใช้ได้เฉพาะเครื่องหลัก */
export const AssistantNotice = ({ page }: { page: string }) => (
  <Card
    title={`${page}ใช้ได้ที่เครื่องหลักเท่านั้น`}
    subtitle="เครื่องนี้ตั้งเป็นเครื่องผู้ช่วยไว้"
    icon={<Tablet className="h-5 w-5 text-think-600" aria-hidden="true" />}
  >
    <p className="rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-4 py-3 text-sm leading-relaxed text-peach-900">
      เพื่อไม่ให้คำตอบของคู่แยกกันคนละชุด ระบบให้กรอกใบงานและส่งงานที่<strong>เครื่องหลัก</strong>
      ซึ่งเป็นคอมพิวเตอร์ที่ Driver ใช้เพียงเครื่องเดียว
    </p>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">
      เครื่องนี้ใช้เปิด <strong>คลังความรู้</strong> อ่านประกอบระหว่างทำงาน
      และทดลองเล่นตัวจำลองเพื่อทำความเข้าใจได้ตามปกติ
    </p>
    <p className="mt-3 text-xs text-slate-500">
      หากเครื่องนี้คือคอมพิวเตอร์หลักของคู่จริง ให้กลับไปหน้า &quot;เริ่มต้นใช้งาน&quot;
      แล้วเลือกใหม่เป็น &quot;เครื่องหลักของคู่&quot;
    </p>
  </Card>
);
