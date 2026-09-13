import { useMemo, useState } from 'react';
import { Camera, Check, Send, Star, X } from 'lucide-react';
import { Button } from '../Ui';
import { compressImage } from '../../utils/live';
import type { LiveActivityPreset } from '../../types/live';

/** ผลที่ฟอร์มส่งกลับให้หน้ากิจกรรมสดนำไปส่งเข้าเซิร์ฟเวอร์ */
export interface AnswerDraft {
  answer: string;
  score: number;
  total: number;
  image?: { base64: string; name: string };
}

interface FormProps {
  preset: LiveActivityPreset;
  disabled: boolean;
  onSubmit: (draft: AnswerDraft) => void;
}

const inputClass =
  'w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100';

/* ==================== คลาวด์คำ ==================== */

const WordCloudForm = ({ preset, disabled, onSubmit }: FormProps) => {
  const max = preset.maxEntries ?? 3;
  const [words, setWords] = useState<string[]>(() => Array(max).fill(''));

  const filled = words.filter((w) => w.trim()).length;

  return (
    <div className="space-y-3">
      {words.map((w, i) => (
        <input
          key={i}
          value={w}
          disabled={disabled}
          maxLength={40}
          placeholder={`คำที่ ${i + 1}${i === 0 ? '' : ' (ไม่บังคับ)'}`}
          onChange={(e) => {
            const next = [...words];
            next[i] = e.target.value;
            setWords(next);
          }}
          aria-label={`คำที่ ${i + 1}`}
          className={inputClass}
        />
      ))}
      <Button
        variant="primary"
        disabled={disabled || filled === 0}
        onClick={() =>
          onSubmit({
            answer: words
              .map((w) => w.trim())
              .filter(Boolean)
              .join('|'),
            score: 0,
            total: 0,
          })
        }
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        ส่งคำของฉัน ({filled} คำ)
      </Button>
    </div>
  );
};

/* ==================== แบบทดสอบตรวจอัตโนมัติ ==================== */

const QuizForm = ({ preset, disabled, onSubmit }: FormProps) => {
  const questions = preset.questions ?? [];
  const [picked, setPicked] = useState<number[]>(() => Array(questions.length).fill(-1));

  const answeredAll = picked.every((p) => p >= 0);

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3">
          <legend className="px-1 font-display text-sm font-bold text-slate-700">
            ข้อ {qi + 1}
          </legend>
          <p className="mb-2.5 text-sm leading-relaxed text-slate-700">{q.text}</p>
          <div className="grid gap-2">
            {q.choices.map((c, ci) => {
              const active = picked[qi] === ci;
              return (
                <button
                  key={ci}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => {
                    const next = [...picked];
                    next[qi] = ci;
                    setPicked(next);
                  }}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'border-brand-400 bg-brand-50 font-semibold text-brand-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      active
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-300 text-slate-400'
                    }`}
                    aria-hidden="true"
                  >
                    {'กขคง'[ci] ?? ci + 1}
                  </span>
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <Button
        variant="primary"
        disabled={disabled || !answeredAll}
        onClick={() => {
          const score = questions.reduce(
            (sum, q, i) => sum + (picked[i] === q.answerIndex ? 1 : 0),
            0,
          );
          onSubmit({ answer: picked.join(','), score, total: questions.length });
        }}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {answeredAll ? 'ส่งคำตอบ' : `ยังเหลืออีก ${picked.filter((p) => p < 0).length} ข้อ`}
      </Button>
    </div>
  );
};

/* ==================== จับคู่เงื่อนไขกับผลลัพธ์ ==================== */

/** สลับลำดับด้วยรหัสคงที่ เพื่อให้ทุกเครื่องเห็นการสลับแบบเดียวกัน แต่ไม่เรียงตรงกับฝั่งซ้าย */
const shuffleStable = <T,>(items: T[]): T[] => {
  const arr = [...items];
  let seed = 20690701;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const MatchForm = ({ preset, disabled, onSubmit }: FormProps) => {
  const pairs = useMemo(() => preset.pairs ?? [], [preset.pairs]);
  const actions = useMemo(() => shuffleStable(pairs), [pairs]);
  /** เก็บว่าเงื่อนไขแต่ละข้อถูกโยงไปที่ผลลัพธ์รหัสใด */
  const [links, setLinks] = useState<Record<string, string>>({});
  const [activeCondition, setActiveCondition] = useState<string | null>(null);

  const linkedActions = new Set(Object.values(links));
  const done = Object.keys(links).length === pairs.length;

  const tapCondition = (id: string) => {
    if (disabled) return;
    if (links[id]) {
      // แตะซ้ำที่ข้อที่โยงไว้แล้ว = ยกเลิกการโยง
      const next = { ...links };
      delete next[id];
      setLinks(next);
      setActiveCondition(id);
      return;
    }
    setActiveCondition(activeCondition === id ? null : id);
  };

  const tapAction = (actionId: string) => {
    if (disabled || !activeCondition) return;
    if (linkedActions.has(actionId)) return;
    setLinks({ ...links, [activeCondition]: actionId });
    setActiveCondition(null);
  };

  return (
    <div className="space-y-3">
      <p className="rounded-2xl border-2 border-dashed border-think-200 bg-think-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-think-900">
        แตะเงื่อนไขทางซ้ายให้ขึ้นกรอบสีก่อน แล้วแตะผลลัพธ์ทางขวาที่คู่กัน
        ถ้าโยงผิดให้แตะเงื่อนไขเดิมซ้ำเพื่อยกเลิก
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="font-display text-sm font-bold text-slate-600">เงื่อนไข (Condition)</h3>
          {pairs.map((p, i) => {
            const linkedTo = links[p.id];
            const selected = activeCondition === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => tapCondition(p.id)}
                className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition ${
                  linkedTo
                    ? 'border-mint-400 bg-mint-50 text-mint-900'
                    : selected
                      ? 'border-brand-500 bg-brand-50 text-brand-900 ring-4 ring-brand-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
                }`}
              >
                <span className="mr-1.5 font-bold text-slate-400">{i + 1}.</span>
                {p.condition}
                {linkedTo && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-mint-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    โยงแล้ว
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-sm font-bold text-slate-600">ผลลัพธ์ (Action)</h3>
          {actions.map((a) => {
            const used = linkedActions.has(a.id);
            return (
              <button
                key={a.id}
                type="button"
                disabled={disabled || used || !activeCondition}
                onClick={() => tapAction(a.id)}
                className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition ${
                  used
                    ? 'border-mint-300 bg-mint-50/60 text-mint-800 opacity-70'
                    : activeCondition
                      ? 'border-brand-300 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-50'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {a.action}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        variant="primary"
        disabled={disabled || !done}
        onClick={() => {
          const score = pairs.filter((p) => links[p.id] === p.id).length;
          const answer = pairs.map((p) => `${p.id}>${links[p.id] ?? '-'}`).join(',');
          onSubmit({ answer, score, total: pairs.length });
        }}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {done ? 'ส่งคำตอบ' : `โยงแล้ว ${Object.keys(links).length} จาก ${pairs.length} คู่`}
      </Button>
    </div>
  );
};

/* ==================== โพลสำรวจด่วน ==================== */

const PollForm = ({ preset, disabled, onSubmit }: FormProps) => {
  const [stars, setStars] = useState(0);

  // ไม่ได้กำหนดตัวเลือกไว้ = ให้ดาว 1-5
  if (!preset.options?.length) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="ให้ดาว 1 ถึง 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              aria-pressed={stars === n}
              aria-label={`${n} ดาว`}
              onClick={() => setStars(n)}
              className={`rounded-2xl border-2 p-2.5 transition ${
                stars >= n
                  ? 'border-lemon-400 bg-lemon-50'
                  : 'border-slate-200 bg-white hover:border-lemon-200'
              }`}
            >
              <Star
                className={`h-8 w-8 ${stars >= n ? 'fill-lemon-400 text-lemon-500' : 'text-slate-300'}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-semibold text-slate-600">
          {stars ? `เลือกไว้ ${stars} ดาว` : 'แตะดาวเพื่อให้คะแนน'}
        </p>
        <Button
          variant="primary"
          className="w-full"
          disabled={disabled || stars === 0}
          onClick={() => onSubmit({ answer: String(stars), score: stars, total: 5 })}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          ส่งคำตอบ
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {preset.options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSubmit({ answer: opt, score: 0, total: 0 })}
          className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left font-display text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-700 disabled:opacity-45"
          style={{ boxShadow: '0 3px 0 0 #e2e8f0' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

/* ==================== พิมพ์ตอบสั้น ==================== */

const ShortAnswerForm = ({ preset, disabled, onSubmit }: FormProps) => {
  const max = preset.maxEntries ?? 1;
  const [texts, setTexts] = useState<string[]>(() => Array(max).fill(''));
  const filled = texts.filter((t) => t.trim().length >= 3).length;

  return (
    <div className="space-y-3">
      {texts.map((t, i) => (
        <div key={i}>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {preset.entryLabels?.[i] ?? `ข้อความที่ ${i + 1}`}
          </label>
          <textarea
            value={t}
            disabled={disabled}
            rows={2}
            maxLength={200}
            onChange={(e) => {
              const next = [...texts];
              next[i] = e.target.value;
              setTexts(next);
            }}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
      ))}
      <Button
        variant="primary"
        disabled={disabled || filled === 0}
        onClick={() =>
          onSubmit({
            answer: texts
              .map((t, i) => {
                const clean = t.trim();
                if (!clean) return '';
                const label = preset.entryLabels?.[i];
                return label ? `${label}: ${clean}` : clean;
              })
              .filter(Boolean)
              .join('\n'),
            score: 0,
            total: 0,
          })
        }
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        ส่งข้อความ
      </Button>
    </div>
  );
};

/* ==================== ส่งภาพหน้าจอ SOS ==================== */

const ImageForm = ({ disabled, onSubmit }: FormProps) => {
  const [preview, setPreview] = useState<{ url: string; base64: string; name: string } | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const shrunk = await compressImage(file);
      setPreview({ url: URL.createObjectURL(file), base64: shrunk.base64, name: shrunk.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เปิดไฟล์ภาพไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-8 text-center transition hover:bg-brand-50">
          <Camera className="h-10 w-10 text-brand-500" aria-hidden="true" />
          <span className="font-display text-sm font-bold text-brand-800">
            {busy ? 'กำลังเตรียมภาพ...' : 'แตะเพื่อถ่ายภาพหรือเลือกภาพหน้าจอ'}
          </span>
          <span className="text-xs text-slate-500">ระบบย่อภาพให้อัตโนมัติก่อนส่ง</span>
          <input
            type="file"
            accept="image/*"
            disabled={disabled || busy}
            className="sr-only"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200">
          <img src={preview.url} alt="ภาพหน้าจอที่เลือกไว้" className="w-full" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="เอาภาพนี้ออก"
            className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 shadow-clay-sm"
          >
            <X className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </button>
        </div>
      )}

      {error && <p className="text-xs font-semibold text-bubble-700">⚠ {error}</p>}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          อาการที่พบ (ช่วยให้ครูดูตรงจุดเร็วขึ้น)
        </label>
        <input
          value={note}
          disabled={disabled}
          maxLength={120}
          placeholder="เช่น กดตอบแล้วคะแนนไม่ขึ้น"
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
        />
      </div>

      <Button
        variant="danger"
        disabled={disabled || !preview}
        onClick={() =>
          preview &&
          onSubmit({
            answer: note.trim(),
            score: 0,
            total: 0,
            image: { base64: preview.base64, name: preview.name },
          })
        }
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        ส่งขอความช่วยเหลือ
      </Button>
    </div>
  );
};

/* ==================== ตัวเลือกฟอร์มตามชนิดกิจกรรม ==================== */

export const StudentAnswerForm = (props: FormProps) => {
  switch (props.preset.type) {
    case 'wordcloud':
      return <WordCloudForm {...props} />;
    case 'quiz':
      return <QuizForm {...props} />;
    case 'match':
      return <MatchForm {...props} />;
    case 'poll':
      return <PollForm {...props} />;
    case 'shortanswer':
      return <ShortAnswerForm {...props} />;
    case 'image':
      return <ImageForm {...props} />;
    default:
      return null;
  }
};
