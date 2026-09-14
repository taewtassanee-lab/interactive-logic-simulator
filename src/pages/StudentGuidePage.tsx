import { useState } from 'react';
import {
  BookOpenCheck,
  CircleHelp,
  Handshake,
  ListOrdered,
  Monitor,
  Printer,
  Tablet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { Button, Card } from '../components/Ui';
import {
  PAIR_RULES,
  ROLE_GUIDES,
  STUDENT_FAQ,
  STUDENT_GUIDE_SECTIONS,
  STUDENT_STEPS,
} from '../data/studentGuide';

/**
 * คู่มือนักเรียน
 *
 * แท็บนี้อยู่ในหน้าที่นักเรียนใช้ ส่วนคู่มือครูย้ายไปอยู่หลังรหัสครูในแดชบอร์ด
 * ของเดิมเอาแผนการสอนมาวางไว้หน้านักเรียน ซึ่งผู้เรียนอ่านแล้วไม่ได้คำตอบว่าตัวเองต้องทำอะไร
 * หน้านี้จึงตอบสามคำถามของผู้เรียนตามลำดับ คือทำอะไร ทำอย่างไร และถูกวัดจากอะไร
 */
const ROLE_STYLE = {
  brand: {
    frame: 'border-brand-200 bg-gradient-to-b from-brand-50 to-white',
    edge: 'rgba(99,102,241,0.3)',
    chip: 'from-brand-400 to-brand-600',
    text: 'text-brand-700',
    dot: 'bg-brand-500',
  },
  think: {
    frame: 'border-think-200 bg-gradient-to-b from-think-50 to-white',
    edge: 'rgba(139,92,246,0.3)',
    chip: 'from-think-400 to-think-600',
    text: 'text-think-700',
    dot: 'bg-think-500',
  },
} as const;

/** สีของหัวข้อแบบเปิดอ่าน ใช้ชุดเดียวกับหน้าคลังความรู้ ผู้เรียนจะได้คุ้นตา */
const SECTION_STYLE: Record<string, { head: string; num: string; edge: string; text: string }> = {
  mint: {
    head: 'bg-gradient-to-r from-mint-100 to-mint-50',
    num: 'from-mint-400 to-mint-600',
    edge: 'rgba(16,185,129,0.3)',
    text: 'text-mint-700',
  },
  bubble: {
    head: 'bg-gradient-to-r from-bubble-100 to-bubble-50',
    num: 'from-bubble-400 to-bubble-600',
    edge: 'rgba(236,72,153,0.3)',
    text: 'text-bubble-700',
  },
  think: {
    head: 'bg-gradient-to-r from-think-100 to-think-50',
    num: 'from-think-400 to-think-600',
    edge: 'rgba(139,92,246,0.3)',
    text: 'text-think-700',
  },
  lemon: {
    head: 'bg-gradient-to-r from-lemon-100 to-lemon-50',
    num: 'from-lemon-400 to-peach-500',
    edge: 'rgba(245,158,11,0.3)',
    text: 'text-peach-700',
  },
  peach: {
    head: 'bg-gradient-to-r from-peach-100 to-peach-50',
    num: 'from-peach-400 to-peach-600',
    edge: 'rgba(249,115,22,0.3)',
    text: 'text-peach-700',
  },
  brand: {
    head: 'bg-gradient-to-r from-brand-100 to-brand-50',
    num: 'from-brand-400 to-brand-600',
    edge: 'rgba(99,102,241,0.3)',
    text: 'text-brand-700',
  },
  slate: {
    head: 'bg-gradient-to-r from-slate-100 to-slate-50',
    num: 'from-slate-400 to-slate-600',
    edge: 'rgba(100,116,139,0.3)',
    text: 'text-slate-700',
  },
};

export const StudentGuidePage = () => {
  const { state } = useApp();
  const { settings } = useSettings();
  const [openId, setOpenId] = useState<string | null>('goal');
  const isAssistant = state.session.deviceMode === 'assistant';

  return (
    <div className="space-y-4">
      {/* ---------- แนะนำกิจกรรม ---------- */}
      <Card
        accent="brand"
        title="คู่มือนักเรียน"
        subtitle={`${settings.courseName} ${settings.gradeLevel} | ${settings.unitName}`}
        icon={<BookOpenCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />}
        actions={
          <Button variant="secondary" onClick={() => window.print()} className="no-print">
            <Printer className="h-4 w-4" aria-hidden="true" />
            พิมพ์คู่มือ
          </Button>
        }
      >
        <p className="text-[15px] leading-relaxed text-slate-700">
          คาบนี้เราจะจับคู่กันแก้ Bug ของระบบสุ่มข้อสอบ โดยใช้เว็บนี้ทดลองเรียงบล็อกคำสั่งดูผลก่อน
          แล้วค่อยนำสิ่งที่เข้าใจไปแก้ Event Sheet จริงใน Construct 2
          อ่านคู่มือนี้ก่อนลงมือ แล้วเปิดกลับมาดูได้ตลอดเวลาเมื่อไม่แน่ใจว่าต้องทำอะไรต่อ
        </p>

        {/* บอกสถานะเครื่องที่ถืออยู่ ผู้เรียนจะได้ไม่งงว่าทำไมบางหน้าพิมพ์ไม่ได้ */}
        <div
          className={`mt-3 flex flex-wrap items-center gap-2.5 rounded-2xl border-2 px-4 py-3 ${
            isAssistant
              ? 'border-think-200 bg-think-50/70'
              : 'border-brand-200 bg-brand-50/70'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-clay-sm">
            {isAssistant ? (
              <Tablet className="h-5 w-5 text-think-600" aria-hidden="true" />
            ) : (
              <Monitor className="h-5 w-5 text-brand-600" aria-hidden="true" />
            )}
          </span>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
            <span className="font-display font-bold text-slate-800">
              เครื่องนี้ตั้งไว้เป็นโหมด {isAssistant ? 'Navigator' : 'Driver'}
            </span>{' '}
            {isAssistant
              ? 'เปิดอ่านและเข้าร่วมกิจกรรมสดได้ แต่กรอกใบงานไม่ได้ ให้ใช้เครื่อง Driver พิมพ์คำตอบของทั้งคู่'
              : 'เป็นเครื่องที่บันทึกคำตอบและส่งงานของคู่ทั้งหมด สลับบทบาทให้สลับที่นั่ง ไม่ต้องสลับเครื่อง'}
          </p>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            { label: 'รูปแบบกิจกรรม', value: 'จับคู่ Driver และ Navigator' },
            { label: 'สิ่งที่ต้องทำให้สำเร็จ', value: 'แก้ Bug 2 ภารกิจ + ใบงาน 100%' },
            { label: 'สิ่งที่ต้องส่ง', value: 'ใบงาน PDF + ไฟล์ .capx' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5"
              style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="font-display text-sm font-bold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- บทบาทสองแบบ ---------- */}
      <Card
        accent="think"
        title="ฉันต้องทำอะไรในบทบาทของฉัน"
        subtitle="ทุกคนจะได้ทำครบทั้งสองบทบาท เพราะระบบบังคับสลับตามเวลา"
        icon={<Handshake className="h-5 w-5 text-think-600" aria-hidden="true" />}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {ROLE_GUIDES.map((r) => {
            const s = ROLE_STYLE[r.accent];
            return (
              <article
                key={r.role}
                className={`rounded-[1.25rem] border-2 px-4 py-4 ${s.frame}`}
                style={{ boxShadow: `0 5px 0 0 ${s.edge}` }}
              >
                <header className="mb-2.5 flex items-center gap-2.5">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b text-white shadow-clay-sm ${s.chip}`}
                  >
                    {r.role === 'Driver' ? (
                      <Monitor className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Tablet className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-slate-800">{r.role}</h3>
                    <p className={`text-sm font-semibold ${s.text}`}>{r.tagline}</p>
                  </div>
                </header>

                <p className="rounded-xl bg-white/80 px-3 py-2 text-sm leading-relaxed text-slate-600">
                  {r.device}
                </p>

                <ul className="mt-2.5 space-y-1.5">
                  {r.duties.map((d) => (
                    <li key={d} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                      <span
                        className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{d}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-2.5 rounded-xl border-2 border-dashed border-peach-200 bg-peach-50/70 px-3 py-2 text-sm leading-relaxed text-peach-800">
                  ข้อควรระวัง: {r.avoid}
                </p>
              </article>
            );
          })}
        </div>
      </Card>

      {/* ---------- ลำดับงานทั้งคาบ ---------- */}
      <Card
        accent="mint"
        title="ทำตามลำดับนี้"
        subtitle="แต่ละขั้นบอกไว้ด้วยว่ารู้ได้อย่างไรว่าทำสำเร็จแล้ว"
        icon={<ListOrdered className="h-5 w-5 text-mint-600" aria-hidden="true" />}
      >
        <ol className="space-y-2.5">
          {STUDENT_STEPS.map((s, i) => (
            <li
              key={s.tab}
              className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3"
              style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-mint-400 to-mint-600 font-display text-base font-bold text-white shadow-clay-sm">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-slate-800">
                  ไปที่แท็บ &quot;{s.tab}&quot;
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.what}</p>
                <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-mint-50 px-2.5 py-1 text-xs font-semibold text-mint-800">
                  ผ่านขั้นนี้เมื่อ: {s.done}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* ---------- หัวข้อแบบเปิดอ่าน ---------- */}
      <div className="space-y-2.5">
        {STUDENT_GUIDE_SECTIONS.map((sec, i) => {
          const open = openId === sec.id;
          const s = SECTION_STYLE[sec.accent] ?? SECTION_STYLE.brand;
          return (
            <section
              key={sec.id}
              className="clay-card overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : sec.id)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                  open ? s.head : 'bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b font-display text-base font-bold text-white ${s.num}`}
                  style={{ boxShadow: `0 4px 0 0 ${s.edge}` }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[17px] font-bold leading-snug text-slate-800">
                    {sec.title}
                  </span>
                  {!open && (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{sec.lead}</span>
                  )}
                </span>
                {/* ใช้คำแทนเครื่องหมาย ให้เหมือนหน้าคลังความรู้ */}
                <span
                  className={`flex min-w-[5.5rem] shrink-0 items-center justify-center rounded-xl border-2 px-3 py-1.5 font-display text-sm font-bold transition ${
                    open ? `border-white/70 bg-white/80 ${s.text}` : 'border-brand-200 bg-white text-brand-700'
                  }`}
                >
                  {open ? 'ปิด' : 'เปิดอ่าน'}
                </span>
              </button>

              {open && (
                <div className="border-t-2 border-dashed border-slate-100 bg-white px-4 py-4">
                  <p className="mb-3 rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-600">
                    {sec.lead}
                  </p>
                  <ul className="space-y-2">
                    {sec.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700"
                      >
                        <span
                          className={`mt-[9px] h-2 w-2 shrink-0 rounded-full bg-gradient-to-b ${s.num}`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ---------- กติกาการทำงานเป็นคู่ ---------- */}
      <Card
        accent="lemon"
        title="กติกาการทำงานเป็นคู่"
        subtitle="อ่านออกเสียงพร้อมกันก่อนเริ่ม แล้วยึดไว้ตลอดคาบ"
        icon={<Handshake className="h-5 w-5 text-peach-600" aria-hidden="true" />}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {PAIR_RULES.map((rule, i) => (
            <li
              key={rule}
              className="flex items-start gap-2.5 rounded-2xl border-2 border-lemon-200 bg-lemon-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-lemon-400 to-peach-500 font-display text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------- ปัญหาที่เจอบ่อย ---------- */}
      <Card
        accent="slate"
        title="เจอปัญหาแบบนี้ ทำอย่างไร"
        subtitle="ลองแก้ตามนี้ก่อนยกมือเรียกครู"
        icon={<CircleHelp className="h-5 w-5 text-slate-600" aria-hidden="true" />}
      >
        <div className="space-y-2.5">
          {STUDENT_FAQ.map((f) => (
            <article
              key={f.q}
              className="rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3"
              style={{ boxShadow: '0 4px 0 0 #e2e8f0' }}
            >
              <p className="font-display text-[15px] font-bold text-slate-800">{f.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </article>
          ))}
        </div>

        <p className="mt-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-600">
          ถ้าลองครบแล้วยังไม่ได้ ให้ยกมือเรียก {settings.teacherName} พร้อมบอกว่าทำอะไรไปแล้วบ้าง
          ครูจะได้ช่วยได้ตรงจุดเร็วขึ้น
        </p>
      </Card>
    </div>
  );
};
