import { useState } from 'react';
import {
  BookOpenCheck,
  Boxes,
  CircleCheck,
  CircleHelp,
  FunctionSquare,
  Lightbulb,
  ListChecks,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Button, Card, Pill } from '../components/Ui';
import { ArrayPlayground } from '../components/ArrayPlayground';
import { Mascot } from '../components/Illustrations';
import {
  ARRAY_COMMANDS,
  ARRAY_CONCEPTS,
  COMMON_MISTAKES,
  FUNCTION_COMMANDS,
  FUNCTION_CONCEPTS,
  GLOSSARY,
  REVIEW_QUESTIONS,
  type CommandRow,
  type ConceptSection,
} from '../data/knowledge';

/* ---------- การ์ดแนวคิดแบบพับเก็บได้ ---------- */

const ConceptList = ({
  sections,
  tone,
}: {
  sections: ConceptSection[];
  tone: 'brand' | 'think';
}) => {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);
  const ring = tone === 'brand' ? 'border-brand-200' : 'border-think-200';
  const head = tone === 'brand' ? 'bg-brand-50' : 'bg-think-50';
  const num = tone === 'brand' ? 'from-brand-400 to-brand-600' : 'from-think-400 to-think-600';

  return (
    <div className="space-y-2">
      {sections.map((sec, i) => {
        const open = openId === sec.id;
        return (
          <div key={sec.id} className={`overflow-hidden rounded-[1.25rem] border-2 ${ring}`}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : sec.id)}
              aria-expanded={open}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition ${
                open ? head : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b font-display text-xs font-bold text-white ${num}`}
              >
                {i + 1}
              </span>
              <span className="flex-1 font-display text-sm font-bold text-slate-800">
                {sec.title}
              </span>
              <span className="shrink-0 text-slate-400" aria-hidden="true">
                {open ? '−' : '+'}
              </span>
            </button>

            {open && (
              <div className="border-t-2 border-dashed border-slate-100 px-4 py-3">
                <p className="rounded-2xl bg-lemon-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
                  <Lightbulb
                    className="mr-1.5 inline h-4 w-4 text-lemon-500"
                    aria-hidden="true"
                  />
                  {sec.plain}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {sec.technical.map((t) => (
                    <li key={t} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
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
            เปิดอ่านได้ตลอดเวลาระหว่างทำกิจกรรม
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        แนะนำให้อ่านตามลำดับนี้ เริ่มจาก <strong className="text-brand-700">Array</strong>{' '}
        เพื่อเข้าใจการเก็บข้อสอบและเลขตำแหน่ง จากนั้นลองเล่นในส่วนทดลอง แล้วค่อยอ่าน{' '}
        <strong className="text-think-700">Function</strong> เพื่อเข้าใจการเรียกใช้ซ้ำ
        ปิดท้ายด้วยข้อผิดพลาดที่พบบ่อยและคำถามทบทวน
      </p>
    </Card>

    {/* ---------- Array ---------- */}
    <Card
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

    {/* ---------- นำมาประกอบกัน ---------- */}
    <Card
      title="ส่วนที่ 3: นำมาประกอบกันเป็นระบบแบบทดสอบสุ่ม"
      subtitle="ตรรกะทั้งหมดที่ต้องเขียนใน Event Sheet"
      icon={<BookOpenCheck className="h-5 w-5 text-mint-600" aria-hidden="true" />}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {[
          {
            title: 'Function "Random"',
            tone: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white',
            steps: [
              'Set Num to floor(random(Array.Width))',
              'Set CurrentQuestion to Array.At(Num, 0, 0)',
              'Array -> Delete index Num from X axis',
              'Display CurrentQuestion',
            ],
            note: 'อ่านค่าก่อน แล้วจึงลบ ลำดับนี้ห้ามสลับ',
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
            steps: ['If Array is empty (Width = 0)', 'Go to Layout "Summary"', 'Display Score'],
            note: 'ต้องตรวจว่าว่างก่อน จึงค่อยเปลี่ยนหน้า',
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
      title="ส่วนที่ 4: ข้อผิดพลาดที่พบบ่อย"
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
