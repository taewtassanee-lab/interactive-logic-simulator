import { ArrowLeftRight, Compass, Mouse, Repeat2, TriangleAlert } from 'lucide-react';
import { useRoleTimer } from '../context/RoleTimerContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from './Ui';

/**
 * คำสั่งบังคับสลับบทบาท ขึ้นเต็มจอเมื่อหมดเวลารอบ
 *
 * ปิดไม่ได้ด้วยวิธีอื่นนอกจากกดยืนยันว่าสลับที่นั่งแล้ว
 * เพราะถ้าปิดได้ง่าย ผู้เรียนจะกดข้ามแล้วให้คนเดิมทำต่อทั้งคาบ
 * ซึ่งขัดกับหลักการ Pair Programming ที่ต้องได้ลงมือทั้งคู่
 */
export const RoleSwapOverlay = () => {
  const { mustSwitch, currentDriver, currentNavigator, switchCount, markSwitched, postpone } =
    useRoleTimer();
  const { settings } = useSettings();

  if (!mustSwitch) return null;

  // หลังกดยืนยัน คนที่เป็น Navigator อยู่ตอนนี้จะขึ้นมาเป็น Driver
  const nextDriver = currentNavigator;
  const nextNavigator = currentDriver;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="swap-title"
      aria-describedby="swap-desc"
    >
      <div className="clay-card w-full max-w-lg animate-pop p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 animate-wiggle items-center justify-center rounded-2xl bg-gradient-to-b from-lemon-300 to-peach-400 text-white shadow-clay-sm">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="swap-title" className="font-display text-xl font-bold text-slate-800">
              หมดเวลา ต้องสลับบทบาทก่อน
            </h2>
            <p id="swap-desc" className="text-sm text-slate-500">
              ครบ {settings.roleSwitchMinutes} นาทีแล้ว
              ทำงานต่อไม่ได้จนกว่าจะสลับที่นั่งจริง
            </p>
          </div>
        </div>

        {/* ---------- คำสั่งที่ต้องทำ ---------- */}
        <div className="rounded-[1.25rem] border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-4">
          <p className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-brand-900">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            คำสั่ง: ให้ทั้งคู่สลับที่นั่งเดี๋ยวนี้
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-200 bg-white px-3.5 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-clay-sm">
                <Mouse className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="min-w-0 text-sm leading-snug text-slate-700">
                <strong className="block font-display text-base text-brand-800">
                  {nextDriver}
                </strong>
                มานั่งหน้าคอมพิวเตอร์ เป็น <strong>Driver</strong> คนต่อไป
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-think-200 bg-white px-3.5 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-think-400 to-think-600 text-white shadow-clay-sm">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="min-w-0 text-sm leading-snug text-slate-700">
                <strong className="block font-display text-base text-think-800">
                  {nextNavigator}
                </strong>
                ย้ายไปเป็น <strong>Navigator</strong> คอยอ่านเงื่อนไขและตรวจตรรกะ
              </p>
            </div>
          </div>

          <p className="mt-3 rounded-2xl bg-lemon-50 px-3 py-2 text-xs leading-relaxed text-peach-900">
            ก่อนกดปุ่ม ให้ Driver คนเดิมเล่าให้คนใหม่ฟังสั้น ๆ ว่าทำอะไรไปแล้วบ้าง และติดอยู่ตรงไหน
          </p>
        </div>

        <Button
          variant="purple"
          onClick={markSwitched}
          className="mt-4 w-full py-3 text-base"
          autoFocus
        >
          <Repeat2 className="h-5 w-5" aria-hidden="true" />
          สลับที่นั่งแล้ว เริ่มรอบใหม่
        </Button>

        {/* ทางออกสำรอง ใช้เมื่อครูกำลังสาธิตหน้าชั้นหรืออยู่ระหว่างนำเสนอ
            ตั้งใจทำให้ปุ่มเล็กและจางกว่า เพื่อให้การสลับบทบาทยังเป็นทางเลือกหลัก */}
        <button
          type="button"
          onClick={() => postpone(5)}
          className="mt-2 w-full rounded-xl py-1.5 text-xs font-medium text-slate-400 underline decoration-dotted underline-offset-4 transition hover:text-slate-600"
        >
          ยังสลับไม่ได้ตอนนี้ ขอเลื่อนออกไปอีก 5 นาที
        </button>

        <p className="mt-1 text-center text-xs text-slate-500">
          สลับบทบาทไปแล้ว {switchCount} ครั้ง | ระบบบันทึกเวลาที่สลับไว้เป็นหลักฐานในใบงาน
        </p>
      </div>
    </div>
  );
};
