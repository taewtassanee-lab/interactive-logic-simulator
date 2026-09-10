import { useState } from 'react';
import { RotateCcw, Sparkles, X } from 'lucide-react';
import { APP_CONFIG, TEACHER_INFO } from '../config';
import { Button } from './Ui';
import { Mascot } from './Illustrations';
import { TeacherAvatar } from './TeacherCard';

export const Header = ({ onReset }: { onReset: () => void }) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b-4 border-white/60 bg-gradient-to-r from-brand-600 via-think-600 to-bubble-500 shadow-pop">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 drop-shadow-lg">
            <Mascot size={54} className="animate-float" mood="cheer" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[17px] font-bold leading-tight text-white drop-shadow-sm sm:text-xl lg:text-2xl">
              Interactive Logic Simulator
            </h1>
            <p className="hidden text-[12.5px] leading-snug text-white/85 lg:block">
              {APP_CONFIG.appTagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ครูผู้สอนและโรงเรียน แสดงบนจอกว้างเท่านั้น กันหัวเว็บแน่นบนมือถือ */}
          <span className="hidden items-center gap-2 rounded-full border-2 border-white/40 bg-white/20 py-1 pl-1 pr-3.5 text-white xl:inline-flex">
            <TeacherAvatar size={30} />
            <span className="leading-tight">
              <span className="block font-display text-xs font-bold">{TEACHER_INFO.name}</span>
              <span className="block text-[10.5px] text-white/85">{TEACHER_INFO.school}</span>
            </span>
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border-2 border-white/40 bg-white/20 px-3.5 py-1.5 font-display text-xs font-bold text-white md:inline-flex">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {APP_CONFIG.courseLabel}
          </span>
          <Button
            variant="secondary"
            onClick={() => setConfirming(true)}
            title="ลบข้อมูลทั้งหมดในเครื่องนี้แล้วเริ่มใหม่"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Reset ข้อมูล</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 sm:hidden">
          <span className="rounded-full border-2 border-white/40 bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
            {APP_CONFIG.courseLabel}
          </span>
        </div>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <div className="clay-card w-full max-w-md animate-pop p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id="reset-title" className="font-display text-lg font-bold text-slate-800">
                ยืนยันการล้างข้อมูลทั้งหมด
              </h2>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="ปิดหน้าต่างยืนยัน"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              ระบบจะลบข้อมูลผู้เรียน บล็อกใน Workspace ผลภารกิจ และคำตอบในใบงานทั้งหมดที่บันทึกไว้ในเบราว์เซอร์นี้
              การกระทำนี้ย้อนกลับไม่ได้
            </p>
            <p className="mt-3 rounded-2xl border-2 border-lemon-200 bg-lemon-50 px-3.5 py-2.5 text-xs leading-relaxed text-peach-800">
              แนะนำ: หากยังไม่ได้ดาวน์โหลดใบงาน PDF ให้ดาวน์โหลดเก็บไว้ก่อนกดยืนยัน
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setConfirming(false);
                  onReset();
                }}
              >
                ยืนยันล้างข้อมูล
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
