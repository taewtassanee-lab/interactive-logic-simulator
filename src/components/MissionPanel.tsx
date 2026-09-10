import { Award, Bug, CircleCheck, Medal, Search, Target } from 'lucide-react';
import type { MissionState, SimState } from '../types';
import { MISSION_SUCCESS_MESSAGES } from '../utils/simulator';
import { Card } from './Ui';
import { BugBuddy, Medal3D } from './Illustrations';

const MISSIONS = [
  {
    key: 'mission1' as const,
    title: 'ภารกิจที่ 1: ระบบสุ่มข้อสอบซ้ำ',
    symptom: 'ระบบสุ่มคำถามเดิมซ้ำ ผู้เล่นเจอข้อเดิมหลายครั้ง',
    cause: 'ไม่มีบล็อก Array -> Delete index Num from X axis ข้อสอบที่ใช้แล้วจึงยังอยู่ใน Array',
    goal: 'เพิ่มบล็อก Delete index ให้อยู่ต่อจาก Set CurrentQuestion ภายใน Function "Random"',
    success: MISSION_SUCCESS_MESSAGES.mission1,
    icon: Search,
  },
  {
    key: 'mission2' as const,
    title: 'ภารกิจที่ 2: ทำข้อสอบครบแต่ไม่เข้าสู่หน้าสรุปผล',
    symptom: 'ทำข้อสอบครบทุกข้อแล้ว แต่หน้าจอยังค้างอยู่ที่ Layout Quiz',
    cause: 'ไม่มีเงื่อนไข If Array is empty หรือวาง Go to Layout "Summary" ไม่ถูกตำแหน่ง',
    goal: 'จัดบล็อก If Array is empty ให้อยู่ก่อน Go to Layout "Summary" และ Display Score',
    success: MISSION_SUCCESS_MESSAGES.mission2,
    icon: Target,
  },
];

const BADGES = [
  {
    id: 'array_detective',
    name: 'Array Detective',
    description: 'แก้ภารกิจระบบสุ่มข้อสอบซ้ำสำเร็จ',
    icon: Search,
    tone: 'brand' as const,
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'แก้ภารกิจเงื่อนไขจบเกมสำเร็จ',
    icon: Bug,
    tone: 'bubble' as const,
  },
  {
    id: 'logic_master',
    name: 'Logic Master',
    description: 'ผ่านทั้ง 2 ภารกิจ เข้าใจตรรกะทั้งระบบ',
    icon: Medal,
    tone: 'think' as const,
  },
];

export const MissionPanel = ({
  missions,
  liveState,
}: {
  missions: MissionState;
  liveState: SimState;
}) => {
  const passed = {
    mission1: missions.mission1Passed,
    mission2: missions.mission2Passed,
  };
  const earned: Record<string, boolean> = {
    array_detective: passed.mission1,
    bug_hunter: passed.mission2,
    logic_master: passed.mission1 && passed.mission2,
  };

  return (
    <div className="space-y-4">
      <Card
        title="Debug Challenge: ภารกิจแก้ Bug"
        subtitle="แก้ให้ครบทั้ง 2 ภารกิจเพื่อรับเหรียญตราครบชุด"
        icon={<Bug className="h-5 w-5 text-bubble-600" aria-hidden="true" />}
        actions={<BugBuddy size={52} className="animate-float" />}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {MISSIONS.map((m) => {
            const Icon = m.icon;
            const ok = passed[m.key];
            return (
              <div
                key={m.key}
                className={`rounded-[1.25rem] border-2 p-3.5 transition-transform hover:-translate-y-0.5 ${
                  ok
                    ? 'border-mint-300 bg-gradient-to-b from-mint-50 to-white shadow-clay-sm'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-clay-sm ${
                      ok
                        ? 'bg-gradient-to-b from-mint-400 to-mint-600 text-white'
                        : 'bg-gradient-to-b from-white to-slate-100 text-slate-500'
                    }`}
                  >
                    {ok ? (
                      <CircleCheck className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">{m.title}</h3>
                    <p
                      className={`text-xs font-semibold ${ok ? 'text-mint-700' : 'text-slate-500'}`}
                    >
                      สถานะ: {ok ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}
                    </p>
                  </div>
                </div>
                <dl className="space-y-1 text-xs leading-relaxed text-slate-600">
                  <div>
                    <dt className="inline font-semibold text-slate-700">อาการ: </dt>
                    <dd className="inline">{m.symptom}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-slate-700">สาเหตุ: </dt>
                    <dd className="inline">{m.cause}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-slate-700">เป้าหมาย: </dt>
                    <dd className="inline">{m.goal}</dd>
                  </div>
                </dl>
                {ok && (
                  <p className="mt-2 flex animate-pop gap-2 rounded-2xl bg-gradient-to-b from-mint-400 to-mint-600 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-white shadow-clay-sm">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {m.success}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="เหรียญตราความสำเร็จ"
        subtitle={`คะแนนสูงสุดจากการจำลอง: ${missions.bestScore} คะแนน | คะแนนรอบล่าสุด: ${liveState.score} คะแนน`}
        icon={<Award className="h-5 w-5 text-lemon-500" aria-hidden="true" />}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            const got = earned[badge.id];
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center rounded-[1.25rem] border-2 p-4 text-center transition ${
                  got
                    ? 'border-lemon-200 bg-gradient-to-b from-lemon-50 to-white shadow-clay-sm'
                    : 'border-dashed border-slate-200 bg-slate-50/70'
                }`}
              >
                <Medal3D tone={badge.tone} earned={got}>
                  <Icon className="h-7 w-7 drop-shadow" aria-hidden="true" />
                </Medal3D>
                <p className="mt-2 font-display text-sm font-bold text-slate-800">{badge.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                  {badge.description}
                </p>
                <p
                  className={`mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    got ? 'bg-mint-200 text-mint-900' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {got ? 'ได้รับแล้ว' : 'ยังไม่ได้รับ'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
