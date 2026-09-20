import { useEffect, useState } from 'react';
import { AlertTriangle, Image as ImageIcon, Loader2, Medal, Star, Users } from 'lucide-react';
import { Button, EmptyState, Pill } from '../Ui';
import { averageStars, countOptions, countWords, fetchSosImage, rankResponses } from '../../utils/live';
import type { LiveActivityPreset, LiveResponse } from '../../types/live';

interface ViewProps {
  preset: LiveActivityPreset;
  responses: LiveResponse[];
  teacherKey: string;
  /** ครูปิดรับคำตอบแล้ว จึงเปิดเฉลยได้ */
  revealed: boolean;
}

/* ==================== คลาวด์คำ ==================== */

const CLOUD_TONES = [
  'text-brand-600',
  'text-think-600',
  'text-mint-700',
  'text-peach-600',
  'text-bubble-600',
];

const WordCloudView = ({ responses }: ViewProps) => {
  const words = countWords(responses);
  if (!words.length) {
    return <EmptyState icon={null} title="ยังไม่มีคำส่งเข้ามา" description="รอให้นักเรียนพิมพ์คำแรกสักครู่" />;
  }
  const max = words[0].count;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-3xl border-2 border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-8">
        {words.map((w, i) => {
          // ขนาดตัวอักษรไล่จาก 18px ถึง 68px ตามความถี่ คำที่ซ้ำมากจะเด่นขึ้นมาเอง
          const ratio = max > 1 ? (w.count - 1) / (max - 1) : 1;
          return (
            <span
              key={w.word}
              className={`font-display font-bold leading-tight ${CLOUD_TONES[i % CLOUD_TONES.length]}`}
              style={{ fontSize: `${18 + ratio * 50}px` }}
              title={`${w.word} — ${w.count} คน`}
            >
              {w.word}
              <sup className="ml-0.5 text-xs font-semibold text-slate-400">{w.count}</sup>
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-slate-500">
        รวม {words.length} คำที่ต่างกัน จากผู้ตอบ {responses.length} คน
      </p>
    </div>
  );
};

/* ==================== โพลสำรวจ ==================== */

const PollView = ({ preset, responses }: ViewProps) => {
  if (!responses.length) {
    return <EmptyState icon={null} title="ยังไม่มีใครกดตอบ" description="รอผลจากนักเรียนสักครู่" />;
  }

  if (!preset.options?.length) {
    const avg = averageStars(responses);
    const buckets = [1, 2, 3, 4, 5].map(
      (n) => responses.filter((r) => Number(r.answer) === n).length,
    );
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-4 py-6 text-center">
          <p className="font-display text-6xl font-bold text-peach-600">{avg.toFixed(2)}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            คะแนนเฉลี่ยจากผู้ตอบ {responses.length} คน (เต็ม 5 ดาว)
          </p>
          <div className="mt-2 flex justify-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-6 w-6 ${
                  avg >= n - 0.25 ? 'fill-lemon-400 text-lemon-500' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = buckets[n - 1];
            const percent = Math.round((count / responses.length) * 100);
            return (
              <div key={n} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm font-semibold text-slate-600">{n} ดาว</span>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lemon-300 to-peach-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm text-slate-500">
                  {count} คน ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const counts = countOptions(responses, preset.options);
  const top = Math.max(...counts, 1);

  return (
    <div className="space-y-2.5">
      {preset.options.map((opt, i) => {
        const percent = Math.round((counts[i] / responses.length) * 100);
        return (
          <div key={opt}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">{opt}</span>
              <span className="shrink-0 text-sm text-slate-500">
                {counts[i]} คน ({percent}%)
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-xl bg-slate-100">
              <div
                className={`h-full rounded-xl transition-all duration-500 ${
                  counts[i] === top && counts[i] > 0
                    ? 'bg-gradient-to-r from-brand-400 to-brand-600'
                    : 'bg-gradient-to-r from-slate-300 to-slate-400'
                }`}
                style={{ width: `${Math.max(percent, counts[i] ? 4 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-center text-sm text-slate-500">ผู้ตอบทั้งหมด {responses.length} คน</p>
    </div>
  );
};

/* ==================== ตารางอันดับ (แบบทดสอบและจับคู่) ==================== */

const MEDAL_TONES = ['text-lemon-500', 'text-slate-400', 'text-peach-600'];

const LeaderboardView = ({ preset, responses, revealed }: ViewProps) => {
  if (!responses.length) {
    return <EmptyState icon={null} title="ยังไม่มีใครส่งคำตอบ" description="รอผลจากนักเรียนสักครู่" />;
  }
  const ranked = rankResponses(responses);
  const total = ranked[0]?.total || 0;
  const avg = ranked.reduce((s, r) => s + r.score, 0) / ranked.length;

  /** สัดส่วนคนที่ตอบถูกรายข้อ ใช้ชี้ว่าข้อไหนต้องอธิบายซ้ำ */
  const perQuestion = (preset.questions ?? []).map((q, qi) => {
    const correct = ranked.filter((r) => Number(r.answer.split(',')[qi]) === q.answerIndex).length;
    return { q, correct, percent: Math.round((correct / ranked.length) * 100) };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 px-3.5 py-3 text-center">
          <p className="font-display text-3xl font-bold text-brand-700">{ranked.length}</p>
          <p className="text-xs font-semibold text-slate-600">ส่งคำตอบแล้ว (คน)</p>
        </div>
        <div className="rounded-2xl border-2 border-mint-200 bg-mint-50/70 px-3.5 py-3 text-center">
          <p className="font-display text-3xl font-bold text-mint-700">
            {avg.toFixed(1)}
            <span className="text-base text-slate-400">/{total}</span>
          </p>
          <p className="text-xs font-semibold text-slate-600">คะแนนเฉลี่ยของห้อง</p>
        </div>
        <div className="rounded-2xl border-2 border-lemon-200 bg-lemon-50/70 px-3.5 py-3 text-center">
          <p className="font-display text-3xl font-bold text-peach-600">
            {Math.round((ranked.filter((r) => r.score >= total * 0.7).length / ranked.length) * 100)}%
          </p>
          <p className="text-xs font-semibold text-slate-600">ผ่านเกณฑ์ร้อยละ 70</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
              <th className="rounded-l-xl px-3 py-2">อันดับ</th>
              <th className="px-3 py-2">ชื่อผู้ตอบ</th>
              <th className="px-3 py-2">รหัสคู่</th>
              <th className="px-3 py-2 text-center">คะแนน</th>
              <th className="rounded-r-xl px-3 py-2 text-right">เวลาที่ใช้</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={`${r.studentName}-${i}`} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                    {i < 3 && (
                      <Medal className={`h-4 w-4 ${MEDAL_TONES[i]}`} aria-hidden="true" />
                    )}
                    {i + 1}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-slate-700">
                  {r.studentName}
                  {r.studentNumber && (
                    <span className="ml-1 text-xs text-slate-400">เลขที่ {r.studentNumber}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.pairCode || '-'}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 font-bold ${
                      r.score >= r.total * 0.7
                        ? 'bg-mint-100 text-mint-800'
                        : 'bg-peach-100 text-peach-800'
                    }`}
                  >
                    {r.score}/{r.total}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-500">{r.seconds} วินาที</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {revealed && perQuestion.length > 0 && (
        <div className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/60 px-4 py-3.5">
          <h4 className="mb-2 font-display text-sm font-bold text-think-900">
            เฉลยและสัดส่วนที่ตอบถูกรายข้อ
          </h4>
          {/* แสดงตัวโจทย์ด้วย เพราะหน้านี้ถูกฉายขึ้นจอหน้าชั้นตอนเฉลย
              ถ้าเห็นแต่เลขข้อกับคำตอบ ผู้เรียนจะจำไม่ได้ว่ากำลังพูดถึงข้อไหน */}
          <ol className="space-y-3">
            {perQuestion.map(({ q, percent }, i) => (
              <li
                key={q.id}
                className="rounded-xl bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-slate-700"
              >
                <p className="font-semibold text-slate-800">
                  ข้อ {i + 1}. {q.text}
                </p>
                <p className="mt-1">
                  เฉลยคือ <strong className="text-mint-700">{q.choices[q.answerIndex]}</strong>
                  {' · '}
                  ตอบถูก{' '}
                  <span
                    className={`font-bold ${percent >= 70 ? 'text-mint-700' : 'text-bubble-700'}`}
                  >
                    {percent}%
                  </span>
                </p>
                {q.explain && <p className="mt-0.5 text-xs text-slate-500">{q.explain}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {revealed && preset.type === 'match' && (
        <div className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/60 px-4 py-3.5">
          <h4 className="mb-2 font-display text-sm font-bold text-think-900">เฉลยการจับคู่</h4>
          <ol className="space-y-1.5">
            {(preset.pairs ?? []).map((p) => (
              <li key={p.id} className="text-sm leading-relaxed text-slate-700">
                <strong>{p.condition}</strong> → {p.action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

/* ==================== กำแพงข้อความ ==================== */

const WALL_TONES = [
  'border-brand-200 bg-brand-50/60',
  'border-mint-200 bg-mint-50/60',
  'border-lemon-200 bg-lemon-50/60',
  'border-think-200 bg-think-50/60',
  'border-peach-200 bg-peach-50/60',
];

const AnswerWallView = ({ responses }: ViewProps) => {
  if (!responses.length) {
    return <EmptyState icon={null} title="ยังไม่มีข้อความส่งเข้ามา" description="รอให้นักเรียนพิมพ์สักครู่" />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {responses.map((r, i) => (
        <article
          key={`${r.studentName}-${i}`}
          className={`rounded-2xl border-2 px-3.5 py-3 ${WALL_TONES[i % WALL_TONES.length]}`}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{r.answer}</p>
          <footer className="mt-2 flex items-center gap-1.5 border-t border-dashed border-slate-300 pt-2 text-xs font-semibold text-slate-500">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {r.studentName}
            {r.pairCode && <span className="text-slate-400">· {r.pairCode}</span>}
          </footer>
        </article>
      ))}
    </div>
  );
};

/* ==================== ภาพ SOS ==================== */

const SosCard = ({ response, teacherKey }: { response: LiveResponse; teacherKey: string }) => {
  const fileId = response.answer.startsWith('IMG:') ? response.answer.slice(4) : '';
  const [src, setSrc] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [zoom, setZoom] = useState(false);

  const load = async () => {
    if (!fileId) return;
    setState('loading');
    const res = await fetchSosImage(teacherKey, fileId);
    if (res.ok && res.data) {
      setSrc(res.data.dataUrl);
      setState('idle');
    } else {
      setState('error');
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-bubble-200 bg-white">
      <header className="flex items-center gap-2 bg-bubble-50 px-3 py-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-bubble-600" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-bubble-900">
          {response.studentName}
        </span>
        {response.pairCode && <Pill tone="bubble">{response.pairCode}</Pill>}
      </header>

      {src ? (
        <button type="button" onClick={() => setZoom(true)} className="block w-full">
          <img src={src} alt={`ภาพหน้าจอจาก ${response.studentName}`} className="w-full" />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 px-3 py-6">
          {state === 'error' ? (
            <p className="text-xs font-semibold text-bubble-700">โหลดภาพไม่สำเร็จ</p>
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300" aria-hidden="true" />
          )}
          <Button variant="secondary" disabled={state === 'loading'} onClick={() => void load()}>
            {state === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
            )}
            {state === 'loading' ? 'กำลังโหลด...' : 'เปิดดูภาพ'}
          </Button>
        </div>
      )}

      {response.answer && !response.answer.startsWith('IMG:') && (
        <p className="px-3 py-2 text-sm text-slate-600">{response.answer}</p>
      )}

      {zoom && src && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`ภาพหน้าจอจาก ${response.studentName} ขนาดเต็ม`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 p-4"
          onClick={() => setZoom(false)}
        >
          <img src={src} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </article>
  );
};

const SosGalleryView = ({ responses, teacherKey }: ViewProps) => {
  if (!responses.length) {
    return (
      <EmptyState
        icon={null}
        title="ยังไม่มีคู่ไหนขอความช่วยเหลือ"
        description="เมื่อมีนักเรียนส่งภาพหน้าจอเข้ามา จะขึ้นที่นี่ทันที"
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {responses.map((r, i) => (
        <SosCard key={`${r.studentName}-${i}`} response={r} teacherKey={teacherKey} />
      ))}
    </div>
  );
};

/* ==================== ตัวเลือกมุมมองตามชนิดกิจกรรม ==================== */

export const LiveResultView = (props: ViewProps) => {
  switch (props.preset.type) {
    case 'wordcloud':
      return <WordCloudView {...props} />;
    case 'poll':
      return <PollView {...props} />;
    case 'quiz':
    case 'match':
      return <LeaderboardView {...props} />;
    case 'shortanswer':
      return <AnswerWallView {...props} />;
    case 'image':
      return <SosGalleryView {...props} />;
    default:
      return null;
  }
};

/** แปลงคำตอบกิจกรรมสดเป็น CSV ให้ครูเก็บเป็นหลักฐาน */
export const liveResponsesToCsv = (responses: LiveResponse[]): string => {
  const headers = [
    'เวลาที่ตอบ',
    'ห้องเรียน',
    'รหัสกิจกรรม',
    'ชื่อผู้ตอบ',
    'เลขที่',
    'รหัสคู่',
    'คำตอบ',
    'คะแนน',
    'คะแนนเต็ม',
    'เวลาที่ใช้ (วินาที)',
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = responses.map((r) =>
    [
      r.submittedAt ? new Date(r.submittedAt).toLocaleString('th-TH') : '',
      r.classroom,
      r.activityId,
      r.studentName,
      r.studentNumber,
      r.pairCode,
      r.answer,
      r.score,
      r.total,
      r.seconds,
    ]
      .map(esc)
      .join(','),
  );
  // BOM เพื่อให้ Excel เปิดไฟล์ภาษาไทยได้ถูกต้อง
  return '﻿' + [headers.map(esc).join(','), ...lines].join('\n');
};

/** ตัวนับผู้ตอบแบบเรียลไทม์ ใช้โชว์บนจอหน้าชั้น */
export const ResponderCounter = ({ count }: { count: number }) => {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(id);
  }, [count]);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-mint-200 bg-mint-50 px-3 py-1 font-display text-sm font-bold text-mint-800 transition-transform ${
        pulse ? 'scale-110' : 'scale-100'
      }`}
    >
      <Users className="h-4 w-4" aria-hidden="true" />
      {count} คนตอบแล้ว
    </span>
  );
};
