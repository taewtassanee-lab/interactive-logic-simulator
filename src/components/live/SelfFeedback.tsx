import { Check, Lightbulb, X } from 'lucide-react';
import type { LiveActivityPreset } from '../../types/live';
import type { AnswerDraft } from './StudentForms';

/**
 * ผลของตัวเองที่ผู้เรียนเห็นทันทีหลังกดส่ง
 *
 * เดิมคำตอบวิ่งไปขึ้นที่จอครูอย่างเดียว ผู้เรียนเห็นแค่ข้อความว่าส่งแล้ว
 * จึงไม่ได้รับข้อมูลสะท้อนกลับที่ตัวเองเอาไปปรับปรุงต่อได้เลยในคาบนั้น
 *
 * ส่วนนี้จึงคืนผลให้เจ้าของคำตอบทันที: ได้กี่ข้อ ข้อไหนถูกข้อไหนผิด
 * เฉลยคืออะไร และเพราะอะไร เพื่อให้แก้ความเข้าใจที่คลาดเคลื่อนได้ก่อนลงมือทำภารกิจจริง
 */
const Ratio = ({ score, total }: { score: number; total: number }) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const tone =
    pct >= 80
      ? { bar: 'from-mint-400 to-mint-600', text: 'text-mint-700', ring: 'border-mint-200 bg-mint-50/70' }
      : pct >= 50
        ? { bar: 'from-lemon-400 to-peach-500', text: 'text-peach-700', ring: 'border-lemon-200 bg-lemon-50/70' }
        : { bar: 'from-bubble-400 to-bubble-600', text: 'text-bubble-700', ring: 'border-bubble-200 bg-bubble-50/70' };

  return (
    <div className={`rounded-2xl border-2 px-4 py-3.5 ${tone.ring}`}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className={`font-display text-4xl font-bold leading-none ${tone.text}`}>
          {score}
        </span>
        <span className="font-display text-lg font-bold text-slate-400">/ {total}</span>
        <span className="text-sm font-semibold text-slate-600">คิดเป็น {pct}%</span>
      </div>
      <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const SelfFeedback = ({
  preset,
  draft,
}: {
  preset: LiveActivityPreset;
  draft: AnswerDraft;
}) => {
  /* ---------- แบบทดสอบ: คืนผลรายข้อพร้อมเฉลย ---------- */
  if (preset.type === 'quiz' && preset.questions?.length) {
    const questions = preset.questions;
    const picked = draft.answer.split(',').map((n) => Number(n));

    return (
      <div className="space-y-3">
        <Ratio score={draft.score} total={draft.total} />

        <div className="space-y-2.5">
          {questions.map((q, i) => {
            const my = picked[i];
            const right = my === q.answerIndex;
            return (
              <article
                key={q.id}
                className={`rounded-2xl border-2 px-3.5 py-3 ${
                  right ? 'border-mint-200 bg-mint-50/50' : 'border-bubble-200 bg-bubble-50/50'
                }`}
              >
                <header className="mb-1.5 flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                      right ? 'bg-mint-500' : 'bg-bubble-500'
                    }`}
                  >
                    {right ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <X className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed text-slate-800">
                    ข้อ {i + 1}. {q.text}
                  </p>
                </header>

                <p className="ml-8 text-sm leading-relaxed text-slate-600">
                  คำตอบของฉัน:{' '}
                  <strong className={right ? 'text-mint-700' : 'text-bubble-700'}>
                    {q.choices[my] ?? 'ไม่ได้ตอบ'}
                  </strong>
                </p>
                {!right && (
                  <p className="ml-8 text-sm leading-relaxed text-slate-600">
                    คำตอบที่ถูก: <strong className="text-mint-700">{q.choices[q.answerIndex]}</strong>
                  </p>
                )}
                {q.explain && (
                  <p className="ml-8 mt-1.5 flex gap-1.5 rounded-xl bg-white/80 px-2.5 py-1.5 text-xs leading-relaxed text-slate-600">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-peach-500" aria-hidden="true" />
                    <span className="min-w-0">{q.explain}</span>
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- จับคู่: คืนผลรายคู่พร้อมคู่ที่ถูก ---------- */
  if (preset.type === 'match' && preset.pairs?.length) {
    const pairs = preset.pairs;
    const links = new Map(
      draft.answer.split(',').map((seg) => {
        const [from, to] = seg.split('>');
        return [from, to] as const;
      }),
    );

    return (
      <div className="space-y-3">
        <Ratio score={draft.score} total={draft.total} />
        <ul className="space-y-2">
          {pairs.map((p) => {
            const chose = links.get(p.id);
            const right = chose === p.id;
            const chosenAction = pairs.find((x) => x.id === chose)?.action;
            return (
              <li
                key={p.id}
                className={`rounded-2xl border-2 px-3.5 py-2.5 text-sm leading-relaxed ${
                  right ? 'border-mint-200 bg-mint-50/50' : 'border-bubble-200 bg-bubble-50/50'
                }`}
              >
                <p className="font-semibold text-slate-800">{p.condition}</p>
                <p className="text-slate-600">
                  ฉันโยงไปที่: <strong>{chosenAction ?? 'ยังไม่ได้โยง'}</strong>
                </p>
                {!right && (
                  <p className="text-mint-700">
                    ที่ถูกคือ: <strong>{p.action}</strong>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  /* ---------- กิจกรรมที่ไม่มีคำตอบถูกผิด: คืนสิ่งที่ตัวเองส่งไป ---------- */
  return (
    <div className="space-y-3">
      {draft.total > 0 && <Ratio score={draft.score} total={draft.total} />}
      {draft.answer && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            คำตอบที่ฉันส่งไป
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {draft.answer.split('|').join('\n')}
          </p>
        </div>
      )}
      {draft.image && (
        <p className="rounded-2xl border-2 border-peach-200 bg-peach-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
          ส่งภาพหน้าจอ &quot;{draft.image.name}&quot; ให้ครูแล้ว ครูจะเห็นภาพนี้ในแดชบอร์ด
        </p>
      )}
    </div>
  );
};
