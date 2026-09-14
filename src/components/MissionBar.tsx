import { useState } from 'react';
import { ArrowRight, CircleCheck, Lightbulb, PartyPopper, Target } from 'lucide-react';
import { BADGES, MISSIONS, type MissionKey } from '../data/missions';
import type { MissionState } from '../types';
import { Button } from './Ui';
import { BugBuddy, Medal3D } from './Illustrations';
import { useApp } from '../context/AppContext';

/**
 * แถบภารกิจที่อยู่บนสุดของหน้าจำลองตรรกะ
 *
 * เหตุผลที่ต้องอยู่บนสุด: เดิมโจทย์ภารกิจอยู่ล่างสุดของหน้า ต้องเลื่อนลงเกือบ 3 หน้าจอถึงจะเห็น
 * นักเรียนจึงเริ่มลงมือโดยยังไม่รู้ว่ากำลังแก้ปัญหาอะไร
 *
 * เลือกดูได้ทีละภารกิจเพื่อฝึกทักษะแก้ทีละจุดแล้วทดสอบ แต่ไม่ล็อกภารกิจที่ 2
 * เพราะนักเรียนที่เก่งอาจมองออกทั้งสองจุดพร้อมกัน
 */
export const MissionBar = ({ missions }: { missions: MissionState }) => {
  const { update } = useApp();
  const passed: Record<MissionKey, boolean> = {
    mission1: missions.mission1Passed,
    mission2: missions.mission2Passed,
  };

  // เปิดมาที่ภารกิจแรกที่ยังไม่ผ่าน เพื่อไม่ให้ผู้เรียนต้องกดเลือกเอง
  const [active, setActive] = useState<MissionKey>(
    passed.mission1 && !passed.mission2 ? 'mission2' : 'mission1',
  );
  const [hintLevel, setHintLevel] = useState(0);

  const current = MISSIONS.find((m) => m.key === active) ?? MISSIONS[0];
  const isPassed = passed[current.key];
  const allPassed = passed.mission1 && passed.mission2;
  const earned: Record<string, boolean> = {
    array_detective: passed.mission1,
    bug_hunter: passed.mission2,
    logic_master: allPassed,
  };

  const switchTo = (key: MissionKey) => {
    setActive(key);
    setHintLevel(0);
  };

  return (
    <section className="clay-card overflow-hidden">
      {/* ---------- แถบเลือกภารกิจ + เหรียญตรา ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-700">
            <Target className="h-4 w-4 text-bubble-600" aria-hidden="true" />
            ภารกิจแก้ Bug
          </span>

          {MISSIONS.map((m) => {
            const on = active === m.key;
            const done = passed[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => switchTo(m.key)}
                aria-current={on ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 font-display text-xs font-semibold transition-all duration-150 active:translate-y-[2px] sm:text-sm ${
                  on
                    ? 'bg-gradient-to-b from-brand-400 to-brand-600 text-white'
                    : 'bg-white text-slate-500 hover:-translate-y-0.5 hover:text-brand-600'
                }`}
                style={{
                  boxShadow: on ? '0 4px 0 0 #2f3aa1' : '0 3px 0 0 #e2e8f0',
                }}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    done
                      ? 'bg-mint-500 text-white'
                      : on
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {done ? '✓' : m.order}
                </span>
                <span className="hidden sm:inline">{m.shortTitle}</span>
                <span className="sm:hidden">ภารกิจ {m.order}</span>
              </button>
            );
          })}
        </div>

        {/* เหรียญตราแบบย่อ เห็นความคืบหน้าได้ตลอดโดยไม่ต้องเลื่อนหน้า */}
        <div className="flex items-center gap-2">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <span key={b.id} title={`${b.name} — ${b.description}`}>
                <span className="sr-only">
                  {b.name}: {earned[b.id] ? 'ได้รับแล้ว' : 'ยังไม่ได้รับ'}
                </span>
                <span className="block scale-[0.62] origin-center">
                  <Medal3D tone={b.tone} earned={earned[b.id]}>
                    <Icon className="h-7 w-7 drop-shadow" aria-hidden="true" />
                  </Medal3D>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ---------- โจทย์ของภารกิจที่เลือก ---------- */}
      <div className="px-4 py-4 sm:px-5">
        {allPassed && (
          <p className="mb-3 flex items-center gap-2.5 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-4 py-3 font-display text-sm font-bold text-peach-900">
            <PartyPopper className="h-5 w-5 shrink-0 text-lemon-500" aria-hidden="true" />
            ผ่านครบทั้ง 2 ภารกิจแล้ว ได้เหรียญ Logic Master ไปทำใบงานดิจิทัลต่อได้เลย
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <BugBuddy size={64} className="hidden shrink-0 animate-float sm:block" />

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-bold text-slate-800">{current.title}</h2>

            <dl className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-semibold text-bubble-700">อาการ</dt>
                <dd>{current.symptom}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-semibold text-peach-700">สาเหตุ</dt>
                <dd>{current.cause}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-semibold text-mint-700">เป้าหมาย</dt>
                <dd>{current.goal}</dd>
              </div>
            </dl>

            {/* ---------- คำใบ้ไล่ระดับ ---------- */}
            {!isPassed && (
              <div className="mt-3">
                {hintLevel > 0 && (
                  <ul className="mb-2 space-y-1.5 rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-3.5 py-2.5">
                    {current.hints.slice(0, hintLevel).map((h, i) => (
                      <li
                        key={h}
                        className="flex gap-2 text-xs leading-relaxed text-peach-900"
                      >
                        <span className="font-bold">{i + 1}.</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {hintLevel < current.hints.length && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setHintLevel((v) => v + 1);
                      // นับจำนวนคำใบ้ที่เปิด ใช้ทำรายงานให้ครูเห็นว่าคู่ไหนต้องการความช่วยเหลือมาก
                      update((prev) => ({
                        missions: { ...prev.missions, hintsUsed: prev.missions.hintsUsed + 1 },
                      }));
                    }}
                  >
                    <Lightbulb className="h-4 w-4 text-lemon-500" aria-hidden="true" />
                    {hintLevel === 0
                      ? 'ขอคำใบ้'
                      : `ขอคำใบ้เพิ่ม (${hintLevel}/${current.hints.length})`}
                  </Button>
                )}
              </div>
            )}

            {/* ---------- ผ่านแล้ว ---------- */}
            {isPassed && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="flex min-w-0 flex-1 animate-pop gap-2 rounded-2xl bg-gradient-to-b from-mint-400 to-mint-600 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-white shadow-clay-sm">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {current.success}
                </p>
                {current.key === 'mission1' && !passed.mission2 && (
                  <Button variant="primary" onClick={() => switchTo('mission2')}>
                    ไปภารกิจที่ 2
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
