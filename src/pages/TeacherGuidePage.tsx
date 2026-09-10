import { useState } from 'react';
import { BookOpen, ChevronDown, Clock, GraduationCap, Printer, Users2 } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { GPAS_STEPS, GUIDE_SECTIONS } from '../data/teacherGuide';
import { Button, Card } from '../components/Ui';
import { TeacherBanner, TeacherCard } from '../components/TeacherCard';

export const TeacherGuidePage = () => {
  const [openId, setOpenId] = useState<string | null>('objective');
  const totalMinutes = GPAS_STEPS.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-4">
      <Card
        title="คู่มือครูผู้สอน"
        subtitle={`${APP_CONFIG.courseName} ${APP_CONFIG.gradeLevel} | ${APP_CONFIG.unitName}`}
        icon={<GraduationCap className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          <Button variant="secondary" onClick={() => window.print()} className="no-print">
            <Printer className="h-4 w-4" aria-hidden="true" />
            พิมพ์คู่มือ
          </Button>
        }
      >
        <TeacherCard className="mb-4" size={96} />
        <TeacherBanner className="mb-4" />
        <p className="text-sm leading-relaxed text-slate-600">
          คู่มือนี้ออกแบบสำหรับการสอน 1 คาบเรียน ({totalMinutes} นาที) ด้วยกระบวนการ GPAS 5 Steps
          โดยใช้ Interactive Logic Simulator เป็นสื่อกลางให้นักเรียนเห็นการทำงานของ Array และ Function
          ก่อนลงมือแก้ไข Event Sheet จริงใน Construct 2
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { label: 'รูปแบบกิจกรรม', value: 'Pair Programming (Driver / Navigator)' },
            { label: 'จำนวนภารกิจแก้ Bug', value: '2 ภารกิจ + 3 เหรียญตรา' },
            { label: 'หลักฐานการเรียนรู้', value: 'ใบงาน PDF + ไฟล์ .capx' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- ขั้นตอนการสอน GPAS 5 Steps ---------- */}
      <Card
        title={`ขั้นตอนการใช้งานในคาบ ${totalMinutes} นาที ตาม GPAS 5 Steps`}
        subtitle="แบ่งเวลาและบทบาทของครูกับนักเรียนในแต่ละขั้น"
        icon={<Clock className="h-5 w-5 text-think-600" aria-hidden="true" />}
      >
        <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
          {GPAS_STEPS.map((s, i) => (
            <div
              key={s.step}
              className={
                ['bg-brand-500', 'bg-think-500', 'bg-mint-500', 'bg-lemon-500', 'bg-bubble-500'][i]
              }
              style={{ width: `${(s.minutes / totalMinutes) * 100}%` }}
              title={`${s.step} ${s.minutes} นาที`}
            />
          ))}
        </div>

        <div className="space-y-3">
          {GPAS_STEPS.map((s, i) => (
            <div key={s.step} className="rounded-xl border border-slate-200 p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${
                    ['bg-brand-600', 'bg-think-600', 'bg-mint-600', 'bg-lemon-500', 'bg-bubble-600'][i]
                  }`}
                >
                  {i + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-800">
                  {s.step} ({s.thaiName})
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {s.minutes} นาที
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-brand-50 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-brand-900">
                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    บทบาทครู
                  </p>
                  <ul className="space-y-1 text-xs leading-relaxed text-brand-900">
                    {s.teacher.map((t) => (
                      <li key={t} className="flex gap-1.5">
                        <span aria-hidden="true">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-think-50 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-think-900">
                    <Users2 className="h-4 w-4" aria-hidden="true" />
                    บทบาทนักเรียน
                  </p>
                  <ul className="space-y-1 text-xs leading-relaxed text-think-900">
                    {s.student.map((t) => (
                      <li key={t} className="flex gap-1.5">
                        <span aria-hidden="true">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- หัวข้ออื่น ๆ แบบพับเก็บได้ ---------- */}
      <Card
        title="หัวข้อเตรียมสอนและการวัดผล"
        subtitle="กดที่หัวข้อเพื่อเปิดอ่านรายละเอียด"
        icon={<BookOpen className="h-5 w-5 text-mint-600" aria-hidden="true" />}
      >
        <div className="space-y-2">
          {GUIDE_SECTIONS.map((section) => {
            const isOpen = openId === section.id;
            return (
              <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition ${
                    isOpen ? 'bg-brand-50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <ul className="space-y-2 border-t border-slate-100 px-4 py-3">
                    {section.items.map((item, i) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
