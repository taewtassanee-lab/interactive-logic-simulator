import { useState } from 'react';
import {
  BookOpenCheck,
  Boxes,
  ArrowLeftRight,
  CircleCheck,
  CircleHelp,
  FunctionSquare,
  Lightbulb,
  Copy,
  ListChecks,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Button, Card, Pill } from '../components/Ui';
import { ArrayPlayground } from '../components/ArrayPlayground';
import { Mascot } from '../components/Illustrations';
import {
  ADVANCED_CONCEPTS,
  ARRAY_COMMANDS,
  ARRAY_CONCEPTS,
  COMMON_MISTAKES,
  FUNCTION_COMMANDS,
  FUNCTION_CONCEPTS,
  GLOSSARY,
  QUIZ_JSON,
  REAL_EVENT_MAPPING,
  REVIEW_QUESTIONS,
  type CommandRow,
  type ConceptSection,
} from '../data/knowledge';

/* ---------- การ์ดแนวคิดแบบพับเก็บได้ ---------- */

const TONES = {
  brand: {
    ring: 'border-brand-200',
    head: 'bg-gradient-to-r from-brand-100 to-brand-50',
    num: 'from-brand-400 to-brand-600',
    edge: 'rgba(99,102,241,0.28)',
    dot: 'text-brand-500',
    text: 'text-brand-900',
  },
  think: {
    ring: 'border-think-200',
    head: 'bg-gradient-to-r from-think-100 to-think-50',
    num: 'from-think-400 to-think-600',
    edge: 'rgba(139,92,246,0.28)',
    dot: 'text-think-500',
    text: 'text-think-900',
  },
  mint: {
    ring: 'border-mint-200',
    head: 'bg-gradient-to-r from-mint-100 to-mint-50',
    num: 'from-mint-400 to-mint-600',
    edge: 'rgba(16,185,129,0.28)',
    dot: 'text-mint-600',
    text: 'text-mint-900',
  },
} as const;

const ConceptList = ({
  sections,
  tone,
}: {
  sections: ConceptSection[];
  tone: keyof typeof TONES;
}) => {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);
  /** หัวข้อที่เคยกางอ่านแล้ว ใช้ทำแถบความคืบหน้าให้ผู้เรียนรู้ว่าอ่านไปถึงไหน */
  const [read, setRead] = useState<string[]>(sections[0]?.id ? [sections[0].id] : []);
  const { ring, head, num, edge, dot, text } = TONES[tone];
  const percent = Math.round((read.length / sections.length) * 100);

  return (
    <div className="space-y-2.5">
      {/* แถบความคืบหน้า ให้รู้ว่าเหลืออีกกี่หัวข้อ ไม่ใช่เลื่อนอ่านไปเรื่อย ๆ โดยไม่รู้ปลายทาง */}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-3.5 py-2">
        <span className="shrink-0 text-xs font-semibold text-slate-500">
          เปิดอ่านแล้ว {read.length} จาก {sections.length} หัวข้อ
        </span>
        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span
            className={`block h-full rounded-full bg-gradient-to-r transition-all duration-500 ${num}`}
            style={{ width: `${percent}%` }}
          />
        </span>
        <span className={`shrink-0 font-display text-sm font-bold ${text}`}>{percent}%</span>
      </div>

      {sections.map((sec, i) => {
        const open = openId === sec.id;
        return (
          <div key={sec.id} className={`overflow-hidden rounded-[1.25rem] border-2 ${ring}`}>
            <button
              type="button"
              onClick={() => {
                setOpenId(open ? null : sec.id);
                if (!open) setRead((prev) => (prev.includes(sec.id) ? prev : [...prev, sec.id]));
              }}
              aria-expanded={open}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                open ? head : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b font-display text-base font-bold text-white ${num}`}
                style={{ boxShadow: `0 4px 0 0 ${edge}` }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] font-bold leading-snug text-slate-800">
                  {sec.title}
                  {/* ติดป้ายเฉพาะหัวข้อที่ต้องรู้ก่อนเข้าคาบ ที่เหลือปล่อยว่างไว้
                      เพื่อไม่ให้ผู้เรียนรู้สึกว่าต้องอ่านทุกหัวข้อให้ครบก่อนจึงจะเริ่มได้ */}
                  {sec.essential && (
                    <span className="ml-2 inline-block whitespace-nowrap rounded-full border-2 border-mint-300 bg-mint-50 px-2 py-0.5 align-middle font-display text-[11px] font-bold text-mint-800">
                      อ่านก่อนเรียน
                    </span>
                  )}
                </span>
                {!open && read.includes(sec.id) && (
                  <span className="mt-0.5 block text-xs font-semibold text-mint-700">
                    อ่านแล้ว · กดเพื่อเปิดดูอีกครั้ง
                  </span>
                )}
              </span>
              {/* ใช้คำแทนเครื่องหมายบวกลบ ผู้เรียนจะได้รู้ทันทีว่ากดแล้วเกิดอะไรขึ้น
                  กำหนดความกว้างขั้นต่ำไว้ ปุ่มจะได้ไม่ขยับตอนสลับคำ */}
              <span
                className={`flex min-w-[5.5rem] shrink-0 items-center justify-center rounded-xl border-2 px-3 py-1.5 font-display text-sm font-bold transition ${
                  open
                    ? `border-white/70 bg-white/80 ${text}`
                    : 'border-brand-200 bg-white text-brand-700'
                }`}
              >
                {open ? 'ปิด' : 'เปิดอ่าน'}
              </span>
            </button>

            {open && (
              <div className="border-t-2 border-dashed border-slate-100 bg-white px-4 py-4">
                {/* คำเปรียบเทียบมาก่อนเสมอ ให้เห็นภาพก่อนแล้วค่อยลงรายละเอียดทางเทคนิค */}
                <div
                  className="rounded-2xl border-2 border-lemon-200 bg-gradient-to-b from-lemon-50 to-white px-4 py-3"
                  style={{ boxShadow: '0 4px 0 0 rgba(245,158,11,0.22)' }}
                >
                  <p className="mb-1 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide text-peach-700">
                    <Lightbulb className="h-4 w-4" aria-hidden="true" />
                    เปรียบเทียบให้เห็นภาพ
                  </p>
                  <p className="text-[15px] leading-relaxed text-slate-700">{sec.plain}</p>
                </div>

                <p className="mb-2 mt-3.5 font-display text-xs font-bold uppercase tracking-wide text-slate-500">
                  รายละเอียดที่ต้องรู้
                </p>
                <ul className="space-y-2">
                  {sec.technical.map((t) => (
                    <li
                      key={t}
                      className="flex gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-[15px] leading-relaxed text-slate-700"
                    >
                      <CircleCheck className={`mt-0.5 h-4 w-4 shrink-0 ${dot}`} aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- ตารางคำสั่ง ---------- */

const CommandTable = ({ rows }: { rows: CommandRow[] }) => (
  <div className="scroll-thin -mx-1 overflow-x-auto px-1">
    <table className="w-full min-w-[560px] border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-slate-200 text-left">
          <th className="px-2.5 py-2 text-xs font-bold text-slate-600">คำสั่ง / นิพจน์</th>
          <th className="px-2.5 py-2 text-xs font-bold text-slate-600">ความหมาย</th>
          <th className="px-2.5 py-2 text-xs font-bold text-slate-600">ข้อสังเกต</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.command} className="border-b border-slate-100 hover:bg-brand-50/40">
            <td className="px-2.5 py-2">
              <code className="whitespace-nowrap rounded-lg bg-slate-100 px-2 py-1 font-mono text-[12px] font-semibold text-slate-800">
                {r.command}
              </code>
            </td>
            <td className="px-2.5 py-2 text-slate-700">{r.meaning}</td>
            <td className="px-2.5 py-2 text-xs text-slate-500">{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------- คำถามทบทวน ---------- */

const ReviewQuiz = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answered = Object.keys(answers).length;
  const correct = REVIEW_QUESTIONS.filter((q) => answers[q.id] === q.answerIndex).length;

  return (
    <Card
      accent="mint"
      title="คำถามทบทวนความเข้าใจ"
      subtitle="ตอบเพื่อตรวจสอบตัวเอง ไม่มีผลต่อคะแนนในระบบ"
      icon={<ListChecks className="h-5 w-5 text-mint-600" aria-hidden="true" />}
      actions={
        answered > 0 ? (
          <Pill tone={correct === REVIEW_QUESTIONS.length ? 'mint' : 'brand'}>
            ตอบถูก {correct} จาก {answered} ข้อที่ทำแล้ว
          </Pill>
        ) : null
      }
    >
      <div className="space-y-4">
        {REVIEW_QUESTIONS.map((q, qi) => {
          const chosen = answers[q.id];
          const done = chosen !== undefined;
          const isRight = chosen === q.answerIndex;
          return (
            <div key={q.id} className="rounded-[1.25rem] border-2 border-slate-100 p-3.5">
              <p className="mb-2.5 flex gap-2.5 font-display text-sm font-bold text-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">
                  {qi + 1}
                </span>
                {q.question}
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {q.choices.map((c, ci) => {
                  const selected = chosen === ci;
                  const showRight = done && ci === q.answerIndex;
                  const showWrong = selected && !isRight;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: ci }))}
                      disabled={done}
                      className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm transition disabled:cursor-default ${
                        showRight
                          ? 'border-mint-300 bg-mint-50 font-semibold text-mint-900'
                          : showWrong
                            ? 'border-bubble-300 bg-bubble-50 text-bubble-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      {showRight ? (
                        <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : showWrong ? (
                        <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300"
                          aria-hidden="true"
                        />
                      )}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>

              {done && (
                <p
                  className={`mt-2.5 flex gap-2 rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isRight ? 'bg-mint-50 text-mint-900' : 'bg-lemon-50 text-peach-900'
                  }`}
                  role="status"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>{isRight ? 'ถูกต้อง' : 'ยังไม่ถูก'}: </strong>
                    {q.explain}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {answered === REVIEW_QUESTIONS.length && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-mint-200 bg-gradient-to-b from-mint-50 to-white px-4 py-3">
          <p className="font-display text-sm font-bold text-mint-900">
            ทำครบแล้ว ตอบถูก {correct} จาก {REVIEW_QUESTIONS.length} ข้อ
          </p>
          <Button variant="secondary" onClick={() => setAnswers({})}>
            ทำใหม่อีกครั้ง
          </Button>
        </div>
      )}
    </Card>
  );
};

/* ---------- หน้าหลัก ---------- */

/* ---------- ชุดข้อสอบ JSON สำหรับวางใน Construct 2 ---------- */

/**
 * แผนกำหนดให้ผู้เรียนเขียนแอ็กชัน Load from JSON string เองในคาบ
 * แต่เดิมไม่มีที่ใดในระบบบอกว่าข้อความ JSON นั้นหาได้จากไหน
 * ถ้าปล่อยให้พิมพ์เองจะเสียเวลาไปมากและพิมพ์ผิดง่าย เพราะวงเล็บและเครื่องหมายคำพูดต้องครบทุกตัว
 * จึงวางไว้ให้คัดลอกได้ในที่ที่ผู้เรียนเปิดอยู่แล้วระหว่างทำงาน
 */
const JsonBlock = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(QUIZ_JSON);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="mt-4 rounded-[1.25rem] border-2 border-peach-300 bg-gradient-to-b from-peach-50 to-white px-4 py-3.5"
      style={{ boxShadow: '0 5px 0 0 rgba(249,115,22,0.22)' }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="font-display text-[15px] font-bold text-peach-800">
          ชุดข้อสอบ 10 ข้อสำหรับวางใน Construct 2
        </p>
        <Button variant="secondary" onClick={() => void copy()} className="ml-auto">
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}
        </Button>
      </div>

      <p className="mb-2 text-sm leading-relaxed text-slate-600">
        กดคัดลอกแล้วนำไปวางในช่องของแอ็กชัน <strong>Array &gt; Load from JSON string</strong>{' '}
        ใต้เหตุการณ์ On start of layout ไม่ต้องพิมพ์เอง เพราะวงเล็บและเครื่องหมายคำพูดต้องครบทุกตัว
        พิมพ์ผิดตัวเดียวข้อสอบจะไม่เข้า Array
      </p>

      <pre className="overflow-x-auto rounded-2xl bg-slate-900 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-mint-200">
        {QUIZ_JSON}
      </pre>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        แต่ละช่องเก็บสองค่าไว้ด้วยกันในรูปแบบ <strong>&quot;หมายเลขข้อ,ตัวเฉลย&quot;</strong>{' '}
        เช่น <code className="font-mono">&quot;3,ก&quot;</code> หมายถึงข้อที่ 3 เฉลยข้อ ก
        แล้วใช้ <strong>tokenat</strong> แยกสองค่านี้ออกจากกันตอนใช้งาน ตามหัวข้อด้านบน
        <br />
        ถ้าเพิ่มหรือลดจำนวนข้อ ต้องแก้เลข <code className="font-mono">size</code> ให้ตรงกับจำนวนจริงด้วย
      </p>
    </div>
  );
};

export const KnowledgePage = () => (
  <div className="space-y-4">
    {/* ---------- หัวเรื่อง ---------- */}
    <Card>
      <div className="flex flex-col items-center gap-4 rounded-[1.5rem] bg-gradient-to-br from-brand-500 via-think-500 to-bubble-500 px-5 py-5 text-center sm:flex-row sm:text-left">
        <Mascot size={100} mood="think" className="shrink-0 animate-float drop-shadow-xl" />
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-snug text-white drop-shadow sm:text-2xl">
            คลังความรู้ Array และ Function
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-white/90">
            รวมความรู้ที่ต้องใช้ในการสร้างระบบแบบทดสอบสุ่มด้วย Construct 2
            อ่านก่อนเริ่มทำกิจกรรม และเปิดกลับมาดูได้ตลอดเวลา
          </p>
        </div>
      </div>
      {/* คลังนี้มีเนื้อหาราวสองหมื่นตัวอักษร ถ้าสั่งให้อ่านครบก่อนเรียนจะใช้เวลาเกินครึ่งชั่วโมง
          จึงคัดเส้นทางสั้นไว้ให้ ว่าจำเป็นจริง ๆ แค่ 4 หัวข้อ ที่เหลือเป็นคู่มือเปิดดูตอนติด */}
      <div
        className="mt-4 rounded-[1.25rem] border-2 border-mint-300 bg-gradient-to-b from-mint-50 to-white px-4 py-3.5"
        style={{ boxShadow: '0 5px 0 0 rgba(16,185,129,0.25)' }}
      >
        <p className="font-display text-[15px] font-bold text-mint-900">
          ก่อนเข้าคาบ อ่านแค่ 4 หัวข้อนี้พอ
        </p>
        <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {[
            'Array คืออะไร',
            'Index เริ่มนับที่ 0 ไม่ใช่ 1',
            'Array.Width คือจำนวนช่องที่มีอยู่',
            'Function คืออะไร',
          ].map((t, i) => (
            <li
              key={t}
              className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-1.5 text-sm text-slate-700"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-mint-400 to-mint-600 font-display text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
          สี่หัวข้อนี้ใช้เวลาอ่านประมาณ 5 นาที และเป็นทุกอย่างที่ต้องรู้เพื่อเริ่มภารกิจแรก
          จากนั้นให้ลองกดลบช่องในส่วน &quot;ลองเล่น Array ด้วยตัวเอง&quot; สัก 2 ถึง 3 ครั้ง
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          <strong className="text-slate-800">หัวข้อที่เหลือไม่ต้องอ่านล่วงหน้า</strong>{' '}
          ให้ใช้เป็นคู่มือเปิดค้นตอนลงมือทำจริงเมื่อติดขัด โดยเฉพาะบน iPad ของ Navigator
          ซึ่งมีหน้าที่คอยเปิดหาข้อมูลให้คู่อยู่แล้ว
        </p>
      </div>
    </Card>

    {/* ---------- Array ---------- */}
    <Card
      accent="brand"
      title="ส่วนที่ 1: Array คลังเก็บข้อสอบ"
      subtitle="ตัวแปรที่เก็บข้อมูลได้หลายค่า หัวใจของระบบสุ่มไม่ซ้ำ"
      icon={<Boxes className="h-5 w-5 text-brand-600" aria-hidden="true" />}
    >
      <ConceptList sections={ARRAY_CONCEPTS} tone="brand" />
      <h3 className="mb-2 mt-4 font-display text-sm font-bold text-slate-800">
        คำสั่งและนิพจน์ที่ใช้บ่อย
      </h3>
      <CommandTable rows={ARRAY_COMMANDS} />
    </Card>

    {/* ---------- ทดลองเล่น ---------- */}
    <ArrayPlayground />

    {/* ---------- Function ---------- */}
    <Card
      accent="think"
      title="ส่วนที่ 2: Function ชุดคำสั่งที่เรียกใช้ซ้ำได้"
      subtitle="เขียนครั้งเดียว ใช้ได้หลายที่ แก้ที่เดียวมีผลทุกจุด"
      icon={<FunctionSquare className="h-5 w-5 text-think-600" aria-hidden="true" />}
    >
      <ConceptList sections={FUNCTION_CONCEPTS} tone="think" />
      <h3 className="mb-2 mt-4 font-display text-sm font-bold text-slate-800">
        คำสั่งและนิพจน์ที่ใช้บ่อย
      </h3>
      <CommandTable rows={FUNCTION_COMMANDS} />
    </Card>

    {/* ---------- เทคนิคที่ใช้ในไฟล์จริง ---------- */}
    <Card
      accent="mint"
      title="ส่วนที่ 3: เทคนิคเพิ่มเติมที่ใช้ในไฟล์จริง"
      subtitle="3 เรื่องที่จะเจอใน Event Sheet ของโปรเจกต์ แต่ไม่มีในเว็บจำลอง พร้อมชุดข้อสอบให้คัดลอกไปใช้"
      icon={<Boxes className="h-5 w-5 text-mint-600" aria-hidden="true" />}
    >
      <ConceptList sections={ADVANCED_CONCEPTS} tone="mint" />
      <JsonBlock />
    </Card>

    {/* ---------- ตารางเทียบเว็บจำลองกับของจริง ---------- */}
    <Card
      accent="peach"
      title="ส่วนที่ 4: จากเว็บจำลอง สู่ Event Sheet จริง"
      subtitle="บล็อกในเว็บนี้ตรงกับคำสั่งใดใน Construct 2 ใช้เป็นแผนที่ตอนลงมือทำจริง"
      icon={<ArrowLeftRight className="h-5 w-5 text-think-600" aria-hidden="true" />}
    >
      <p className="mb-3 rounded-2xl border-2 border-dashed border-lemon-200 bg-lemon-50 px-3.5 py-2.5 text-xs leading-relaxed text-peach-900">
        เว็บจำลองตั้งใจย่อคำสั่งให้สั้นเพื่อให้เข้าใจตรรกะก่อน เมื่อไปเขียนจริงใน Construct 2
        ชื่อคำสั่งจะยาวกว่าและมีรายละเอียดเพิ่ม ตารางนี้จับคู่ให้ทีละบรรทัด
      </p>
      <div className="scroll-thin -mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left">
              <th className="px-2.5 py-2 text-xs font-bold text-slate-600">บล็อกในเว็บจำลอง</th>
              <th className="px-2.5 py-2 text-xs font-bold text-slate-600">คำสั่งจริงใน Construct 2</th>
              <th className="px-2.5 py-2 text-xs font-bold text-slate-600">สิ่งที่ต่างออกไป</th>
            </tr>
          </thead>
          <tbody>
            {REAL_EVENT_MAPPING.map((m) => (
              <tr key={m.real} className="border-b border-slate-100 align-top hover:bg-think-50/40">
                <td className="px-2.5 py-2">
                  <code className="font-mono text-[11.5px] leading-snug text-slate-600">
                    {m.block}
                  </code>
                </td>
                <td className="px-2.5 py-2">
                  <code className="font-mono text-[11.5px] font-semibold leading-snug text-brand-800">
                    {m.real}
                  </code>
                </td>
                <td className="px-2.5 py-2 text-xs leading-relaxed text-slate-600">{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {/* ---------- นำมาประกอบกัน ---------- */}
    <Card
      accent="brand"
      title="ส่วนที่ 5: โครงตรรกะทั้งหมดของระบบ"
      subtitle="ตรรกะทั้งหมดที่ต้องเขียนใน Event Sheet"
      icon={<BookOpenCheck className="h-5 w-5 text-mint-600" aria-hidden="true" />}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {[
          {
            title: 'Function "Random"',
            tone: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white',
            steps: [
              'Set Num to int(random(Array.Width))',
              'quiz: Set animation frame to int(trim(tokenat(Array.At(Num),0,",")))',
              'Set Answer to trim(tokenat(Array.At(Num),1,","))',
              'Array > Delete index Num from X axis',
            ],
            note: 'อ่านค่าให้ครบทั้งหมายเลขข้อและเฉลยก่อน แล้วจึงลบ ลำดับนี้ห้ามสลับ',
          },
          {
            title: 'ตรวจคำตอบ',
            tone: 'border-think-200 bg-gradient-to-b from-think-50 to-white',
            steps: [
              'On button answer clicked',
              'If Answer = bt_Select.Choice',
              'Add 1 to Score',
              'Call Function "Random"',
            ],
            note: 'Add 1 to Score ต้องอยู่ใต้เงื่อนไขตรวจคำตอบเท่านั้น',
          },
          {
            title: 'เงื่อนไขจบเกม',
            tone: 'border-mint-200 bg-gradient-to-b from-mint-50 to-white',
            steps: [
              'Array > Is empty (Invert = ยังไม่ว่าง) → สุ่มต่อ',
              'Else → เข้าสู่ทางจบเกม',
              'Score ≤ 5 → Go to เสียใจ',
              'Score > 5 → Go to ดีใจ',
            ],
            note: 'ไฟล์จริงแยกหน้าจบเป็น 2 หน้าตามคะแนน ไม่ใช่หน้า Summary หน้าเดียว',
          },
        ].map((box) => (
          <div key={box.title} className={`rounded-[1.25rem] border-2 p-3.5 ${box.tone}`}>
            <h3 className="mb-2 font-display text-sm font-bold text-slate-800">{box.title}</h3>
            <ol className="space-y-1.5">
              {box.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white font-mono text-[10px] font-bold text-slate-600 shadow-clay-sm">
                    {i + 1}
                  </span>
                  <code className="font-mono text-[11.5px] leading-snug text-slate-700">{s}</code>
                </li>
              ))}
            </ol>
            <p className="mt-2.5 border-t-2 border-dashed border-white pt-2 text-[11.5px] leading-relaxed text-slate-600">
              {box.note}
            </p>
          </div>
        ))}
      </div>
    </Card>

    {/* ---------- ข้อผิดพลาดที่พบบ่อย ---------- */}
    <Card
      accent="bubble"
      title="ส่วนที่ 6: ข้อผิดพลาดที่พบบ่อย"
      subtitle="อ่านไว้ก่อน จะได้ไม่เสียเวลาหาสาเหตุนาน"
      icon={<TriangleAlert className="h-5 w-5 text-bubble-600" aria-hidden="true" />}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {COMMON_MISTAKES.map((m) => (
          <div
            key={m.id}
            className="rounded-[1.25rem] border-2 border-bubble-200 bg-gradient-to-b from-bubble-50 to-white p-3.5"
          >
            <h3 className="mb-1.5 font-display text-sm font-bold text-bubble-900">{m.title}</h3>
            <dl className="space-y-1 text-xs leading-relaxed text-slate-600">
              <div>
                <dt className="inline font-semibold text-slate-700">อาการ: </dt>
                <dd className="inline">{m.symptom}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-slate-700">สาเหตุ: </dt>
                <dd className="inline">{m.cause}</dd>
              </div>
            </dl>
            <p className="mt-2 flex gap-2 rounded-xl bg-mint-50 px-3 py-2 text-xs leading-relaxed text-mint-900">
              <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>วิธีแก้: </strong>
                {m.fix}
              </span>
            </p>
          </div>
        ))}
      </div>
    </Card>

    {/* ---------- คำถามทบทวน ---------- */}
    <ReviewQuiz />

    {/* ---------- คำศัพท์ ---------- */}
    <Card
      accent="slate"
      title="คำศัพท์ที่ควรรู้"
      subtitle="ศัพท์ที่จะเจอทั้งในเว็บนี้และใน Construct 2"
      icon={<CircleHelp className="h-5 w-5 text-slate-500" aria-hidden="true" />}
    >
      <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GLOSSARY.map((g) => (
          <div
            key={g.term}
            className="rounded-2xl border-2 border-slate-100 bg-white px-3 py-2.5"
          >
            <dt className="font-mono text-[12.5px] font-bold text-brand-700">{g.term}</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">{g.meaning}</dd>
          </div>
        ))}
      </dl>
    </Card>
  </div>
);
